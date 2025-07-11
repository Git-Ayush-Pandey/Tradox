const jwt = require("jsonwebtoken");
const User = require("./model/UserModel");

module.exports.isLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log("Middleware received token:", token); // ✅ Log token

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ Might throw
    const user = await User.findById(decoded.id);
    console.log("Decoded user:", user); // ✅ Log decoded user

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err); // ✅ Log the exact error
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
