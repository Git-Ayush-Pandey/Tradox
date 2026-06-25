require("dotenv").config();
const jwt = require("jsonwebtoken");

// FIX: Changed from 3 days to 7 days to match cookie maxAge (7 * 24 * 60 * 60 * 1000 ms)
module.exports.createSecretToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: 7 * 24 * 60 * 60,
  });
};
