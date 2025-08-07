import { useState, useEffect, useContext, useMemo } from "react";
import { fetchPositions, getQuote } from "../hooks/api";
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

const enrichPosition = (item, price, basePrice) => {
  const prevPrice = item.prevPrice ?? price;
  const currentValue = price * item.qty;
  const investment = item.avg * item.qty;
  const change = price - basePrice;
  const percent = basePrice ? (change / basePrice) * 100 : 0;

  return {
    ...item,
    price,
    basePrice,
    prevPrice,
    day: price - item.avg, // store as number
    change: change.toFixed(2),
    percent: percent.toFixed(2),
    isLoss: currentValue < investment,
  };
};

const Positions = () => {
  const { allPositions, setAllPositions, openSellWindow, showAlert } =
    useContext(GeneralContext);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const { livePrices, updateSymbols } = useLivePriceContext();

  const marketOpen = useMemo(() => isMarketOpen(), []);

  useEffect(() => {
    const loadPositions = async () => {
      try {
        const res = await fetchPositions();
        const raw = res.data;
        if (!raw.length) {
          showAlert("warning", "No open positions found.");
        }

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

  useEffect(() => {
    if (!loading && allPositions.length > 0 && totalProfitLoss < -1000) {
      showAlert(
        "error",
        "Your open positions are in a significant loss. Review recommended."
      );
    }
  }, [loading, allPositions.length, totalProfitLoss, showAlert]);
  if (loading) return <div>Loading...</div>;

  if (allPositions.length === 0)
    return (
      <div className="no-orders">
        <div className="icon">📉</div>
        <p>No open positions found.</p>
      </div>
    );

  return (
    <div className="orders">
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
                  <td>{stock.price.toFixed(2)}</td>
                  <td>{currentValue.toFixed(2)}</td>
                  <td className={stock.isLoss ? "loss" : "profit"}>
                    {(currentValue - stock.avg * stock.qty).toFixed(2)}
                  </td>
                  <td className={stock.isLoss ? "loss" : "profit"}>
                    {(stock.qty * stock.day).toFixed(2)} ({stock.percent}%)
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
    </div>
  );
};

export default Positions;
