const router = require("express").Router();
const User = require("../model/UserModel");
const { Fund } = require("../model/FundsModel");
const { createSecretToken } = require("../util/secretToken");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { isLoggedIn } = require("../middleware");

router.post("/signup", async (req, res) => {
  try {
    const { email, phone, name, password } = req.body;

    const newUser = new User({ email, phone, name });
    const registeredUser = await User.register(newUser, password);

    const defaultFund = new Fund({
      userId: registeredUser._id,
      availableMargin: 0,
      usedMargin: 0,
      availableCash: 0,
      openingBalance: 0,
      payin: 0,
      span: 0,
      deliveryMargin: 0,
      exposure: 0,
      optionsPremium: 0,
      collateralLiquid: 0,
      collateralEquity: 0,

      commodityAvailableMargin: 0,
      commodityUsedMargin: 0,
      commodityAvailableCash: 0,
      commodityOpeningBalance: 0,
      commodityPayin: 0,
      commoditySpan: 0,
      commodityDeliveryMargin: 0,
      commodityExposure: 0,
      commodityOptionsPremium: 0,
    });

    await defaultFund.save();

    const token = createSecretToken(registeredUser._id);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const safeUser = {
      id: registeredUser._id,
      name: registeredUser.name,
      email: registeredUser.email,
      phone: registeredUser.phone,
    };

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: safeUser,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
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
    return res
      .status(401)
      .json({ success: false, message: "Invalid password" });
  }
  const token = createSecretToken(user._id);
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "none",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  const safeUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  };
  return res
    .status(200)
    .json({ success: true, message: "Login successful", safeUser });
});

router.get("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  });
  return res.status(200).json({ success: true, message: "Logout successful" });
});

router.get("/verify", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ status: false });

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(data.id);
    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    };
    if (user) return res.json({ status: true, safeUser });
    return res.json({ status: false });
  } catch (err) {
    return res.json({ status: false });
  }
});

router.get("/me", isLoggedIn, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  });
});

router.post("/update-unrealised-pnl", isLoggedIn, async (req, res) => {
  try {
    const { unrealisedPnL } = req.body;

    if (typeof unrealisedPnL !== "number") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid PnL value" });
    }

    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // ✅ Correct field name
    user.unrealizedPL = unrealisedPnL;
    await user.save();

    res.json({
      success: true,
      message: "Unrealised PnL updated",
      unrealisedPnL,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/pnl", isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "realizedPL unrealizedPL"
    );
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({
      success: true,
      realizedPL: user.realizedPL || 0,
      unrealizedPL: user.unrealizedPL || 0,
      totalPL: (user.realizedPL || 0) + (user.unrealizedPL || 0),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
