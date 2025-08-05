import React, { useState, useEffect } from "react";
import { verifyToken } from "../components/hooks/api";
import BuyActionWindow from "../components/windows/BuyActionWindow";
import SellActionWindow from "../components/windows/SellActionWindow";
import AnalyticsWindow from "../components/windows/AnalyticsWindow";

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
  const [allPositions, setAllPositions] = useState([]);

  const handleOpenBuyWindow = (stock, order = null) => {
    console.log("Opening BuyActionWindow for:", stock);
    setIsBuyWindowOpen(true);
    setSelectedStock(stock);
    setEditOrder(order);
  };

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
        allPositions,
        setAllPositions,
        openBuyWindow: handleOpenBuyWindow,
        closeBuyWindow: handleCloseBuyWindow,
        openSellWindow: handleOpenSellWindow,
        closeSellWindow: handleCloseSellWindow,
        openAnalyticsWindow: handleOpenAnalyticsWindow,
        closeAnalyticsWindow: handleCloseAnalyticsWindow,
        analyticsStock,
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
    </GeneralContext.Provider>
  );
};

export default GeneralContext;
