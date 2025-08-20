import { useContext, useMemo, useState, useEffect } from "react";
import Menu from "./Menu";
import GeneralContext from "../contexts/GeneralContext";

const TopBar = ({ onWatchlistClick }) => {
  const { openAnalyticsWindow } = useContext(GeneralContext);
  const [showMore, setShowMore] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [visibleSymbols, setVisibleSymbols] = useState([]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (windowWidth < 768) {
      setVisibleSymbols([]);
    } else if (windowWidth < 992) {
      setVisibleSymbols(["NDX"]);
    } else {
      setVisibleSymbols(["DJI", "NDX"]);
    }
  }, [windowWidth]);

  const indices = useMemo(
    () => ({
      NASDAQ100: { name: "NASDAQ-100", symbol: "NDX" },
      DJIA: { name: "Dow Jones Industrial Average", symbol: "DJI" },
      NASDAQ: { name: "NASDAQ Composite", symbol: "IXIC" },
      NYSE: { name: "NYSE Composite", symbol: "NYA" },
    }),
    []
  );

  const IndexBlock = ({ index, onClick }) => (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "6px 10px",
        borderRadius: "8px",
        backgroundColor: "#f9fafb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        marginRight: "16px",
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#eef2f7";
        e.currentTarget.style.transform = "scale(1.03)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#f9fafb";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <span style={{ fontSize: "0.88rem", fontWeight: "600", color: "#333" }}>
        {index.name}
      </span>
    </div>
  );

  const moreSymbols = Object.keys(indices).filter(
    (key) => !visibleSymbols.includes(indices[key].symbol)
  );

  return (
    <div
      className="topbar-container"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #e0e0e0",
        backgroundColor: "#fff",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexBasis: "32%",
          maxWidth: "32%",
        }}
      >
        {visibleSymbols.length === 1 ? (
          <div
            style={{
              flexBasis: "40%",
              maxWidth: "40%",
              display: "grid",
              gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
              gap: "10px",
            }}
          >
            {visibleSymbols.map((sym) => {
              const idx = Object.values(indices).find(
                (item) => item.symbol === sym
              );
              return (
                <IndexBlock
                  key={sym}
                  index={idx}
                  onClick={() =>
                    openAnalyticsWindow({
                      name: idx.symbol,
                      symbol: idx.symbol,
                      type: "index",
                    })
                  }
                />
              );
            })}
          </div>
        ) : visibleSymbols.length === 2 ? (
          <div
            style={{
              flexBasis: "80%",
              maxWidth: "80%",
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "10px",
            }}
          >
            {visibleSymbols.map((sym) => {
              const idx = Object.values(indices).find(
                (item) => item.symbol === sym
              );
              return (
                <IndexBlock
                  key={sym}
                  index={idx}
                  onClick={() =>
                    openAnalyticsWindow({
                      name: idx.symbol,
                      symbol: idx.symbol,
                      type: "index",
                    })
                  }
                />
              );
            })}
          </div>
        ) : null}
        <div
          style={{
            justifyContent: "flex-start",
            flexBasis: "20%",
            maxWidth: "20%",
            position: "relative",
          }}
        >
          <button
            className="indexesButton"
            onClick={() => setShowMore((prev) => !prev)}
          >
            {windowWidth < 768
              ? showMore
                ? "Close ▲"
                : "Market Indexes ▼"
              : showMore
              ? "Less ▲"
              : "More ▼"}
          </button>

          {showMore && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                ...(windowWidth < 768 ? { left: 0 } : { right: 0 }),
                marginTop: "5px",
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "6px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                zIndex: 1000,
                minWidth: "180px",
                padding: "8px 0",
              }}
            >
              {moreSymbols.map((key) => {
                const idx = indices[key];
                return (
                  <div
                    key={idx.symbol}
                    onClick={() => {
                      openAnalyticsWindow({
                        name: idx.symbol,
                        symbol: idx.symbol,
                        type: "index",
                      });
                      setShowMore(false);
                    }}
                    style={{
                      padding: "6px 12px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f1f5f9")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {idx.name}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{ flexBasis: "68%", maxWidth: "68%" }}>
        <Menu onWatchlistClick={onWatchlistClick} />
      </div>
    </div>
  );
};

export default TopBar;
