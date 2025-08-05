const nodemailer = require("nodemailer");

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send OTP via email
exports.sendEmailOTP = async (to, otp) => {
  const mailOptions = {
    from: `"WanderStay Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your OTP Verification Code",
    text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
  };
  await transporter.sendMail(mailOptions);
};

// Mock SMS sender — logs OTP to console
exports.sendSMSOTP = async (phone, otp) => {
  console.log(`📲 Mock SMS OTP to +91${phone}: ${otp}`);
};
