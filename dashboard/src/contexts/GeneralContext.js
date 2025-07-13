import React, { useState, useEffect } from "react";
import axios from "axios";

import BuyActionWindow from "../windows/BuyActionWindow";
import SellActionWindow from "../windows/SellActionWindow";

const GeneralContext = React.createContext({
  user: null,
  loading: true,
  openBuyWindow: (uid) => {},
  closeBuyWindow: () => {},
  openSellWindow: (uid) => {},
  closeSellWindow: () => {},
});

export const GeneralContextProvider = (props) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isBuyWindowOpen, setIsBuyWindowOpen] = useState(false);
  const [selectedStockUID, setSelectedStockUID] = useState(null);
  const [isSellWindowOpen, setIsSellWindowOpen] = useState(false);

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
      }}
    >
      {props.children}
      {isBuyWindowOpen && <BuyActionWindow uid={selectedStockUID} />}
      {isSellWindowOpen && <SellActionWindow uid={selectedStockUID} />}
    </GeneralContext.Provider>
  );
};

export default GeneralContext;
