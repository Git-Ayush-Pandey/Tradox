import { useState, useEffect, useContext, useMemo } from "react";
import { fetchHoldings, getQuote } from "../hooks/api";
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

const enrichHolding = (item, price, basePrice) => {
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
  const { livePrices, updateSymbols } = useLivePriceContext();
  const marketOpen = useMemo(() => isMarketOpen(), []);

  useEffect(() => {
    const fetchWithQuotes = async () => {
      try {
        setLoading(true);
        const res = await fetchHoldings();
        const rawHoldings = res.data;

        const priceResults = await Promise.all(
          rawHoldings.map(async (item) => {
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

        const enriched = rawHoldings.map((item) => {
          const pricing = priceResults.find((p) => p.symbol === item.name);
          return enrichHolding(
            item,
            pricing?.price ?? item.avg,
            pricing?.basePrice ?? item.avg
          );
        });

        setAllHoldings(enriched);
        updateSymbols(rawHoldings.map((i) => i.name));
      } catch (err) {
        console.error("Error fetching holdings:", err);
        showAlert("error", "Failed to fetch holdings.");
      } finally {
        setLoading(false);
      }
    };

    fetchWithQuotes();
    // eslint-disable-next-line
  }, [setAllHoldings]);

  useEffect(() => {
    if (!marketOpen) return;

    setAllHoldings((prev) =>
      prev.map((item) => {
        const live = livePrices[item.name];
        if (!live) return item;

        // Preserve basePrice from earlier enrich
        return enrichHolding(item, live, item.basePrice ?? item.avg);
      })
    );
    setLastUpdate(new Date());
    // eslint-disable-next-line
  }, [livePrices, marketOpen]);

  useEffect(() => {
    if (marketOpen) return;
    const interval = setInterval(() => setLastUpdate(new Date()), 60000);
    return () => clearInterval(interval);
  }, [marketOpen]);

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
            {formatCurrency(totalInvestment)} <br />
            <span>Total investment</span>
          </h5>
        </div>
        <div className="col">
          <h5>
            {formatCurrency(totalCurrentValue)} <br />
            <span>Current value</span>
          </h5>
        </div>
        <div className="col">
          <h5
            className={totalCurrentValue < totalInvestment ? "loss" : "profit"}
          >
            {formatCurrency(totalProfitLoss)} ({totalPLPercent.toFixed(2)}%)
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
