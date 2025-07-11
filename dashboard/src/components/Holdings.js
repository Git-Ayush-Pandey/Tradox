import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { VerticalGraph } from "./VerticalGraph";
import GeneralContext from "../contexts/GeneralContext";

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);
  const generalContext = useContext(GeneralContext);

  useEffect(() => {
    axios.get("http://localhost:3002/holdings").then((res) => {
      setAllHoldings(res.data);
    });
  }, []);

  const labels = allHoldings.map((stock) => stock.name);
  const data = {
    labels,
    datasets: [
      {
        label: "Stock Price",
        data: allHoldings.map((stock) => stock.price),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

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

  return (
    <>
      <h3 className="title">Holdings ({allHoldings.length})</h3>

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
            {allHoldings.map((stock, index) => {
              const currentValue = stock.price * stock.qty;
              const isProfit = currentValue - stock.avg * stock.qty >= 0;
              const profitClass = isProfit ? "profit" : "loss";
              const dayClass = stock.isLoss ? "loss" : "profit";

              const handleSellClick = () => {
                console.log("Clicked sell on:", stock.name); 
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
            {totalInvestment.toFixed(2).toLocaleString()}{" "}
            <span className="text-muted">₹</span>
          </h5>
          <p>Total investment</p>
        </div>
        <div className="col">
          <h5>
            {totalCurrentValue.toFixed(2).toLocaleString()}{" "}
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

      {allHoldings.length > 0 && <VerticalGraph data={data} />}
    </>
  );
};

export default Holdings;
