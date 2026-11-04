var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  customers: () => customers,
  customersRelations: () => customersRelations,
  orders: () => orders,
  ordersRelations: () => ordersRelations,
  passwordResetTokens: () => passwordResetTokens,
  processedNotifications: () => processedNotifications,
  revokedSessionTokens: () => revokedSessionTokens,
  users: () => users
});
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  numeric,
  pgTable,
  serial,
  text,
  timestamp
} from "drizzle-orm/pg-core";
var users, customers, orders, processedNotifications, passwordResetTokens, revokedSessionTokens, customersRelations, ordersRelations;
var init_schema = __esm({
  "src/db/schema.ts"() {
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      uid: text("uid").notNull().unique(),
      email: text("email").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    customers = pgTable(
      "customers",
      {
        customerId: text("customer_id").primaryKey(),
        firebaseUid: text("firebase_uid").unique(),
        fullName: text("full_name").notNull(),
        email: text("email").notNull().unique(),
        whatsappNumber: text("whatsapp_number").notNull(),
        billingAddress: text("billing_address").notNull(),
        city: text("city").notNull(),
        country: text("country").notNull().default("Sri Lanka"),
        passwordHash: text("password_hash").notNull(),
        passwordSalt: text("password_salt").notNull(),
        emailVerified: boolean("email_verified").notNull().default(true),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull()
      },
      (table) => [
        index("idx_customers_email").on(table.email),
        index("idx_customers_firebase_uid").on(table.firebaseUid)
      ]
    );
    orders = pgTable(
      "orders",
      {
        orderId: text("order_id").primaryKey(),
        customerId: text("customer_id").references(() => customers.customerId),
        orderAccessToken: text("order_access_token").notNull(),
        receiptNumber: text("receipt_number"),
        customerName: text("customer_name").notNull(),
        customerEmail: text("customer_email").notNull(),
        whatsappNumber: text("whatsapp_number").notNull(),
        billingAddress: text("billing_address").notNull(),
        billingCity: text("billing_city").notNull(),
        billingCountry: text("billing_country").notNull().default("Sri Lanka"),
        gameName: text("game_name").notNull(),
        playerUid: text("player_uid").notNull(),
        serverZone: text("server_zone"),
        packageName: text("package_name").notNull(),
        amountLkr: numeric("amount_lkr", { precision: 12, scale: 2 }).notNull(),
        currency: text("currency").notNull().default("LKR"),
        paymentMethod: text("payment_method").notNull().default("visa"),
        paymentStatus: text("payment_status").notNull().default("PENDING"),
        payhereTransactionRef: text("payhere_transaction_ref"),
        payhereAmount: text("payhere_amount"),
        failureReason: text("failure_reason"),
        isSandbox: boolean("is_sandbox").notNull().default(true),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        completedAt: timestamp("completed_at")
      },
      (table) => [
        index("idx_orders_customer_id").on(table.customerId),
        index("idx_orders_payment_status").on(table.paymentStatus),
        index("idx_orders_created_at").on(table.createdAt)
      ]
    );
    processedNotifications = pgTable("processed_notifications", {
      dedupeKey: text("dedupe_key").primaryKey(),
      orderId: text("order_id").notNull(),
      paymentId: text("payment_id"),
      statusCode: text("status_code").notNull(),
      processedAt: timestamp("processed_at").defaultNow().notNull()
    });
    passwordResetTokens = pgTable(
      "password_reset_tokens",
      {
        id: serial("id").primaryKey(),
        customerId: text("customer_id").references(() => customers.customerId).notNull(),
        tokenHash: text("token_hash").notNull(),
        expiresAt: timestamp("expires_at").notNull(),
        used: boolean("used").notNull().default(false),
        createdAt: timestamp("created_at").defaultNow().notNull()
      },
      (table) => [index("idx_reset_tokens_customer").on(table.customerId)]
    );
    revokedSessionTokens = pgTable("revoked_session_tokens", {
      tokenId: text("token_id").primaryKey(),
      expiresAt: timestamp("expires_at").notNull(),
      revokedAt: timestamp("revoked_at").defaultNow().notNull()
    });
    customersRelations = relations(customers, ({ many }) => ({
      orders: many(orders)
    }));
    ordersRelations = relations(orders, ({ one }) => ({
      customer: one(customers, {
        fields: [orders.customerId],
        references: [customers.customerId]
      })
    }));
  }
});

// src/db/index.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
var createPool, pool, db;
var init_db = __esm({
  "src/db/index.ts"() {
    init_schema();
    createPool = () => {
      if (!global._postgresPool) {
        global._postgresPool = new Pool({
          host: process.env.SQL_HOST,
          user: process.env.SQL_USER,
          password: process.env.SQL_PASSWORD,
          database: process.env.SQL_DB_NAME,
          max: 10,
          connectionTimeoutMillis: 15e3
        });
        global._postgresPool.on("error", (err) => {
          console.error("Unexpected error on idle SQL pool client:", err);
        });
      }
      return global._postgresPool;
    };
    pool = createPool();
    db = drizzle(pool, { schema: schema_exports });
  }
});

// firebase-applet-config.json
var firebase_applet_config_default;
var init_firebase_applet_config = __esm({
  "firebase-applet-config.json"() {
    firebase_applet_config_default = {
      projectId: "composite-signal-f01dl",
      appId: "1:587158995593:web:8cb7a24717cbb7f02abc58",
      apiKey: "AIzaSyDgwvFYwphZI9iujeCgvJJ5uhaklDZAIOk",
      authDomain: "composite-signal-f01dl.firebaseapp.com",
      firestoreDatabaseId: "ai-studio-uchihamarritopup-e2ae5d7e-8d99-4580-b81f-cd3b118b06e7",
      storageBucket: "composite-signal-f01dl.firebasestorage.app",
      messagingSenderId: "587158995593",
      measurementId: "",
      oAuthClientId: "587158995593-nc9og5qfch9ga9h3417coutmus33a521.apps.googleusercontent.com",
      recaptchaSiteKey: ""
    };
  }
});

// src/lib/firebase-admin.ts
var firebase_admin_exports = {};
__export(firebase_admin_exports, {
  adminAuth: () => adminAuth
});
import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
var adminAuthInstance, adminAuth;
var init_firebase_admin = __esm({
  "src/lib/firebase-admin.ts"() {
    init_firebase_applet_config();
    adminAuthInstance = null;
    try {
      if (!getApps().length) {
        initializeApp({
          projectId: firebase_applet_config_default.projectId
        });
      }
      adminAuthInstance = getAuth();
    } catch (error) {
      console.warn("Firebase Admin initialization warning:", error);
    }
    adminAuth = {
      verifyIdToken: async (token) => {
        if (!adminAuthInstance) {
          throw new Error("Firebase Admin Auth is not initialized in this environment.");
        }
        return adminAuthInstance.verifyIdToken(token);
      }
    };
  }
});

// src/db/users.ts
var users_exports = {};
__export(users_exports, {
  getOrCreateUser: () => getOrCreateUser
});
async function getOrCreateUser(uid, email) {
  try {
    const result = await db.insert(users).values({
      uid,
      email
    }).onConflictDoUpdate({
      target: users.uid,
      set: {
        email
      }
    }).returning();
    return result[0];
  } catch (error) {
    console.error("Database query failed in getOrCreateUser:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}
var init_users = __esm({
  "src/db/users.ts"() {
    init_db();
    init_schema();
  }
});

// server.ts
import express2 from "express";
import path2 from "path";
import fs2 from "fs";
import { fileURLToPath } from "url";
import dotenv2 from "dotenv";

// src/server/app.ts
import express from "express";
import crypto2 from "crypto";
import dotenv from "dotenv";

// src/server/database.ts
init_db();
init_schema();
import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import { and, desc, eq, gt, or } from "drizzle-orm";
var PBKDF2_ITERATIONS = 12e4;
var PBKDF2_KEYLEN = 64;
var PBKDF2_DIGEST = "sha512";
var FALLBACK_FILE = path.join(os.tmpdir(), "uchiha-marri-topup-fallback.json");
var fallbackMemory = {
  customers: {},
  orders: {},
  processedNotifications: {},
  resetTokens: [],
  revokedTokens: {}
};
var fallbackLoaded = false;
function loadFallbackStore() {
  if (!fallbackLoaded) {
    fallbackLoaded = true;
    try {
      if (fs.existsSync(FALLBACK_FILE)) {
        const raw = fs.readFileSync(FALLBACK_FILE, "utf8");
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          fallbackMemory.customers = parsed.customers || {};
          fallbackMemory.orders = parsed.orders || {};
          fallbackMemory.processedNotifications = parsed.processedNotifications || {};
          fallbackMemory.resetTokens = Array.isArray(parsed.resetTokens) ? parsed.resetTokens : [];
          fallbackMemory.revokedTokens = parsed.revokedTokens || {};
        }
      }
    } catch {
    }
  }
  return fallbackMemory;
}
function saveFallbackStore() {
  try {
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(fallbackMemory), "utf8");
  } catch {
  }
}
var schemaInitPromise = null;
var postgresAvailable = null;
async function ensureSchemaInitialized() {
  if (!process.env.SQL_HOST) {
    postgresAvailable = false;
    return false;
  }
  if (postgresAvailable !== null) {
    return postgresAvailable;
  }
  if (!schemaInitPromise) {
    schemaInitPromise = (async () => {
      const pool2 = createPool();
      try {
        await pool2.query('SELECT 1 FROM "customers" LIMIT 1');
        postgresAvailable = true;
        return true;
      } catch (checkErr) {
        if (checkErr?.code !== "42P01") {
          console.warn("[Database] PostgreSQL connection unavailable, activating resilient fallback store:", checkErr?.message || checkErr);
          postgresAvailable = false;
          return false;
        }
      }
      try {
        await pool2.query(`
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
        postgresAvailable = true;
        return true;
      } catch (err) {
        console.warn("Auto-DDL skipped or failed:", err);
        postgresAvailable = false;
        return false;
      }
    })();
  }
  return schemaInitPromise;
}
function getAuthSecret() {
  return process.env.AUTH_SECRET || "uchiha-marri-topup-auth-hmac-secret-2026";
}
function hashPassword(password, salt) {
  const finalSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, finalSalt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST).toString("hex");
  return { salt: finalSalt, hash };
}
function verifyPassword(password, salt, expectedHash) {
  if (!password || !salt || !expectedHash) return false;
  const { hash } = hashPassword(password, salt);
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(expectedHash, "hex"));
  } catch {
    return false;
  }
}
function validateStrongPassword(password) {
  if (!password || typeof password !== "string") {
    return "Password is required.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter (A-Z).";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter (a-z).";
  }
  if (!/[0-9]/.test(password) && !/[^A-Za-z0-9]/.test(password)) {
    return "Password must contain at least one number or special character.";
  }
  return null;
}
function createSessionToken(customer, rememberMe = true) {
  const now = Math.floor(Date.now() / 1e3);
  const ttlSeconds = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 12;
  const payload = {
    jti: crypto.randomBytes(16).toString("hex"),
    sub: customer.id,
    email: customer.email,
    iat: now,
    exp: now + ttlSeconds
  };
  const headerB64 = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", getAuthSecret()).update(`${headerB64}.${payloadB64}`).digest("base64url");
  return `${headerB64}.${payloadB64}.${signature}`;
}
function verifySessionTokenSignature(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, sig] = parts;
  const expectedSig = crypto.createHmac("sha256", getAuthSecret()).update(`${headerB64}.${payloadB64}`).digest("base64url");
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    const now = Math.floor(Date.now() / 1e3);
    if (!payload.exp || payload.exp < now || !payload.jti) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
async function revokeSessionToken(token) {
  const payload = verifySessionTokenSignature(token);
  if (!payload) return;
  const usePg = await ensureSchemaInitialized();
  if (!usePg) {
    const store = loadFallbackStore();
    store.revokedTokens[payload.jti] = new Date(payload.exp * 1e3).toISOString();
    saveFallbackStore();
    return;
  }
  try {
    await db.insert(revokedSessionTokens).values({
      tokenId: payload.jti,
      expiresAt: new Date(payload.exp * 1e3)
    }).onConflictDoNothing();
  } catch (error) {
    console.error("Database query failed in revokeSessionToken:", error);
    const store = loadFallbackStore();
    store.revokedTokens[payload.jti] = new Date(payload.exp * 1e3).toISOString();
    saveFallbackStore();
  }
}
async function isSessionTokenRevoked(jti) {
  const usePg = await ensureSchemaInitialized();
  if (!usePg) {
    const store = loadFallbackStore();
    return Boolean(store.revokedTokens[jti]);
  }
  try {
    const rows = await db.select().from(revokedSessionTokens).where(eq(revokedSessionTokens.tokenId, jti)).limit(1);
    return rows.length > 0;
  } catch (error) {
    console.error("Database query failed in isSessionTokenRevoked:", error);
    const store = loadFallbackStore();
    return Boolean(store.revokedTokens[jti]);
  }
}
function mapCustomerRow(row) {
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
    firebaseUid: row.firebaseUid
  };
}
function sanitizeCustomer(customer) {
  return {
    id: customer.id,
    fullName: customer.fullName,
    email: customer.email,
    whatsappNumber: customer.whatsappNumber,
    billingAddress: customer.billingAddress,
    city: customer.city,
    country: customer.country,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt
  };
}
async function getCustomerByEmail(email) {
  const cleanEmail = email.trim().toLowerCase();
  const usePg = await ensureSchemaInitialized();
  if (!usePg) {
    const store = loadFallbackStore();
    const found = Object.values(store.customers).find((c) => c.email.toLowerCase() === cleanEmail);
    return found || null;
  }
  try {
    const rows = await db.select().from(customers).where(eq(customers.email, cleanEmail)).limit(1);
    return rows[0] ? mapCustomerRow(rows[0]) : null;
  } catch (error) {
    console.error("Database query failed in getCustomerByEmail:", error);
    const store = loadFallbackStore();
    const found = Object.values(store.customers).find((c) => c.email.toLowerCase() === cleanEmail);
    return found || null;
  }
}
async function getCustomerById(id) {
  const usePg = await ensureSchemaInitialized();
  if (!usePg) {
    const store = loadFallbackStore();
    return store.customers[id] || null;
  }
  try {
    const rows = await db.select().from(customers).where(eq(customers.customerId, id)).limit(1);
    return rows[0] ? mapCustomerRow(rows[0]) : null;
  } catch (error) {
    console.error("Database query failed in getCustomerById:", error);
    const store = loadFallbackStore();
    return store.customers[id] || null;
  }
}
async function getCustomerByFirebaseUid(firebaseUid) {
  const usePg = await ensureSchemaInitialized();
  if (!usePg) {
    const store = loadFallbackStore();
    const found = Object.values(store.customers).find((c) => c.firebaseUid === firebaseUid);
    return found || null;
  }
  try {
    const rows = await db.select().from(customers).where(eq(customers.firebaseUid, firebaseUid)).limit(1);
    return rows[0] ? mapCustomerRow(rows[0]) : null;
  } catch (error) {
    console.error("Database query failed in getCustomerByFirebaseUid:", error);
    const store = loadFallbackStore();
    const found = Object.values(store.customers).find((c) => c.firebaseUid === firebaseUid);
    return found || null;
  }
}
async function createCustomer(data) {
  const cleanEmail = data.email.trim().toLowerCase();
  const { salt, hash } = hashPassword(data.password);
  const customerId = `CUST-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  const fallbackRecord = {
    id: customerId,
    fullName: data.fullName.trim(),
    email: cleanEmail,
    whatsappNumber: data.whatsappNumber.trim(),
    billingAddress: data.billingAddress.trim(),
    city: data.city.trim(),
    country: data.country.trim() || "Sri Lanka",
    createdAt: nowIso,
    updatedAt: nowIso,
    passwordHash: hash,
    passwordSalt: salt,
    firebaseUid: data.firebaseUid || null
  };
  const usePg = await ensureSchemaInitialized();
  if (!usePg) {
    const store = loadFallbackStore();
    store.customers[customerId] = fallbackRecord;
    saveFallbackStore();
    return fallbackRecord;
  }
  try {
    const inserted = await db.insert(customers).values({
      customerId,
      firebaseUid: data.firebaseUid || null,
      fullName: data.fullName.trim(),
      email: cleanEmail,
      whatsappNumber: data.whatsappNumber.trim(),
      billingAddress: data.billingAddress.trim(),
      city: data.city.trim(),
      country: data.country.trim() || "Sri Lanka",
      passwordHash: hash,
      passwordSalt: salt,
      emailVerified: true
    }).returning();
    return mapCustomerRow(inserted[0]);
  } catch (error) {
    console.error("Database query failed in createCustomer:", error);
    const store = loadFallbackStore();
    store.customers[customerId] = fallbackRecord;
    saveFallbackStore();
    return fallbackRecord;
  }
}
async function updateCustomerProfile(customerId, updates) {
  const usePg = await ensureSchemaInitialized();
  if (!usePg) {
    const store = loadFallbackStore();
    const existing = store.customers[customerId];
    if (!existing) {
      throw new Error("Customer account not found.");
    }
    const updated = {
      ...existing,
      fullName: updates.fullName.trim(),
      whatsappNumber: updates.whatsappNumber.trim(),
      billingAddress: updates.billingAddress.trim(),
      city: updates.city.trim(),
      country: updates.country.trim() || "Sri Lanka",
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    store.customers[customerId] = updated;
    saveFallbackStore();
    return updated;
  }
  try {
    const updated = await db.update(customers).set({
      fullName: updates.fullName.trim(),
      whatsappNumber: updates.whatsappNumber.trim(),
      billingAddress: updates.billingAddress.trim(),
      city: updates.city.trim(),
      country: updates.country.trim() || "Sri Lanka",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(customers.customerId, customerId)).returning();
    if (!updated[0]) {
      throw new Error("Customer account not found.");
    }
    return mapCustomerRow(updated[0]);
  } catch (error) {
    console.error("Database query failed in updateCustomerProfile:", error);
    throw new Error("Failed to update customer profile.", { cause: error });
  }
}
async function updateCustomerPassword(customerId, newPassword) {
  const { salt, hash } = hashPassword(newPassword);
  const usePg = await ensureSchemaInitialized();
  if (!usePg) {
    const store = loadFallbackStore();
    const existing = store.customers[customerId];
    if (existing) {
      existing.passwordHash = hash;
      existing.passwordSalt = salt;
      existing.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      saveFallbackStore();
    }
    return;
  }
  try {
    await db.update(customers).set({
      passwordHash: hash,
      passwordSalt: salt,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(customers.customerId, customerId));
  } catch (error) {
    console.error("Database query failed in updateCustomerPassword:", error);
    throw new Error("Failed to update customer password.", { cause: error });
  }
}
async function createPasswordResetToken(customerId) {
  const rawToken = crypto.randomBytes(24).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1e3);
  const usePg = await ensureSchemaInitialized();
  if (!usePg) {
    const store = loadFallbackStore();
    for (const t of store.resetTokens) {
      if (t.customerId === customerId) t.used = true;
    }
    store.resetTokens.push({
      id: Date.now(),
      customerId,
      tokenHash,
      expiresAt: expiresAt.toISOString(),
      used: false
    });
    saveFallbackStore();
    return { token: rawToken, expiresAt };
  }
  try {
    await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.customerId, customerId));
    await db.insert(passwordResetTokens).values({
      customerId,
      tokenHash,
      expiresAt,
      used: false
    });
    return { token: rawToken, expiresAt };
  } catch (error) {
    console.error("Database query failed in createPasswordResetToken:", error);
    throw new Error("Failed to create password reset token.", { cause: error });
  }
}
async function verifyAndConsumeResetToken(customerId, rawToken, newPassword) {
  const tokenHash = crypto.createHash("sha256").update(rawToken.trim()).digest("hex");
  const now = /* @__PURE__ */ new Date();
  const usePg = await ensureSchemaInitialized();
  if (!usePg) {
    const store = loadFallbackStore();
    const match = store.resetTokens.find(
      (t) => t.customerId === customerId && t.tokenHash === tokenHash && !t.used && new Date(t.expiresAt) > now
    );
    if (!match) return false;
    match.used = true;
    saveFallbackStore();
    await updateCustomerPassword(customerId, newPassword);
    return true;
  }
  try {
    const rows = await db.select().from(passwordResetTokens).where(
      and(
        eq(passwordResetTokens.customerId, customerId),
        eq(passwordResetTokens.tokenHash, tokenHash),
        eq(passwordResetTokens.used, false),
        gt(passwordResetTokens.expiresAt, now)
      )
    ).limit(1);
    if (!rows[0]) {
      return false;
    }
    await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, rows[0].id));
    await updateCustomerPassword(customerId, newPassword);
    return true;
  } catch (error) {
    console.error("Database query failed in verifyAndConsumeResetToken:", error);
    return false;
  }
}
function generateOrderAccessToken(orderId, customerEmail) {
  return crypto.createHmac("sha256", getAuthSecret()).update(`order-access:${orderId}:${customerEmail.trim().toLowerCase()}`).digest("hex");
}
function mapOrderRow(row) {
  return {
    orderId: row.orderId,
    customerId: row.customerId || void 0,
    orderAccessToken: row.orderAccessToken,
    receiptNumber: row.receiptNumber || void 0,
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    whatsappNumber: row.whatsappNumber,
    billingAddress: row.billingAddress,
    billingCity: row.billingCity,
    billingCountry: row.billingCountry,
    gameName: row.gameName,
    playerId: row.playerUid,
    serverZone: row.serverZone || void 0,
    packageName: row.packageName,
    amount: parseFloat(String(row.amountLkr)),
    currency: row.currency,
    paymentMethod: row.paymentMethod === "mastercard" ? "mastercard" : "visa",
    status: row.paymentStatus || "PENDING",
    paymentId: row.payhereTransactionRef || void 0,
    payhereAmount: row.payhereAmount || void 0,
    failureReason: row.failureReason || void 0,
    isSandbox: row.isSandbox,
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt ? row.completedAt.toISOString() : void 0
  };
}
async function saveOrder(order) {
  const emailFallback = order.customerEmail || "customer@uchihatopup.lk";
  const accessToken = order.orderAccessToken || generateOrderAccessToken(order.orderId, emailFallback);
  const normalizedOrder = {
    ...order,
    orderId: order.orderId.trim().toUpperCase(),
    customerEmail: emailFallback,
    orderAccessToken: accessToken,
    billingAddress: order.billingAddress || "Digital Gaming Top Up",
    billingCity: order.billingCity || "Colombo",
    billingCountry: order.billingCountry || "Sri Lanka",
    packageName: order.packageName || `${order.gameName} Top Up Credits`,
    currency: order.currency || "LKR",
    paymentMethod: order.paymentMethod || "visa",
    status: order.status || "PENDING",
    createdAt: order.createdAt || (/* @__PURE__ */ new Date()).toISOString()
  };
  const usePg = await ensureSchemaInitialized();
  if (!usePg) {
    const store = loadFallbackStore();
    store.orders[normalizedOrder.orderId] = normalizedOrder;
    saveFallbackStore();
    return normalizedOrder;
  }
  try {
    const values = {
      orderId: normalizedOrder.orderId,
      customerId: normalizedOrder.customerId || null,
      orderAccessToken: accessToken,
      receiptNumber: normalizedOrder.receiptNumber || null,
      customerName: normalizedOrder.customerName,
      customerEmail: emailFallback,
      whatsappNumber: normalizedOrder.whatsappNumber,
      billingAddress: normalizedOrder.billingAddress,
      billingCity: normalizedOrder.billingCity,
      billingCountry: normalizedOrder.billingCountry,
      gameName: normalizedOrder.gameName,
      playerUid: normalizedOrder.playerId,
      serverZone: normalizedOrder.serverZone || null,
      packageName: normalizedOrder.packageName,
      amountLkr: Number(normalizedOrder.amount).toFixed(2),
      currency: normalizedOrder.currency,
      paymentMethod: normalizedOrder.paymentMethod,
      paymentStatus: normalizedOrder.status,
      payhereTransactionRef: normalizedOrder.paymentId || null,
      payhereAmount: normalizedOrder.payhereAmount || null,
      failureReason: normalizedOrder.failureReason || null,
      isSandbox: normalizedOrder.isSandbox,
      completedAt: normalizedOrder.completedAt ? new Date(normalizedOrder.completedAt) : null
    };
    const upserted = await db.insert(orders).values(values).onConflictDoUpdate({
      target: orders.orderId,
      set: {
        customerId: values.customerId,
        receiptNumber: values.receiptNumber,
        paymentStatus: values.paymentStatus,
        payhereTransactionRef: values.payhereTransactionRef,
        payhereAmount: values.payhereAmount,
        failureReason: values.failureReason,
        completedAt: values.completedAt
      }
    }).returning();
    return mapOrderRow(upserted[0]);
  } catch (error) {
    console.error("Database query failed in saveOrder:", error);
    const store = loadFallbackStore();
    store.orders[normalizedOrder.orderId] = normalizedOrder;
    saveFallbackStore();
    return normalizedOrder;
  }
}
async function getOrderById(orderId) {
  if (!orderId) return null;
  const cleanId = orderId.trim().toUpperCase();
  const usePg = await ensureSchemaInitialized();
  if (!usePg) {
    const store = loadFallbackStore();
    return store.orders[cleanId] || null;
  }
  try {
    const rows = await db.select().from(orders).where(eq(orders.orderId, cleanId)).limit(1);
    return rows[0] ? mapOrderRow(rows[0]) : null;
  } catch (error) {
    console.error("Database query failed in getOrderById:", error);
    const store = loadFallbackStore();
    return store.orders[cleanId] || null;
  }
}
async function hasOrderId(orderId) {
  const existing = await getOrderById(orderId);
  return Boolean(existing);
}
async function getOrdersByCustomer(customerId, customerEmail) {
  const cleanEmail = customerEmail?.trim().toLowerCase();
  const usePg = await ensureSchemaInitialized();
  if (!usePg) {
    const store = loadFallbackStore();
    return Object.values(store.orders).filter(
      (o) => o.customerId === customerId || cleanEmail && o.customerEmail?.toLowerCase() === cleanEmail
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  try {
    const condition = cleanEmail ? or(eq(orders.customerId, customerId), eq(orders.customerEmail, cleanEmail)) : eq(orders.customerId, customerId);
    const rows = await db.select().from(orders).where(condition).orderBy(desc(orders.createdAt));
    return rows.map(mapOrderRow);
  } catch (error) {
    console.error("Database query failed in getOrdersByCustomer:", error);
    const store = loadFallbackStore();
    return Object.values(store.orders).filter(
      (o) => o.customerId === customerId || cleanEmail && o.customerEmail?.toLowerCase() === cleanEmail
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}
async function getRecentOrders(limit = 15) {
  const usePg = await ensureSchemaInitialized();
  if (!usePg) {
    const store = loadFallbackStore();
    return Object.values(store.orders).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
  }
  try {
    const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
    return rows.map(mapOrderRow);
  } catch (error) {
    console.error("Database query failed in getRecentOrders:", error);
    const store = loadFallbackStore();
    return Object.values(store.orders).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
  }
}
async function hasProcessedNotification(dedupeKey) {
  const usePg = await ensureSchemaInitialized();
  if (!usePg) {
    const store = loadFallbackStore();
    return Boolean(store.processedNotifications[dedupeKey]);
  }
  try {
    const rows = await db.select().from(processedNotifications).where(eq(processedNotifications.dedupeKey, dedupeKey)).limit(1);
    return rows.length > 0;
  } catch (error) {
    console.error("Database query failed in hasProcessedNotification:", error);
    const store = loadFallbackStore();
    return Boolean(store.processedNotifications[dedupeKey]);
  }
}
async function markNotificationProcessed(dedupeKey, orderId, paymentId, statusCode) {
  const usePg = await ensureSchemaInitialized();
  if (!usePg) {
    const store = loadFallbackStore();
    store.processedNotifications[dedupeKey] = {
      orderId,
      paymentId,
      statusCode,
      processedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    saveFallbackStore();
    return;
  }
  try {
    await db.insert(processedNotifications).values({
      dedupeKey,
      orderId,
      paymentId: paymentId || null,
      statusCode
    }).onConflictDoNothing();
  } catch (error) {
    console.error("Database query failed in markNotificationProcessed:", error);
    const store = loadFallbackStore();
    store.processedNotifications[dedupeKey] = {
      orderId,
      paymentId,
      statusCode,
      processedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    saveFallbackStore();
  }
}

// src/server/app.ts
dotenv.config();
var app = express();
function getTrustedBaseUrl(req) {
  const configuredUrl = (process.env.APP_BASE_URL || process.env.APP_URL || "").trim().replace(/\/+$/, "");
  if (configuredUrl && /^https?:\/\//i.test(configuredUrl)) {
    return configuredUrl;
  }
  if (req) {
    const host = (req.get("x-forwarded-host") || req.get("host") || "localhost:3000").split(",")[0].trim();
    const protoHeader = (req.get("x-forwarded-proto") || req.protocol || "https").split(",")[0].trim();
    const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? protoHeader : "https";
    return `${protocol}://${host}`;
  }
  return "http://localhost:3000";
}
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  const requestOrigin = req.get("origin");
  const trustedBase = getTrustedBaseUrl(req);
  if (requestOrigin) {
    try {
      const originUrl = new URL(requestOrigin);
      const trustedUrl = new URL(trustedBase);
      const isAllowed = originUrl.host === trustedUrl.host || originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1" || originUrl.hostname.endsWith(".run.app") || originUrl.hostname.endsWith(".vercel.app");
      if (isAllowed) {
        res.setHeader("Access-Control-Allow-Origin", requestOrigin);
        res.setHeader("Vary", "Origin");
      }
    } catch {
    }
  } else {
    res.setHeader("Access-Control-Allow-Origin", trustedBase);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Admin-Secret, X-Order-Token"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ extended: true, limit: "64kb" }));
var rateLimitBuckets = /* @__PURE__ */ new Map();
function createRateLimiter(options) {
  return (req, res, next) => {
    const forwarded = req.get("x-forwarded-for");
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : req.ip || "unknown";
    const key = `${options.keyPrefix}:${clientIp}`;
    const now = Date.now();
    const bucket = rateLimitBuckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      rateLimitBuckets.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }
    bucket.count += 1;
    if (bucket.count > options.max) {
      const retryAfterSec = Math.ceil((bucket.resetAt - now) / 1e3);
      res.setHeader("Retry-After", String(retryAfterSec));
      return res.status(429).json({
        success: false,
        error: options.message
      });
    }
    return next();
  };
}
var authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1e3,
  max: 25,
  keyPrefix: "auth",
  message: "Too many authentication attempts. Please wait a few minutes and try again."
});
var resetRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1e3,
  max: 15,
  keyPrefix: "pwd-reset",
  message: "Too many password reset requests. Please wait 15 minutes before trying again."
});
var paymentInitiateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1e3,
  max: 35,
  keyPrefix: "payhere-init",
  message: "Too many payment initiation requests. Please wait a moment and try again."
});
function generateUniqueReceiptNumber(orderId) {
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const digits = orderId.replace(/[^0-9]/g, "");
  const suffix = digits.length >= 5 ? digits.slice(-5) : crypto2.randomInt(1e4, 99999).toString();
  return `REC-${year}-${suffix}`;
}
function sanitizeInputText(input, maxLength = 200) {
  if (typeof input !== "string") return "";
  return input.replace(/[<>]/g, "").trim().slice(0, maxLength);
}
var config = {
  merchantId: (process.env.PAYHERE_MERCHANT_ID || "").trim(),
  merchantSecret: (process.env.PAYHERE_MERCHANT_SECRET || "").trim(),
  isSandbox: process.env.PAYHERE_SANDBOX ? process.env.PAYHERE_SANDBOX.toLowerCase() !== "false" : true,
  businessWhatsApp: (process.env.BUSINESS_WHATSAPP || "0742235836").trim(),
  businessName: "UCHIHA MARRI TOP UP"
};
function getActivePayHereConfig() {
  const isSandbox = process.env.PAYHERE_SANDBOX !== void 0 ? process.env.PAYHERE_SANDBOX.toLowerCase() !== "false" : config.isSandbox;
  const configuredMerchantId = (process.env.PAYHERE_MERCHANT_ID || config.merchantId || "").trim();
  const configuredMerchantSecret = (process.env.PAYHERE_MERCHANT_SECRET || config.merchantSecret || "").trim();
  return {
    merchantId: configuredMerchantId || (isSandbox ? "1220000" : ""),
    merchantSecret: configuredMerchantSecret,
    isSandbox,
    businessWhatsApp: (process.env.BUSINESS_WHATSAPP || config.businessWhatsApp || "0742235836").trim(),
    businessName: config.businessName
  };
}
function generatePayHereHash(merchantId, orderId, amount, currency, merchantSecret) {
  const formattedAmount = Number(amount).toFixed(2);
  const hashedSecret = crypto2.createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
  const hashString = `${merchantId}${orderId}${formattedAmount}${currency}${hashedSecret}`;
  return crypto2.createHash("md5").update(hashString).digest("hex").toUpperCase();
}
function verifyPayHereSignature(merchantId, orderId, payhereAmount, payhereCurrency, statusCode, merchantSecret, receivedMd5Sig) {
  if (!merchantId || !orderId || !payhereAmount || !payhereCurrency || !statusCode || !merchantSecret || !receivedMd5Sig) {
    return false;
  }
  const hashedSecret = crypto2.createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
  const hashString = `${merchantId}${orderId}${payhereAmount}${payhereCurrency}${statusCode}${hashedSecret}`;
  const localMd5 = crypto2.createHash("md5").update(hashString).digest("hex").toUpperCase();
  try {
    const a = Buffer.from(localMd5, "utf8");
    const b = Buffer.from(receivedMd5Sig.trim().toUpperCase(), "utf8");
    if (a.length !== b.length) return false;
    return crypto2.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
async function getAuthenticatedCustomerFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  if (!token) return null;
  const payload = verifySessionTokenSignature(token);
  if (payload) {
    const revoked = await isSessionTokenRevoked(payload.jti);
    if (revoked) {
      return null;
    }
    return await getCustomerById(payload.sub);
  }
  try {
    const { adminAuth: adminAuth2 } = await Promise.resolve().then(() => (init_firebase_admin(), firebase_admin_exports));
    const { getOrCreateUser: getOrCreateUser2 } = await Promise.resolve().then(() => (init_users(), users_exports));
    const decoded = await adminAuth2.verifyIdToken(token);
    if (decoded && decoded.uid) {
      const email = (decoded.email || `${decoded.uid}@firebase.user`).toLowerCase();
      await getOrCreateUser2(decoded.uid, email).catch(() => null);
      let customer = await getCustomerByFirebaseUid(decoded.uid);
      if (!customer && decoded.email) {
        customer = await getCustomerByEmail(decoded.email);
      }
      if (!customer) {
        customer = await createCustomer({
          fullName: decoded.name || email.split("@")[0] || "Gaming Customer",
          email,
          whatsappNumber: "0700000000",
          billingAddress: "Digital Gaming Top Up",
          city: "Colombo",
          country: "Sri Lanka",
          password: crypto2.randomBytes(24).toString("hex") + "Aa1!",
          firebaseUid: decoded.uid
        });
      }
      return customer;
    }
  } catch {
  }
  return null;
}
async function requireCustomerAuth(req, res, next) {
  try {
    const customer = await getAuthenticatedCustomerFromRequest(req);
    if (!customer) {
      return res.status(401).json({
        success: false,
        error: "Authentication required. Please log in to access your account."
      });
    }
    req.customer = customer;
    next();
  } catch (error) {
    console.error("Authentication check failed:", error);
    return res.status(500).json({
      success: false,
      error: "Authentication verification failed."
    });
  }
}
var ADMIN_EMAILS = new Set(
  [
    process.env.ADMIN_EMAIL?.trim().toLowerCase(),
    "uchihamarri@gmail.com",
    "sanukagkk@gmail.com"
  ].filter(Boolean)
);
async function isRequestAuthorizedAdmin(req) {
  const adminSecretEnv = (process.env.ADMIN_SECRET || "").trim();
  const headerSecret = (req.get("x-admin-secret") || req.body?.adminSecret || "").toString().trim();
  if (adminSecretEnv && headerSecret) {
    try {
      const a = Buffer.from(adminSecretEnv, "utf8");
      const b = Buffer.from(headerSecret, "utf8");
      if (a.length === b.length && crypto2.timingSafeEqual(a, b)) {
        return true;
      }
    } catch {
    }
  }
  const customer = await getAuthenticatedCustomerFromRequest(req);
  if (customer && ADMIN_EMAILS.has(customer.email.toLowerCase())) {
    return true;
  }
  return false;
}
var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var DUMMY_SALT = "0123456789abcdef0123456789abcdef";
var DUMMY_HASH = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
app.post("/api/auth/register", authRateLimiter, async (req, res) => {
  try {
    const {
      fullName,
      email,
      whatsappNumber,
      billingAddress,
      city,
      country,
      password,
      confirmPassword
    } = req.body || {};
    const cleanName = sanitizeInputText(fullName, 100);
    const cleanEmail = sanitizeInputText(email, 120).toLowerCase();
    const cleanWhatsapp = sanitizeInputText(whatsappNumber, 30);
    const cleanAddress = sanitizeInputText(billingAddress, 200);
    const cleanCity = sanitizeInputText(city, 80);
    const cleanCountry = sanitizeInputText(country, 80) || "Sri Lanka";
    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ success: false, error: "Full Name is required (at least 2 characters)." });
    }
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: "Please enter a valid Email Address." });
    }
    if (!cleanWhatsapp || cleanWhatsapp.replace(/[^0-9]/g, "").length < 9) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid WhatsApp / Mobile Number (at least 9 digits)."
      });
    }
    if (!cleanAddress || cleanAddress.length < 3) {
      return res.status(400).json({ success: false, error: "Billing Address is required." });
    }
    if (!cleanCity || cleanCity.length < 2) {
      return res.status(400).json({ success: false, error: "City is required." });
    }
    const passwordError = validateStrongPassword(password);
    if (passwordError) {
      return res.status(400).json({ success: false, error: passwordError });
    }
    if (confirmPassword !== void 0 && password !== confirmPassword) {
      return res.status(400).json({ success: false, error: "Passwords do not match." });
    }
    const existing = await getCustomerByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "Unable to complete registration with the provided credentials. If you already have an account, please sign in."
      });
    }
    const customer = await createCustomer({
      fullName: cleanName,
      email: cleanEmail,
      whatsappNumber: cleanWhatsapp,
      billingAddress: cleanAddress,
      city: cleanCity,
      country: cleanCountry,
      password
    });
    const token = createSessionToken(customer, true);
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      customer: sanitizeCustomer(customer)
    });
  } catch (err) {
    console.error("[Auth Register Error]:", err?.message || "Registration error");
    return res.status(500).json({
      success: false,
      error: "Failed to register customer account. Please try again."
    });
  }
});
app.post("/api/auth/login", authRateLimiter, async (req, res) => {
  try {
    const { email, password, rememberMe = true } = req.body || {};
    const cleanEmail = sanitizeInputText(email, 120).toLowerCase();
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: "Please enter a valid email address." });
    }
    if (!password || typeof password !== "string") {
      return res.status(400).json({ success: false, error: "Please enter your password." });
    }
    const customer = await getCustomerByEmail(cleanEmail);
    if (!customer) {
      verifyPassword(password, DUMMY_SALT, DUMMY_HASH);
      return res.status(401).json({
        success: false,
        error: "Invalid email address or password."
      });
    }
    if (!verifyPassword(password, customer.passwordSalt, customer.passwordHash)) {
      return res.status(401).json({
        success: false,
        error: "Invalid email address or password."
      });
    }
    const token = createSessionToken(customer, Boolean(rememberMe));
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      customer: sanitizeCustomer(customer)
    });
  } catch (err) {
    console.error("[Auth Login Error]:", err?.message || "Login error");
    return res.status(500).json({
      success: false,
      error: "An error occurred during login. Please try again."
    });
  }
});
app.post("/api/auth/logout", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      await revokeSessionToken(token);
    }
    return res.status(200).json({
      success: true,
      message: "Logged out successfully and session invalidated."
    });
  } catch {
    return res.status(200).json({
      success: true,
      message: "Logged out successfully."
    });
  }
});
app.post("/api/auth/forgot-password", resetRateLimiter, async (req, res) => {
  try {
    const { email, whatsappNumber } = req.body || {};
    const cleanEmail = sanitizeInputText(email, 120).toLowerCase();
    const cleanWhatsapp = sanitizeInputText(whatsappNumber, 30);
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: "Please enter a valid email address." });
    }
    const customer = await getCustomerByEmail(cleanEmail);
    if (customer && cleanWhatsapp) {
      const inputDigits = cleanWhatsapp.replace(/[^0-9]/g, "");
      const storedDigits = customer.whatsappNumber.replace(/[^0-9]/g, "");
      if (inputDigits.length >= 7 && inputDigits.slice(-7) === storedDigits.slice(-7)) {
        await createPasswordResetToken(customer.id);
      }
    }
    return res.status(200).json({
      success: true,
      message: "If an account matching that email and WhatsApp number exists, a password reset request has been registered. Please verify your registered WhatsApp number to complete the reset."
    });
  } catch (err) {
    console.error("[Forgot Password Error]:", err?.message || "Error");
    return res.status(500).json({
      success: false,
      error: "Unable to process password reset request."
    });
  }
});
app.post("/api/auth/reset-password", resetRateLimiter, async (req, res) => {
  try {
    const { email, whatsappNumber, resetToken, newPassword, confirmPassword } = req.body || {};
    const cleanEmail = sanitizeInputText(email, 120).toLowerCase();
    const cleanWhatsapp = sanitizeInputText(whatsappNumber, 30);
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: "Valid email address is required." });
    }
    const passwordError = validateStrongPassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ success: false, error: passwordError });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, error: "Passwords do not match." });
    }
    const customer = await getCustomerByEmail(cleanEmail);
    if (!customer) {
      verifyPassword(newPassword, DUMMY_SALT, DUMMY_HASH);
      return res.status(400).json({
        success: false,
        error: "Unable to reset password. Please verify your account details and try again."
      });
    }
    let authorized = false;
    if (resetToken && typeof resetToken === "string" && resetToken.trim().length > 0) {
      authorized = await verifyAndConsumeResetToken(customer.id, resetToken, newPassword);
    } else if (cleanWhatsapp) {
      const inputDigits = cleanWhatsapp.replace(/[^0-9]/g, "");
      const storedDigits = customer.whatsappNumber.replace(/[^0-9]/g, "");
      if (inputDigits.length >= 9 && inputDigits.slice(-9) === storedDigits.slice(-9)) {
        await updateCustomerPassword(customer.id, newPassword);
        authorized = true;
      }
    }
    if (!authorized) {
      return res.status(400).json({
        success: false,
        error: "Unable to reset password. Please verify your registered details or reset token."
      });
    }
    return res.status(200).json({
      success: true,
      message: "Your password has been updated. You can now sign in with your new password."
    });
  } catch (err) {
    console.error("[Reset Password Error]:", err?.message || "Error");
    return res.status(500).json({
      success: false,
      error: "Unable to reset password."
    });
  }
});
app.get("/api/customer/profile", requireCustomerAuth, async (req, res) => {
  const customer = req.customer;
  return res.status(200).json({
    success: true,
    customer: sanitizeCustomer(customer)
  });
});
app.put("/api/customer/profile", requireCustomerAuth, async (req, res) => {
  try {
    const customer = req.customer;
    const {
      fullName,
      whatsappNumber,
      billingAddress,
      city,
      country,
      currentPassword,
      newPassword
    } = req.body || {};
    const cleanName = sanitizeInputText(fullName, 100);
    const cleanWhatsapp = sanitizeInputText(whatsappNumber, 30);
    const cleanAddress = sanitizeInputText(billingAddress, 200);
    const cleanCity = sanitizeInputText(city, 80);
    const cleanCountry = sanitizeInputText(country, 80) || "Sri Lanka";
    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ success: false, error: "Full Name is required (at least 2 characters)." });
    }
    if (!cleanWhatsapp || cleanWhatsapp.replace(/[^0-9]/g, "").length < 9) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid WhatsApp / Mobile Number (at least 9 digits)."
      });
    }
    if (!cleanAddress || cleanAddress.length < 3) {
      return res.status(400).json({ success: false, error: "Billing Address is required." });
    }
    if (!cleanCity || cleanCity.length < 2) {
      return res.status(400).json({ success: false, error: "City is required." });
    }
    if (newPassword && typeof newPassword === "string" && newPassword.length > 0) {
      if (!currentPassword || !verifyPassword(currentPassword, customer.passwordSalt, customer.passwordHash)) {
        return res.status(400).json({
          success: false,
          error: "Your current password is incorrect."
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
      country: cleanCountry
    });
    return res.status(200).json({
      success: true,
      message: "Your billing profile has been updated.",
      customer: sanitizeCustomer(updated)
    });
  } catch (err) {
    console.error("[Customer Profile Update Error]:", err?.message || "Error");
    return res.status(500).json({
      success: false,
      error: "Failed to update profile."
    });
  }
});
app.get("/api/customer/orders", requireCustomerAuth, async (req, res) => {
  try {
    const customer = req.customer;
    const rawOrders = await getOrdersByCustomer(customer.id, customer.email);
    const orders2 = await Promise.all(rawOrders.map((t) => buildVerificationResponse(t, true)));
    const summary = {
      total: orders2.length,
      successful: orders2.filter((o) => o.status === "SUCCESSFUL").length,
      pending: orders2.filter((o) => o.status === "PENDING").length,
      failed: orders2.filter((o) => o.status === "FAILED" || o.status === "CANCELLED").length
    };
    return res.status(200).json({
      success: true,
      summary,
      orders: orders2
    });
  } catch (err) {
    console.error("[Customer Orders Fetch Error]:", err?.message || "Error");
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve your orders."
    });
  }
});
app.get("/api/customer/orders/:orderId", requireCustomerAuth, async (req, res) => {
  try {
    const customer = req.customer;
    const orderId = req.params.orderId.trim().toUpperCase();
    const order = await getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found." });
    }
    const isOwner = order.customerId === customer.id || !order.customerId && order.customerEmail?.toLowerCase() === customer.email.toLowerCase();
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        error: "Access denied. You can only view orders belonging to your account."
      });
    }
    return res.status(200).json({
      success: true,
      order: await buildVerificationResponse(order, true)
    });
  } catch (err) {
    console.error("[Customer Single Order Error]:", err?.message || "Error");
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve order details."
    });
  }
});
app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "healthy", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/api/payhere/config", (_req, res) => {
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
    checkoutUrl: active.isSandbox ? "https://sandbox.payhere.lk/pay/checkout" : "https://www.payhere.lk/pay/checkout"
  });
});
app.post("/api/payhere/config", authRateLimiter, async (req, res) => {
  const isAdmin = await isRequestAuthorizedAdmin(req);
  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      error: "Administrator authorization required to update PayHere gateway settings."
    });
  }
  const { merchantId, merchantSecret, isSandbox, businessWhatsApp } = req.body || {};
  if (merchantId !== void 0 && typeof merchantId === "string") {
    config.merchantId = sanitizeInputText(merchantId, 64);
  }
  if (merchantSecret !== void 0 && typeof merchantSecret === "string") {
    config.merchantSecret = merchantSecret.trim();
  }
  if (typeof isSandbox === "boolean") {
    config.isSandbox = isSandbox;
  }
  if (businessWhatsApp && typeof businessWhatsApp === "string") {
    config.businessWhatsApp = sanitizeInputText(businessWhatsApp, 30);
  }
  const active = getActivePayHereConfig();
  return res.json({
    success: true,
    message: "Store settings updated by authorized administrator.",
    merchantId: active.merchantId,
    isSandbox: active.isSandbox,
    businessWhatsApp: active.businessWhatsApp,
    configured: Boolean(active.merchantId && active.merchantSecret)
  });
});
var OFFICIAL_MEMBERSHIPS = {
  weekly_lite_membership: { id: "weekly_lite_membership", name: "Weekly Lite Membership", price: 150 },
  weekly_membership: { id: "weekly_membership", name: "Weekly Membership", price: 570 },
  monthly_membership: { id: "monthly_membership", name: "Monthly Membership", price: 2700 },
  vip_membership: { id: "vip_membership", name: "VIP Membership", price: 3300 },
  s_vip_membership: { id: "s_vip_membership", name: "S VIP Membership", price: 5e3 },
  vip_pro_max_membership: { id: "vip_pro_max_membership", name: "VIP PRO MAX Membership", price: 6400 },
  svip_pro_max_membership: { id: "svip_pro_max_membership", name: "SVIP PRO MAX Membership", price: 9900 }
};
var OFFICIAL_DIAMOND_PACKAGES = {
  diamond_100: { id: "diamond_100", name: "100 + 10 Diamonds", price: 280 },
  diamond_310: { id: "diamond_310", name: "310 + 31 Diamonds", price: 850 },
  diamond_520: { id: "diamond_520", name: "520 + 52 Diamonds", price: 1420 },
  diamond_1060: { id: "diamond_1060", name: "1060 + 106 Diamonds", price: 2850 },
  diamond_2180: { id: "diamond_2180", name: "2180 + 218 Diamonds", price: 5700 },
  diamond_5600: { id: "diamond_5600", name: "5600 + 560 Diamonds", price: 14200 }
};
var OFFICIAL_MLBB_PACKAGES = {
  mlbb_61: { id: "mlbb_61", name: "Mobile Legends 61 Diamonds (56 + 5 Bonus)", totalDiamonds: 61, baseDiamonds: 56, bonusDiamonds: 5, price: 220 },
  mlbb_153: { id: "mlbb_153", name: "Mobile Legends 153 Diamonds (139 + 14 Bonus)", totalDiamonds: 153, baseDiamonds: 139, bonusDiamonds: 14, price: 530 },
  mlbb_307: { id: "mlbb_307", name: "Mobile Legends 307 Diamonds (277 + 30 Bonus)", totalDiamonds: 307, baseDiamonds: 277, bonusDiamonds: 30, price: 1050 },
  mlbb_625: { id: "mlbb_625", name: "Mobile Legends 625 Diamonds (553 + 72 Bonus)", totalDiamonds: 625, baseDiamonds: 553, bonusDiamonds: 72, price: 2050 },
  mlbb_937: { id: "mlbb_937", name: "Mobile Legends 937 Diamonds (829 + 108 Bonus)", totalDiamonds: 937, baseDiamonds: 829, bonusDiamonds: 108, price: 3060 },
  mlbb_1603: { id: "mlbb_1603", name: "Mobile Legends 1603 Diamonds (1381 + 222 Bonus)", totalDiamonds: 1603, baseDiamonds: 1381, bonusDiamonds: 222, price: 5060 },
  mlbb_2608: { id: "mlbb_2608", name: "Mobile Legends 2608 Diamonds (2210 + 398 Bonus)", totalDiamonds: 2608, baseDiamonds: 2210, bonusDiamonds: 398, price: 8060 },
  mlbb_3287: { id: "mlbb_3287", name: "Mobile Legends 3287 Diamonds (2762 + 525 Bonus)", totalDiamonds: 3287, baseDiamonds: 2762, bonusDiamonds: 525, price: 10100 },
  mlbb_6629: { id: "mlbb_6629", name: "Mobile Legends 6629 Diamonds (5524 + 1105 Bonus)", totalDiamonds: 6629, baseDiamonds: 5524, bonusDiamonds: 1105, price: 20200 }
};
var OFFICIAL_BLOODSTRIKE_PACKAGES = {
  bs_strike_pass_elite: {
    id: "bs_strike_pass_elite",
    name: "Strike Pass Elite",
    displayTitle: "Blood Strike - Strike Pass Elite",
    category: "pass",
    price: 1230
  },
  bs_strike_pass_premium: {
    id: "bs_strike_pass_premium",
    name: "Strike Pass Premium",
    displayTitle: "Blood Strike - Strike Pass Premium",
    category: "pass",
    price: 2740
  },
  bs_100_gold: {
    id: "bs_100_gold",
    name: "100 + 5 Gold",
    displayTitle: "Blood Strike - 100 + 5 Gold",
    category: "gold",
    price: 275
  },
  bs_300_gold: {
    id: "bs_300_gold",
    name: "300 + 20 Gold",
    displayTitle: "Blood Strike - 300 + 20 Gold",
    category: "gold",
    price: 850
  },
  bs_500_gold: {
    id: "bs_500_gold",
    name: "500 + 40 Gold",
    displayTitle: "Blood Strike - 500 + 40 Gold",
    category: "gold",
    price: 1430
  },
  bs_1000_gold: {
    id: "bs_1000_gold",
    name: "1000 + 100 Gold",
    displayTitle: "Blood Strike - 1000 + 100 Gold",
    category: "gold",
    price: 2770
  },
  bs_2000_gold: {
    id: "bs_2000_gold",
    name: "2000 + 260 Gold",
    displayTitle: "Blood Strike - 2000 + 260 Gold",
    category: "gold",
    price: 5440
  },
  bs_5000_gold: {
    id: "bs_5000_gold",
    name: "5000 + 800 Gold",
    displayTitle: "Blood Strike - 5000 + 800 Gold",
    category: "gold",
    price: 13400
  },
  bs_level_up_pass: {
    id: "bs_level_up_pass",
    name: "Level Up Pass",
    displayTitle: "Blood Strike - Level Up Pass",
    category: "pass",
    price: 640
  }
};
function findOfficialMembership(packageId, packageName) {
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
function findOfficialDiamondPackage(packageId, packageName) {
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
function findOfficialMlbbPackage(packageId, packageName) {
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
function findOfficialBloodStrikePackage(packageId, packageName) {
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
app.get("/api/memberships", (_req, res) => {
  return res.json(Object.values(OFFICIAL_MEMBERSHIPS));
});
app.get("/api/mlbb-packages", (_req, res) => {
  return res.json(Object.values(OFFICIAL_MLBB_PACKAGES));
});
app.get("/api/bloodstrike-packages", (_req, res) => {
  return res.json(Object.values(OFFICIAL_BLOODSTRIKE_PACKAGES));
});
var KNOWN_FREEFIRE_ACCOUNTS = {
  "7847502560": { username: "TG xMARRI", region: "SG/MY" },
  "2891048291": { username: "UCHIHA\u2605ITACHI", region: "SG/MY" },
  "1892048192": { username: "SL_MAD_DOG", region: "IND/SA" },
  "5192847102": { username: "NOVA\u30FBKILLED", region: "SG/MY" },
  "984102914": { username: "SHADOW_NINJA_LK", region: "IND/SA" }
};
app.post("/api/verify-uid", async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid || typeof uid !== "string" || !uid.trim()) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid Player ID (UID)."
      });
    }
    const cleanUid = uid.trim().replace(/[^0-9]/g, "");
    if (cleanUid.length < 8 || cleanUid.length > 11) {
      return res.status(400).json({
        success: false,
        error: "Invalid Free Fire UID length. UIDs must be between 8 and 11 numeric digits."
      });
    }
    if (/^0+$/.test(cleanUid) || cleanUid === "12345678") {
      return res.status(404).json({
        success: false,
        error: "Player ID not found. Please verify your Free Fire UID and try again."
      });
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
    if (KNOWN_FREEFIRE_ACCOUNTS[cleanUid]) {
      const account = KNOWN_FREEFIRE_ACCOUNTS[cleanUid];
      return res.status(200).json({
        success: true,
        uid: cleanUid,
        username: account.username,
        region: account.region
      });
    }
    const prefixes = ["TG", "OP", "SK", "SRI", "DARK", "NOVA", "ROYAL", "LEGEND"];
    const suffixes = ["GAMER", "VIP", "LK", "SL", "PRO", "SNIPER", "KILLER", "BOSS"];
    const numHash = cleanUid.split("").reduce((acc, char) => acc + parseInt(char, 10), 0);
    const prefix = prefixes[numHash % prefixes.length];
    const suffix = suffixes[numHash * 3 % suffixes.length];
    const generatedUsername = `${prefix}\u2605${suffix}_${cleanUid.slice(-3)}`;
    return res.status(200).json({
      success: true,
      uid: cleanUid,
      username: generatedUsername,
      region: "SG/MY"
    });
  } catch (err) {
    console.error("[Verify UID Error]:", err?.message || "Error");
    return res.status(500).json({
      success: false,
      error: "An internal error occurred during UID verification. Please try again."
    });
  }
});
app.post("/api/payhere/initiate", paymentInitiateLimiter, async (req, res) => {
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
      paymentMethod
    } = req.body || {};
    const cleanGameName = sanitizeInputText(gameName, 100);
    const cleanPlayerId = sanitizeInputText(playerId, 60);
    const cleanServerZone = sanitizeInputText(serverZone, 30);
    const cleanPackageId = sanitizeInputText(packageId, 80);
    const cleanPackageName = sanitizeInputText(packageName, 140);
    if (!cleanGameName) {
      return res.status(400).json({ error: "Game selection is required." });
    }
    if (!cleanPlayerId) {
      return res.status(400).json({ error: "Player ID / UID is required." });
    }
    if (amount === void 0 || amount === null || amount === "") {
      return res.status(400).json({ error: "Payment amount is required." });
    }
    const numericAmount = parseFloat(String(amount));
    if (isNaN(numericAmount) || !isFinite(numericAmount) || numericAmount < 50 || numericAmount > 25e4) {
      return res.status(400).json({ error: "Payment amount must be between 50 LKR and 250,000 LKR." });
    }
    const resolvedFullName = authenticatedCustomer?.fullName || (sanitizeInputText(customerName, 100).length >= 2 ? sanitizeInputText(customerName, 100) : `Player ${cleanPlayerId}`);
    const resolvedWhatsapp = authenticatedCustomer?.whatsappNumber || sanitizeInputText(whatsappNumber, 30);
    if (!resolvedWhatsapp || resolvedWhatsapp.replace(/[^0-9]/g, "").length < 9) {
      return res.status(400).json({
        error: "A valid WhatsApp / Mobile Number is required. Please log in or enter your WhatsApp number."
      });
    }
    const cleanPhoneDigits = resolvedWhatsapp.replace(/[^0-9]/g, "");
    const resolvedEmail = (authenticatedCustomer?.email || sanitizeInputText(customerEmail, 120) || `${cleanPhoneDigits || "customer"}@uchihatopup.lk`).toLowerCase();
    if (!EMAIL_REGEX.test(resolvedEmail)) {
      return res.status(400).json({ error: "Please enter a valid Email Address for PayHere receipt confirmation." });
    }
    const nameParts = resolvedFullName.split(/\s+/);
    const firstName = nameParts[0] || "Player";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : cleanPlayerId;
    const finalBillingAddress = authenticatedCustomer?.billingAddress || sanitizeInputText(billingAddress, 200) || "Digital Gaming Top Up";
    const finalBillingCity = authenticatedCustomer?.city || sanitizeInputText(billingCity, 80) || "Colombo";
    const finalBillingCountry = authenticatedCustomer?.country || sanitizeInputText(billingCountry, 80) || "Sri Lanka";
    const officialMembership = findOfficialMembership(cleanPackageId, cleanPackageName);
    if (officialMembership) {
      if (numericAmount !== officialMembership.price) {
        return res.status(400).json({
          error: `Invalid price for ${officialMembership.name}. Current official price is ${officialMembership.price} LKR. Outdated or manipulated prices cannot be submitted.`,
          requiredPrice: officialMembership.price
        });
      }
    }
    const officialDiamondPkg = findOfficialDiamondPackage(cleanPackageId, cleanPackageName);
    if (officialDiamondPkg) {
      if (numericAmount !== officialDiamondPkg.price) {
        return res.status(400).json({
          error: `Invalid price for ${officialDiamondPkg.name}. Official price is ${officialDiamondPkg.price} LKR.`,
          requiredPrice: officialDiamondPkg.price
        });
      }
    }
    const isMlbbOrder = cleanGameName.toLowerCase().includes("mobile legends") || cleanPackageId.startsWith("mlbb_");
    let officialMlbbPkg = null;
    if (isMlbbOrder) {
      if (!cleanServerZone) {
        return res.status(400).json({
          error: "Zone ID / Server ID is required for Mobile Legends: Bang Bang orders."
        });
      }
      if (!/^\d{4,5}$/.test(cleanServerZone)) {
        return res.status(400).json({
          error: "Invalid Zone ID: Mobile Legends Zone ID must be a 4 or 5 digit numeric code (e.g. 2049 or 12345)."
        });
      }
      officialMlbbPkg = findOfficialMlbbPackage(cleanPackageId, cleanPackageName);
      if (officialMlbbPkg && numericAmount !== officialMlbbPkg.price) {
        return res.status(400).json({
          error: `Invalid price for ${officialMlbbPkg.name}. Official price is ${officialMlbbPkg.price} LKR.`,
          requiredPrice: officialMlbbPkg.price
        });
      }
    }
    const isBloodStrikeOrder = cleanGameName.toLowerCase().replace(/\s+/g, "").includes("bloodstrike") || cleanPackageId.startsWith("bs_");
    let officialBloodStrikePkg = null;
    if (isBloodStrikeOrder) {
      officialBloodStrikePkg = findOfficialBloodStrikePackage(cleanPackageId, cleanPackageName);
      if (!officialBloodStrikePkg) {
        return res.status(400).json({
          error: "Invalid Blood Strike package selected. Please select an official Blood Strike top-up package."
        });
      }
      if (numericAmount !== officialBloodStrikePkg.price) {
        return res.status(400).json({
          error: `Invalid price for Blood Strike ${officialBloodStrikePkg.name}. Official price is Rs. ${officialBloodStrikePkg.price.toLocaleString("en-US")} LKR.`,
          requiredPrice: officialBloodStrikePkg.price
        });
      }
    }
    if (!activeConfig.merchantId || !activeConfig.merchantSecret) {
      return res.status(500).json({
        error: "PayHere merchant credentials are not configured on the server. Please set PAYHERE_MERCHANT_ID and PAYHERE_MERCHANT_SECRET environment variables."
      });
    }
    let orderId = `UMT-${Date.now().toString().slice(-6)}-${crypto2.randomInt(1e3, 9999)}`;
    while (await hasOrderId(orderId)) {
      orderId = `UMT-${Date.now().toString().slice(-6)}-${crypto2.randomInt(1e3, 9999)}`;
    }
    const finalPackageName = officialMembership ? officialMembership.name : officialDiamondPkg ? officialDiamondPkg.name : officialMlbbPkg ? officialMlbbPkg.name : officialBloodStrikePkg ? officialBloodStrikePkg.displayTitle : cleanPackageName || `${cleanGameName} Top Up Credits`;
    const matchedCustomer = authenticatedCustomer || await getCustomerByEmail(resolvedEmail);
    const orderAccessToken = generateOrderAccessToken(orderId, resolvedEmail);
    const transaction = {
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
      serverZone: cleanServerZone || void 0,
      packageName: finalPackageName,
      amount: numericAmount,
      currency: "LKR",
      paymentMethod: paymentMethod === "mastercard" ? "mastercard" : "visa",
      status: "PENDING",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      isSandbox: activeConfig.isSandbox
    };
    await saveOrder(transaction);
    const currency = "LKR";
    const hash = generatePayHereHash(
      activeConfig.merchantId,
      orderId,
      numericAmount,
      currency,
      activeConfig.merchantSecret
    );
    const formattedAmount = numericAmount.toFixed(2);
    const baseUrl = getTrustedBaseUrl(req);
    const checkoutUrl = activeConfig.isSandbox ? "https://sandbox.payhere.lk/pay/checkout" : "https://www.payhere.lk/pay/checkout";
    res.setHeader("Content-Type", "application/json");
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
        currency: "LKR",
        amount: formattedAmount,
        first_name: firstName,
        last_name: lastName,
        email: transaction.customerEmail,
        phone: transaction.whatsappNumber,
        address: transaction.billingAddress,
        city: transaction.billingCity,
        country: transaction.billingCountry,
        hash,
        custom_1: `${cleanGameName} (UID: ${cleanPlayerId}${cleanServerZone ? " Zone: " + cleanServerZone : ""})`,
        custom_2: `Method: ${transaction.paymentMethod.toUpperCase()}`
      },
      checkoutUrl
    });
  } catch (err) {
    console.error("[PayHere Initiate Error]:", err?.message || "Error");
    return res.status(500).json({ error: "Failed to initiate payment. Please try again." });
  }
});
app.post("/api/payhere/notify", async (req, res) => {
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
      status_message
    } = req.body || {};
    if (!merchant_id || !order_id || !payhere_amount || !payhere_currency || status_code === void 0 || !md5sig) {
      return res.status(400).send("Missing required notification parameters");
    }
    if (!activeConfig.merchantId || !activeConfig.merchantSecret) {
      return res.status(500).send("Merchant credentials not configured");
    }
    if (String(merchant_id).trim() !== activeConfig.merchantId) {
      return res.status(400).send("Invalid merchant_id");
    }
    const cleanOrderId = String(order_id).trim().toUpperCase();
    const transaction = await getOrderById(cleanOrderId);
    if (!transaction) {
      return res.status(404).send("Order not found");
    }
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
      return res.status(400).send("Invalid signature");
    }
    const notifiedAmount = parseFloat(String(payhere_amount));
    if (isNaN(notifiedAmount) || notifiedAmount.toFixed(2) !== Number(transaction.amount).toFixed(2) || String(payhere_currency).trim().toUpperCase() !== transaction.currency.toUpperCase()) {
      return res.status(400).send("Order amount or currency mismatch");
    }
    const normalizedStatus = String(status_code).trim();
    const dedupeKey = `${cleanOrderId}:${payment_id || "no_pid"}:${normalizedStatus}`;
    const alreadyProcessed = await hasProcessedNotification(dedupeKey);
    if (alreadyProcessed || transaction.status === "SUCCESSFUL" && normalizedStatus === "2") {
      return res.status(200).send("OK");
    }
    await markNotificationProcessed(
      dedupeKey,
      cleanOrderId,
      payment_id ? String(payment_id) : void 0,
      normalizedStatus
    );
    if (normalizedStatus === "2") {
      transaction.status = "SUCCESSFUL";
      transaction.paymentId = payment_id ? String(payment_id) : transaction.paymentId;
      transaction.payhereAmount = String(payhere_amount);
      transaction.completedAt = (/* @__PURE__ */ new Date()).toISOString();
      transaction.failureReason = void 0;
      if (!transaction.receiptNumber) {
        transaction.receiptNumber = generateUniqueReceiptNumber(cleanOrderId);
      }
    } else if (normalizedStatus === "0") {
      if (transaction.status !== "SUCCESSFUL") {
        transaction.status = "PENDING";
        transaction.paymentId = payment_id ? String(payment_id) : transaction.paymentId;
      }
    } else if (normalizedStatus === "-1") {
      if (transaction.status !== "SUCCESSFUL") {
        transaction.status = "CANCELLED";
        transaction.failureReason = sanitizeInputText(status_message, 160) || "Payment cancelled by customer on PayHere checkout";
      }
    } else {
      if (transaction.status !== "SUCCESSFUL") {
        transaction.status = "FAILED";
        transaction.failureReason = sanitizeInputText(status_message, 160) || "Payment failed or charged back on PayHere gateway";
      }
    }
    await saveOrder(transaction);
    return res.status(200).send("OK");
  } catch (err) {
    console.error("[PayHere Webhook Error]:", err?.message || "Webhook error");
    return res.status(500).send("Internal Server Error");
  }
});
async function canRequesterAccessOrder(req, transaction) {
  const suppliedToken = (req.query.token || req.get("x-order-token") || req.body?.token || req.body?.orderAccessToken || "").toString().trim();
  if (suppliedToken && transaction.orderAccessToken) {
    try {
      const a = Buffer.from(suppliedToken, "utf8");
      const b = Buffer.from(transaction.orderAccessToken, "utf8");
      if (a.length === b.length && crypto2.timingSafeEqual(a, b)) {
        return true;
      }
    } catch {
    }
  }
  const customer = await getAuthenticatedCustomerFromRequest(req);
  if (customer) {
    if (transaction.customerId === customer.id || !transaction.customerId && transaction.customerEmail?.toLowerCase() === customer.email.toLowerCase()) {
      return true;
    }
    return false;
  }
  if (transaction.customerId) {
    return false;
  }
  return false;
}
async function buildVerificationResponse(transaction, includeFullCustomerDetails) {
  const activeConfig = getActivePayHereConfig();
  const isPaid = transaction.status === "SUCCESSFUL";
  if (isPaid && !transaction.receiptNumber) {
    transaction.receiptNumber = generateUniqueReceiptNumber(transaction.orderId);
    await saveOrder(transaction);
  }
  return {
    orderId: transaction.orderId,
    customerId: includeFullCustomerDetails ? transaction.customerId : void 0,
    receiptNumber: isPaid ? transaction.receiptNumber || null : null,
    customerName: includeFullCustomerDetails ? transaction.customerName : `${transaction.customerName.charAt(0)}***`,
    whatsappNumber: includeFullCustomerDetails ? transaction.whatsappNumber : `***${transaction.whatsappNumber.slice(-3)}`,
    customerEmail: includeFullCustomerDetails ? transaction.customerEmail : void 0,
    billingAddress: includeFullCustomerDetails ? transaction.billingAddress : void 0,
    billingCity: includeFullCustomerDetails ? transaction.billingCity : void 0,
    billingCountry: transaction.billingCountry || "Sri Lanka",
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
    country: transaction.billingCountry || "Sri Lanka",
    paymentProvider: "PayHere Sri Lanka",
    whatsappSupport: activeConfig.businessWhatsApp
  };
}
app.get("/api/payhere/verify", async (req, res) => {
  try {
    const rawId = req.query.order_id || req.query.orderId || "";
    const orderId = rawId.trim().toUpperCase();
    if (!orderId) {
      return res.status(400).json({ error: "order_id query parameter is required" });
    }
    const transaction = await getOrderById(orderId);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    const authorized = await canRequesterAccessOrder(req, transaction);
    if (!authorized) {
      return res.status(403).json({
        error: "Access denied. Please sign in to the account that placed this order to view its details."
      });
    }
    return res.json(await buildVerificationResponse(transaction, true));
  } catch (err) {
    console.error("[Verify GET Error]:", err?.message || "Error");
    return res.status(500).json({ error: "Unable to verify order status." });
  }
});
app.post("/api/payhere/verify", async (req, res) => {
  try {
    const rawId = req.body?.order_id || req.body?.orderId || "";
    const orderId = String(rawId).trim().toUpperCase();
    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }
    const transaction = await getOrderById(orderId);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    const authorized = await canRequesterAccessOrder(req, transaction);
    if (!authorized) {
      return res.status(403).json({
        error: "Access denied. Please sign in to the account that placed this order to view its details."
      });
    }
    return res.json(await buildVerificationResponse(transaction, true));
  } catch (err) {
    console.error("[Verify POST Error]:", err?.message || "Error");
    return res.status(500).json({ error: "Unable to verify order status." });
  }
});
app.get("/api/payhere/verify/:orderId", async (req, res) => {
  try {
    const orderId = req.params.orderId.trim().toUpperCase();
    const transaction = await getOrderById(orderId);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    const authorized = await canRequesterAccessOrder(req, transaction);
    if (!authorized) {
      return res.status(403).json({
        error: "Access denied. Please sign in to the account that placed this order to view its details."
      });
    }
    return res.json(await buildVerificationResponse(transaction, true));
  } catch (err) {
    console.error("[Verify Param Error]:", err?.message || "Error");
    return res.status(500).json({ error: "Unable to verify order status." });
  }
});
app.get("/api/receipt/:orderId", async (req, res) => {
  try {
    const activeConfig = getActivePayHereConfig();
    const orderId = req.params.orderId.trim().toUpperCase();
    const transaction = await getOrderById(orderId);
    if (!transaction) {
      return res.status(404).json({ error: "Order not found" });
    }
    const authorized = await canRequesterAccessOrder(req, transaction);
    if (!authorized) {
      return res.status(403).json({
        error: "Access denied. You are not authorized to access another customer\u2019s payment receipt."
      });
    }
    if (transaction.status !== "SUCCESSFUL") {
      return res.status(400).json({
        verified: false,
        status: transaction.status,
        message: "Payment has not been confirmed by PayHere. Paid receipt cannot be generated until verified."
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
        currency: "LKR",
        paymentMethod: transaction.paymentMethod === "mastercard" ? "Mastercard (PayHere)" : "Visa Card (PayHere)",
        status: "PAID",
        businessName: activeConfig.businessName,
        country: transaction.billingCountry || "Sri Lanka",
        paymentProvider: "PayHere Sri Lanka",
        whatsappSupport: activeConfig.businessWhatsApp
      }
    });
  } catch (err) {
    console.error("[Receipt Fetch Error]:", err?.message || "Error");
    return res.status(500).json({ error: "Unable to generate receipt." });
  }
});
app.get("/api/transactions/:orderId", async (req, res) => {
  try {
    const orderId = req.params.orderId.trim().toUpperCase();
    const transaction = await getOrderById(orderId);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    const authorized = await canRequesterAccessOrder(req, transaction);
    if (!authorized) {
      return res.status(403).json({
        error: "Access denied. Please sign in to the account that placed this order."
      });
    }
    return res.json(await buildVerificationResponse(transaction, true));
  } catch (err) {
    console.error("[Transaction Lookup Error]:", err?.message || "Error");
    return res.status(500).json({ error: "Unable to retrieve transaction." });
  }
});
app.get("/api/transactions", async (_req, res) => {
  try {
    const recent = await getRecentOrders(15);
    const list = recent.map((t) => ({
      orderId: `UMT-***-${t.orderId.slice(-4)}`,
      customerName: t.customerName.charAt(0) + "***",
      gameName: t.gameName,
      amount: t.amount,
      status: t.status,
      createdAt: t.createdAt
    }));
    return res.json(list);
  } catch {
    return res.json([]);
  }
});
app.use((err, _req, res, _next) => {
  console.error("[Express Unhandled Error]:", err?.message || err);
  const status = typeof err?.status === "number" && err.status >= 400 && err.status < 600 ? err.status : 500;
  const errorMsg = typeof err === "string" ? err : err && typeof err.message === "string" && err.message.trim() ? err.message.trim() : "An unexpected server error occurred. Please try again.";
  res.status(status).json({
    success: false,
    error: errorMsg
  });
});

// server.ts
dotenv2.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, port: PORT, host: "0.0.0.0" },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs2.existsSync(path2.resolve(__dirname, "dist")) ? path2.resolve(__dirname, "dist") : path2.resolve(process.cwd(), "dist");
    if (fs2.existsSync(distPath)) {
      app.use(express2.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path2.resolve(distPath, "index.html"));
      });
    } else {
      console.warn(`[UCHIHA MARRI TOP UP] Warning: dist folder not found at ${distPath}. Run 'npm run build' first.`);
    }
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[UCHIHA MARRI TOP UP] Production server listening on http://0.0.0.0:${PORT}`);
  });
}
startServer();
