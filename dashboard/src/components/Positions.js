import { useState, useEffect, useContext, useMemo, useRef } from "react";
import { getQuote } from "../hooks/api";
import GeneralContext, { enrichHoldingsandPositions } from "../contexts/GeneralContext";
import { isMarketOpen } from "../hooks/isMarketOpen";
import { useLivePriceContext } from "../contexts/LivePriceContext";
import InvestmentBarChart from "./ChartJs/InvestmentBarChart";

const Positions = () => {
  const {
    positions: allPositions,
    setPositions: setAllPositions,
    openSellWindow,
    showAlert,
    loading: appLoading,
  } = useContext(GeneralContext);

  const [hoveredRow, setHoveredRow] = useState(null);
  const { livePrices, subscribe, unsubscribe } = useLivePriceContext();
  const marketOpen = useMemo(() => isMarketOpen(), []);
  const componentId = useRef("positions-" + Math.random().toString(36).slice(2)).current;

  // Subscribe to live prices when market is open and we have positions
  useEffect(() => {
    if (!marketOpen || !allPositions || allPositions.length === 0) return;
    const uniqueSymbols = [...new Set(allPositions.map((s) => s.name.toUpperCase()))];
    subscribe?.(componentId, uniqueSymbols);
    return () => {
      unsubscribe?.(componentId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketOpen, allPositions]);

  // live price updates when market open
  useEffect(() => {
    if (!marketOpen) return;

    setAllPositions((prev) =>
      prev.map((item) => {
        const live =
          livePrices[item.name] ??
          livePrices[item.name?.toUpperCase?.()] ??
          livePrices[item.name?.toLowerCase?.()];
        if (!live) return item;
        return enrichHoldingsandPositions(item, live, item.basePrice);
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [livePrices, marketOpen]);

  // closed market polling
  useEffect(() => {
    if (marketOpen) return;
    if (!allPositions || allPositions.length === 0) return;

    let mounted = true;
    const fetchClosedPrices = async () => {
      try {
        const results = await Promise.all(
          allPositions.map(async (item, idx) => {
            try {
              await new Promise((r) => setTimeout(r, idx * 80));
              const quote = await getQuote(item.name);
              return {
                symbol: item.name,
                price: quote.data?.c ?? item.price ?? item.avg,
                basePrice: quote.data?.pc ?? item.basePrice ?? item.avg,
              };
            } catch {
              return {
                symbol: item.name,
                price: item.price ?? item.avg,
                basePrice: item.basePrice ?? item.avg,
              };
            }
          })
        );

        if (!mounted) return;

        setAllPositions((prev) =>
          prev.map((p) => {
            const upd = results.find((r) => r.symbol === p.name);
            if (!upd) return p;
            return enrichHoldingsandPositions(p, upd.price, upd.basePrice);
          })
        );
      } catch (err) {
        console.error("Closed-market positions price refresh failed", err);
        showAlert("error", "Failed to refresh prices.");
      }
    };

    fetchClosedPrices();
    const id = setInterval(fetchClosedPrices, 60000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketOpen]);

  const totalPositionValue = allPositions.reduce((acc, s) => acc + s.price * s.qty, 0);
  const totalCost = allPositions.reduce((acc, s) => acc + s.avg * s.qty, 0);
  const totalProfitLoss = totalPositionValue - totalCost;
  const totalPLPercent = totalCost === 0 ? 0 : (totalProfitLoss / totalCost) * 100;

  if (appLoading) return <div>Loading...</div>;

  if (allPositions.length === 0)
    return (
      <div className="no-orders">
        <div className="icon mt-4">📉</div>
        <p className="mt-5">No open positions found.</p>
      </div>
    );

  return (
    <div className="orders">
      <div className="market-status">
        <span>
          {marketOpen ? (
            <span style={{ color: "#4caf50" }}>🟢 Market Open - Live Prices</span>
          ) : (
            <span>⚫ Market Closed - Latest Prices</span>
          )}
        </span>
      </div>
      <h3 className="title">Positions ({allPositions.length})</h3>
      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg. cost</th>
              <th>LTP</th>
              <th>Cur. val</th>
              <th>P&L</th>
              <th>Day chg.</th>
            </tr>
          </thead>
          <tbody>
            {allPositions.map((stock, index) => {
              const currentValue = stock.price * stock.qty;
              return (
                <tr
                  key={index}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="align-left">
                    <div
                      className="d-flex align-items-center justify-content-between"
                      style={{ minWidth: "120px" }}
                    >
                      <span>{stock.name}</span>
                      <button
                        className={`btn btn-danger btn-sm ms-2 ${hoveredRow === index ? "" : "invisible"}`}
                        onClick={() =>
                          openSellWindow({
                            id: stock._id,
                            name: stock.name,
                          })
                        }
                      >
                        SELL
                      </button>
                    </div>
                  </td>

                  <td>{stock.qty}</td>
                  <td>{stock.avg.toFixed(2)}</td>
                  <td>
                    {stock.price.toFixed(2)}
                    {marketOpen && <span className="live-dot">●</span>}
                  </td>
                  <td>{currentValue.toFixed(2)}</td>
                  <td className={stock.isLoss ? "loss" : "profit"}>
                    {(currentValue - stock.avg * stock.qty).toFixed(2)}
                  </td>
                  <td className={stock.dayChange < 0 ? "loss" : "profit"}>
                    {stock.dayChange >= 0 ? "+" : ""}
                    {stock.dayChange.toFixed(2)} ({stock.dayChangePercent >= 0 ? "+" : ""}
                    {stock.dayChangePercent.toFixed(2)}%)
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="row mt-5">
        <div className="col">
          <h5>
            ${totalCost.toFixed(2)} <br />
            <span>Total cost</span>
          </h5>
        </div>
        <div className="col">
          <h5>
            ${totalPositionValue.toFixed(2)} <br />
            <span>Current value</span>
          </h5>
        </div>
        <div className="col">
          <h5 className={totalProfitLoss < 0 ? "loss" : "profit"}>
            ${totalProfitLoss.toFixed(2)} ({totalPLPercent.toFixed(2)}%)
            <br />
            <span>P&L</span>
          </h5>
        </div>
      </div>
      <InvestmentBarChart data={allPositions} title="Positions Investment" />
    </div>
  );
};

export default Positions;
