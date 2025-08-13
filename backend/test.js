const fetch = require("node-fetch");
require("dotenv").config();

const API_KEY = process.env.SEARCH_API_KEY;

async function test() {
  const url = `https://finnhub.io/api/v1/index/constituents?symbol=%5ENDX&token=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log("NASDAQ-100 Constituents:", data);
}

test();
