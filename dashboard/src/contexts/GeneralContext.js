import React, { useState, useEffect, useCallback } from "react";
import {
  verifyToken,
  fetchHoldings,
  fetchPositions,
  getQuote,
  FetchFunds,
} from "../hooks/api";
import BuyActionWindow from "../components/windows/BuyActionWindow";
import SellActionWindow from "../components/windows/SellActionWindow";
import AnalyticsWindow from "../components/windows/AnalyticsWindow";
import Alert from "../components/windows/alert";
import { isMarketOpen } from "../hooks/isMarketOpen";

const GeneralContext = React.createContext({
  user: null,
  holdings: [],
  setHoldings: () => {},
  positions: [],
  setPositions: () => {},
  loading: true,
  openBuyWindow: () => {},
  closeBuyWindow: () => {},
  openSellWindow: () => {},
  closeSellWindow: () => {},
  openAnalyticsWindow: () => {},
  closeAnalyticsWindow: () => {},
  analyticsStock: null,
});

export const enrichHoldingsandPositions = (item, price, basePrice) => {
  const currentValue = price * item.qty;
  const investment = item.avg * item.qty;

  const boughtDate = new Date(item.boughtday);
  const today = new Date();
  const boughtToday =
    boughtDate.getFullYear() === today.getFullYear() &&
    boughtDate.getMonth() === today.getMonth() &&
    boughtDate.getDate() === today.getDate();

  let refPrice = boughtToday ? item.avg : basePrice;
  if (!isMarketOpen() && boughtToday) {
    refPrice = item.avg;
  }
  console.log(item.avg, basePrice, price);
  let dayChange = (price - refPrice) * item.qty;
  const dayChangePercent = ((price - refPrice) / refPrice) * 100;
  const totalChange = price - item.avg;
  const totalChangePercent = (totalChange / item.avg) * 100;

  return {
    ...item,
    price,
    basePrice,
    boughtToday,
    dayChange,
    dayChangePercent,
    totalChange,
    totalChangePercent,
    isLoss: currentValue < investment,
  };
};

export const GeneralContextProvider = (props) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isBuyWindowOpen, setIsBuyWindowOpen] = useState(false);
  const [isSellWindowOpen, setIsSellWindowOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [analyticsStock, setAnalyticsStock] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [positions, setPositions] = useState([]);
  const [alert, setAlert] = useState(null);
  const [orders, setOrders] = useState([]);
  const [funds, setFunds] = useState(null);

  const handleOpenBuyWindow = (stock, order = null) => {
    setIsBuyWindowOpen(true);
    setSelectedStock(stock);
    setEditOrder(order);
  };

  const showAlert = useCallback((type, message, duration = 3000) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), duration);
  }, []);

  const handleCloseBuyWindow = () => {
    setIsBuyWindowOpen(false);
    setSelectedStock(null);
    setEditOrder(null);
  };

  const handleOpenSellWindow = (stock, order = null) => {
    setIsSellWindowOpen(true);
    setSelectedStock(stock);
    setEditOrder(order);
  };

  const handleCloseSellWindow = () => {
    setIsSellWindowOpen(false);
    setSelectedStock(null);
    setEditOrder(null);
  };

  const handleOpenAnalyticsWindow = (stock) => {
    setAnalyticsStock(stock);
    setIsAnalyticsOpen(true);
  };

  const handleCloseAnalyticsWindow = () => {
    setAnalyticsStock(null);
    setIsAnalyticsOpen(false);
  };

  const fetchHoldingsWithQuotes = async () => {
    const res = await fetchHoldings();
    const raw = res.data;
    const priceResults = await Promise.all(
      raw.map(async (item, idx) => {
        await new Promise((r) => setTimeout(r, idx * 80));
        try {
          const quote = await getQuote(item.name);
          return {
            symbol: item.name,
            price: quote.data?.c ?? item.avg,
            basePrice: quote.data?.pc ?? item.avg,
          };
        } catch {
          return { symbol: item.name, price: item.avg, basePrice: item.avg };
        }
      })
    );
    return raw.map((item) => {
      const pricing = priceResults.find((p) => p.symbol === item.name);
      return enrichHoldingsandPositions(
        item,
        pricing?.price ?? item.avg,
        pricing?.basePrice ?? item.avg
      );
    });
  };

  const fetchPositionsWithQuotes = async () => {
    const res = await fetchPositions();
    const raw = res.data;
    const quotes = await Promise.all(
      raw.map(async (item, idx) => {
        await new Promise((r) => setTimeout(r, idx * 80));
        try {
          const quote = await getQuote(item.name);
          return {
            symbol: item.name,
            price: quote.data?.c ?? item.avg,
            basePrice: quote.data?.pc ?? item.avg,
          };
        } catch {
          return { symbol: item.name, price: item.avg, basePrice: item.avg };
        }
      })
    );
    return raw.map((item) => {
      const match = quotes.find((q) => q.symbol === item.name);
      return enrichHoldingsandPositions(
        item,
        match?.price ?? item.avg,
        match?.basePrice ?? item.avg
      );
    });
  };
  const fetchFund = async () => {
    try {
      const res = await FetchFunds();
      setFunds(res.data); // save the actual funds object
    } catch (err) {
      console.error("Failed to refresh Funds:", err);
      setFunds({ availableMargin: 0 }); // fallback
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const [holdingsEnriched, positionsEnriched] = await Promise.all([
        fetchHoldingsWithQuotes(),
        fetchPositionsWithQuotes(),
      ]);
      setHoldings(holdingsEnriched || []);
      setPositions(positionsEnriched || []);
    } catch (error) {
      console.error("Failed to fetch holdings or positions", error);
    }
  }, []);

  const refreshData = async () => {
    try {
      const [holdingsEnriched, positionsEnriched] = await Promise.all([
        fetchHoldingsWithQuotes(),
        fetchPositionsWithQuotes(),
      ]);
      setHoldings(holdingsEnriched || []);
      setPositions(positionsEnriched || []);
    } catch (error) {
      console.error("Failed to fetch holdings or positions", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    verifyToken()
      .then((res) => {
        if (res.data.status) {
          setUser(res.data.safeUser);
          fetchData();
          fetchFund();
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [fetchData]);

  const refreshFunds = async () => {
    await fetchFund();
  };
  const refreshAll = async () => {
    try {
      await Promise.all([fetchData(), fetchFund()]);
    } catch (err) {
      console.error("Portfolio refresh failed:", err);
    }
  };

  return (
    <GeneralContext.Provider
      value={{
        user,
        refreshAll,
        refreshFunds,
        setUser,
        loading,
        holdings,
        setHoldings,
        positions,
        setPositions,
        funds,
        refreshData,
        fetchFund,
        setFunds,
        openBuyWindow: handleOpenBuyWindow,
        closeBuyWindow: handleCloseBuyWindow,
        openSellWindow: handleOpenSellWindow,
        closeSellWindow: handleCloseSellWindow,
        openAnalyticsWindow: handleOpenAnalyticsWindow,
        closeAnalyticsWindow: handleCloseAnalyticsWindow,
        analyticsStock,
        alert,
        showAlert,
        orders,
        setOrders,
      }}
    >
      {props.children}
      {isBuyWindowOpen && (
        <BuyActionWindow uid={selectedStock} existingOrder={editOrder} />
      )}
      {isSellWindowOpen && (
        <SellActionWindow uid={selectedStock} existingOrder={editOrder} />
      )}
      {isAnalyticsOpen && (
        <AnalyticsWindow
          stock={analyticsStock}
          onClose={handleCloseAnalyticsWindow}
        />
      )}
      {alert && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999 }}>
          <Alert type={alert.type} message={alert.message} />
        </div>
      )}
    </GeneralContext.Provider>
  );
};

export default GeneralContext;
