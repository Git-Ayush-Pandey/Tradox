import { useState, useEffect, useContext } from "react";
import axios from "axios";
import GeneralContext from "../contexts/GeneralContext";

const Positions = () => {
  const [allPositions, setAllPositions] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);
  const generalContext = useContext(GeneralContext);

  useEffect(() => {
    axios
      .get("http://localhost:3002/positions", {
        withCredentials: true,
      })
      .then((res) => {
        setAllPositions(res.data);
      })
      .catch((err) => {
        console.log("Error fetching positions:", err);
      });
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
            </tr>
          </thead>

          <tbody>
            {allPositions.map((stock, index) => {
              const currentValue = stock.price * stock.qty;
              const isProfit = currentValue - stock.avg * stock.qty >= 0;
              const profitClass = isProfit ? "profit" : "loss";
              const dayClass = stock.isLoss ? "loss" : "profit";

              const handleSellClick = () => {
                generalContext.openSellWindow({
                  id: stock._id,
                  name: stock.name,
                });
              };

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
                            handleSellClick();
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
                  <td className={dayClass}>{stock.day}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="row text-center my-3">
        <div className="col">
          <h5>
            {totalCost.toFixed(2).toLocaleString()}{" "}
            <span className="text-muted">₹</span>
          </h5>
          <p>Total cost</p>
        </div>
        <div className="col">
          <h5>
            {totalPositionValue.toFixed(2).toLocaleString()}{" "}
            <span className="text-muted">₹</span>
          </h5>
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
