require("dotenv").config();
const express = require("express");
const router = express.Router();
const axios = require("axios");

const SEARCH_API_KEY = process.env.SEARCH_API_KEY;
const LIVEPRICE_API_KEY = process.env.LIVEPRICE_API_KEY;

const PRICE_CACHE_TTL = 5000; // 5 seconds
const SEARCH_CACHE_TTL = 30000; // 30 seconds
const NEWS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const OVERVIEW_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const priceCache = new Map();
const searchCache = new Map();
const newsCache = new Map();
const overviewCache = new Map();

let rateLimitedUntil = 0;

// FIX: TTL-based cache cleanup — runs every 30 seconds to evict stale entries
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of priceCache) {
    if (now - val.timestamp > PRICE_CACHE_TTL * 10) priceCache.delete(key);
  }
  for (const [key, val] of searchCache) {
    if (now - val.timestamp > SEARCH_CACHE_TTL * 2) searchCache.delete(key);
  }
  for (const [key, val] of newsCache) {
    if (now - val.timestamp > NEWS_CACHE_TTL * 2) newsCache.delete(key);
  }
  for (const [key, val] of overviewCache) {
    if (now - val.timestamp > OVERVIEW_CACHE_TTL * 2) overviewCache.delete(key);
  }
}, 30000);

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
  if (cachedData && Date.now() - cachedData.timestamp < PRICE_CACHE_TTL) {
    return res.json(cachedData.data);
  }

  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${LIVEPRICE_API_KEY}`;
    const response = await axios.get(url);

    priceCache.set(symbol, {
      data: response.data,
      timestamp: Date.now(),
    });

    res.json(response.data);
  } catch (err) {
    console.error("Live Price Error:", err.message);

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

router.get("/search", async (req, res) => {
  const { keywords } = req.query;
  if (!keywords) {
    return res.status(400).json({ error: "Missing keywords parameter" });
  }

  const cachedData = searchCache.get(keywords);
  if (cachedData && Date.now() - cachedData.timestamp < SEARCH_CACHE_TTL) {
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

// FIX: Added server-side caching for news (5 min TTL) to avoid hammering Finnhub
router.get("/news", async (req, res) => {
  const { symbol, from, to } = req.query;
  if (!symbol || !from || !to) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const cacheKey = `${symbol}:${from}:${to}`;
  const cached = newsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < NEWS_CACHE_TTL) {
    return res.json(cached.data);
  }

  try {
    const url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${SEARCH_API_KEY}`;
    const response = await axios.get(url);
    newsCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
    res.json(response.data);
  } catch (err) {
    console.error("News Error:", err.message);
    res.status(500).json({ error: "Failed to fetch news data" });
  }
});

// FIX: Added server-side caching for overview (10 min TTL)
router.get("/overview", async (req, res) => {
  const { symbol } = req.query;
  if (!symbol)
    return res.status(400).json({ error: "Missing symbol parameter" });

  const cached = overviewCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < OVERVIEW_CACHE_TTL) {
    return res.json(cached.data);
  }

  try {
    const url = `https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${SEARCH_API_KEY}`;
    const response = await axios.get(url);
    overviewCache.set(symbol, { data: response.data.metric, timestamp: Date.now() });
    res.json(response.data.metric);
  } catch (err) {
    console.error("Overview fetch failed:", err.message);
    res.status(500).json({ error: "Failed to fetch overview data" });
  }
});

module.exports = router;
