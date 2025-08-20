const express = require("express");
const router = express.Router();
const { sendEmailOTP, sendSMSOTP } = require("../util/otp");
const User = require("../model/UserModel");

const otpStore = {};

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

router.post("/send-otp", async (req, res) => {
  const { type, value } = req.body;
  const otp = generateOTP();

  console.log(` Sending OTP to ${type}: ${value}, Code: ${otp}`);

  otpStore[value] = { otp, expires: Date.now() + 10 * 60 * 1000 };

  try {
    if (type === "email") {
      await sendEmailOTP(value, otp);
      res.json({ success: true, message: "OTP sent" });
    } else if (type === "phone") {
      await sendSMSOTP(value, otp);
      res.json({ success: true, message: "OTP sent", otp });
    } else {
      throw new Error("Unsupported type");
    }
  } catch (err) {
    console.error(" Failed to send OTP:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { type, value, otp } = req.body;
  const record = otpStore[value];

  if (!record || Date.now() > record.expires) {
    return res.status(400).json({ success: false, message: "OTP expired" });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

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
