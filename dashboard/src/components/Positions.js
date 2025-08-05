import { useState, useEffect, useContext } from "react";
import { fetchPositions, getQuote } from "./hooks/api";
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

// Enrich each position with price, change %, etc.
const enrichPosition = (item, price, basePrice) => {
  const prevPrice = item.price ?? price;
  const currentValue = price * item.qty;
  const investment = item.avg * item.qty;
  const change = price - basePrice;
  const percent = basePrice ? (change / basePrice) * 100 : 0;

  return {
    ...item,
    price,
    basePrice,
    prevPrice,
    net: (price - item.avg).toFixed(2),
    day: (price - prevPrice).toFixed(2),
    change: change.toFixed(2),
    percent: percent.toFixed(2),
    isLoss: currentValue < investment,
  };
};

const Positions = () => {
  const { allPositions, setAllPositions, openSellWindow } = useContext(GeneralContext);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const { livePrices, updateSymbols } = useLivePriceContext();

  const symbols = allPositions.map((s) => s.name);

  // Initial load + enrich with API prices
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
          return enrichPosition(item, match?.price, match?.basePrice);
        });

        setAllPositions(enriched);
        updateSymbols(symbols);
      } catch (err) {
        console.error("Error loading positions:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPositions();
  }, [setAllPositions, symbols, updateSymbols]);

  // Apply live prices if available
  useEffect(() => {
    if (!isMarketOpen() || allPositions.length === 0 || !livePrices) return;

    setAllPositions((prev) =>
      prev.map((item) => {
        const live = livePrices[item.name];
        if (!live) return item;
        return enrichPosition(item, live, item.basePrice);
      })
    );
  }, [livePrices, allPositions.length, setAllPositions]);

  // Re-subscribe to symbols
  useEffect(() => {
    if (isMarketOpen() && symbols.length > 0) {
      updateSymbols(symbols);
    }
  }, [symbols, updateSymbols]);

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

  if (loading)
    return <div className="text-center mt-4">Loading positions...</div>;

  if (allPositions.length === 0)
    return (
      <div className="text-center mt-4 text-muted">
        No open positions found.
      </div>
    );

  return (
    <>
      <h3 className="title">Positions ({allPositions.length})</h3>

      <div className="order-table table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="table-dark">
            <tr>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg. cost</th>
              <th>LTP</th>
              <th>Cur. val</th>
              <th>P&L</th>
              <th>Net chg.</th>
              <th>Day chg.</th>
              <th>% Change</th>
            </tr>
          </thead>

          <tbody>
            {allPositions.map((stock, index) => {
              const currentValue = stock.price * stock.qty;
              const profitClass = stock.isLoss ? "loss" : "profit";

              return (
                <tr
                  key={index}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="position-relative">
                    <div className="d-flex align-items-center justify-content-between gap-2">
                      <span className="flex-grow-1">{stock.name}</span>
                      {hoveredRow === index && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            openSellWindow({
                              id: stock._id,
                              name: stock.name,
                            });
                          }}
                        >
                          Sell
                        </button>
                      )}
                    </div>
                  </td>

                  <td>{stock.qty}</td>
                  <td>{stock.avg.toFixed(2)}</td>
                  <td>{stock.price.toFixed(2)}</td>
                  <td>{currentValue.toFixed(2)}</td>
                  <td className={profitClass}>
                    {(currentValue - stock.avg * stock.qty).toFixed(2)}
                  </td>
                  <td className={profitClass}>{stock.net}</td>
                  <td className={profitClass}>{stock.day}</td>
                  <td className={parseFloat(stock.percent) < 0 ? "text-danger" : "text-success"}>
                    {stock.percent}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="row text-center my-3">
        <div className="col">
          <h5>{formatCurrency(totalCost)}</h5>
          <p>Total cost</p>
        </div>
        <div className="col">
          <h5>{formatCurrency(totalPositionValue)}</h5>
          <p>Current value</p>
        </div>
        <div className="col">
          <h5 className={totalProfitLoss >= 0 ? "profit" : "loss"}>
            {totalProfitLoss.toFixed(2)} ({totalPLPercent.toFixed(2)}%)
          </h5>
          <p>P&L</p>
        </div>
      </div>
    </>
  );
};

export default Positions;
