const jwt = require("jsonwebtoken");
const User = require("./model/UserModel");

module.exports.isLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log("Middleware received token:", token);
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    console.log("Decoded user:", user);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
