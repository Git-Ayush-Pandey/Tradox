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

exports.sendSMSOTP = async (phone, otp, url = null) => {
  try {
    // 1) Template config from env (so you never hardcode again)
    const templateName = process.env.MSG91_TEMPLATE_NAME || "otptemplate";
    const languageCode = process.env.MSG91_TEMPLATE_LANG || "en";

    // 2) Phone normalization: keep single leading 91
    let digits = String(phone || "").replace(/\D/g, "");
    if (!digits.startsWith("91")) {
      // if user passed 10 digits, prepend 91
      if (digits.length === 10) digits = `91${digits}`;
      else digits = `91${digits}`;
    }

    // 3) Components: body_1 is mandatory; button_1 only if you pass a URL
    const components = {
      body_1: { type: "text", value: otp },
      ...(url && { button_1: { subtype: "url", type: "text", value: url } }),
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
              components,
            },
          ],
        },
      },
    };

    // Helpful debug so logs always show which template was used
    console.log("➡️ Sending WhatsApp template", {
      templateName,
      languageCode,
      to: digits,
      hasButton: !!url,
    });

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
    const apiErr = error.response?.data || error.message;
    console.error("❌ MSG91 send error:", apiErr);

    // Friendly hints for the 3 most common causes
    if (String(apiErr).toLowerCase().includes("disabled")) {
      console.error("⚠ The template is disabled. Enable it in MSG91 > WhatsApp > Templates.");
    }
    if (String(apiErr).toLowerCase().includes("does not exist")) {
      console.error("⚠ Template name/language mismatch. Verify name & language exactly as in MSG91.");
    }
    if (String(apiErr).toLowerCase().includes("namespace")) {
      console.error("⚠ Namespace mismatch. Verify the namespace tied to your integrated number.");
    }

    throw error;
  }
};
