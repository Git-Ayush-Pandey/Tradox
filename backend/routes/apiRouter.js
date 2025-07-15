require("dotenv").config();
const express = require("express");
const router = express.Router();
const axios = require("axios");

const SEARCH_API_KEY = process.env.SEARCH_API_KEY;
const LIVEPRICE_API_KEY = process.env.LIVEPRICE_API_KEY;

// ✅ 1. Stock Symbol Search
router.get("/search", async (req, res) => {
  const { keywords } = req.query;

  if (!keywords) {
    return res.status(400).json({ error: "Missing keywords parameter" });
  }

  try {
    const url = `https://finnhub.io/api/v1/search?q=${keywords}&token=${SEARCH_API_KEY}`;
    const response = await axios.get(url);
    res.json({ bestMatches: response.data.result });
  } catch (err) {
    console.error("🔴 Search Error:", err.message);
    res.status(500).json({ error: "Failed to fetch search results" });
  }
});

// ✅ 2. Live Price Quote
router.get("/livePrice", async (req, res) => {
  const { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: "Missing symbol parameter" });
  }

  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${LIVEPRICE_API_KEY}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    console.error("🔴 Live Price Error:", err.message);
    res.status(500).json({ error: "Failed to fetch live price" });
  }
});

module.exports = router;
