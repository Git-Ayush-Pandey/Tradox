require("dotenv").config();
const express = require("express");
const router = express.Router();
const axios = require("axios");

const SEARCH_API_KEY = process.env.SEARCH_API_KEY;
const LIVEPRICE_API_KEY = process.env.LIVEPRICE_API_KEY;
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY;

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

router.get("/livePrice", async (req, res) => {
  const { symbol } = req.query;
  if (!symbol)
    return res.status(400).json({ error: "Missing symbol parameter" });
  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${LIVEPRICE_API_KEY}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    console.error("🔴 Live Price Error:", err.message);
    res.status(500).json({ error: "Failed to fetch live price" });
  }
});

router.get("/graph", async (req, res) => {
  const { symbol, interval } = req.query;
  if (!symbol || !interval) {
    return res.status(400).json({ error: "Missing symbol or interval" });
  }
  const url = `https://www.alphavantage.co/query`;
  const params = {
    apikey: ALPHA_VANTAGE_KEY,
    symbol: symbol,
  };

  if (interval === "1day") {
    params.function = "TIME_SERIES_INTRADAY";
    params.interval = "5min";
    params.outputsize = "compact";
  } else if (interval === "1week" || interval === "1month") {
    params.function = "TIME_SERIES_DAILY";
  } else if (interval === "1year") {
    params.function = "TIME_SERIES_WEEKLY";
  } else if (interval === "5year" || interval === "all") {
    params.function = "TIME_SERIES_MONTHLY";
  } else {
    return res.status(400).json({ error: "Invalid interval" });
  }

  try {
    const response = await axios.get(url, { params });
    res.json(response.data);
  } catch (err) {
    console.error("Graph Fetch Error:", err.message);
    res.status(500).json({ error: "Failed to fetch graph data" });
  }
});

router.get("/news", async (req, res) => {
  const { symbol, from, to } = req.query;
  if (!symbol || !from || !to) {
    return res
      .status(400)
      .json({ error: "Missing symbol, from, or to parameter" });
  }
  const url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${LIVEPRICE_API_KEY}`;

  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("🔴 News fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

router.get("/overview", async (req, res) => {
  const { symbol } = req.query;
  if (!symbol) {
    return res.status(400).json({ error: "Missing symbol parameter" });
  }
  const url = `https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${LIVEPRICE_API_KEY}`;

  try {
    const response = await axios.get(url);
    res.json(response.data.metric);
  } catch (error) {
    console.error("🔴 Overview fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch overview data" });
  }
});

module.exports = router;
