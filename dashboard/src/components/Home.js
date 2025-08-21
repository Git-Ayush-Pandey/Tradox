import React, { useState, useEffect, useContext } from "react";
import Dashboard from "./Dashboard";
import WatchList from "./Watchlist/index";
import { Drawer, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TopBar from "./TopBar";
import GeneralContext from "../contexts/GeneralContext";
import BuyActionWindow from "../components/windows/BuyActionWindow";
import SellActionWindow from "../components/windows/SellActionWindow";
import AnalyticsWindow from "../components/windows/AnalyticsWindow";

const Home = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [watchlistOpen, setWatchlistOpen] = useState(false);

  const {
    isBuyWindowOpen,
    isSellWindowOpen,
    isAnalyticsOpen,
    selectedStock,
    editOrder,
    analyticsStock,
    closeBuyWindow,
    closeSellWindow,
    closeAnalyticsWindow,
  } = useContext(GeneralContext);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <TopBar onWatchlistClick={() => setWatchlistOpen(true)} />

      <div className="dashboard-container">
        {!isMobile && (
          <div className="watchlist-container">
            <WatchList />
          </div>
        )}

        <div className="content" style={{ position: "relative" }}>
          <Dashboard />

          {/* Windows rendered on top of Dashboard */}
          {isBuyWindowOpen && (
            <BuyActionWindow
              uid={selectedStock}
              existingOrder={editOrder}
              onClose={closeBuyWindow}
            />
          )}

          {isSellWindowOpen && (
            <SellActionWindow
              uid={selectedStock}
              existingOrder={editOrder}
              onClose={closeSellWindow}
            />
          )}

          {isAnalyticsOpen && (
            <AnalyticsWindow
              stock={analyticsStock}
              onClose={closeAnalyticsWindow}
            />
          )}
        </div>
      </div>

      {isMobile && (
        <Drawer
          anchor="left"
          open={watchlistOpen}
          onClose={() => setWatchlistOpen(false)}
          PaperProps={{
            className: "watchlist-drawer",
            sx: {
              width: "100%",
              maxWidth: 450,
              height: "100vh",
              display: "flex",
            },
          }}
        >
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 2,
              display: "flex",
              justifyContent: "flex-end",
              padding: 8,
              background: "#fff",
              borderBottom: "1px solid #e5e5e5",
            }}
          >
            <IconButton
              onClick={() => setWatchlistOpen(false)}
              aria-label="Close watchlist"
            >
              <CloseIcon />
            </IconButton>
          </div>

          <div style={{ flex: 1, minHeight: 0 }}>
            <WatchList />
          </div>
        </Drawer>
      )}
    </>
  );
};

export default Home;
