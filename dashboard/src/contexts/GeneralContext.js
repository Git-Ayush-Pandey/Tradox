import { useState, useEffect, useCallback, createContext, useRef } from "react";
import {
  verifyToken,
  fetchHoldings,
  fetchPositions,
  getQuote,
  FetchFunds,
  executeOrder,
  FetchOrders,
  updateRealisedPnL,
} from "../hooks/api";
import { useLivePriceContext } from "./LivePriceContext";
import { isMarketOpen } from "../hooks/isMarketOpen";
import Alert from "../components/windows/alert";

const GeneralContext = createContext();

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

  const dayChange = (price - refPrice) * item.qty;
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

export const GeneralContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [isBuyWindowOpen, setIsBuyWindowOpen] = useState(false);
  const [isSellWindowOpen, setIsSellWindowOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [analyticsStock, setAnalyticsStock] = useState(null);
  const [alert, setAlert] = useState(null);

  const [holdings, setHoldings] = useState([]);
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [funds, setFunds] = useState(null);

  const { livePrices } = useLivePriceContext();
  const executingRef = useRef(new Set());

  const openBuyWindow = (stock, order = null) => {
    setIsBuyWindowOpen(true);
    setSelectedStock(stock);
    setEditOrder(order);
  };
  const closeBuyWindow = () => {
    setIsBuyWindowOpen(false);
    setSelectedStock(null);
    setEditOrder(null);
  };
  const openSellWindow = (stock, order = null) => {
    setIsSellWindowOpen(true);
    setSelectedStock(stock);
    setEditOrder(order);
  };
  const closeSellWindow = () => {
    setIsSellWindowOpen(false);
    setSelectedStock(null);
    setEditOrder(null);
  };
  const openAnalyticsWindow = (stock) => {
    setAnalyticsStock(stock);
    setIsAnalyticsOpen(true);
  };
  const closeAnalyticsWindow = () => {
    setAnalyticsStock(null);
    setIsAnalyticsOpen(false);
  };

  const showAlert = useCallback((type, message, duration = 3000) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), duration);
  }, []);

  const fetchHoldingsWithQuotes = async () => {
    const res = await fetchHoldings();
    const raw = res.data || [];
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
    const raw = res.data || [];
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
      setFunds(res.data);
    } catch (err) {
      console.error("Failed to refresh Funds:", err);
      setFunds({ availableMargin: 0 });
    }
  };

  const fetchOrder = async () => {
    try {
      const res = await FetchOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error("Failed to refresh Orders:", err);
    }
  };

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

  const refreshOrders = async () => {
    await fetchOrder();
  };

  const refreshFunds = async () => {
    await fetchFund();
  };

  const refreshAll = async () => {
    try {
      await Promise.all([refreshData(), fetchFund(), fetchOrder()]);
    } catch (err) {
      console.error("Portfolio refresh failed:", err);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  useEffect(() => {
    if (!isMarketOpen()) return;

    const executeMatchingOrders = async () => {
      let executedAny = false;
      for (const order of orders) {
        if (
          order.executed ||
          order.cancelled ||
          executingRef.current.has(order._id)
        )
          continue;

        const price =
          livePrices[order.name] ??
          livePrices[order.name?.toUpperCase?.()] ??
          livePrices[order.name?.toLowerCase?.()];
        if (!price) continue;

        const match =
          (order.mode === "BUY" && price <= order.price) ||
          (order.mode === "SELL" && price >= order.price);

        if (!match) continue;

        executingRef.current.add(order._id);
        try {
          const res = await executeOrder(order._id);
          setOrders((prev) =>
            prev.map((o) => (o._id === order._id ? res.data.order : o))
          );
          if (order.mode === "SELL") {
            let buyPrice = null;

            if (order.type === "Delivery") {
              const holding = holdings.find((h) => h.name === order.name);
              if (holding) {
                buyPrice = holding.avg;
              }
            } else {
              const position = positions.find((p) => p.name === order.name);
              if (position) {
                buyPrice = position.avg;
              }
            }

            if (buyPrice !== null) {
              const realizedDelta = (order.price - buyPrice) * order.qty;
              updateRealisedPnL(realizedDelta);
            } else {
              console.warn(
                `No matching holding/position found for ${order.name}`
              );
            }
          }
          executedAny = true;
          showAlert("success", `Order for ${order.name} executed.`);
        } catch (err) {
          console.error(`Failed to execute order ${order._id}`, err);
          showAlert("error", `Failed to execute order for ${order.name}.`);
        } finally {
          executingRef.current.delete(order._id);
        }
      }
      if (executedAny) {
        await refreshFunds();
        await refreshData();
        await refreshOrders();
      }
    };

    executeMatchingOrders();
    // eslint-disable-next-line
  }, [livePrices, orders, showAlert]);

  useEffect(() => {
    setLoading(true);
    verifyToken()
      .then((res) => {
        if (res.data.status) {
          setUser(res.data.safeUser);
          refreshAll();
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, []);

  return (
    <GeneralContext.Provider
      value={{
        user,
        setUser,
        loading,

        holdings,
        setHoldings,
        positions,
        setPositions,
        orders,
        setOrders,
        funds,
        setFunds,

        refreshData,
        refreshOrders,
        refreshFunds,
        refreshAll,

        openBuyWindow,
        closeBuyWindow,
        openSellWindow,
        closeSellWindow,
        openAnalyticsWindow,
        closeAnalyticsWindow,

        isBuyWindowOpen,
        isSellWindowOpen,
        isAnalyticsOpen,

        selectedStock,
        editOrder,
        analyticsStock,

        alert,
        showAlert,
      }}
    >
      {children}
      {alert && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999 }}>
          <Alert type={alert.type} message={alert.message} />
        </div>
      )}
    </GeneralContext.Provider>
  );
};

export default GeneralContext;
