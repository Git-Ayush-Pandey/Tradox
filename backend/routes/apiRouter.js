require("dotenv").config();
const express = require("express");
const router = express.Router();
const axios = require("axios");

const SEARCH_API_KEY = process.env.SEARCH_API_KEY;
const LIVEPRICE_API_KEY = process.env.LIVEPRICE_API_KEY;
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY;

const priceCache = new Map();
const CACHE_DURATION = 5000;

let rateLimitedUntil = 0;

router.get("/price", async (req, res) => {
  const { symbol } = req.query;
  if (!symbol) {
    return res.status(400).json({ error: "Missing symbol parameter" });
  }

  if (Date.now() < rateLimitedUntil) {
    return res.status(429).json({
      error: "Rate limited, please wait",
      retryAfter: Math.ceil((rateLimitedUntil - Date.now()) / 1000),
    });
  }

  const cachedData = priceCache.get(symbol);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    console.log(`✅ Cache hit for ${symbol}`);
    return res.json(cachedData.data);
  }

  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${LIVEPRICE_API_KEY}`;
    const response = await axios.get(url);

    priceCache.set(symbol, {
      data: response.data,
      timestamp: Date.now(),
    });

    if (priceCache.size > 1000) {
      const oldestKey = priceCache.keys().next().value;
      priceCache.delete(oldestKey);
    }

    console.log(` API call for ${symbol}`);
    res.json(response.data);
  } catch (err) {
    console.error(" Live Price Error:", err.message);

    if (err.response && err.response.status === 429) {
      rateLimitedUntil = Date.now() + 60000;
      return res.status(429).json({
        error: "Rate limited by external API",
        retryAfter: 60,
      });
    }

    res.status(500).json({ error: "Failed to fetch live price" });
  }
});

const searchCache = new Map();

router.get("/search", async (req, res) => {
  const { keywords } = req.query;
  if (!keywords) {
    return res.status(400).json({ error: "Missing keywords parameter" });
  }

  const cachedData = searchCache.get(keywords);
  if (cachedData && Date.now() - cachedData.timestamp < 30000) {
    return res.json({ bestMatches: cachedData.data });
  }

  try {
    const url = `https://finnhub.io/api/v1/search?q=${keywords}&token=${SEARCH_API_KEY}`;
    const response = await axios.get(url);

    searchCache.set(keywords, {
      data: response.data.result,
      timestamp: Date.now(),
    });

    res.json({ bestMatches: response.data.result });
  } catch (err) {
    console.error("Search Error:", err.message);
    if (err.response && err.response.status === 429) {
      return res.status(429).json({ error: "Search rate limited" });
    }
    res.status(500).json({ error: "Failed to fetch search results" });
  }
});

router.get("/news", async (req, res) => {
  const { symbol, from, to } = req.query;
  if (!symbol || !from || !to) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    const url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${SEARCH_API_KEY}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    console.error(" News Error:", err.message);
    res.status(500).json({ error: "Failed to fetch news data" });
  }
});

router.get("/overview", async (req, res) => {
  const { symbol } = req.query;
  if (!symbol)
    return res.status(400).json({ error: "Missing symbol parameter" });

  try {
    const url = `https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${SEARCH_API_KEY}`;
    const response = await axios.get(url);

    res.json(response.data.metric);
  } catch (err) {
    console.error(" Overview fetch failed:", err.message);
    res.status(500).json({ error: "Failed to fetch overview data" });
  }
});

module.exports = router;
