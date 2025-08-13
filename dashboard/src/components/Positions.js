import { useState, useEffect, useContext, useMemo, useRef } from "react";
import { fetchPositions, getQuote } from "../hooks/api";
import GeneralContext from "../contexts/GeneralContext";
import { isMarketOpen } from "../hooks/isMarketOpen";
import { useLivePriceContext } from "../contexts/LivePriceContext";
import InvestmentBarChart from "./ChartJs/InvestmentBarChart";

const enrichPosition = (item, price, basePrice) => {
  const currentValue = price * item.qty;
  const investment = item.avg * item.qty;

  const boughtDate = new Date(item.boughtday);
  const today = new Date();
  const boughtToday =
    boughtDate.getFullYear() === today.getFullYear() &&
    boughtDate.getMonth() === today.getMonth() &&
    boughtDate.getDate() === today.getDate();

  let refPrice = boughtToday ? item.avg : basePrice;

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

const Positions = () => {
  const {
    positions: allPositions,
    setPositions: setAllPositions,
    openSellWindow,
    showAlert,
  } = useContext(GeneralContext);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const { livePrices, subscribe, unsubscribe, updateSymbols } =
    useLivePriceContext();
  const marketOpen = useMemo(() => isMarketOpen(), []);
  const componentId = useRef(
    "positions-" + Math.random().toString(36).slice(2)
  ).current;

  // initial load + enrich with getQuote
  useEffect(() => {
    let mounted = true;
    const loadPositions = async () => {
      try {
        setLoading(true);
        const res = await fetchPositions();
        const raw = res.data;

        const quotes = await Promise.all(
          raw.map(async (item, idx) => {
            try {
              await new Promise((r) => setTimeout(r, idx * 80));
              const quote = await getQuote(item.name);
              return {
                symbol: item.name,
                price: quote.data?.c ?? item.avg,
                basePrice: quote.data?.pc ?? item.avg,
              };
            } catch {
              return {
                symbol: item.name,
                price: item.avg,
                basePrice: item.avg,
              };
            }
          })
        );

        const enriched = raw.map((item) => {
          const match = quotes.find((q) => q.symbol === item.name);
          return enrichPosition(
            { ...item, prevPrice: match?.basePrice },
            match?.price,
            match?.basePrice
          );
        });

        if (!mounted) return;
        setAllPositions(enriched);

        // subscribe if market is open
        if (marketOpen && enriched.length > 0) {
          const uniqueSymbols = [
            ...new Set(enriched.map((s) => s.name.toUpperCase())),
          ];
          if (subscribe) subscribe(componentId, uniqueSymbols);
          if (typeof updateSymbols === "function") updateSymbols(uniqueSymbols);
        }
      } catch (err) {
        console.error("Error loading positions:", err);
        showAlert("error", "Failed to load positions.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadPositions();
    // eslint-disable-next-line
  }, [subscribe, updateSymbols, marketOpen]);

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
        return enrichPosition(item, live, item.basePrice);
      })
    );
    // eslint-disable-next-line
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
            return enrichPosition(p, upd.price, upd.basePrice);
          })
        );
      } catch (err) {
        console.error("Closed-market positions price refresh failed", err);
      }
    };

    fetchClosedPrices();
    const id = setInterval(fetchClosedPrices, 60000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
    // eslint-disable-next-line
  }, [marketOpen]);

  // cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (unsubscribe) unsubscribe(componentId);
    };
    // eslint-disable-next-line
  }, []);

  const totalPositionValue = allPositions.reduce(
    (acc, stock) => acc + stock.price * stock.qty,
    0
  );
  const totalCost = allPositions.reduce(
    (acc, stock) => acc + stock.avg * stock.qty,
    0
  );
  const totalProfitLoss = totalPositionValue - totalCost;
  const totalPLPercent =
    totalCost === 0 ? 0 : (totalProfitLoss / totalCost) * 100;

  if (loading) return <div>Loading...</div>;

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
            <span style={{ color: "#4caf50" }}>
              🟢 Market Open - Live Prices
            </span>
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
                        className={`btn btn-danger btn-sm ms-2 ${
                          hoveredRow === index ? "" : "invisible"
                        }`}
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
                    {stock.dayChange.toFixed(2)} (
                    {stock.dayChangePercent >= 0 ? "+" : ""}
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
