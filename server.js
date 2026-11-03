// server.ts
import express from "express";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
var transactions = /* @__PURE__ */ new Map();
var config = {
  merchantId: process.env.PAYHERE_MERCHANT_ID || "1211149",
  merchantSecret: process.env.PAYHERE_MERCHANT_SECRET || "4O9vC3xXz6L4Vj2k0b3U1w==",
  // Official PayHere Sandbox Secret
  isSandbox: process.env.PAYHERE_SANDBOX !== "false",
  businessWhatsApp: process.env.BUSINESS_WHATSAPP || "0742235836",
  businessName: "UCHIHA MARRI TOP UP"
};
function generatePayHereHash(merchantId, orderId, amount, currency, merchantSecret) {
  const formattedAmount = Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false
  });
  const hashedSecret = crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
  const hashString = `${merchantId}${orderId}${formattedAmount}${currency}${hashedSecret}`;
  return crypto.createHash("md5").update(hashString).digest("hex").toUpperCase();
}
function verifyPayHereSignature(merchantId, orderId, payhereAmount, payhereCurrency, statusCode, merchantSecret, receivedMd5Sig) {
  const hashedSecret = crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
  const hashString = `${merchantId}${orderId}${payhereAmount}${payhereCurrency}${statusCode}${hashedSecret}`;
  const localMd5 = crypto.createHash("md5").update(hashString).digest("hex").toUpperCase();
  return localMd5 === receivedMd5Sig.toUpperCase();
}
app.get("/api/payhere/config", (_req, res) => {
  res.json({
    merchantId: config.merchantId,
    isSandbox: config.isSandbox,
    businessWhatsApp: config.businessWhatsApp,
    businessName: config.businessName,
    hasCustomSecret: Boolean(config.merchantSecret && config.merchantSecret.length > 5)
  });
});
app.post("/api/payhere/config", (req, res) => {
  const { merchantId, merchantSecret, isSandbox, businessWhatsApp } = req.body;
  if (merchantId && typeof merchantId === "string") {
    config.merchantId = merchantId.trim();
  }
  if (merchantSecret && typeof merchantSecret === "string") {
    config.merchantSecret = merchantSecret.trim();
  }
  if (typeof isSandbox === "boolean") {
    config.isSandbox = isSandbox;
  }
  if (businessWhatsApp && typeof businessWhatsApp === "string") {
    config.businessWhatsApp = businessWhatsApp.trim();
  }
  res.json({
    success: true,
    message: "Store settings updated successfully",
    merchantId: config.merchantId,
    isSandbox: config.isSandbox,
    businessWhatsApp: config.businessWhatsApp
  });
});
app.post("/api/payhere/initiate", (req, res) => {
  try {
    const {
      customerName,
      whatsappNumber,
      customerEmail,
      gameName,
      playerId,
      serverZone,
      amount,
      paymentMethod
    } = req.body;
    if (!customerName || !whatsappNumber || !gameName || !playerId || !amount) {
      return res.status(400).json({ error: "Missing required top-up details" });
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount < 50) {
      return res.status(400).json({ error: "Minimum payment amount is 50 LKR" });
    }
    const orderId = `UMT-${Date.now().toString().slice(-6)}-${Math.floor(1e3 + Math.random() * 9e3)}`;
    const transaction = {
      orderId,
      customerName: customerName.trim(),
      whatsappNumber: whatsappNumber.trim(),
      customerEmail: customerEmail ? customerEmail.trim() : `${whatsappNumber.replace(/[^0-9]/g, "")}@uchihatopup.lk`,
      gameName: gameName.trim(),
      playerId: playerId.trim(),
      serverZone: serverZone ? serverZone.trim() : void 0,
      amount: numericAmount,
      currency: "LKR",
      paymentMethod: paymentMethod === "mastercard" ? "mastercard" : "visa",
      status: "PENDING",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      isSandbox: config.isSandbox
    };
    transactions.set(orderId, transaction);
    const currency = "LKR";
    const hash = generatePayHereHash(
      config.merchantId,
      orderId,
      numericAmount,
      currency,
      config.merchantSecret
    );
    const formattedAmount = numericAmount.toFixed(2);
    const host = req.get("host") || "localhost:3000";
    const protocol = req.protocol === "https" || req.get("x-forwarded-proto") === "https" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;
    res.json({
      success: true,
      orderId,
      payhereData: {
        sandbox: config.isSandbox,
        merchant_id: config.merchantId,
        return_url: `${baseUrl}/?status=success&order_id=${orderId}`,
        cancel_url: `${baseUrl}/?status=failed&order_id=${orderId}`,
        notify_url: `${baseUrl}/api/payhere/notify`,
        order_id: orderId,
        items: `${config.businessName} - ${gameName} Top Up`,
        amount: formattedAmount,
        currency: "LKR",
        hash,
        first_name: customerName,
        last_name: "Customer",
        email: transaction.customerEmail,
        phone: whatsappNumber,
        address: "Gaming Account Top Up",
        city: "Colombo",
        country: "Sri Lanka",
        custom_1: `${gameName} (UID: ${playerId}${serverZone ? " Zone: " + serverZone : ""})`,
        custom_2: `Method: ${transaction.paymentMethod.toUpperCase()}`
      },
      checkoutUrl: config.isSandbox ? "https://sandbox.payhere.lk/pay/checkout" : "https://www.payhere.lk/pay/checkout"
    });
  } catch (err) {
    console.error("Error initiating PayHere payment:", err);
    res.status(500).json({ error: "Failed to initiate payment", details: err?.message });
  }
});
app.post("/api/payhere/notify", (req, res) => {
  try {
    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      status_message
    } = req.body;
    console.log(`[PayHere Webhook] Notification received for Order: ${order_id}, Status: ${status_code}`);
    const transaction = transactions.get(order_id);
    if (!transaction) {
      console.warn(`[PayHere Webhook] Order not found in memory: ${order_id}`);
      return res.status(404).send("Order not found");
    }
    const isSignatureValid = verifyPayHereSignature(
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      config.merchantSecret,
      md5sig
    );
    if (!isSignatureValid) {
      console.error(`[PayHere Webhook] Invalid signature detected for Order: ${order_id}`);
      return res.status(400).send("Invalid signature");
    }
    if (status_code === "2") {
      transaction.status = "SUCCESSFUL";
      transaction.paymentId = payment_id;
      transaction.payhereAmount = payhere_amount;
      transaction.completedAt = (/* @__PURE__ */ new Date()).toISOString();
      console.log(`[PayHere Webhook] Order ${order_id} marked as SUCCESSFUL`);
    } else if (status_code === "-1") {
      transaction.status = "CANCELLED";
      transaction.failureReason = status_message || "Payment cancelled by user";
    } else {
      transaction.status = "FAILED";
      transaction.failureReason = status_message || "Payment failed on PayHere gateway";
    }
    res.status(200).send("OK");
  } catch (err) {
    console.error("[PayHere Webhook Error]:", err);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/api/payhere/verify/:orderId", (req, res) => {
  const { orderId } = req.params;
  const transaction = transactions.get(orderId);
  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }
  res.json({
    orderId: transaction.orderId,
    customerName: transaction.customerName,
    whatsappNumber: transaction.whatsappNumber,
    gameName: transaction.gameName,
    playerId: transaction.playerId,
    serverZone: transaction.serverZone,
    amount: transaction.amount,
    currency: transaction.currency,
    paymentMethod: transaction.paymentMethod,
    status: transaction.status,
    paymentId: transaction.paymentId || `PAY-${orderId.slice(-4)}-${Math.floor(1e3 + Math.random() * 9e3)}`,
    createdAt: transaction.createdAt,
    completedAt: transaction.completedAt || (/* @__PURE__ */ new Date()).toISOString(),
    failureReason: transaction.failureReason
  });
});
app.get("/api/transactions/:orderId", (req, res) => {
  const { orderId } = req.params;
  const transaction = transactions.get(orderId);
  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }
  res.json(transaction);
});
app.get("/api/transactions", (_req, res) => {
  const list = Array.from(transactions.values()).slice(-15).reverse().map((t) => ({
    orderId: t.orderId,
    customerName: t.customerName.charAt(0) + "***" + t.customerName.slice(-1),
    gameName: t.gameName,
    amount: t.amount,
    status: t.status,
    createdAt: t.createdAt
  }));
  res.json(list);
});
app.post("/api/payhere/simulate-status", (req, res) => {
  const { orderId, status } = req.body;
  const transaction = transactions.get(orderId);
  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }
  if (status === "SUCCESSFUL") {
    transaction.status = "SUCCESSFUL";
    transaction.paymentId = `PAY-${Date.now().toString().slice(-6)}`;
    transaction.completedAt = (/* @__PURE__ */ new Date()).toISOString();
  } else if (status === "FAILED") {
    transaction.status = "FAILED";
    transaction.failureReason = "Card declined by issuing bank or authentication failed";
    transaction.completedAt = (/* @__PURE__ */ new Date()).toISOString();
  }
  res.json({ success: true, transaction });
});
var sampleTransactions = [
  {
    orderId: "UMT-892140-5219",
    customerName: "Kavindu Perera",
    whatsappNumber: "+94719876543",
    gameName: "Free Fire",
    playerId: "2891048291",
    amount: 1500,
    currency: "LKR",
    paymentMethod: "visa",
    status: "SUCCESSFUL",
    paymentId: "PAY-8921-9302",
    createdAt: new Date(Date.now() - 1e3 * 60 * 18).toISOString(),
    completedAt: new Date(Date.now() - 1e3 * 60 * 17).toISOString(),
    isSandbox: false
  },
  {
    orderId: "UMT-772911-3481",
    customerName: "Dineth Silva",
    whatsappNumber: "+94774567890",
    gameName: "PUBG Mobile",
    playerId: "519284710",
    amount: 3200,
    currency: "LKR",
    paymentMethod: "mastercard",
    status: "SUCCESSFUL",
    paymentId: "PAY-7729-1120",
    createdAt: new Date(Date.now() - 1e3 * 60 * 45).toISOString(),
    completedAt: new Date(Date.now() - 1e3 * 60 * 44).toISOString(),
    isSandbox: false
  },
  {
    orderId: "UMT-618492-9102",
    customerName: "Nadeeshana Bandara",
    whatsappNumber: "+94763321144",
    gameName: "Mobile Legends",
    playerId: "984102914",
    serverZone: "2049",
    amount: 2500,
    currency: "LKR",
    paymentMethod: "visa",
    status: "SUCCESSFUL",
    paymentId: "PAY-6184-7491",
    createdAt: new Date(Date.now() - 1e3 * 60 * 95).toISOString(),
    completedAt: new Date(Date.now() - 1e3 * 60 * 94).toISOString(),
    isSandbox: false
  }
];
sampleTransactions.forEach((t) => {
  if (t.orderId) {
    transactions.set(t.orderId, t);
  }
});
app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "healthy", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
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
    const distPath = fs.existsSync(path.resolve(__dirname, "dist")) ? path.resolve(__dirname, "dist") : path.resolve(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
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
