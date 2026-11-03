import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// Firebase Auth & Core Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// CUSTOMERS table (Persistent customer profiles & credentials)
export const customers = pgTable(
  'customers',
  {
    customerId: text('customer_id').primaryKey(),
    firebaseUid: text('firebase_uid').unique(),
    fullName: text('full_name').notNull(),
    email: text('email').notNull().unique(),
    whatsappNumber: text('whatsapp_number').notNull(),
    billingAddress: text('billing_address').notNull(),
    city: text('city').notNull(),
    country: text('country').notNull().default('Sri Lanka'),
    passwordHash: text('password_hash').notNull(),
    passwordSalt: text('password_salt').notNull(),
    emailVerified: boolean('email_verified').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_customers_email').on(table.email),
    index('idx_customers_firebase_uid').on(table.firebaseUid),
  ]
);

// ORDERS table (Persistent gaming top-up orders & PayHere verification state)
export const orders = pgTable(
  'orders',
  {
    orderId: text('order_id').primaryKey(),
    customerId: text('customer_id').references(() => customers.customerId),
    orderAccessToken: text('order_access_token').notNull(),
    receiptNumber: text('receipt_number'),
    customerName: text('customer_name').notNull(),
    customerEmail: text('customer_email').notNull(),
    whatsappNumber: text('whatsapp_number').notNull(),
    billingAddress: text('billing_address').notNull(),
    billingCity: text('billing_city').notNull(),
    billingCountry: text('billing_country').notNull().default('Sri Lanka'),
    gameName: text('game_name').notNull(),
    playerUid: text('player_uid').notNull(),
    serverZone: text('server_zone'),
    packageName: text('package_name').notNull(),
    amountLkr: numeric('amount_lkr', { precision: 12, scale: 2 }).notNull(),
    currency: text('currency').notNull().default('LKR'),
    paymentMethod: text('payment_method').notNull().default('visa'),
    paymentStatus: text('payment_status').notNull().default('PENDING'),
    payhereTransactionRef: text('payhere_transaction_ref'),
    payhereAmount: text('payhere_amount'),
    failureReason: text('failure_reason'),
    isSandbox: boolean('is_sandbox').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
  },
  (table) => [
    index('idx_orders_customer_id').on(table.customerId),
    index('idx_orders_payment_status').on(table.paymentStatus),
    index('idx_orders_created_at').on(table.createdAt),
  ]
);

// Idempotency table to prevent duplicate PayHere IPN notification processing
export const processedNotifications = pgTable('processed_notifications', {
  dedupeKey: text('dedupe_key').primaryKey(),
  orderId: text('order_id').notNull(),
  paymentId: text('payment_id'),
  statusCode: text('status_code').notNull(),
  processedAt: timestamp('processed_at').defaultNow().notNull(),
});

// Single-use, short-lived password reset tokens (hashed)
export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: serial('id').primaryKey(),
    customerId: text('customer_id')
      .references(() => customers.customerId)
      .notNull(),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    used: boolean('used').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('idx_reset_tokens_customer').on(table.customerId)]
);

// Revoked session tokens for secure server-side logout
export const revokedSessionTokens = pgTable('revoked_session_tokens', {
  tokenId: text('token_id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  revokedAt: timestamp('revoked_at').defaultNow().notNull(),
});

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.customerId],
  }),
}));
