# Implementation Plan: PayHere Sandbox Integration & Customer Checkout Update

## 1. Overview
Update the existing **UCHIHA MARRI TOP UP** application to collect full customer and billing details during checkout, integrate the official PayHere Sandbox Checkout API with strict server-side MD5 hash generation and IPN notification verification, and provide receipt download and manual WhatsApp receipt sharing (`0742235836`) without altering existing designs, games, packages, or prices.

---

## 2. Planned Changes by File

### A. Environment Configuration (`/.env.example`)
- Document the required server-side PayHere environment variables without hardcoding any private credentials:
  - `PAYHERE_MERCHANT_ID`
  - `PAYHERE_MERCHANT_SECRET`
  - `PAYHERE_SANDBOX="true"`
  - `BUSINESS_WHATSAPP="0742235836"`

### B. Shared TypeScript Types (`/src/types.ts`)
- Extend `PaymentInitiationPayload` and `ReceiptData` to include:
  - `customerEmail: string`
  - `billingAddress: string`
  - `billingCity: string`
  - `billingCountry: string`
- Ensure payment status types explicitly cover `SUCCESSFUL`, `PENDING`, `FAILED`, and `CANCELLED`.

### C. Checkout Form (`/src/components/PaymentForm.tsx`)
- **Customer & Billing Information (Section 01)**:
  - Keep existing **Customer Full Name** (`customerName`) and **WhatsApp Number** (`whatsappNumber`) inputs.
  - Add required inputs matching the existing dark/crimson aesthetic:
    - **Email Address** (`customerEmail`)
    - **Billing Address** (`billingAddress`)
    - **Billing City** (`billingCity`)
    - **Billing Country** (`billingCountry`, defaulting to `"Sri Lanka"`)
- **Preserve Existing Checkout Controls**:
  - Keep Game selection (`Free Fire`, `Mobile Legends`, `Blood Strike`), Player ID / UID (and Free Fire UID lookup), Server Zone ID (with MLBB 4–5 digit numeric validation), Package selection, Custom amount input, and Visa/Mastercard selection.
- **Validation & Submission**:
  - Validate Full Name, WhatsApp Number, Email Address (format check), Billing Address, Billing City, Billing Country, Game, Player UID, Zone ID (when required), and Package/Custom Amount before calling `POST /api/payhere/initiate`.
  - Receive the signed `payhereData` payload and `checkoutUrl` (`https://sandbox.payhere.lk/pay/checkout` in Sandbox mode) and redirect the customer via a hidden auto-submitted POST form to PayHere Hosted Checkout. Never collect card numbers, CVV, or expiry dates on the site.

### D. Secure PayHere Backend (`/src/server/app.ts`)
-Reuse the existing Express backend mounted via `/api/index.ts` and `vercel.json` (no duplicate endpoint files):
  1. **`GET /api/payhere/config` & `POST /api/payhere/config`**:
     - Read `PAYHERE_MERCHANT_ID`, `PAYHERE_MERCHANT_SECRET`, and `PAYHERE_SANDBOX` (`true` by default unless explicitly `"false"`).
     - Remove hardcoded fallback secret strings so credentials come strictly from server environment variables or runtime configuration.
     - Return configuration status (`configured`, `sandbox`, `checkoutUrl`) without exposing `PAYHERE_MERCHANT_SECRET`.
  2. **`POST /api/payhere/initiate`**:
     - Validate all required customer fields (`customerName`, `whatsappNumber`, `customerEmail`, `billingAddress`, `billingCity`, `billingCountry`), game details (`gameName`, `playerId`, `serverZoneId`), and package/custom amount against server-side package pricing.
     - Generate a unique order ID (`UMT-<timestamp>-<random>`).
     - Format amount to 2 decimal places (`amount.toFixed(2)`) and compute the official PayHere MD5 checkout hash on the server:
       `UPPERCASE(MD5(merchant_id + order_id + amountFormatted + currency + UPPERCASE(MD5(merchant_secret))))`.
     - Populate PayHere checkout fields (`first_name`, `last_name`, `email`, `phone`, `address`, `city`, `country`, `return_url`, `cancel_url`, `notify_url`, and custom fields) and save the transaction with initial status `PENDING`.
  3. **`POST /api/payhere/notify`**:
     - Verify `merchant_id` matches the configured `PAYHERE_MERCHANT_ID`.
     - Verify the PayHere `md5sig` signature:
       `UPPERCASE(MD5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + UPPERCASE(MD5(merchant_secret))))`.
     - Verify the order exists and that `Number(payhere_amount).toFixed(2) === Number(transaction.amount).toFixed(2)` and `payhere_currency === transaction.currency`.
     - Prevent duplicate payment notifications: if the order is already marked `SUCCESSFUL`, log and return `200 OK` without re-processing.
     - Map PayHere `status_code` values accurately:
       - `2` → `SUCCESSFUL`
       - `0` → `PENDING`
       - `-1` → `CANCELLED`
       - `-2` / `-3` → `FAILED`
  4. **`GET /api/payhere/verify` & `GET /api/payhere/verify/:orderId` & `POST /api/payhere/verify`**:
     - Support verifying an order via path parameter (`/api/payhere/verify/:orderId`), query parameter (`/api/payhere/verify?order_id=...`), or POST body.
     - Never mark an order `SUCCESSFUL` merely because the user returned to `return_url`; return the authoritative server-side status (`SUCCESSFUL`, `PENDING`, `FAILED`, or `CANCELLED`).

### E. Receipt & WhatsApp Confirmation (`/src/components/ReceiptPreviewCard.tsx`, `/src/pages/ReceiptPage.tsx`, `/src/components/SuccessView.tsx`)
- Ensure the receipt view displays:
  - **UCHIHA MARRI TOP UP**
  - **Order ID**
  - **Customer Name**
  - **Game Name**
  - **Player ID**
  - **Package**
  - **Payment Amount**
  - **Payment Status** (`SUCCESSFUL`, `PENDING`, `FAILED`, `CANCELLED`)
  - **Payment Date**
- Include a **`DOWNLOAD RECEIPT`** button to download the official PDF receipt (while keeping PNG download available).
- Include a **`SEND RECEIPT VIA WHATSAPP`** button that opens WhatsApp (`0742235836` / `94742235836`) with a pre-filled message containing all receipt details so the customer can manually send it (without claiming the WhatsApp message was automatically sent).
- Accurately reflect `SUCCESSFUL`, `PENDING`, `FAILED`, and `CANCELLED` states on the return/verification screens so unverified redirects remain `PENDING` until PayHere's server notification confirms payment.
