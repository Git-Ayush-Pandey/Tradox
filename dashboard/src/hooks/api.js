import axios from "axios";
const BASE = "http://localhost:3002";

// AUTHENTICATION ROUTES

export const signup = (payload) =>
  axios.post(`${BASE}/auth/signup`, payload, { withCredentials: true });

export const login = (payload) =>
  axios.post(`${BASE}/auth/login`, payload, { withCredentials: true });

export const logout = () =>
  axios.get(`${BASE}/auth/logout`, { withCredentials: true });

export const verifyToken = () =>
  axios.get(`${BASE}/auth/verify`, { withCredentials: true });

export const getMe = () =>
  axios.get(`${BASE}/auth/me`, { withCredentials: true });

// FUNDS ROUTES

export const FetchFunds = () =>
  axios.get(`${BASE}/funds`, { withCredentials: true });

export const addFunds = (payload) =>
  axios.post(`${BASE}/funds/add`, payload, { withCredentials: true });

export const withdrawFunds = (payload) =>
  axios.post(`${BASE}/funds/withdraw`, payload, { withCredentials: true });

// WATCHLIST ROUTES

export const fetchWatchlists = () =>
  axios.get(`${BASE}/watchlist`, { withCredentials: true });

export const addStock = (payload) =>
  axios.post(`${BASE}/watchlist/add`, payload, { withCredentials: true });

export const deleteStock = (id) =>
  axios.delete(`${BASE}/watchlist/delete/${id}`, { withCredentials: true });
// Add these new exports to your existing api.js
export const createWatchlist = (listName) =>
  axios.post(`${BASE}/watchlist/create`, { listName }, { withCredentials: true });

export const deleteWatchlist = (listName) =>
  axios.delete(`${BASE}/watchlist/delete-list/${encodeURIComponent(listName)}`, { 
    withCredentials: true 
  });

// HOLDINGS ROUTES

export const fetchHoldings = () =>
  axios.get(`${BASE}/holdings`, { withCredentials: true });

export const addHolding = (payload) =>
  axios.post(`${BASE}/holdings/add`, payload, { withCredentials: true });

export const sellHolding = (name, payload) =>
  axios.put(`${BASE}/holdings/sell/${name}`, payload, {
    withCredentials: true,
  });

// POSITIONS ROUTES

export const fetchPositions = () =>
  axios.get(`${BASE}/positions`, { withCredentials: true });

export const addPosition = (payload) =>
  axios.post(`${BASE}/positions/add`, payload, { withCredentials: true });

export const sellPosition = (name, payload) =>
  axios.put(`${BASE}/positions/sell/${name}`, payload, {
    withCredentials: true,
  });

// ORDERS ROUTES

export const FetchOrders = () =>
  axios.get(`${BASE}/orders`, { withCredentials: true });

export const placeOrder = (payload) =>
  axios.post(`${BASE}/orders/new`, payload, { withCredentials: true });

export const deleteOrder = (id) =>
  axios.delete(`${BASE}/orders/delete/${id}`, { withCredentials: true });

export const executeOrder = (id) =>
  axios.post(`${BASE}/orders/execute/${id}`, {}, { withCredentials: true });

export const editOrder = (id, payload) =>
  axios.put(`${BASE}/orders/edit/${id}`, payload, { withCredentials: true });

// STOCK DATA (FINNHUB / ALPHA VANTAGE)

export const searchStocks = (keyword) =>
  axios.get(`${BASE}/stock/search`, {
    params: { keywords: keyword },
    withCredentials: true,
  });

export const getQuote = (symbol) =>
  axios.get(`${BASE}/stock/price`, {
    params: { symbol },
    withCredentials: true,
  });

export const fetchGraphData = (symbol, interval) =>
  axios.get(`${BASE}/stock/graph`, {
    params: { symbol, interval },
    withCredentials: true,
  });

export const fetchOverview = (symbol) =>
  axios.get(`${BASE}/stock/overview`, {
    params: { symbol },
    withCredentials: true,
  });

export const fetchNews = (symbol, from, to) =>
  axios.get(`${BASE}/stock/news`, {
    params: { symbol, from, to },
    withCredentials: true,
  });
