import { useState, useEffect, useContext } from "react";
import { fetchHoldings, getQuote } from "./hooks/api";
import { VerticalGraph } from "./ChartJs/VerticalGraph";
import GeneralContext from "../contexts/GeneralContext";
import { isMarketOpen } from "./hooks/isMarketOpen";
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
  const percent = basePrice ? ((change / basePrice) * 100).toFixed(2) : "0.00";
  return {
    ...item,
    price,
    basePrice,
    change: change.toFixed(2),
    percent,
    isLoss: currentValue < investment,
  };
};

const Holdings = () => {
  const { holdings: allHoldings, setHoldings: setAllHoldings } = useContext(GeneralContext);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const generalContext = useContext(GeneralContext);
  const { livePrices, updateSymbols } = useLivePriceContext();

  // Fetch holdings and quote prices on mount
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
          return enrichHolding(item, pricing?.price ?? item.avg, pricing?.basePrice ?? item.avg);
        });

        setAllHoldings(enriched);
        updateSymbols(rawHoldings.map((i) => i.name));
      } catch (err) {
        console.error("Error fetching holdings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWithQuotes();
  }, [setAllHoldings, updateSymbols]);

  // Apply live prices on top during market hours
  useEffect(() => {
    if (!isMarketOpen() || !livePrices || allHoldings.length === 0) return;

    const updated = allHoldings.map((item) => {
      const live = livePrices[item.name];
      if (!live) return item;
      return enrichHolding(item, live, item.basePrice);
    });

    setAllHoldings(updated);
    setLastUpdate(new Date());
  }, [livePrices, allHoldings, setAllHoldings]);

  // Periodic refresh (optional, if market is closed)
  useEffect(() => {
    if (isMarketOpen()) return;

    const interval = setInterval(() => setLastUpdate(new Date()), 60000);
    return () => clearInterval(interval);
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

  const labels = allHoldings.map((stock) => stock.name);
  const data = {
    labels,
    datasets: [
      {
        label: "Stock Price",
        data: allHoldings.map((stock) => stock.price),
        backgroundColor: allHoldings.map(
          () =>
            `rgba(${Math.floor(Math.random() * 255)},${Math.floor(
              Math.random() * 255
            )},${Math.floor(Math.random() * 255)},0.5)`
        ),
      },
    ],
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="orders">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '15px',
        fontSize: '12px',
        color: '#666'
      }}>
        <span>
          {isMarketOpen() ? (
            <span style={{ color: '#4caf50' }}>🟢 Market Open - Live Prices</span>
          ) : (
            <span style={{ color: '#666' }}>⚫ Market Closed - Latest Prices</span>
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
              <th>Net chg.</th>
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
                    {stock.name}
                    {hoveredRow === index && (
                      <span className="actions">
                        <button
                          className="btn sell"
                          onClick={() =>
                            generalContext.openSellWindow(stock)
                          }
                        >
                          SELL
                        </button>
                      </span>
                    )}
                  </td>
                  <td>{stock.qty}</td>
                  <td>{stock.avg.toFixed(2)}</td>
                  <td>
                    {stock.price.toFixed(2)}
                    {isMarketOpen() && (
                      <span style={{ fontSize: '10px', color: '#4caf50', marginLeft: '4px' }}>●</span>
                    )}
                  </td>
                  <td>{currentValue.toFixed(2)}</td>
                  <td className={stock.isLoss ? "loss" : "profit"}>
                    {(currentValue - stock.avg * stock.qty).toFixed(2)}
                  </td>
                  <td className={parseFloat(stock.change) < 0 ? "loss" : "profit"}>
                    {stock.change}
                  </td>
                  <td className={parseFloat(stock.percent) < 0 ? "loss" : "profit"}>
                    {stock.percent}
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
          <h5 className={totalProfitLoss >= 0 ? "profit" : "loss"}>
            {formatCurrency(totalProfitLoss)} ({totalPLPercent.toFixed(2)}%)
            <br />
            <span>P&L</span>
          </h5>
        </div>
      </div>

      <VerticalGraph data={data} />
    </div>
  );
};

export default Holdings;
