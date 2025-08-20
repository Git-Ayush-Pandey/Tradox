import { useState, useEffect } from "react";
import Dashboard from "./Dashboard";
import WatchList from "./Watchlist/index";
import { Drawer, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TopBar from "./TopBar";

const Home = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [watchlistOpen, setWatchlistOpen] = useState(false);

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
