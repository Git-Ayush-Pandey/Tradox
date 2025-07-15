import axios from "axios";

const BASE = "http://localhost:3002";

// Get all watchlists
export const fetchWatchlists = () => axios.get(`${BASE}/watchlist`, { withCredentials: true });

// Search stocks using Finnhub
export const searchStocks = (keyword) =>
  axios.get(`${BASE}/stock/search?keywords=${keyword}`, { withCredentials: true });

// Get live quote from Finnhub
export const getQuote = (symbol) =>
  axios.get(`${BASE}/stock/livePrice?symbol=${symbol}`, { withCredentials: true });

// Add stock to a watchlist
export const addStock = (payload) =>
  axios.post(`${BASE}/watchlist/add`, payload, { withCredentials: true });

// Delete stock from a watchlist
export const deleteStock = (id) =>
  axios.delete(`${BASE}/watchlist/delete/${id}`, { withCredentials: true });
