import React, { useState, useEffect, useCallback } from "react";
import { verifyToken, fetchHoldings, fetchPositions } from "../hooks/api";
import BuyActionWindow from "../components/windows/BuyActionWindow";
import SellActionWindow from "../components/windows/SellActionWindow";
import AnalyticsWindow from "../components/windows/AnalyticsWindow";
import Alert from "../components/windows/alert";

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

  const handleOpenBuyWindow = (stock, order = null) => {
    console.log("Opening BuyActionWindow for:", stock);
    setIsBuyWindowOpen(true);
    setSelectedStock(stock);
    setEditOrder(order);
  };
  const showAlert = useCallback((type, message, duration = 3000) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), duration);
  },[])

  const handleCloseBuyWindow = () => {
    setIsBuyWindowOpen(false);
    setSelectedStock(null);
    setEditOrder(null);
  };

  const handleOpenSellWindow = (stock, order = null) => {
    console.log("Opening SellActionWindow for:", stock);
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
    console.log("Opening analytics for:", stock);
    setAnalyticsStock(stock);
    setIsAnalyticsOpen(true);
  };

  const handleCloseAnalyticsWindow = () => {
    setAnalyticsStock(null);
    setIsAnalyticsOpen(false);
  };
  const fetchData = useCallback(async () => {
    try {
      const [holdingsRes, positionsRes] = await Promise.all([
        fetchHoldings(),
        fetchPositions(),
      ]);
      setHoldings(holdingsRes.data.holdings || []);
      setPositions(positionsRes.data.positions || []);
    } catch (error) {
      console.error("Failed to fetch holdings or positions", error);
    }
  }, []); 
  useEffect(() => {
    setLoading(true);
    verifyToken()
      .then((res) => {
        if (res.data.status) {
          setUser(res.data.safeUser);
          // If user is verified, fetch their data
          fetchData();
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [fetchData]);

  useEffect(() => {
    verifyToken()
      .then((res) => {
        if (res.data.status) setUser(res.data.safeUser);
        else setUser(null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);
  return (
    <GeneralContext.Provider
      value={{
        user,
        loading,
        holdings,
        setHoldings,
        positions,
        setPositions,
        openBuyWindow: handleOpenBuyWindow,
        closeBuyWindow: handleCloseBuyWindow,
        openSellWindow: handleOpenSellWindow,
        closeSellWindow: handleCloseSellWindow,
        openAnalyticsWindow: handleOpenAnalyticsWindow,
        closeAnalyticsWindow: handleCloseAnalyticsWindow,
        analyticsStock,
        alert,
        showAlert,
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
