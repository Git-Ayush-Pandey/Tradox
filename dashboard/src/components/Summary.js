import { useContext, useEffect } from "react";
import GeneralContext from "../contexts/GeneralContext";
import { updateUnrealisedPnL } from "../hooks/api";

const Summary = () => {
  const { user, holdings, positions, loading } = useContext(GeneralContext);

  const formatINR = (val) =>
    `$${val.toLocaleString("en-IN", { minimumFractionDigits: 2 })} `;

  const calculatePL = (list) => {
    const investment = list.reduce(
      (acc, s) => acc + (s.avg ?? 0) * (s.qty ?? 0),
      0
    );
    const currentValue = list.reduce(
      (acc, s) => acc + (s.price ?? 0) * (s.qty ?? 0),
      0
    );
    const pnl = currentValue - investment;
    const percent = investment > 0 ? (pnl / investment) * 100 : 0;
    return { investment, currentValue, pnl, percent };
  };

  const getPLClass = (pnl) => (pnl < 0 ? "loss" : "profit");

  const holdingsPL = calculatePL(holdings);
  const positionsPL = calculatePL(positions);

  const unrealised = holdingsPL.pnl + positionsPL.pnl;

  useEffect(() => {
    if (holdings.length > 0 || positions.length > 0) {
      updateUnrealisedPnL(unrealised)
        .then(() => console.log("Unrealised PnL updated:", unrealised))
        .catch((err) => console.error("Error updating unrealised PnL:", err));
    }
  }, [unrealised, holdings.length, positions.length]);

  if (loading)
    return <div className="text-center mt-4">Loading summary...</div>;

  return (
    <>
      <div className="username">
        <h6>Hi, {user.name}!</h6>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Positions ({positions.length})</p>
        </span>
        <div className="data">
          <div className="first">
            <h3 className={getPLClass(positionsPL.pnl)}>
              {formatINR(positionsPL.pnl)}{" "}
              <small className={getPLClass(positionsPL.pnl)}>
                ({positionsPL.percent.toFixed(2)}%)
              </small>
            </h3>
            <p>P&L</p>
          </div>
          <hr />
          <div className="second">
            <p>
              Current Value <span>{formatINR(positionsPL.currentValue)}</span>
            </p>
            <p>
              Cost <span>{formatINR(positionsPL.investment)}</span>
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Holdings ({holdings.length})</p>
        </span>
        <div className="data">
          <div className="first">
            <h3 className={getPLClass(holdingsPL.pnl)}>
              {formatINR(holdingsPL.pnl)}{" "}
              <small className={getPLClass(holdingsPL.pnl)}>
                ({holdingsPL.percent.toFixed(2)}%)
              </small>
            </h3>
            <p>P&L</p>
          </div>
          <hr />
          <div className="second">
            <p>
              Current Value <span>{formatINR(holdingsPL.currentValue)}</span>
            </p>
            <p>
              Investment <span>{formatINR(holdingsPL.investment)}</span>
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>
    </>
  );
};

export default Summary;
