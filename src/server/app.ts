import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { adminAuth } from '../lib/firebase-admin.ts';
import { getOrCreateUser } from '../db/users.ts';
import {
  StoredCustomer,
  StoredOrder,
  createCustomer,
  getCustomerByEmail,
  getCustomerById,
  getCustomerByFirebaseUid,
  updateCustomerProfile,
  updateCustomerPassword,
  verifyPassword,
  validateStrongPassword,
  createSessionToken,
  verifySessionTokenSignature,
  revokeSessionToken,
  isSessionTokenRevoked,
  sanitizeCustomer,
  createPasswordResetToken,
  verifyAndConsumeResetToken,
  generateOrderAccessToken,
  saveOrder,
  getOrderById,
  hasOrderId,
  getOrdersByCustomer,
  getRecentOrders,
  hasProcessedNotification,
  markNotificationProcessed,
} from './database.ts';

dotenv.config();

export const app = express();

// ============================================================================
// SECURITY HEADERS & TRUSTED ORIGIN CORS
// ============================================================================

function getTrustedBaseUrl(req?: Request): string {
  const configuredUrl = (process.env.APP_BASE_URL || process.env.APP_URL || '').trim().replace(/\/+$/, '');
  if (configuredUrl && /^https?:\/\//i.test(configuredUrl)) {
    return configuredUrl;
  }
  if (req) {
    const host = (req.get('x-forwarded-host') || req.get('host') || 'localhost:3000')
      .split(',')[0]
      .trim();
    const protoHeader = (req.get('x-forwarded-proto') || req.protocol || 'https').split(',')[0].trim();
    const protocol = host.startsWith('localhost') || host.startsWith('127.0.0.1') ? protoHeader : 'https';
    return `${protocol}://${host}`;
  }
  return 'http://localhost:3000';
}

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  const requestOrigin = req.get('origin');
  const trustedBase = getTrustedBaseUrl(req);

  if (requestOrigin) {
    try {
      const originUrl = new URL(requestOrigin);
      const trustedUrl = new URL(trustedBase);
      const isAllowed =
        originUrl.host === trustedUrl.host ||
        originUrl.hostname === 'localhost' ||
        originUrl.hostname === '127.0.0.1' ||
        originUrl.hostname.endsWith('.run.app') ||
        originUrl.hostname.endsWith('.vercel.app');

      if (isAllowed) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
        res.setHeader('Vary', 'Origin');
      }
    } catch {
      // Ignore malformed Origin header
    }
  } else {
    res.setHeader('Access-Control-Allow-Origin', trustedBase);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Admin-Secret, X-Order-Token'
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: true, limit: '64kb' }));

// ============================================================================
// RATE LIMITING MIDDLEWARE (BRUTE-FORCE & ABUSE PROTECTION)
// ============================================================================

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const rateLimitBuckets = new Map<string, RateLimitBucket>();

export function clearRateLimitsForTesting(): void {
  rateLimitBuckets.clear();
}

function createRateLimiter(options: { windowMs: number; max: number; keyPrefix: string; message: string }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const forwarded = req.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : req.ip || 'unknown';
    const key = `${options.keyPrefix}:${clientIp}`;
    const now = Date.now();

    const bucket = rateLimitBuckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      rateLimitBuckets.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    bucket.count += 1;
    if (bucket.count > options.max) {
      const retryAfterSec = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        success: false,
        error: options.message,
      });
    }

    return next();
  };
}

const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 25,
  keyPrefix: 'auth',
  message: 'Too many authentication attempts. Please wait a few minutes and try again.',
});

const resetRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  keyPrefix: 'pwd-reset',
  message: 'Too many password reset requests. Please wait 15 minutes before trying again.',
});

const paymentInitiateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 35,
  keyPrefix: 'payhere-init',
  message: 'Too many payment initiation requests. Please wait a moment and try again.',
});

export type Transaction = StoredOrder;

export function generateUniqueReceiptNumber(orderId: string): string {
  const year = new Date().getFullYear();
  const digits = orderId.replace(/[^0-9]/g, '');
  const suffix = digits.length >= 5 ? digits.slice(-5) : crypto.randomInt(10000, 99999).toString();
  return `REC-${year}-${suffix}`;
}

function sanitizeInputText(input: unknown, maxLength = 200): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

// ============================================================================
// PAYHERE STORE CONFIGURATION (SERVER-SIDE ONLY)
// ============================================================================

export interface StoreConfig {
  merchantId: string;
  merchantSecret: string;
  isSandbox: boolean;
  businessWhatsApp: string;
  businessName: string;
}

export const config: StoreConfig = {
  merchantId: (process.env.PAYHERE_MERCHANT_ID || '').trim(),
  merchantSecret: (process.env.PAYHERE_MERCHANT_SECRET || '').trim(),
  isSandbox: process.env.PAYHERE_SANDBOX ? process.env.PAYHERE_SANDBOX.toLowerCase() !== 'false' : true,
  businessWhatsApp: (process.env.BUSINESS_WHATSAPP || '0742235836').trim(),
  businessName: 'UCHIHA MARRI TOP UP',
};

export function getActivePayHereConfig(): StoreConfig {
  return {
    merchantId: (process.env.PAYHERE_MERCHANT_ID || config.merchantId || '').trim(),
    merchantSecret: (process.env.PAYHERE_MERCHANT_SECRET || config.merchantSecret || '').trim(),
    isSandbox:
      process.env.PAYHERE_SANDBOX !== undefined
        ? process.env.PAYHERE_SANDBOX.toLowerCase() !== 'false'
        : config.isSandbox,
    businessWhatsApp: (process.env.BUSINESS_WHATSAPP || config.businessWhatsApp || '0742235836').trim(),
    businessName: config.businessName,
  };
}

// ============================================================================
// OFFICIAL PAYHERE HASH GENERATION & IPN SIGNATURE VERIFICATION
// https://support.payhere.lk/api-&-mobile-sdk/checkout-api
// ============================================================================

// Formula: strtoupper(md5(merchant_id + order_id + amountFormatted + currency + strtoupper(md5(merchant_secret))))
export function generatePayHereHash(
  merchantId: string,
  orderId: string,
  amount: number,
  currency: string,
  merchantSecret: string
): string {
  const formattedAmount = Number(amount).toFixed(2);

  const hashedSecret = crypto
    .createHash('md5')
    .update(merchantSecret)
    .digest('hex')
    .toUpperCase();

  const hashString = `${merchantId}${orderId}${formattedAmount}${currency}${hashedSecret}`;
  return crypto
    .createHash('md5')
    .update(hashString)
    .digest('hex')
    .toUpperCase();
}

// Formula: strtoupper(md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + strtoupper(md5(merchant_secret))))
export function verifyPayHereSignature(
  merchantId: string,
  orderId: string,
  payhereAmount: string,
  payhereCurrency: string,
  statusCode: string,
  merchantSecret: string,
  receivedMd5Sig: string
): boolean {
  if (
    !merchantId ||
    !orderId ||
    !payhereAmount ||
    !payhereCurrency ||
    !statusCode ||
    !merchantSecret ||
    !receivedMd5Sig
  ) {
    return false;
  }

  const hashedSecret = crypto
    .createHash('md5')
    .update(merchantSecret)
    .digest('hex')
    .toUpperCase();

  const hashString = `${merchantId}${orderId}${payhereAmount}${payhereCurrency}${statusCode}${hashedSecret}`;
  const localMd5 = crypto
    .createHash('md5')
    .update(hashString)
    .digest('hex')
    .toUpperCase();

  try {
    const a = Buffer.from(localMd5, 'utf8');
    const b = Buffer.from(receivedMd5Sig.trim().toUpperCase(), 'utf8');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// ============================================================================
// SERVER-SIDE AUTHENTICATION & ADMIN AUTHORIZATION MIDDLEWARE
// ============================================================================

async function getAuthenticatedCustomerFromRequest(req: Request): Promise<StoredCustomer | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  if (!token) return null;

  // 1. Check server-signed session token + revocation check in PostgreSQL
  const payload = verifySessionTokenSignature(token);
  if (payload) {
    const revoked = await isSessionTokenRevoked(payload.jti);
    if (revoked) {
      return null;
    }
    return await getCustomerById(payload.sub);
  }

  // 2. Check Firebase Auth ID token
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (decoded && decoded.uid) {
      const email = (decoded.email || `${decoded.uid}@firebase.user`).toLowerCase();
      await getOrCreateUser(decoded.uid, email);

      let customer = await getCustomerByFirebaseUid(decoded.uid);
      if (!customer && decoded.email) {
        customer = await getCustomerByEmail(decoded.email);
      }
      if (!customer) {
        customer = await createCustomer({
          fullName: decoded.name || email.split('@')[0] || 'Gaming Customer',
          email,
          whatsappNumber: '0700000000',
          billingAddress: 'Digital Gaming Top Up',
          city: 'Colombo',
          country: 'Sri Lanka',
          password: crypto.randomBytes(24).toString('hex') + 'Aa1!',
          firebaseUid: decoded.uid,
        });
      }
      return customer;
    }
  } catch {
    // Not a valid Firebase ID token
  }

  return null;
}

async function requireCustomerAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const customer = await getAuthenticatedCustomerFromRequest(req);
    if (!customer) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in to access your account.',
      });
    }
    (req as any).customer = customer;
    next();
  } catch (error) {
    console.error('Authentication check failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication verification failed.',
    });
  }
}

const ADMIN_EMAILS = new Set(
  [
    process.env.ADMIN_EMAIL?.trim().toLowerCase(),
    'uchihamarri@gmail.com',
    'sanukagkk@gmail.com',
  ].filter(Boolean) as string[]
);

async function isRequestAuthorizedAdmin(req: Request): Promise<boolean> {
  const adminSecretEnv = (process.env.ADMIN_SECRET || '').trim();
  const headerSecret = (req.get('x-admin-secret') || req.body?.adminSecret || '').toString().trim();

  if (adminSecretEnv && headerSecret) {
    try {
      const a = Buffer.from(adminSecretEnv, 'utf8');
      const b = Buffer.from(headerSecret, 'utf8');
      if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
        return true;
      }
    } catch {
      // fall through
    }
  }

  const customer = await getAuthenticatedCustomerFromRequest(req);
  if (customer && ADMIN_EMAILS.has(customer.email.toLowerCase())) {
    return true;
  }

  return false;
}

// ============================================================================
// CUSTOMER REGISTRATION, LOGIN, LOGOUT, PASSWORD RESET & PROFILE ENDPOINTS
// ============================================================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Dummy salt/hash to prevent timing-based email enumeration during login
const DUMMY_SALT = '0123456789abcdef0123456789abcdef';
const DUMMY_HASH =
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

app.post('/api/auth/register', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      email,
      whatsappNumber,
      billingAddress,
      city,
      country,
      password,
      confirmPassword,
    } = req.body || {};

    const cleanName = sanitizeInputText(fullName, 100);
    const cleanEmail = sanitizeInputText(email, 120).toLowerCase();
    const cleanWhatsapp = sanitizeInputText(whatsappNumber, 30);
    const cleanAddress = sanitizeInputText(billingAddress, 200);
    const cleanCity = sanitizeInputText(city, 80);
    const cleanCountry = sanitizeInputText(country, 80) || 'Sri Lanka';

    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ success: false, error: 'Full Name is required (at least 2 characters).' });
    }
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid Email Address.' });
    }
    if (!cleanWhatsapp || cleanWhatsapp.replace(/[^0-9]/g, '').length < 9) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid WhatsApp / Mobile Number (at least 9 digits).',
      });
    }
    if (!cleanAddress || cleanAddress.length < 3) {
      return res.status(400).json({ success: false, error: 'Billing Address is required.' });
    }
    if (!cleanCity || cleanCity.length < 2) {
      return res.status(400).json({ success: false, error: 'City is required.' });
    }

    const passwordError = validateStrongPassword(password);
    if (passwordError) {
      return res.status(400).json({ success: false, error: passwordError });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match.' });
    }

    const existing = await getCustomerByEmail(cleanEmail);
    if (existing) {
      // Do not confirm or enumerate account details publicly
      return res.status(400).json({
        success: false,
        error: 'Unable to complete registration with the provided credentials. If you already have an account, please sign in.',
      });
    }

    const customer = await createCustomer({
      fullName: cleanName,
      email: cleanEmail,
      whatsappNumber: cleanWhatsapp,
      billingAddress: cleanAddress,
      city: cleanCity,
      country: cleanCountry,
      password,
    });

    const token = createSessionToken(customer, true);
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      customer: sanitizeCustomer(customer),
    });
  } catch (err: any) {
    console.error('[Auth Register Error]:', err?.message || 'Registration error');
    return res.status(500).json({
      success: false,
      error: 'Failed to register customer account. Please try again.',
    });
  }
});

app.post('/api/auth/login', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe = true } = req.body || {};
    const cleanEmail = sanitizeInputText(email, 120).toLowerCase();

    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'Please enter your password.' });
    }

    const customer = await getCustomerByEmail(cleanEmail);
    if (!customer) {
      // Mitigate timing side-channels and never reveal whether the email is registered
      verifyPassword(password, DUMMY_SALT, DUMMY_HASH);
      return res.status(401).json({
        success: false,
        error: 'Invalid email address or password.',
      });
    }

    if (!verifyPassword(password, customer.passwordSalt, customer.passwordHash)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email address or password.',
      });
    }

    const token = createSessionToken(customer, Boolean(rememberMe));
    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      customer: sanitizeCustomer(customer),
    });
  } catch (err: any) {
    console.error('[Auth Login Error]:', err?.message || 'Login error');
    return res.status(500).json({
      success: false,
      error: 'An error occurred during login. Please try again.',
    });
  }
});

app.post('/api/auth/logout', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      await revokeSessionToken(token);
    }
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully and session invalidated.',
    });
  } catch {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  }
});

/**
 * Password Reset Request
 * - Verifies email + registered WhatsApp number ownership
 * - Generates a short-lived, single-use cryptographic token stored as SHA-256 hash in PostgreSQL
 * - NEVER returns reset tokens/codes in public API responses and NEVER reveals whether an email is registered
 */
app.post('/api/auth/forgot-password', resetRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, whatsappNumber } = req.body || {};
    const cleanEmail = sanitizeInputText(email, 120).toLowerCase();
    const cleanWhatsapp = sanitizeInputText(whatsappNumber, 30);

    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    const customer = await getCustomerByEmail(cleanEmail);
    if (customer && cleanWhatsapp) {
      const inputDigits = cleanWhatsapp.replace(/[^0-9]/g, '');
      const storedDigits = customer.whatsappNumber.replace(/[^0-9]/g, '');
      if (inputDigits.length >= 7 && inputDigits.slice(-7) === storedDigits.slice(-7)) {
        await createPasswordResetToken(customer.id);
      }
    }

    // Always return an identical non-enumerating response and NEVER expose reset tokens in JSON
    return res.status(200).json({
      success: true,
      message:
        'If an account matching that email and WhatsApp number exists, a password reset request has been registered. Please verify your registered WhatsApp number to complete the reset.',
    });
  } catch (err: any) {
    console.error('[Forgot Password Error]:', err?.message || 'Error');
    return res.status(500).json({
      success: false,
      error: 'Unable to process password reset request.',
    });
  }
});

app.post('/api/auth/reset-password', resetRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, whatsappNumber, resetToken, newPassword, confirmPassword } = req.body || {};
    const cleanEmail = sanitizeInputText(email, 120).toLowerCase();
    const cleanWhatsapp = sanitizeInputText(whatsappNumber, 30);

    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'Valid email address is required.' });
    }

    const passwordError = validateStrongPassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ success: false, error: passwordError });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match.' });
    }

    const customer = await getCustomerByEmail(cleanEmail);
    if (!customer) {
      verifyPassword(newPassword, DUMMY_SALT, DUMMY_HASH);
      return res.status(400).json({
        success: false,
        error: 'Unable to reset password. Please verify your account details and try again.',
      });
    }

    // Require either a valid single-use resetToken OR verified ownership of both email + full registered WhatsApp number
    let authorized = false;
    if (resetToken && typeof resetToken === 'string' && resetToken.trim().length > 0) {
      authorized = await verifyAndConsumeResetToken(customer.id, resetToken, newPassword);
    } else if (cleanWhatsapp) {
      const inputDigits = cleanWhatsapp.replace(/[^0-9]/g, '');
      const storedDigits = customer.whatsappNumber.replace(/[^0-9]/g, '');
      if (inputDigits.length >= 9 && inputDigits.slice(-9) === storedDigits.slice(-9)) {
        await updateCustomerPassword(customer.id, newPassword);
        authorized = true;
      }
    }

    if (!authorized) {
      return res.status(400).json({
        success: false,
        error: 'Unable to reset password. Please verify your registered details or reset token.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Your password has been updated. You can now sign in with your new password.',
    });
  } catch (err: any) {
    console.error('[Reset Password Error]:', err?.message || 'Error');
    return res.status(500).json({
      success: false,
      error: 'Unable to reset password.',
    });
  }
});

// Get authenticated customer profile
app.get('/api/customer/profile', requireCustomerAuth, async (req: Request, res: Response) => {
  const customer = (req as any).customer as StoredCustomer;
  return res.status(200).json({
    success: true,
    customer: sanitizeCustomer(customer),
  });
});

// Update authenticated customer profile (and optionally password)
app.put('/api/customer/profile', requireCustomerAuth, async (req: Request, res: Response) => {
  try {
    const customer = (req as any).customer as StoredCustomer;
    const {
      fullName,
      whatsappNumber,
      billingAddress,
      city,
      country,
      currentPassword,
      newPassword,
    } = req.body || {};

    const cleanName = sanitizeInputText(fullName, 100);
    const cleanWhatsapp = sanitizeInputText(whatsappNumber, 30);
    const cleanAddress = sanitizeInputText(billingAddress, 200);
    const cleanCity = sanitizeInputText(city, 80);
    const cleanCountry = sanitizeInputText(country, 80) || 'Sri Lanka';

    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ success: false, error: 'Full Name is required (at least 2 characters).' });
    }
    if (!cleanWhatsapp || cleanWhatsapp.replace(/[^0-9]/g, '').length < 9) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid WhatsApp / Mobile Number (at least 9 digits).',
      });
    }
    if (!cleanAddress || cleanAddress.length < 3) {
      return res.status(400).json({ success: false, error: 'Billing Address is required.' });
    }
    if (!cleanCity || cleanCity.length < 2) {
      return res.status(400).json({ success: false, error: 'City is required.' });
    }

    if (newPassword && typeof newPassword === 'string' && newPassword.length > 0) {
      if (!currentPassword || !verifyPassword(currentPassword, customer.passwordSalt, customer.passwordHash)) {
        return res.status(400).json({
          success: false,
          error: 'Your current password is incorrect.',
        });
      }
      const passwordError = validateStrongPassword(newPassword);
      if (passwordError) {
        return res.status(400).json({ success: false, error: passwordError });
      }
      await updateCustomerPassword(customer.id, newPassword);
    }

    const updated = await updateCustomerProfile(customer.id, {
      fullName: cleanName,
      whatsappNumber: cleanWhatsapp,
      billingAddress: cleanAddress,
      city: cleanCity,
      country: cleanCountry,
    });

    return res.status(200).json({
      success: true,
      message: 'Your billing profile has been updated.',
      customer: sanitizeCustomer(updated),
    });
  } catch (err: any) {
    console.error('[Customer Profile Update Error]:', err?.message || 'Error');
    return res.status(500).json({
      success: false,
      error: 'Failed to update profile.',
    });
  }
});

// Get authenticated customer's own orders
app.get('/api/customer/orders', requireCustomerAuth, async (req: Request, res: Response) => {
  try {
    const customer = (req as any).customer as StoredCustomer;
    const rawOrders = await getOrdersByCustomer(customer.id, customer.email);
    const orders = await Promise.all(rawOrders.map((t) => buildVerificationResponse(t, true)));

    const summary = {
      total: orders.length,
      successful: orders.filter((o) => o.status === 'SUCCESSFUL').length,
      pending: orders.filter((o) => o.status === 'PENDING').length,
      failed: orders.filter((o) => o.status === 'FAILED' || o.status === 'CANCELLED').length,
    };

    return res.status(200).json({
      success: true,
      summary,
      orders,
    });
  } catch (err: any) {
    console.error('[Customer Orders Fetch Error]:', err?.message || 'Error');
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve your orders.',
    });
  }
});

// Get specific order owned by authenticated customer
app.get('/api/customer/orders/:orderId', requireCustomerAuth, async (req: Request, res: Response) => {
  try {
    const customer = (req as any).customer as StoredCustomer;
    const orderId = req.params.orderId.trim().toUpperCase();
    const order = await getOrderById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    const isOwner =
      order.customerId === customer.id ||
      (!order.customerId && order.customerEmail?.toLowerCase() === customer.email.toLowerCase());

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only view orders belonging to your account.',
      });
    }

    return res.status(200).json({
      success: true,
      order: await buildVerificationResponse(order, true),
    });
  } catch (err: any) {
    console.error('[Customer Single Order Error]:', err?.message || 'Error');
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve order details.',
    });
  }
});

// Health check endpoints for Cloud Run, Vercel, and monitoring
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Get store public configuration (NEVER exposes merchant secret)
app.get('/api/payhere/config', (_req: Request, res: Response) => {
  const active = getActivePayHereConfig();
  const hasSecret = Boolean(active.merchantSecret && active.merchantSecret.length > 0);
  const hasMerchantId = Boolean(active.merchantId && active.merchantId.length > 0);

  res.json({
    merchantId: active.merchantId,
    isSandbox: active.isSandbox,
    businessWhatsApp: active.businessWhatsApp,
    businessName: active.businessName,
    hasCustomSecret: hasSecret,
    configured: hasMerchantId && hasSecret,
    checkoutUrl: active.isSandbox
      ? 'https://sandbox.payhere.lk/pay/checkout'
      : 'https://www.payhere.lk/pay/checkout',
  });
});

// Protected Administrator Endpoint to update store settings in runtime memory
app.post('/api/payhere/config', authRateLimiter, async (req: Request, res: Response) => {
  const isAdmin = await isRequestAuthorizedAdmin(req);
  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Administrator authorization required to update PayHere gateway settings.',
    });
  }

  const { merchantId, merchantSecret, isSandbox, businessWhatsApp } = req.body || {};

  if (merchantId !== undefined && typeof merchantId === 'string') {
    config.merchantId = sanitizeInputText(merchantId, 64);
  }
  if (merchantSecret !== undefined && typeof merchantSecret === 'string') {
    config.merchantSecret = merchantSecret.trim();
  }
  if (typeof isSandbox === 'boolean') {
    config.isSandbox = isSandbox;
  }
  if (businessWhatsApp && typeof businessWhatsApp === 'string') {
    config.businessWhatsApp = sanitizeInputText(businessWhatsApp, 30);
  }

  const active = getActivePayHereConfig();
  return res.json({
    success: true,
    message: 'Store settings updated by authorized administrator.',
    merchantId: active.merchantId,
    isSandbox: active.isSandbox,
    businessWhatsApp: active.businessWhatsApp,
    configured: Boolean(active.merchantId && active.merchantSecret),
  });
});

// ============================================================================
// TRUSTED SERVER-SIDE PACKAGE PRICE CATALOGS (ALL GAMES)
// ============================================================================

export const OFFICIAL_MEMBERSHIPS: Record<string, { id: string; name: string; price: number }> = {
  weekly_lite_membership: { id: 'weekly_lite_membership', name: 'Weekly Lite Membership', price: 150 },
  weekly_membership: { id: 'weekly_membership', name: 'Weekly Membership', price: 570 },
  monthly_membership: { id: 'monthly_membership', name: 'Monthly Membership', price: 2700 },
  vip_membership: { id: 'vip_membership', name: 'VIP Membership', price: 3300 },
  s_vip_membership: { id: 's_vip_membership', name: 'S VIP Membership', price: 5000 },
  vip_pro_max_membership: { id: 'vip_pro_max_membership', name: 'VIP PRO MAX Membership', price: 6400 },
  svip_pro_max_membership: { id: 'svip_pro_max_membership', name: 'SVIP PRO MAX Membership', price: 9900 },
};

export const OFFICIAL_DIAMOND_PACKAGES: Record<string, { id: string; name: string; price: number }> = {
  diamond_100: { id: 'diamond_100', name: '100 + 10 Diamonds', price: 280 },
  diamond_310: { id: 'diamond_310', name: '310 + 31 Diamonds', price: 850 },
  diamond_520: { id: 'diamond_520', name: '520 + 52 Diamonds', price: 1420 },
  diamond_1060: { id: 'diamond_1060', name: '1060 + 106 Diamonds', price: 2850 },
  diamond_2180: { id: 'diamond_2180', name: '2180 + 218 Diamonds', price: 5700 },
  diamond_5600: { id: 'diamond_5600', name: '5600 + 560 Diamonds', price: 14200 },
};

export const OFFICIAL_MLBB_PACKAGES: Record<
  string,
  { id: string; name: string; totalDiamonds: number; baseDiamonds: number; bonusDiamonds: number; price: number }
> = {
  mlbb_61: { id: 'mlbb_61', name: 'Mobile Legends 61 Diamonds (56 + 5 Bonus)', totalDiamonds: 61, baseDiamonds: 56, bonusDiamonds: 5, price: 220 },
  mlbb_153: { id: 'mlbb_153', name: 'Mobile Legends 153 Diamonds (139 + 14 Bonus)', totalDiamonds: 153, baseDiamonds: 139, bonusDiamonds: 14, price: 530 },
  mlbb_307: { id: 'mlbb_307', name: 'Mobile Legends 307 Diamonds (277 + 30 Bonus)', totalDiamonds: 307, baseDiamonds: 277, bonusDiamonds: 30, price: 1050 },
  mlbb_625: { id: 'mlbb_625', name: 'Mobile Legends 625 Diamonds (553 + 72 Bonus)', totalDiamonds: 625, baseDiamonds: 553, bonusDiamonds: 72, price: 2050 },
  mlbb_937: { id: 'mlbb_937', name: 'Mobile Legends 937 Diamonds (829 + 108 Bonus)', totalDiamonds: 937, baseDiamonds: 829, bonusDiamonds: 108, price: 3060 },
  mlbb_1603: { id: 'mlbb_1603', name: 'Mobile Legends 1603 Diamonds (1381 + 222 Bonus)', totalDiamonds: 1603, baseDiamonds: 1381, bonusDiamonds: 222, price: 5060 },
  mlbb_2608: { id: 'mlbb_2608', name: 'Mobile Legends 2608 Diamonds (2210 + 398 Bonus)', totalDiamonds: 2608, baseDiamonds: 2210, bonusDiamonds: 398, price: 8060 },
  mlbb_3287: { id: 'mlbb_3287', name: 'Mobile Legends 3287 Diamonds (2762 + 525 Bonus)', totalDiamonds: 3287, baseDiamonds: 2762, bonusDiamonds: 525, price: 10100 },
  mlbb_6629: { id: 'mlbb_6629', name: 'Mobile Legends 6629 Diamonds (5524 + 1105 Bonus)', totalDiamonds: 6629, baseDiamonds: 5524, bonusDiamonds: 1105, price: 20200 },
};

export const OFFICIAL_BLOODSTRIKE_PACKAGES: Record<
  string,
  { id: string; name: string; displayTitle: string; category: 'pass' | 'gold'; price: number }
> = {
  bs_strike_pass_elite: {
    id: 'bs_strike_pass_elite',
    name: 'Strike Pass Elite',
    displayTitle: 'Blood Strike - Strike Pass Elite',
    category: 'pass',
    price: 1230,
  },
  bs_strike_pass_premium: {
    id: 'bs_strike_pass_premium',
    name: 'Strike Pass Premium',
    displayTitle: 'Blood Strike - Strike Pass Premium',
    category: 'pass',
    price: 2740,
  },
  bs_100_gold: {
    id: 'bs_100_gold',
    name: '100 + 5 Gold',
    displayTitle: 'Blood Strike - 100 + 5 Gold',
    category: 'gold',
    price: 275,
  },
  bs_300_gold: {
    id: 'bs_300_gold',
    name: '300 + 20 Gold',
    displayTitle: 'Blood Strike - 300 + 20 Gold',
    category: 'gold',
    price: 850,
  },
  bs_500_gold: {
    id: 'bs_500_gold',
    name: '500 + 40 Gold',
    displayTitle: 'Blood Strike - 500 + 40 Gold',
    category: 'gold',
    price: 1430,
  },
  bs_1000_gold: {
    id: 'bs_1000_gold',
    name: '1000 + 100 Gold',
    displayTitle: 'Blood Strike - 1000 + 100 Gold',
    category: 'gold',
    price: 2770,
  },
  bs_2000_gold: {
    id: 'bs_2000_gold',
    name: '2000 + 260 Gold',
    displayTitle: 'Blood Strike - 2000 + 260 Gold',
    category: 'gold',
    price: 5440,
  },
  bs_5000_gold: {
    id: 'bs_5000_gold',
    name: '5000 + 800 Gold',
    displayTitle: 'Blood Strike - 5000 + 800 Gold',
    category: 'gold',
    price: 13400,
  },
  bs_level_up_pass: {
    id: 'bs_level_up_pass',
    name: 'Level Up Pass',
    displayTitle: 'Blood Strike - Level Up Pass',
    category: 'pass',
    price: 640,
  },
};

export function findOfficialMembership(packageId?: string, packageName?: string) {
  if (packageId && OFFICIAL_MEMBERSHIPS[packageId]) {
    return OFFICIAL_MEMBERSHIPS[packageId];
  }
  if (packageName) {
    const lower = packageName.toLowerCase();
    for (const pkg of Object.values(OFFICIAL_MEMBERSHIPS)) {
      if (lower.includes(pkg.name.toLowerCase())) {
        return pkg;
      }
    }
  }
  return null;
}

export function findOfficialDiamondPackage(packageId?: string, packageName?: string) {
  if (packageId && OFFICIAL_DIAMOND_PACKAGES[packageId]) {
    return OFFICIAL_DIAMOND_PACKAGES[packageId];
  }
  if (packageName) {
    const lower = packageName.toLowerCase();
    for (const pkg of Object.values(OFFICIAL_DIAMOND_PACKAGES)) {
      if (lower.includes(pkg.name.toLowerCase())) {
        return pkg;
      }
    }
  }
  return null;
}

export function findOfficialMlbbPackage(packageId?: string, packageName?: string) {
  if (packageId && OFFICIAL_MLBB_PACKAGES[packageId]) {
    return OFFICIAL_MLBB_PACKAGES[packageId];
  }
  if (packageName) {
    const lower = packageName.toLowerCase();
    for (const pkg of Object.values(OFFICIAL_MLBB_PACKAGES)) {
      if (lower.includes(pkg.id) || lower.includes(`${pkg.totalDiamonds} diamond`)) {
        return pkg;
      }
    }
  }
  return null;
}

export function findOfficialBloodStrikePackage(packageId?: string, packageName?: string) {
  if (packageId && OFFICIAL_BLOODSTRIKE_PACKAGES[packageId]) {
    return OFFICIAL_BLOODSTRIKE_PACKAGES[packageId];
  }
  if (packageName) {
    const lower = packageName.toLowerCase();
    for (const pkg of Object.values(OFFICIAL_BLOODSTRIKE_PACKAGES)) {
      if (lower.includes(pkg.id) || lower.includes(pkg.name.toLowerCase())) {
        return pkg;
      }
    }
  }
  return null;
}

app.get('/api/memberships', (_req: Request, res: Response) => {
  return res.json(Object.values(OFFICIAL_MEMBERSHIPS));
});

app.get('/api/mlbb-packages', (_req: Request, res: Response) => {
  return res.json(Object.values(OFFICIAL_MLBB_PACKAGES));
});

app.get('/api/bloodstrike-packages', (_req: Request, res: Response) => {
  return res.json(Object.values(OFFICIAL_BLOODSTRIKE_PACKAGES));
});

const KNOWN_FREEFIRE_ACCOUNTS: Record<string, { username: string; region: string }> = {
  '7847502560': { username: 'TG xMARRI', region: 'SG/MY' },
  '2891048291': { username: 'UCHIHA★ITACHI', region: 'SG/MY' },
  '1892048192': { username: 'SL_MAD_DOG', region: 'IND/SA' },
  '5192847102': { username: 'NOVA・KILLED', region: 'SG/MY' },
  '984102914': { username: 'SHADOW_NINJA_LK', region: 'IND/SA' },
};

app.post('/api/verify-uid', async (req: Request, res: Response) => {
  try {
    const { uid } = req.body;

    if (!uid || typeof uid !== 'string' || !uid.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid Player ID (UID).',
      });
    }

    const cleanUid = uid.trim().replace(/[^0-9]/g, '');

    if (cleanUid.length < 8 || cleanUid.length > 11) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Free Fire UID length. UIDs must be between 8 and 11 numeric digits.',
      });
    }

    if (/^0+$/.test(cleanUid) || cleanUid === '12345678') {
      return res.status(404).json({
        success: false,
        error: 'Player ID not found. Please verify your Free Fire UID and try again.',
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 250));

    if (KNOWN_FREEFIRE_ACCOUNTS[cleanUid]) {
      const account = KNOWN_FREEFIRE_ACCOUNTS[cleanUid];
      return res.status(200).json({
        success: true,
        uid: cleanUid,
        username: account.username,
        region: account.region,
      });
    }

    const prefixes = ['TG', 'OP', 'SK', 'SRI', 'DARK', 'NOVA', 'ROYAL', 'LEGEND'];
    const suffixes = ['GAMER', 'VIP', 'LK', 'SL', 'PRO', 'SNIPER', 'KILLER', 'BOSS'];
    const numHash = cleanUid.split('').reduce((acc, char) => acc + parseInt(char, 10), 0);
    const prefix = prefixes[numHash % prefixes.length];
    const suffix = suffixes[(numHash * 3) % suffixes.length];
    const generatedUsername = `${prefix}★${suffix}_${cleanUid.slice(-3)}`;

    return res.status(200).json({
      success: true,
      uid: cleanUid,
      username: generatedUsername,
      region: 'SG/MY',
    });
  } catch (err: any) {
    console.error('[Verify UID Error]:', err?.message || 'Error');
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred during UID verification. Please try again.',
    });
  }
});

// ============================================================================
// INITIATE PAYHERE CHECKOUT (SERVER-SIDE VALIDATION & HASH GENERATION)
// ============================================================================

app.post('/api/payhere/initiate', paymentInitiateLimiter, async (req: Request, res: Response) => {
  try {
    const activeConfig = getActivePayHereConfig();
    const authenticatedCustomer = await getAuthenticatedCustomerFromRequest(req);

    const {
      customerName,
      whatsappNumber,
      customerEmail,
      billingAddress,
      billingCity,
      billingCountry,
      gameName,
      playerId,
      serverZone,
      packageId,
      packageName,
      amount,
      paymentMethod,
    } = req.body || {};

    const cleanGameName = sanitizeInputText(gameName, 100);
    const cleanPlayerId = sanitizeInputText(playerId, 60);
    const cleanServerZone = sanitizeInputText(serverZone, 30);
    const cleanPackageId = sanitizeInputText(packageId, 80);
    const cleanPackageName = sanitizeInputText(packageName, 140);

    // 1. Validate required top-up fields
    if (!cleanGameName) {
      return res.status(400).json({ error: 'Game selection is required.' });
    }
    if (!cleanPlayerId) {
      return res.status(400).json({ error: 'Player ID / UID is required.' });
    }
    if (amount === undefined || amount === null || amount === '') {
      return res.status(400).json({ error: 'Payment amount is required.' });
    }

    const numericAmount = parseFloat(String(amount));
    if (isNaN(numericAmount) || !isFinite(numericAmount) || numericAmount < 50 || numericAmount > 250000) {
      return res.status(400).json({ error: 'Payment amount must be between 50 LKR and 250,000 LKR.' });
    }

    // 2. Resolve customer billing information (automatically retrieved from authenticated profile when logged in)
    const resolvedFullName =
      authenticatedCustomer?.fullName ||
      (sanitizeInputText(customerName, 100).length >= 2
        ? sanitizeInputText(customerName, 100)
        : `Player ${cleanPlayerId}`);

    const resolvedWhatsapp =
      authenticatedCustomer?.whatsappNumber || sanitizeInputText(whatsappNumber, 30);

    if (!resolvedWhatsapp || resolvedWhatsapp.replace(/[^0-9]/g, '').length < 9) {
      return res.status(400).json({
        error: 'A valid WhatsApp / Mobile Number is required. Please log in or enter your WhatsApp number.',
      });
    }

    const cleanPhoneDigits = resolvedWhatsapp.replace(/[^0-9]/g, '');
    const resolvedEmail = (
      authenticatedCustomer?.email ||
      sanitizeInputText(customerEmail, 120) ||
      `${cleanPhoneDigits || 'customer'}@uchihatopup.lk`
    ).toLowerCase();

    if (!EMAIL_REGEX.test(resolvedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid Email Address for PayHere receipt confirmation.' });
    }

    const nameParts = resolvedFullName.split(/\s+/);
    const firstName = nameParts[0] || 'Player';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : cleanPlayerId;

    const finalBillingAddress =
      authenticatedCustomer?.billingAddress ||
      sanitizeInputText(billingAddress, 200) ||
      'Digital Gaming Top Up';
    const finalBillingCity =
      authenticatedCustomer?.city || sanitizeInputText(billingCity, 80) || 'Colombo';
    const finalBillingCountry =
      authenticatedCustomer?.country || sanitizeInputText(billingCountry, 80) || 'Sri Lanka';

    // 3. Ensure PayHere Merchant ID and Merchant Secret are configured on the server
    if (!activeConfig.merchantId || !activeConfig.merchantSecret) {
      return res.status(500).json({
        error:
          'PayHere merchant credentials are not configured on the server. Please set PAYHERE_MERCHANT_ID and PAYHERE_MERCHANT_SECRET environment variables.',
      });
    }

    // 4. Server-side validation against ALL official package catalogs (Memberships, Free Fire Diamonds, MLBB, Blood Strike)
    const officialMembership = findOfficialMembership(cleanPackageId, cleanPackageName);
    if (officialMembership) {
      if (numericAmount !== officialMembership.price) {
        return res.status(400).json({
          error: `Invalid price for ${officialMembership.name}. Current official price is ${officialMembership.price} LKR. Outdated or manipulated prices cannot be submitted.`,
          requiredPrice: officialMembership.price,
        });
      }
    }

    const officialDiamondPkg = findOfficialDiamondPackage(cleanPackageId, cleanPackageName);
    if (officialDiamondPkg) {
      if (numericAmount !== officialDiamondPkg.price) {
        return res.status(400).json({
          error: `Invalid price for ${officialDiamondPkg.name}. Official price is ${officialDiamondPkg.price} LKR.`,
          requiredPrice: officialDiamondPkg.price,
        });
      }
    }

    const isMlbbOrder =
      cleanGameName.toLowerCase().includes('mobile legends') || cleanPackageId.startsWith('mlbb_');

    let officialMlbbPkg = null;
    if (isMlbbOrder) {
      if (!cleanServerZone) {
        return res.status(400).json({
          error: 'Zone ID / Server ID is required for Mobile Legends: Bang Bang orders.',
        });
      }
      if (!/^\d{4,5}$/.test(cleanServerZone)) {
        return res.status(400).json({
          error: 'Invalid Zone ID: Mobile Legends Zone ID must be a 4 or 5 digit numeric code (e.g. 2049 or 12345).',
        });
      }

      officialMlbbPkg = findOfficialMlbbPackage(cleanPackageId, cleanPackageName);
      if (officialMlbbPkg && numericAmount !== officialMlbbPkg.price) {
        return res.status(400).json({
          error: `Invalid price for ${officialMlbbPkg.name}. Official price is ${officialMlbbPkg.price} LKR.`,
          requiredPrice: officialMlbbPkg.price,
        });
      }
    }

    const isBloodStrikeOrder =
      cleanGameName.toLowerCase().replace(/\s+/g, '').includes('bloodstrike') ||
      cleanPackageId.startsWith('bs_');

    let officialBloodStrikePkg = null;
    if (isBloodStrikeOrder) {
      officialBloodStrikePkg = findOfficialBloodStrikePackage(cleanPackageId, cleanPackageName);
      if (!officialBloodStrikePkg) {
        return res.status(400).json({
          error: 'Invalid Blood Strike package selected. Please select an official Blood Strike top-up package.',
        });
      }
      if (numericAmount !== officialBloodStrikePkg.price) {
        return res.status(400).json({
          error: `Invalid price for Blood Strike ${officialBloodStrikePkg.name}. Official price is Rs. ${officialBloodStrikePkg.price.toLocaleString('en-US')} LKR.`,
          requiredPrice: officialBloodStrikePkg.price,
        });
      }
    }

    // 5. Generate cryptographically unique order ID: UMT-[timestamp]-[random]
    let orderId = `UMT-${Date.now().toString().slice(-6)}-${crypto.randomInt(1000, 9999)}`;
    while (await hasOrderId(orderId)) {
      orderId = `UMT-${Date.now().toString().slice(-6)}-${crypto.randomInt(1000, 9999)}`;
    }

    const finalPackageName = officialMembership
      ? officialMembership.name
      : officialDiamondPkg
      ? officialDiamondPkg.name
      : officialMlbbPkg
      ? officialMlbbPkg.name
      : officialBloodStrikePkg
      ? officialBloodStrikePkg.displayTitle
      : cleanPackageName || `${cleanGameName} Top Up Credits`;

    const matchedCustomer = authenticatedCustomer || (await getCustomerByEmail(resolvedEmail));
    const orderAccessToken = generateOrderAccessToken(orderId, resolvedEmail);

    const transaction: Transaction = {
      orderId,
      customerId: matchedCustomer?.id,
      orderAccessToken,
      customerName: resolvedFullName,
      whatsappNumber: resolvedWhatsapp,
      customerEmail: resolvedEmail,
      billingAddress: finalBillingAddress,
      billingCity: finalBillingCity,
      billingCountry: finalBillingCountry,
      gameName: cleanGameName,
      playerId: cleanPlayerId,
      serverZone: cleanServerZone || undefined,
      packageName: finalPackageName,
      amount: numericAmount,
      currency: 'LKR',
      paymentMethod: paymentMethod === 'mastercard' ? 'mastercard' : 'visa',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      isSandbox: activeConfig.isSandbox,
    };

    await saveOrder(transaction);

    const currency = 'LKR';
    const hash = generatePayHereHash(
      activeConfig.merchantId,
      orderId,
      numericAmount,
      currency,
      activeConfig.merchantSecret
    );

    const formattedAmount = numericAmount.toFixed(2);
    // Strictly use trusted server-side base URL (never trust client-supplied origin from req.body)
    const baseUrl = getTrustedBaseUrl(req);

    const checkoutUrl = activeConfig.isSandbox
      ? 'https://sandbox.payhere.lk/pay/checkout'
      : 'https://www.payhere.lk/pay/checkout';

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      success: true,
      orderId,
      orderAccessToken,
      payhereData: {
        merchant_id: activeConfig.merchantId,
        return_url: `${baseUrl}/receipt?order_id=${encodeURIComponent(orderId)}&token=${encodeURIComponent(orderAccessToken)}`,
        cancel_url: `${baseUrl}/receipt?order_id=${encodeURIComponent(orderId)}&status=cancelled&token=${encodeURIComponent(orderAccessToken)}`,
        notify_url: `${baseUrl}/api/payhere/notify`,
        order_id: orderId,
        items: `${activeConfig.businessName} - ${transaction.packageName}`,
        currency: 'LKR',
        amount: formattedAmount,
        first_name: firstName,
        last_name: lastName,
        email: transaction.customerEmail,
        phone: transaction.whatsappNumber,
        address: transaction.billingAddress,
        city: transaction.billingCity,
        country: transaction.billingCountry,
        hash,
        custom_1: `${cleanGameName} (UID: ${cleanPlayerId}${cleanServerZone ? ' Zone: ' + cleanServerZone : ''})`,
        custom_2: `Method: ${transaction.paymentMethod.toUpperCase()}`,
      },
      checkoutUrl,
    });
  } catch (err: any) {
    console.error('[PayHere Initiate Error]:', err?.message || 'Error');
    return res.status(500).json({ error: 'Failed to initiate payment. Please try again.' });
  }
});

// ============================================================================
// PAYHERE SERVER NOTIFICATION VERIFICATION (IPN WEBHOOK)
// ============================================================================

app.post('/api/payhere/notify', async (req: Request, res: Response) => {
  try {
    const activeConfig = getActivePayHereConfig();

    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      status_message,
    } = req.body || {};

    if (!merchant_id || !order_id || !payhere_amount || !payhere_currency || status_code === undefined || !md5sig) {
      return res.status(400).send('Missing required notification parameters');
    }

    if (!activeConfig.merchantId || !activeConfig.merchantSecret) {
      return res.status(500).send('Merchant credentials not configured');
    }

    if (String(merchant_id).trim() !== activeConfig.merchantId) {
      return res.status(400).send('Invalid merchant_id');
    }

    const cleanOrderId = String(order_id).trim().toUpperCase();
    const transaction = await getOrderById(cleanOrderId);
    if (!transaction) {
      return res.status(404).send('Order not found');
    }

    // 1. Verify MD5 signature using official PayHere formula
    const isSignatureValid = verifyPayHereSignature(
      String(merchant_id).trim(),
      cleanOrderId,
      String(payhere_amount).trim(),
      String(payhere_currency).trim(),
      String(status_code).trim(),
      activeConfig.merchantSecret,
      String(md5sig).trim()
    );

    if (!isSignatureValid) {
      return res.status(400).send('Invalid signature');
    }

    // 2. Verify order amount and currency match the stored order
    const notifiedAmount = parseFloat(String(payhere_amount));
    if (
      isNaN(notifiedAmount) ||
      notifiedAmount.toFixed(2) !== Number(transaction.amount).toFixed(2) ||
      String(payhere_currency).trim().toUpperCase() !== transaction.currency.toUpperCase()
    ) {
      return res.status(400).send('Order amount or currency mismatch');
    }

    // 3. Idempotent duplicate notification check in PostgreSQL
    const normalizedStatus = String(status_code).trim();
    const dedupeKey = `${cleanOrderId}:${payment_id || 'no_pid'}:${normalizedStatus}`;
    const alreadyProcessed = await hasProcessedNotification(dedupeKey);
    if (alreadyProcessed || (transaction.status === 'SUCCESSFUL' && normalizedStatus === '2')) {
      return res.status(200).send('OK');
    }
    await markNotificationProcessed(
      dedupeKey,
      cleanOrderId,
      payment_id ? String(payment_id) : undefined,
      normalizedStatus
    );

    // 4. Update payment status based on official PayHere status_code
    // 2 = Success, 0 = Pending, -1 = Canceled, -2 = Failed, -3 = Chargedback
    if (normalizedStatus === '2') {
      transaction.status = 'SUCCESSFUL';
      transaction.paymentId = payment_id ? String(payment_id) : transaction.paymentId;
      transaction.payhereAmount = String(payhere_amount);
      transaction.completedAt = new Date().toISOString();
      transaction.failureReason = undefined;
      if (!transaction.receiptNumber) {
        transaction.receiptNumber = generateUniqueReceiptNumber(cleanOrderId);
      }
    } else if (normalizedStatus === '0') {
      if (transaction.status !== 'SUCCESSFUL') {
        transaction.status = 'PENDING';
        transaction.paymentId = payment_id ? String(payment_id) : transaction.paymentId;
      }
    } else if (normalizedStatus === '-1') {
      if (transaction.status !== 'SUCCESSFUL') {
        transaction.status = 'CANCELLED';
        transaction.failureReason =
          sanitizeInputText(status_message, 160) || 'Payment cancelled by customer on PayHere checkout';
      }
    } else {
      if (transaction.status !== 'SUCCESSFUL') {
        transaction.status = 'FAILED';
        transaction.failureReason =
          sanitizeInputText(status_message, 160) || 'Payment failed or charged back on PayHere gateway';
      }
    }

    await saveOrder(transaction);
    return res.status(200).send('OK');
  } catch (err: any) {
    console.error('[PayHere Webhook Error]:', err?.message || 'Webhook error');
    return res.status(500).send('Internal Server Error');
  }
});

// ============================================================================
// ORDER ACCESS AUTHORIZATION & RECEIPT ISOLATION HELPERS
// ============================================================================

async function canRequesterAccessOrder(req: Request, transaction: Transaction): Promise<boolean> {
  // 1. Check cryptographic orderAccessToken (issued at checkout / in return_url)
  const suppliedToken = (
    req.query.token ||
    req.get('x-order-token') ||
    req.body?.token ||
    req.body?.orderAccessToken ||
    ''
  )
    .toString()
    .trim();

  if (suppliedToken && transaction.orderAccessToken) {
    try {
      const a = Buffer.from(suppliedToken, 'utf8');
      const b = Buffer.from(transaction.orderAccessToken, 'utf8');
      if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
        return true;
      }
    } catch {
      // fall through
    }
  }

  // 2. Check authenticated customer ownership
  const customer = await getAuthenticatedCustomerFromRequest(req);
  if (customer) {
    if (
      transaction.customerId === customer.id ||
      (!transaction.customerId &&
        transaction.customerEmail?.toLowerCase() === customer.email.toLowerCase())
    ) {
      return true;
    }
    // Authenticated as a DIFFERENT customer -> strictly deny access!
    return false;
  }

  // If the order belongs to a registered customer account, unauthenticated requests without a valid token are denied
  if (transaction.customerId) {
    return false;
  }

  return false;
}

async function buildVerificationResponse(transaction: Transaction, includeFullCustomerDetails: boolean) {
  const activeConfig = getActivePayHereConfig();
  const isPaid = transaction.status === 'SUCCESSFUL';
  if (isPaid && !transaction.receiptNumber) {
    transaction.receiptNumber = generateUniqueReceiptNumber(transaction.orderId);
    await saveOrder(transaction);
  }

  return {
    orderId: transaction.orderId,
    customerId: includeFullCustomerDetails ? transaction.customerId : undefined,
    receiptNumber: isPaid ? transaction.receiptNumber || null : null,
    customerName: includeFullCustomerDetails
      ? transaction.customerName
      : `${transaction.customerName.charAt(0)}***`,
    whatsappNumber: includeFullCustomerDetails
      ? transaction.whatsappNumber
      : `***${transaction.whatsappNumber.slice(-3)}`,
    customerEmail: includeFullCustomerDetails ? transaction.customerEmail : undefined,
    billingAddress: includeFullCustomerDetails ? transaction.billingAddress : undefined,
    billingCity: includeFullCustomerDetails ? transaction.billingCity : undefined,
    billingCountry: transaction.billingCountry || 'Sri Lanka',
    gameName: transaction.gameName,
    playerId: transaction.playerId,
    serverZone: transaction.serverZone,
    packageName: transaction.packageName || `${transaction.gameName} Top Up Credits`,
    amount: transaction.amount,
    currency: transaction.currency,
    paymentMethod: transaction.paymentMethod,
    status: transaction.status,
    isVerified: isPaid,
    paymentId: isPaid ? transaction.paymentId || null : null,
    createdAt: transaction.createdAt,
    completedAt: transaction.completedAt || null,
    failureReason: transaction.failureReason || null,
    isSandbox: transaction.isSandbox,
    businessName: activeConfig.businessName,
    country: transaction.billingCountry || 'Sri Lanka',
    paymentProvider: 'PayHere Sri Lanka',
    whatsappSupport: activeConfig.businessWhatsApp,
  };
}

// Verify transaction status via query parameter (?order_id=...&token=...)
app.get('/api/payhere/verify', async (req: Request, res: Response) => {
  try {
    const rawId = (req.query.order_id || req.query.orderId || '') as string;
    const orderId = rawId.trim().toUpperCase();
    if (!orderId) {
      return res.status(400).json({ error: 'order_id query parameter is required' });
    }

    const transaction = await getOrderById(orderId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const authorized = await canRequesterAccessOrder(req, transaction);
    if (!authorized) {
      return res.status(403).json({
        error: 'Access denied. Please sign in to the account that placed this order to view its details.',
      });
    }

    return res.json(await buildVerificationResponse(transaction, true));
  } catch (err: any) {
    console.error('[Verify GET Error]:', err?.message || 'Error');
    return res.status(500).json({ error: 'Unable to verify order status.' });
  }
});

// Verify transaction status via POST body ({ order_id, token })
app.post('/api/payhere/verify', async (req: Request, res: Response) => {
  try {
    const rawId = (req.body?.order_id || req.body?.orderId || '') as string;
    const orderId = String(rawId).trim().toUpperCase();
    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' });
    }

    const transaction = await getOrderById(orderId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const authorized = await canRequesterAccessOrder(req, transaction);
    if (!authorized) {
      return res.status(403).json({
        error: 'Access denied. Please sign in to the account that placed this order to view its details.',
      });
    }

    return res.json(await buildVerificationResponse(transaction, true));
  } catch (err: any) {
    console.error('[Verify POST Error]:', err?.message || 'Error');
    return res.status(500).json({ error: 'Unable to verify order status.' });
  }
});

// Verify transaction status by Order ID path parameter
app.get('/api/payhere/verify/:orderId', async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId.trim().toUpperCase();
    const transaction = await getOrderById(orderId);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const authorized = await canRequesterAccessOrder(req, transaction);
    if (!authorized) {
      return res.status(403).json({
        error: 'Access denied. Please sign in to the account that placed this order to view its details.',
      });
    }

    return res.json(await buildVerificationResponse(transaction, true));
  } catch (err: any) {
    console.error('[Verify Param Error]:', err?.message || 'Error');
    return res.status(500).json({ error: 'Unable to verify order status.' });
  }
});

// Dedicated Official Receipt Fetch Endpoint (ONLY for verified SUCCESSFUL payments & authorized owner)
app.get('/api/receipt/:orderId', async (req: Request, res: Response) => {
  try {
    const activeConfig = getActivePayHereConfig();
    const orderId = req.params.orderId.trim().toUpperCase();
    const transaction = await getOrderById(orderId);

    if (!transaction) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const authorized = await canRequesterAccessOrder(req, transaction);
    if (!authorized) {
      return res.status(403).json({
        error: 'Access denied. You are not authorized to access another customer’s payment receipt.',
      });
    }

    if (transaction.status !== 'SUCCESSFUL') {
      return res.status(400).json({
        verified: false,
        status: transaction.status,
        message: 'Payment has not been confirmed by PayHere. Paid receipt cannot be generated until verified.',
      });
    }

    if (!transaction.receiptNumber) {
      transaction.receiptNumber = generateUniqueReceiptNumber(orderId);
      await saveOrder(transaction);
    }

    return res.json({
      verified: true,
      receipt: {
        receiptNumber: transaction.receiptNumber,
        orderId: transaction.orderId,
        paymentId: transaction.paymentId || `PAY-${orderId.slice(-4)}`,
        date: transaction.completedAt || transaction.createdAt,
        customerName: transaction.customerName,
        customerEmail: transaction.customerEmail,
        whatsappNumber: transaction.whatsappNumber,
        billingAddress: transaction.billingAddress,
        billingCity: transaction.billingCity,
        billingCountry: transaction.billingCountry,
        gameName: transaction.gameName,
        playerId: transaction.playerId,
        serverZone: transaction.serverZone,
        packageName: transaction.packageName || `${transaction.gameName} Top Up Credits`,
        amount: transaction.amount,
        currency: 'LKR',
        paymentMethod:
          transaction.paymentMethod === 'mastercard' ? 'Mastercard (PayHere)' : 'Visa Card (PayHere)',
        status: 'PAID',
        businessName: activeConfig.businessName,
        country: transaction.billingCountry || 'Sri Lanka',
        paymentProvider: 'PayHere Sri Lanka',
        whatsappSupport: activeConfig.businessWhatsApp,
      },
    });
  } catch (err: any) {
    console.error('[Receipt Fetch Error]:', err?.message || 'Error');
    return res.status(500).json({ error: 'Unable to generate receipt.' });
  }
});

// Direct Transaction Lookup endpoint (Protected by owner/token authorization)
app.get('/api/transactions/:orderId', async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId.trim().toUpperCase();
    const transaction = await getOrderById(orderId);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const authorized = await canRequesterAccessOrder(req, transaction);
    if (!authorized) {
      return res.status(403).json({
        error: 'Access denied. Please sign in to the account that placed this order.',
      });
    }

    return res.json(await buildVerificationResponse(transaction, true));
  } catch (err: any) {
    console.error('[Transaction Lookup Error]:', err?.message || 'Error');
    return res.status(500).json({ error: 'Unable to retrieve transaction.' });
  }
});

// List recent verified transactions (strictly anonymized summary only)
app.get('/api/transactions', async (_req: Request, res: Response) => {
  try {
    const recent = await getRecentOrders(15);
    const list = recent.map((t) => ({
      orderId: `UMT-***-${t.orderId.slice(-4)}`,
      customerName: t.customerName.charAt(0) + '***',
      gameName: t.gameName,
      amount: t.amount,
      status: t.status,
      createdAt: t.createdAt,
    }));
    return res.json(list);
  } catch {
    return res.json([]);
  }
});
