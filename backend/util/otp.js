const nodemailer = require("nodemailer");

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
    from: `"Tradox Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your OTP Verification Code",
    text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
  };
  await transporter.sendMail(mailOptions);
};

// Mock SMS sender — logs OTP to console
const axios = require("axios");

exports.sendSMSOTP = async (phone, otp) => {
  try {
    const templateName = process.env.MSG91_TEMPLATE_NAME || "otptemplate";
    const languageCode = process.env.MSG91_TEMPLATE_LANG || "en_US";
    let digits = String(phone || "").replace(/\D/g, "");
    if (!digits.startsWith("91")) {
      if (digits.length === 10) digits = `91${digits}`;
      else digits = `91${digits}`;
    }

    const components = {
      body_1: { type: "text", value: otp },
      button_1: { subtype: "url", type: "text", value: otp } // always send
    };

    const payload = {
      integrated_number: process.env.MSG91_WHATSAPP_NUMBER,
      content_type: "template",
      payload: {
        messaging_product: "whatsapp",
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode, policy: "deterministic" },
          namespace: process.env.MSG91_NAMESPACE,
          to_and_components: [
            {
              to: [digits],
              components
            }
          ]
        }
      }
    };

    const response = await axios.post(
      "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          authkey: process.env.MSG91_AUTH_KEY,
        },
        timeout: 10000,
      }
    );

    console.log(`✅ OTP ${otp} sent to ${digits}:`, response.data);
  } catch (error) {
    console.error("❌ MSG91 send error:", error.response?.data || error.message);
    throw error;
  }
};
