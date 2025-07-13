require("dotenv").config();
const axios = require("axios");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const { symbol, interval, function: func, outputsize, keywords } = req.query;
  const apiKey = process.env.API_NEW_KEY;
  console.log("Loaded API key:", apiKey);

  if (!func) {
    return res.status(400).json({ error: "Missing required query parameter: function" });
  }

  let url = `https://www.alphavantage.co/query?function=${func}&apikey=${apiKey}`;

  if (func === "SYMBOL_SEARCH") {
    if (!keywords) {
      return res.status(400).json({ error: "Missing keywords for SYMBOL_SEARCH" });
    }
    url += `&keywords=${keywords}`;
  } else {
    if (!symbol) {
      return res.status(400).json({ error: "Missing symbol for this function" });
    }
    url += `&symbol=${symbol}`;
    if (interval) url += `&interval=${interval}`;
    if (outputsize) url += `&outputsize=${outputsize}`;
  }

  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("AlphaVantage API error:", error.message);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

module.exports = router;
