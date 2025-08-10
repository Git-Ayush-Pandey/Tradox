import { useContext, useMemo, useState } from "react";
import Menu from "./Menu";
import GeneralContext from "../contexts/GeneralContext";

const TopBar = () => {
  const { openAnalyticsWindow } = useContext(GeneralContext);
  const [showMore, setShowMore] = useState(false);
  const [livePrices] = useState({}); // No fetching, stays empty unless populated externally

  const indices = useMemo(
    () => ({
      NASDAQ100: { name: "NASDAQ-100", symbol: "NDX" },
      DJIA: { name: "Dow Jones Industrial Average", symbol: "DJI" },
      NASDAQ: { name: "NASDAQ Composite", symbol: "IXIC" },
      NYSE: { name: "NYSE Composite", symbol: "NYA" },
    }),
    []
  );

  const IndexBlock = ({ index, onClick }) => {
    return (
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
        <div style={{ display: "flex", gap: "8px", fontSize: "0.8rem" }}></div>
      </div>
    );
  };

  const visibleSymbols = ["DJI", "NDX"];
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
        padding: "10px 20px",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexBasis: "31%",
          maxWidth: "31%",
        }}
      >
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

        <div
          style={{
            flexBasis: "20%",
            maxWidth: "20%",
            display: "flex",
            position: "relative", // so dropdown positions under this container
          }}
        >
          <button
            onClick={() => setShowMore((prev) => !prev)}
            style={{
              border: "1px solid #ccc",
              borderRadius: "4px",
              background: "#f8f8f8",
              cursor: "pointer",
              fontSize: "0.75rem",
              padding: "4px 10px",
              height: "fit-content",
              whiteSpace: "nowrap",
            }}
          >
            {showMore ? "Less ▲" : "More ▼"}
          </button>

          {showMore && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
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

      {/* Right section: Menu */}
      <div style={{ flexBasis: "68%", maxWidth: "68%" }}>
        <Menu />
      </div>
    </div>
  );
};

export default TopBar;
