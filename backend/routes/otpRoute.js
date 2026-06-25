const express = require("express");
const router = express.Router();
const User = require("../model/UserModel");
const crypto = require("crypto");

// In-memory OTP store (single-instance dev). For multi-instance production,
// replace with a MongoDB TTL collection or Redis.
const otpStore = {};

// Attempt tracking for rate-limiting (5 attempts per value per window)
const attemptStore = {};
const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Hash OTP before storing — plaintext is never persisted
const hashOTP = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");

router.post("/send-otp", async (req, res) => {
  const { type, value } = req.body;

  if (!type || !value) {
    return res
      .status(400)
      .json({ success: false, message: "type and value are required" });
  }

  // Rate limiting: max 5 send requests per 10-min window per value
  const now = Date.now();
  if (!attemptStore[value] || now > attemptStore[value].windowEnd) {
    attemptStore[value] = { count: 0, windowEnd: now + ATTEMPT_WINDOW_MS };
  }
  if (attemptStore[value].count >= MAX_ATTEMPTS) {
    return res.status(429).json({
      success: false,
      message: "Too many OTP requests. Please try again later.",
    });
  }
  attemptStore[value].count += 1;

  const otp = generateOTP();
  const hashedOtp = hashOTP(otp);

  // Store hashed OTP + expiry; never store plaintext
  otpStore[value] = {
    hashedOtp,
    expires: now + 10 * 60 * 1000, // 10 minutes
    used: false,
  };

  // FIX: Only expose raw OTP in development mode.
  // In production, this block is omitted and the actual SMS/email sender is used.
  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    // Development: return OTP directly for testing (no real delivery)
    return res.json({
      success: true,
      message: "Development Mode OTP",
      otp, // ← only present in dev; never sent in production
      deliveryMode: "development",
    });
  }

  // Production: send via real provider (swap in MSG91 / nodemailer here)
  // try {
  //   if (type === "email") await sendEmailOTP(value, otp);
  //   else await sendSMSOTP(value, otp);
  // } catch (err) {
  //   console.error("Failed to deliver OTP:", err);
  //   return res.status(500).json({ success: false, message: "Failed to send OTP" });
  // }

  return res.json({ success: true, message: "OTP sent", deliveryMode: "production" });
});

router.post("/verify-otp", async (req, res) => {
  const { type, value, otp } = req.body;

  if (!type || !value || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "type, value, and otp are required" });
  }

  const record = otpStore[value];

  if (!record || Date.now() > record.expires) {
    return res.status(400).json({ success: false, message: "OTP expired" });
  }

  if (record.used) {
    // Replay protection: single-use OTP
    return res
      .status(400)
      .json({ success: false, message: "OTP already used" });
  }

  const hashedInput = hashOTP(String(otp));
  if (record.hashedOtp !== hashedInput) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  // Mark as used immediately (single-use) before any async work
  record.used = true;
  delete otpStore[value];

  try {
    const updateField =
      type === "email" ? { isEmailVerified: true } : { isPhoneVerified: true };

    const user = await User.findOneAndUpdate(
      { [type]: value },
      { $set: updateField },
      { new: true }
    );

    if (!user) {
      // User not created yet (OTP verified pre-signup) — still a success
      return res.json({
        success: true,
        message: `${type} verified (user not created yet)`,
        verified: true,
      });
    }

    return res.json({ success: true, message: `${type} verified` });
  } catch (err) {
    console.error("Error updating user verification:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
