# UCHIHA MARRI TOP UP — Complete Website Error Fix & Stability Audit

This plan resolves the login and sign-up crashes, stabilizes database connectivity across Google AI Studio and Vercel deployments, adds automatic database table initialization on first request, introduces React error boundaries, and hardens PayHere checkout and customer data isolation while preserving the existing UCHIHA MARRI TOP UP visual design and game catalogs.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed & Defaulted Decisions from Phase 1:**
> - **Confirmed Decision — Automatic Table Initialization**: The backend will automatically ensure all required database tables and indexes (`customers`, `orders`, `processed_notifications`, `password_reset_tokens`, and `revoked_session_tokens`) exist before executing queries on a fresh deployment.
> - **Defaulted Decision — Multi-Environment Database Compatibility**: The database layer will support both AI Studio's Cloud SQL PostgreSQL connection variables and external Supabase PostgreSQL connection settings on Vercel, with clear diagnostic error reporting if environment variables are missing.
> - **Defaulted Decision — Identity Verification for Password Reset**: Customers can reset a forgotten password by verifying ownership of both their registered email address and their registered WhatsApp number (or using a single-use cryptographic reset token), without ever exposing reset codes in public API responses.

---

## 1. Overview & Core Concept

- **What It Does**: Eliminates client-side and serverless runtime crashes during registration, login, and dashboard navigation, guarantees persistent PostgreSQL storage for accounts and orders, and secures the end-to-end PayHere Sandbox and Production payment lifecycle.
- **Target Audience / Persona**: Sri Lankan gamers purchasing Garena Free Fire memberships/diamonds, Mobile Legends: Bang Bang diamonds, and Blood Strike passes/gold in LKR via Visa and Mastercard.
- **Key Value**: Customers register once, log in reliably without page crashes or infinite render loops, have their saved billing details automatically populated at checkout, and track only their own verified orders and downloadable PDF/PNG receipts.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Resilient Registration & Login**: Customers create an account or sign in with immediate field validation, clear loading indicators, network/server error recovery banners, and smooth redirection to the top-up checkout portal.
  2. **1-Click Authenticated Checkout**: Logged-in customers automatically see their saved billing profile (Full Name, Email, WhatsApp Number, Billing Address, City, Country) pre-filled in Step 04, requiring only Game selection, Player UID (and Zone ID for MLBB), Package/Amount selection, and clicking **Pay Now**.
  3. **Protected Customer Dashboard**: Customers view their profile, order summary counters, payment history tabs (**My Orders**, **Payment History**, **Successful**, **Pending**, **Failed**), and verified receipt downloads without render loops or premature redirects while session state loads.
  4. **Global Error Boundary**: Any unexpected runtime exception in a view is caught by a styled recovery boundary that allows the customer to reload or return to the homepage rather than facing a blank screen.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Preserves the established **UCHIHA MARRI TOP UP** dark gaming storefront aesthetic.
  - *Color Palette & Mood*: Deep obsidian canvas (`#08080a` / `#101016`), subtle structural borders (`border-zinc-800`), crimson primary accents (`#dc2626` / `#e11d48`), and semantic verification badges (emerald for verified paid, amber for pending IPN, red for declined/cancelled).
  - *Typography & Hierarchy*: Display headings paired with clean geometric body copy and `tabular-nums` monospace formatting for LKR prices, Player UIDs, and Order IDs.
  - *Component Styling & Layout*: Responsive 1440px desktop container down to mobile viewports, keeping all existing game cards, membership tables, and policy pages intact.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Root-Cause Fix for Sign-Up & Login Crashes on Vercel & Browser**
  - *Chosen Approach*:
    1. Make Firebase Admin initialization resilient so that missing cloud credentials on external Vercel deployments never crash the Express serverless function at module load time.
    2. Add a lazy, once-per-instance idempotent schema bootstrap (`CREATE TABLE IF NOT EXISTS ...`) so a newly connected PostgreSQL/Supabase database on Vercel never throws `relation "customers" does not exist` during the first registration or login request.
    3. Fix the `useCallback` dependency loop in the Customer Dashboard (`selectedOrder` triggering repeated `/api/customer/orders` fetches) and wait for `AuthContext` `isLoading` to finish before redirecting unauthenticated visitors.
    4. Wrap the React application in a top-level Error Boundary and harden all JSON/storage parsing in `AuthContext`.
  - *Why*: Addresses both backend 500 crashes on serverless cold starts and frontend React state/render crashes.
- **Decision 2: Strict Server-Side Price & Notification Verification**
  - *Chosen Approach*: Validate every package ID and amount against the server's authoritative price catalog (Memberships, Free Fire Diamonds, MLBB Diamonds, and Blood Strike packages), generate PayHere MD5 hashes exclusively on the backend, and unlock receipts only after a verified PayHere server notification (`status_code = 2`).
  - *Why*: Prevents browser devtools tampering, fake redirect URL parameters, and cross-customer receipt enumeration.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                     CLIENT SPA (React 19 + Router + ErrorBoundary)         │
│                                                                            │
│  ┌──────────────────┐   ┌────────────────────┐   ┌──────────────────────┐  │
│  │ SignUp & Login   │   │ Easy Checkout Form │   │ Customer Dashboard   │  │
│  │ (Form Validation,│──▶│ (Auto-Filled Saved │──▶│ (Profile Editor,     │  │
│  │  Safe Auth Flow) │   │  Billing Profile)  │   │  Orders & Receipts)  │  │
│  └────────┬─────────┘   └─────────┬──────────┘   └──────────┬───────────┘  │
└───────────┼───────────────────────┼─────────────────────────┼──────────────┘
            │ Bearer Token / JSON   │ POST /api/payhere/*     │ Bearer Token
            ▼                       ▼                         ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                 EXPRESS / VERCEL SERVERLESS API GATEWAY                    │
│                                                                            │
│  ┌──────────────────────┐  ┌────────────────────────┐  ┌────────────────┐  │
│  │ Auth & Rate Limiter  │  │ PayHere Checkout & IPN │  │ Owner & Token  │  │
│  │ (PBKDF2-SHA512,      │  │ Verifier (Server MD5,  │  │ Isolation      │  │
│  │  JWT + Revocation)   │  │ Official Catalog Check)│  │ Guard (403)    │  │
│  └──────────┬───────────┘  └───────────┬────────────┘  └────────┬───────┘  │
│             └──────────────────────────┼────────────────────────┘          │
│                                        ▼                                   │
│             ┌──────────────────────────────────────────────────┐           │
│             │ Auto-Initialized PostgreSQL Repository (Drizzle) │           │
│             │ (customers, orders, processed_notifications,     │           │
│             │  password_reset_tokens, revoked_session_tokens)  │           │
│             └──────────────────────────────────────────────────┘           │
└────────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State
- **Customers (`customers`)**: Stores `customer_id`, `full_name`, `email` (unique, lowercase), `whatsapp_number`, `billing_address`, `city`, `country`, `password_hash`, `password_salt`, and timestamps.
- **Orders (`orders`)**: Stores `order_id`, `customer_id`, `order_access_token` (HMAC-SHA256), `receipt_number`, customer billing snapshot, `game_name`, `player_uid`, `server_zone`, `package_name`, `amount_lkr`, `currency`, `payment_method`, `payment_status` (`PENDING`, `SUCCESSFUL`, `FAILED`, `CANCELLED`), `payhere_transaction_ref`, and timestamps.
- **Security Tables**: `processed_notifications` (idempotent IPN deduplication), `password_reset_tokens` (SHA-256 hashed single-use 15-minute tokens), and `revoked_session_tokens` (server-side logout invalidation).

### Interactive Component & State Mapping
- **SignUp & Login Views**: Validate inputs before network dispatch, handle non-JSON or 500/429 server responses gracefully without throwing unhandled promise rejections, store session state via `AuthContext`, and redirect to `/#payment-section`.
- **Dashboard View**: Waits for `isLoading === false` before checking `!customer`, fetches `/api/customer/orders` without dependency loops, and allows inline profile updates and verified PDF/PNG receipt downloads.
- **Checkout & Receipt Views**: Submits top-up payload to `/api/payhere/initiate`, stores `orderAccessToken` in `sessionStorage`, redirects to PayHere hosted checkout, and polls `/api/payhere/verify` with owner/token authorization on return.
