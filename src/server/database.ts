import crypto from 'crypto';
import { and, desc, eq, gt, or } from 'drizzle-orm';
import { createPool, db } from '../db/index.ts';
import {
  customers,
  orders,
  passwordResetTokens,
  processedNotifications,
  revokedSessionTokens,
} from '../db/schema.ts';
import { CustomerProfile, TransactionDetails } from '../types.ts';

export interface StoredCustomer extends CustomerProfile {
  passwordHash: string;
  passwordSalt: string;
  firebaseUid?: string | null;
}

export interface StoredOrder extends TransactionDetails {
  customerId?: string;
  orderAccessToken?: string;
  receiptNumber?: string;
  payhereAmount?: string;
  completedAt?: string;
  failureReason?: string;
  isSandbox: boolean;
}

const PBKDF2_ITERATIONS = 120000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = 'sha512';

let schemaInitPromise: Promise<void> | null = null;

/**
 * Automatically creates missing PostgreSQL tables and indexes on first request
 * if the connected database does not have them yet (e.g., fresh Vercel Postgres/Supabase).
 * If tables already exist (e.g., provisioned via Cloud SQL UpdateSchema), skips DDL.
 */
export async function ensureSchemaInitialized(): Promise<void> {
  if (!process.env.SQL_HOST) {
    return;
  }
  if (!schemaInitPromise) {
    schemaInitPromise = (async () => {
      const pool = createPool();
      try {
        await pool.query('SELECT 1 FROM "customers" LIMIT 1');
        return;
      } catch (checkErr: any) {
        // Only run DDL if the table is missing (42P01 = undefined_table)
        if (checkErr?.code !== '42P01') {
          return;
        }
      }

      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS "users" (
            "id" serial PRIMARY KEY NOT NULL,
            "firebase_uid" varchar(128) NOT NULL UNIQUE,
            "email" varchar(255) NOT NULL,
            "created_at" timestamp DEFAULT now() NOT NULL
          );
          CREATE TABLE IF NOT EXISTS "customers" (
            "id" serial PRIMARY KEY NOT NULL,
            "customer_id" varchar(64) NOT NULL UNIQUE,
            "firebase_uid" varchar(128) UNIQUE,
            "full_name" varchar(120) NOT NULL,
            "email" varchar(255) NOT NULL UNIQUE,
            "whatsapp_number" varchar(40) NOT NULL,
            "billing_address" text NOT NULL,
            "city" varchar(100) NOT NULL,
            "country" varchar(100) DEFAULT 'Sri Lanka' NOT NULL,
            "password_hash" varchar(256) NOT NULL,
            "password_salt" varchar(128) NOT NULL,
            "email_verified" boolean DEFAULT true NOT NULL,
            "created_at" timestamp DEFAULT now() NOT NULL,
            "updated_at" timestamp DEFAULT now() NOT NULL
          );
          CREATE INDEX IF NOT EXISTS "customers_email_idx" ON "customers" ("email");
          CREATE INDEX IF NOT EXISTS "customers_customer_id_idx" ON "customers" ("customer_id");
          CREATE TABLE IF NOT EXISTS "orders" (
            "id" serial PRIMARY KEY NOT NULL,
            "order_id" varchar(64) NOT NULL UNIQUE,
            "customer_id" varchar(64),
            "order_access_token" varchar(128) NOT NULL,
            "receipt_number" varchar(64),
            "customer_name" varchar(120) NOT NULL,
            "customer_email" varchar(255) NOT NULL,
            "whatsapp_number" varchar(40) NOT NULL,
            "billing_address" text NOT NULL,
            "billing_city" varchar(100) NOT NULL,
            "billing_country" varchar(100) DEFAULT 'Sri Lanka' NOT NULL,
            "game_name" varchar(120) NOT NULL,
            "player_uid" varchar(120) NOT NULL,
            "server_zone" varchar(80),
            "package_name" varchar(200) NOT NULL,
            "amount_lkr" numeric(12, 2) NOT NULL,
            "currency" varchar(10) DEFAULT 'LKR' NOT NULL,
            "payment_method" varchar(32) DEFAULT 'visa' NOT NULL,
            "payment_status" varchar(32) DEFAULT 'PENDING' NOT NULL,
            "payhere_transaction_ref" varchar(128),
            "payhere_amount" varchar(64),
            "failure_reason" text,
            "is_sandbox" boolean DEFAULT true NOT NULL,
            "created_at" timestamp DEFAULT now() NOT NULL,
            "completed_at" timestamp
          );
          CREATE INDEX IF NOT EXISTS "orders_order_id_idx" ON "orders" ("order_id");
          CREATE INDEX IF NOT EXISTS "orders_customer_id_idx" ON "orders" ("customer_id");
          CREATE INDEX IF NOT EXISTS "orders_customer_email_idx" ON "orders" ("customer_email");
          CREATE TABLE IF NOT EXISTS "processed_notifications" (
            "id" serial PRIMARY KEY NOT NULL,
            "dedupe_key" varchar(255) NOT NULL UNIQUE,
            "order_id" varchar(64) NOT NULL,
            "payment_id" varchar(128),
            "status_code" varchar(16) NOT NULL,
            "processed_at" timestamp DEFAULT now() NOT NULL
          );
          CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
            "id" serial PRIMARY KEY NOT NULL,
            "customer_id" varchar(64) NOT NULL,
            "token_hash" varchar(128) NOT NULL,
            "expires_at" timestamp NOT NULL,
            "used" boolean DEFAULT false NOT NULL,
            "created_at" timestamp DEFAULT now() NOT NULL
          );
          CREATE INDEX IF NOT EXISTS "pwd_reset_customer_idx" ON "password_reset_tokens" ("customer_id");
          CREATE TABLE IF NOT EXISTS "revoked_session_tokens" (
            "id" serial PRIMARY KEY NOT NULL,
            "token_id" varchar(128) NOT NULL UNIQUE,
            "expires_at" timestamp NOT NULL,
            "revoked_at" timestamp DEFAULT now() NOT NULL
          );
        `);
      } catch (err) {
        console.warn('Auto-DDL skipped or not permitted for current database role:', err);
      }
    })();
  }
  await schemaInitPromise;
}

function getAuthSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.PAYHERE_MERCHANT_SECRET ||
    'uchiha-marri-topup-auth-hmac-secret-2026'
  );
}

export function hashPassword(password: string, salt?: string): { salt: string; hash: string } {
  const finalSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, finalSalt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
    .toString('hex');
  return { salt: finalSalt, hash };
}

export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  if (!password || !salt || !expectedHash) return false;
  const { hash } = hashPassword(password, salt);
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
  } catch {
    return false;
  }
}

export function validateStrongPassword(password: string): string | null {
  if (!password || typeof password !== 'string') {
    return 'Password is required.';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter (A-Z).';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter (a-z).';
  }
  if (!/[0-9]/.test(password) && !/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain at least one number or special character.';
  }
  return null;
}

export interface SessionTokenPayload {
  jti: string;
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

export function createSessionToken(customer: CustomerProfile, rememberMe = true): string {
  const now = Math.floor(Date.now() / 1000);
  const ttlSeconds = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 12; // 7 days vs 12 hours
  const payload: SessionTokenPayload = {
    jti: crypto.randomBytes(16).toString('hex'),
    sub: customer.id,
    email: customer.email,
    iat: now,
    exp: now + ttlSeconds,
  };
  const headerB64 = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getAuthSecret())
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url');
  return `${headerB64}.${payloadB64}.${signature}`;
}

export function verifySessionTokenSignature(token: string): SessionTokenPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', getAuthSecret())
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url');

  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as SessionTokenPayload;
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now || !payload.jti) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function revokeSessionToken(token: string): Promise<void> {
  const payload = verifySessionTokenSignature(token);
  if (!payload) return;
  try {
    await ensureSchemaInitialized();
    await db
      .insert(revokedSessionTokens)
      .values({
        tokenId: payload.jti,
        expiresAt: new Date(payload.exp * 1000),
      })
      .onConflictDoNothing();
  } catch (error) {
    console.error('Database query failed in revokeSessionToken:', error);
    throw new Error('Failed to revoke session token.', { cause: error });
  }
}

export async function isSessionTokenRevoked(jti: string): Promise<boolean> {
  try {
    await ensureSchemaInitialized();
    const rows = await db
      .select()
      .from(revokedSessionTokens)
      .where(eq(revokedSessionTokens.tokenId, jti))
      .limit(1);
    return rows.length > 0;
  } catch (error) {
    console.error('Database query failed in isSessionTokenRevoked:', error);
    return false;
  }
}

function mapCustomerRow(row: typeof customers.$inferSelect): StoredCustomer {
  return {
    id: row.customerId,
    fullName: row.fullName,
    email: row.email,
    whatsappNumber: row.whatsappNumber,
    billingAddress: row.billingAddress,
    city: row.city,
    country: row.country,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    passwordHash: row.passwordHash,
    passwordSalt: row.passwordSalt,
    firebaseUid: row.firebaseUid,
  };
}

export function sanitizeCustomer(customer: StoredCustomer): CustomerProfile {
  return {
    id: customer.id,
    fullName: customer.fullName,
    email: customer.email,
    whatsappNumber: customer.whatsappNumber,
    billingAddress: customer.billingAddress,
    city: customer.city,
    country: customer.country,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  };
}

export async function getCustomerByEmail(email: string): Promise<StoredCustomer | null> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    await ensureSchemaInitialized();
    const rows = await db
      .select()
      .from(customers)
      .where(eq(customers.email, cleanEmail))
      .limit(1);
    return rows[0] ? mapCustomerRow(rows[0]) : null;
  } catch (error) {
    console.error('Database query failed in getCustomerByEmail:', error);
    throw new Error('Database query failed while looking up customer.', { cause: error });
  }
}

export async function getCustomerById(id: string): Promise<StoredCustomer | null> {
  try {
    await ensureSchemaInitialized();
    const rows = await db
      .select()
      .from(customers)
      .where(eq(customers.customerId, id))
      .limit(1);
    return rows[0] ? mapCustomerRow(rows[0]) : null;
  } catch (error) {
    console.error('Database query failed in getCustomerById:', error);
    throw new Error('Database query failed while looking up customer.', { cause: error });
  }
}

export async function getCustomerByFirebaseUid(firebaseUid: string): Promise<StoredCustomer | null> {
  try {
    await ensureSchemaInitialized();
    const rows = await db
      .select()
      .from(customers)
      .where(eq(customers.firebaseUid, firebaseUid))
      .limit(1);
    return rows[0] ? mapCustomerRow(rows[0]) : null;
  } catch (error) {
    console.error('Database query failed in getCustomerByFirebaseUid:', error);
    throw new Error('Database query failed while looking up customer.', { cause: error });
  }
}

export async function createCustomer(data: {
  fullName: string;
  email: string;
  whatsappNumber: string;
  billingAddress: string;
  city: string;
  country: string;
  password: string;
  firebaseUid?: string;
}): Promise<StoredCustomer> {
  const cleanEmail = data.email.trim().toLowerCase();
  const { salt, hash } = hashPassword(data.password);
  const customerId = `CUST-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomBytes(4)
    .toString('hex')
    .toUpperCase()}`;

  try {
    await ensureSchemaInitialized();
    const inserted = await db
      .insert(customers)
      .values({
        customerId,
        firebaseUid: data.firebaseUid || null,
        fullName: data.fullName.trim(),
        email: cleanEmail,
        whatsappNumber: data.whatsappNumber.trim(),
        billingAddress: data.billingAddress.trim(),
        city: data.city.trim(),
        country: data.country.trim() || 'Sri Lanka',
        passwordHash: hash,
        passwordSalt: salt,
        emailVerified: true,
      })
      .returning();

    return mapCustomerRow(inserted[0]);
  } catch (error) {
    console.error('Database query failed in createCustomer:', error);
    throw new Error('Could not create customer account.', { cause: error });
  }
}

export async function updateCustomerProfile(
  customerId: string,
  updates: {
    fullName: string;
    whatsappNumber: string;
    billingAddress: string;
    city: string;
    country: string;
  }
): Promise<StoredCustomer> {
  try {
    await ensureSchemaInitialized();
    const updated = await db
      .update(customers)
      .set({
        fullName: updates.fullName.trim(),
        whatsappNumber: updates.whatsappNumber.trim(),
        billingAddress: updates.billingAddress.trim(),
        city: updates.city.trim(),
        country: updates.country.trim() || 'Sri Lanka',
        updatedAt: new Date(),
      })
      .where(eq(customers.customerId, customerId))
      .returning();

    if (!updated[0]) {
      throw new Error('Customer account not found.');
    }
    return mapCustomerRow(updated[0]);
  } catch (error) {
    console.error('Database query failed in updateCustomerProfile:', error);
    throw new Error('Failed to update customer profile.', { cause: error });
  }
}

export async function updateCustomerPassword(customerId: string, newPassword: string): Promise<void> {
  const { salt, hash } = hashPassword(newPassword);
  try {
    await ensureSchemaInitialized();
    await db
      .update(customers)
      .set({
        passwordHash: hash,
        passwordSalt: salt,
        updatedAt: new Date(),
      })
      .where(eq(customers.customerId, customerId));
  } catch (error) {
    console.error('Database query failed in updateCustomerPassword:', error);
    throw new Error('Failed to update customer password.', { cause: error });
  }
}

/**
 * Generates a cryptographically random, single-use, 15-minute password reset token.
 * Stores ONLY its SHA-256 hash in PostgreSQL.
 */
export async function createPasswordResetToken(customerId: string): Promise<{ token: string; expiresAt: Date }> {
  const rawToken = crypto.randomBytes(24).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  try {
    await ensureSchemaInitialized();
    // Invalidate any previous unused tokens for this customer
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.customerId, customerId));

    await db.insert(passwordResetTokens).values({
      customerId,
      tokenHash,
      expiresAt,
      used: false,
    });

    return { token: rawToken, expiresAt };
  } catch (error) {
    console.error('Database query failed in createPasswordResetToken:', error);
    throw new Error('Failed to create password reset token.', { cause: error });
  }
}

export async function verifyAndConsumeResetToken(
  customerId: string,
  rawToken: string,
  newPassword: string
): Promise<boolean> {
  const tokenHash = crypto.createHash('sha256').update(rawToken.trim()).digest('hex');
  const now = new Date();

  try {
    await ensureSchemaInitialized();
    const rows = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.customerId, customerId),
          eq(passwordResetTokens.tokenHash, tokenHash),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, now)
        )
      )
      .limit(1);

    if (!rows[0]) {
      return false;
    }

    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, rows[0].id));

    await updateCustomerPassword(customerId, newPassword);
    return true;
  } catch (error) {
    console.error('Database query failed in verifyAndConsumeResetToken:', error);
    throw new Error('Failed to verify password reset token.', { cause: error });
  }
}

// ============================================================================
// ORDER PERSISTENCE IN POSTGRESQL
// ============================================================================

export function generateOrderAccessToken(orderId: string, customerEmail: string): string {
  return crypto
    .createHmac('sha256', getAuthSecret())
    .update(`order-access:${orderId}:${customerEmail.trim().toLowerCase()}`)
    .digest('hex');
}

function mapOrderRow(row: typeof orders.$inferSelect): StoredOrder {
  return {
    orderId: row.orderId,
    customerId: row.customerId || undefined,
    orderAccessToken: row.orderAccessToken,
    receiptNumber: row.receiptNumber || undefined,
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    whatsappNumber: row.whatsappNumber,
    billingAddress: row.billingAddress,
    billingCity: row.billingCity,
    billingCountry: row.billingCountry,
    gameName: row.gameName,
    playerId: row.playerUid,
    serverZone: row.serverZone || undefined,
    packageName: row.packageName,
    amount: parseFloat(String(row.amountLkr)),
    currency: row.currency,
    paymentMethod: row.paymentMethod === 'mastercard' ? 'mastercard' : 'visa',
    status: (row.paymentStatus as StoredOrder['status']) || 'PENDING',
    paymentId: row.payhereTransactionRef || undefined,
    payhereAmount: row.payhereAmount || undefined,
    failureReason: row.failureReason || undefined,
    isSandbox: row.isSandbox,
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt ? row.completedAt.toISOString() : undefined,
  };
}

export async function saveOrder(order: StoredOrder): Promise<StoredOrder> {
  const emailFallback = order.customerEmail || 'customer@uchihatopup.lk';
  const accessToken =
    order.orderAccessToken || generateOrderAccessToken(order.orderId, emailFallback);

  try {
    await ensureSchemaInitialized();
    const values = {
      orderId: order.orderId,
      customerId: order.customerId || null,
      orderAccessToken: accessToken,
      receiptNumber: order.receiptNumber || null,
      customerName: order.customerName,
      customerEmail: emailFallback,
      whatsappNumber: order.whatsappNumber,
      billingAddress: order.billingAddress || 'Digital Gaming Top Up',
      billingCity: order.billingCity || 'Colombo',
      billingCountry: order.billingCountry || 'Sri Lanka',
      gameName: order.gameName,
      playerUid: order.playerId,
      serverZone: order.serverZone || null,
      packageName: order.packageName || `${order.gameName} Top Up Credits`,
      amountLkr: Number(order.amount).toFixed(2),
      currency: order.currency || 'LKR',
      paymentMethod: order.paymentMethod || 'visa',
      paymentStatus: order.status || 'PENDING',
      payhereTransactionRef: order.paymentId || null,
      payhereAmount: order.payhereAmount || null,
      failureReason: order.failureReason || null,
      isSandbox: order.isSandbox,
      completedAt: order.completedAt ? new Date(order.completedAt) : null,
    };

    const upserted = await db
      .insert(orders)
      .values(values)
      .onConflictDoUpdate({
        target: orders.orderId,
        set: {
          customerId: values.customerId,
          receiptNumber: values.receiptNumber,
          paymentStatus: values.paymentStatus,
          payhereTransactionRef: values.payhereTransactionRef,
          payhereAmount: values.payhereAmount,
          failureReason: values.failureReason,
          completedAt: values.completedAt,
        },
      })
      .returning();

    return mapOrderRow(upserted[0]);
  } catch (error) {
    console.error('Database query failed in saveOrder:', error);
    throw new Error('Failed to persist order in database.', { cause: error });
  }
}

export async function getOrderById(orderId: string): Promise<StoredOrder | null> {
  if (!orderId) return null;
  const cleanId = orderId.trim().toUpperCase();
  try {
    await ensureSchemaInitialized();
    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.orderId, cleanId))
      .limit(1);
    return rows[0] ? mapOrderRow(rows[0]) : null;
  } catch (error) {
    console.error('Database query failed in getOrderById:', error);
    throw new Error('Database query failed while retrieving order.', { cause: error });
  }
}

export async function hasOrderId(orderId: string): Promise<boolean> {
  const existing = await getOrderById(orderId);
  return Boolean(existing);
}

export async function getOrdersByCustomer(
  customerId: string,
  customerEmail?: string
): Promise<StoredOrder[]> {
  try {
    await ensureSchemaInitialized();
    const cleanEmail = customerEmail?.trim().toLowerCase();
    const condition = cleanEmail
      ? or(eq(orders.customerId, customerId), eq(orders.customerEmail, cleanEmail))
      : eq(orders.customerId, customerId);

    const rows = await db
      .select()
      .from(orders)
      .where(condition)
      .orderBy(desc(orders.createdAt));

    return rows.map(mapOrderRow);
  } catch (error) {
    console.error('Database query failed in getOrdersByCustomer:', error);
    throw new Error('Database query failed while retrieving customer orders.', { cause: error });
  }
}

export async function getRecentOrders(limit = 15): Promise<StoredOrder[]> {
  try {
    await ensureSchemaInitialized();
    const rows = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(limit);
    return rows.map(mapOrderRow);
  } catch (error) {
    console.error('Database query failed in getRecentOrders:', error);
    throw new Error('Database query failed while retrieving recent orders.', { cause: error });
  }
}

export async function hasProcessedNotification(dedupeKey: string): Promise<boolean> {
  try {
    await ensureSchemaInitialized();
    const rows = await db
      .select()
      .from(processedNotifications)
      .where(eq(processedNotifications.dedupeKey, dedupeKey))
      .limit(1);
    return rows.length > 0;
  } catch (error) {
    console.error('Database query failed in hasProcessedNotification:', error);
    return false;
  }
}

export async function markNotificationProcessed(
  dedupeKey: string,
  orderId: string,
  paymentId: string | undefined,
  statusCode: string
): Promise<void> {
  try {
    await ensureSchemaInitialized();
    await db
      .insert(processedNotifications)
      .values({
        dedupeKey,
        orderId,
        paymentId: paymentId || null,
        statusCode,
      })
      .onConflictDoNothing();
  } catch (error) {
    console.error('Database query failed in markNotificationProcessed:', error);
    throw new Error('Failed to record processed notification.', { cause: error });
  }
}
