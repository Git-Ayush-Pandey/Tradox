const router = require("express").Router();
const User = require("../model/UserModel");
const { createSecretToken } = require("../util/secretToken");
require("dotenv").config();
const jwt = require("jsonwebtoken");

router.post("/signup", async (req, res) => {
  try {
    const { email, phone, name, password } = req.body;
    const newUser = new User({ email, phone, name });
    const registeredUser = await User.register(newUser, password);
    console.log("User registered:", registeredUser);
    const token = createSecretToken(registeredUser._id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: registeredUser,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res
      .status(500)
      .json({ success: false, error: err.message || "Something went wrong" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid email" });
  }
  const isValid = await user.authenticate(password);
  if (!isValid.user) {
    return res.status(401).json({ success: false, message: "Invalid password" });
  }
  const token = createSecretToken(user._id);
  res.cookie("token", token, {
    withCredentials: true,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  return res.status(200).json({ success: true, message: "Login successful", user });
});

router.get("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  });
  return res.status(200).json({ success: true, message: "Logout successful" });
});


router.post("/", (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    console.log("ayush");
    return res.json({ status: false });
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      console.log("ayush Pandey");
      return res.json({ status: false });
    } else {
      const user = await User.findById(data.id);
      if (user) {
        console.log("ayush pandey ki");
        return res.json({ status: true, user: user.username });
      } else {
        console.log("ayush pandey ki jay");
        return res.json({ status: false });
      }
    }
  });
});

module.exports = router;