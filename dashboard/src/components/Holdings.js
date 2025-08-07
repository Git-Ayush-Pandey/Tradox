import { useState, useEffect, useContext, useMemo } from "react";
import { fetchHoldings, getQuote } from "../hooks/api";
import GeneralContext from "../contexts/GeneralContext";
import { isMarketOpen } from "../hooks/isMarketOpen";
import { useLivePriceContext } from "../contexts/LivePriceContext";

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
  const change = price - basePrice;
  const percent = basePrice ? (change / basePrice) * 100 : 0;
  return {
    ...item,
    price,
    basePrice,
    day: price - item.avg,
    change,
    percent,
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
        if (rawHoldings.length === 0) {
          showAlert("warning", "You don't have any holdings yet.");
        }

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
        return enrichHolding(item, live, item.basePrice);
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

  useEffect(() => {
    if (!loading && allHoldings.length > 0 && totalProfitLoss < -1000) {
      showAlert(
        "error",
        "Your holdings are in a significant loss. Please evaluate your positions."
      );
    }
  }, [loading, allHoldings.length, totalProfitLoss, showAlert]);
  if (loading) return <div>Loading...</div>;

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
          {lastUpdate && `Last Updated: ${lastUpdate.toLocaleTimeString()}`}
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

                  <td className={stock.change < 0 ? "loss" : "profit"}>
                    {stock.change >= 0 ? "+" : ""}
                    {(currentValue - stock.avg * stock.qty).toFixed(2)} (
                    {stock.percent >= 0 ? "+" : ""}
                    {stock.percent.toFixed(2)}%)
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="row">
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
    </div>
  );
};

export default Holdings;
