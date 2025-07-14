import React, { useState, useEffect } from "react";
import axios from "axios";

import BuyActionWindow from "../windows/BuyActionWindow";
import SellActionWindow from "../windows/SellActionWindow";
import AnalyticsWindow from "../windows/AnalyticsWindow";

const GeneralContext = React.createContext({
  user: null,
  loading: true,
  openBuyWindow: (uid) => {},
  closeBuyWindow: () => {},
  openSellWindow: (uid) => {},
  closeSellWindow: () => {},
  openAnalyticsWindow: (stock) => {},
  closeAnalyticsWindow: () => {},
  analyticsStock: null,
});

export const GeneralContextProvider = (props) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBuyWindowOpen, setIsBuyWindowOpen] = useState(false);
  const [selectedStockUID, setSelectedStockUID] = useState(null);
  const [isSellWindowOpen, setIsSellWindowOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [analyticsStock, setAnalyticsStock] = useState(null);

  const handleOpenBuyWindow = (uid) => {
    setIsBuyWindowOpen(true);
    setSelectedStockUID(uid);
  };

  const handleCloseBuyWindow = () => {
    setIsBuyWindowOpen(false);
    setSelectedStockUID("");
  };

  const handleOpenSellWindow = (uid) => {
    console.log("Opening SellActionWindow for:", uid);
    setIsSellWindowOpen(true);
    setSelectedStockUID(uid);
  };

  const handleCloseSellWindow = () => {
    setIsSellWindowOpen(false);
    setSelectedStockUID("");
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

  // ✅ Fetch logged-in user on load
  useEffect(() => {
    axios
      .get("http://localhost:3002/auth/verify", { withCredentials: true })
      .then((res) => {
        if (res.data.status) {
          setUser(res.data.safeUser); // { id, name, email, phone }
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <GeneralContext.Provider
      value={{
        user,
        loading,
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
      {isBuyWindowOpen && <BuyActionWindow uid={selectedStockUID} />}
      {isSellWindowOpen && <SellActionWindow uid={selectedStockUID} />}
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
