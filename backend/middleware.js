const jwt = require("jsonwebtoken");
const User = require("./model/UserModel");

module.exports.isLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("_id email name phone");

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("Authenticated user:", user);
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
