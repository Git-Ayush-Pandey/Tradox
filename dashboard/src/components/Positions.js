import { useState, useEffect, useContext, useMemo } from "react";
import { fetchPositions, getQuote } from "../hooks/api";
import GeneralContext from "../contexts/GeneralContext";
import { isMarketOpen } from "../hooks/isMarketOpen";
import { useLivePriceContext } from "../contexts/LivePriceContext";
import InvestmentBarChart from "./ChartJs/InvestmentBarChart";
// Format number to ₹ currency
const formatCurrency = (val) =>
  Number(val).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });

const enrichPosition = (item, price, basePrice) => {
  const currentValue = price * item.qty;
  const investment = item.avg * item.qty;

  const today = new Date().toISOString().split("T")[0];
  let boughtToday = false;

  if (item.createdAt) {
    const date = new Date(item.createdAt);
    if (!isNaN(date)) {
      const buyDate = date.toISOString().split("T")[0];
      boughtToday = buyDate === today;
    }
  }

  const dayChange = (price - (boughtToday ? item.avg : basePrice)) * item.qty;
  const dayChangePercent =
    ((price - (boughtToday ? item.avg : basePrice)) /
      (boughtToday ? item.avg : basePrice)) *
    100;

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
  const { positions: allPositions, setPositions: setAllPositions, openSellWindow, showAlert } =
    useContext(GeneralContext);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const { livePrices, updateSymbols } = useLivePriceContext();
  const [lastUpdate, setLastUpdate] = useState(null);
  const marketOpen = useMemo(() => isMarketOpen(), []);

  useEffect(() => {
    const loadPositions = async () => {
      try {
        const res = await fetchPositions();
        const raw = res.data;
      
        const quotes = await Promise.all(
          raw.map(async (item) => {
            try {
              await new Promise((r) => setTimeout(r, 100));
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

        setAllPositions(enriched);

        // ✅ Only subscribe if market is open
        if (marketOpen && enriched.length > 0) {
          const uniqueSymbols = [
            ...new Set(enriched.map((s) => s.name.toUpperCase())),
          ];
          updateSymbols(uniqueSymbols);
        }
      } catch (err) {
        console.error("Error loading positions:", err);
        showAlert("error", "Failed to load positions.");
      } finally {
        setLoading(false);
      }
    };

    loadPositions();
    // eslint-disable-next-line
  }, [setAllPositions, updateSymbols, marketOpen]);

  useEffect(() => {
    if (!marketOpen) return;

    setAllPositions((prev) =>
      prev.map((item) => {
        const live = livePrices[item.name];
        if (!live) return item;
        return enrichPosition(item, live, item.basePrice);
      })
    );
  }, [livePrices, setAllPositions, marketOpen]);
  useEffect(() => {
    if (marketOpen) return;
    const interval = setInterval(() => setLastUpdate(new Date()), 60000);
    return () => clearInterval(interval);
  }, [marketOpen]);

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
        <span>
          {lastUpdate &&
            `Last Updated: ${lastUpdate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}`}
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
            {formatCurrency(totalCost)} <br />
            <span>Total cost</span>
          </h5>
        </div>
        <div className="col">
          <h5>
            {formatCurrency(totalPositionValue)} <br />
            <span>Current value</span>
          </h5>
        </div>
        <div className="col">
          <h5 className={totalProfitLoss < 0 ? "loss" : "profit"}>
            {formatCurrency(totalProfitLoss)} ({totalPLPercent.toFixed(2)}%)
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
