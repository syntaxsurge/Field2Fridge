import express from "express";
import crypto from "node:crypto";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.Q402_PORT ? Number(process.env.Q402_PORT) : 4020;
const secret = process.env.Q402_SPONSOR_SECRET || "demo-secret";

function requirePayment(req: express.Request, res: express.Response, next: express.NextFunction) {
  const paymentHeader = req.header("x-payment");
  if (!paymentHeader) {
    return res.status(402).json({ error: "Payment required", details: "Missing x-payment header" });
  }
  const valid = crypto.timingSafeEqual(Buffer.from(paymentHeader), Buffer.from(secret));
  if (!valid) {
    return res.status(402).json({ error: "Payment required", details: "Invalid payment token" });
  }
  return next();
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/premium", requirePayment, (_req, res) => {
  res.json({
    status: "ok",
    message: "Premium action executed under 402 gate",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Q402-style gateway running on http://localhost:${PORT}`);
});
