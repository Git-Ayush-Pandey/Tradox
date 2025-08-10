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
    const payload = {
      integrated_number: process.env.MSG91_WHATSAPP_NUMBER,
      content_type: "template",
      payload: {
        messaging_product: "whatsapp",
        type: "template",
        template: {
          name: "otp_template", // The name of your approved template in MSG91
          language: {
            code: "en",
            policy: "deterministic",
          },
          namespace: process.env.MSG91_NAMESPACE,
          to_and_components: [
            {
              to: [`91${phone}`], // Prepend country code (assuming Indian numbers)
              components: {
                body_1: {
                  type: "text",
                  value: otp, // The OTP is passed as the first variable in the template
                },
              },
            },
          ],
        },
      },
    };

    const response = await axios.post(
      "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          authkey: process.env.MSG91_AUTH_KEY,
        },
      }
    );

    console.log(`✅ WhatsApp OTP sent to ${phone}:`, response.data);
  } catch (error) {
    // Log the detailed error from the API for easier debugging
    console.error(
      `❌ Failed to send WhatsApp OTP to ${phone}:`,
      error.response?.data || error.message
    );
    // Re-throw the error so the route handler can manage the response
    throw error;
  }
};
