import { useState, useEffect, useContext, useMemo, useRef } from "react";
import { fetchHoldings, getQuote } from "../hooks/api";
import GeneralContext from "../contexts/GeneralContext";
import { isMarketOpen } from "../hooks/isMarketOpen";
import { useLivePriceContext } from "../contexts/LivePriceContext";
import InvestmentBarChart from "./ChartJs/InvestmentBarChart";

const enrichHolding = (item, price, basePrice) => {
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

const Holdings = () => {
  const {
    holdings: allHoldings,
    setHoldings: setAllHoldings,
    showAlert,
  } = useContext(GeneralContext);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const generalContext = useContext(GeneralContext);
  const { livePrices, subscribe, unsubscribe, updateSymbols } =
    useLivePriceContext();
  const marketOpen = useMemo(() => isMarketOpen(), []);
  const componentId = useRef(
    "holdings-" + Math.random().toString(36).slice(2)
  ).current;

  useEffect(() => {
    let mounted = true;
    const fetchWithQuotes = async () => {
      try {
        setLoading(true);
        const res = await fetchHoldings();
        const rawHoldings = res.data;

        const priceResults = await Promise.all(
          rawHoldings.map(async (item, idx) => {
            try {
              // small stagger to avoid API burst
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

        const enriched = rawHoldings.map((item) => {
          const pricing = priceResults.find((p) => p.symbol === item.name);
          return enrichHolding(
            item,
            pricing?.price ?? item.avg,
            pricing?.basePrice ?? item.avg
          );
        });

        if (!mounted) return;
        setAllHoldings(enriched);
        setLastUpdate(new Date());

        // subscribe if market open
        if (marketOpen && enriched.length > 0) {
          const symsUpper = [
            ...new Set(enriched.map((i) => i.name.toUpperCase())),
          ];
          // prefer subscribe if available
          if (subscribe) subscribe(componentId, symsUpper);
          if (typeof updateSymbols === "function") updateSymbols(symsUpper);
        }
      } catch (err) {
        console.error("Error fetching holdings:", err);
        showAlert("error", "Failed to fetch holdings.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchWithQuotes();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line
  }, [setAllHoldings]);

  useEffect(() => {
    if (!marketOpen) return;

    setAllHoldings((prev) =>
      prev.map((item) => {
        // try different key shapes to be robust
        const live =
          livePrices[item.name] ??
          livePrices[item.name?.toUpperCase?.()] ??
          livePrices[item.name?.toLowerCase?.()];
        if (!live) return item;
        return enrichHolding(item, live, item.basePrice ?? item.avg);
      })
    );
    setLastUpdate(new Date());
    // eslint-disable-next-line
  }, [livePrices, marketOpen]);

  useEffect(() => {
    if (marketOpen) return;
    if (!allHoldings || allHoldings.length === 0) return;
    let mounted = true;

    const fetchClosedPrices = async () => {
      try {
        const results = await Promise.all(
          allHoldings.map(async (item, idx) => {
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

        setAllHoldings((prev) =>
          prev.map((h) => {
            const updated = results.find((r) => r.symbol === h.name);
            if (!updated) return h;
            // keep existing fields but update price/basePrice and recompute via enrichHolding
            return enrichHolding(h, updated.price, updated.basePrice);
          })
        );
        setLastUpdate(new Date());
      } catch (err) {
        console.error("Closed-market price refresh failed", err);
      }
    };

    // initial closed-market refresh
    fetchClosedPrices();
    const id = setInterval(fetchClosedPrices, 60000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
    // eslint-disable-next-line
  }, [marketOpen, allHoldings, setAllHoldings]);
  useEffect(() => {
    return () => {
      if (unsubscribe) unsubscribe(componentId);
    };
    // eslint-disable-next-line
  }, []);
  const totalInvestment = allHoldings.reduce(
    (acc, stock) => acc + stock.avg * stock.qty,
    0
  );
  const totalCurrentValue = allHoldings.reduce(
    (acc, stock) => acc + stock.price * stock.qty,
    0
  );
  const totalProfitLoss = totalCurrentValue - totalInvestment;
  const totalPLPercent =
    totalInvestment === 0 ? 0 : (totalProfitLoss / totalInvestment) * 100;

  if (loading) return <div>Loading...</div>;

  if (allHoldings.length === 0)
    return (
      <div className="no-orders">
        <div className="icon mt-4">📉</div>
        <p className="mt-5">No open holdings found.</p>
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
        <span>
          {lastUpdate &&
            `Last Updated: ${lastUpdate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}`}
        </span>
      </div>

      <h3 className="title">Holdings ({allHoldings.length})</h3>

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
            {allHoldings.map((stock, index) => {
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
                      <div className="d-flex ms-2">
                        <button
                          className={`btn btn-danger btn-sm me-2 ${
                            hoveredRow === index ? "" : "invisible"
                          }`}
                          onClick={() => generalContext.openSellWindow(stock)}
                        >
                          SELL
                        </button>
                      </div>
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
            ${totalInvestment.toFixed(2)} <br />
            <span>Total investment</span>
          </h5>
        </div>
        <div className="col">
          <h5>
            ${totalCurrentValue.toFixed(2)} <br />
            <span>Current value</span>
          </h5>
        </div>
        <div className="col">
          <h5
            className={totalCurrentValue < totalInvestment ? "loss" : "profit"}
          >
            ${totalProfitLoss.toFixed(2)} ({totalPLPercent.toFixed(2)}%)
            <br />
            <span>P&L</span>
          </h5>
        </div>
      </div>
      <InvestmentBarChart data={allHoldings} title="Holdings Investment" />
    </div>
  );
};

export default Holdings;
