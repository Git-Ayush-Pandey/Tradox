import { useEffect, useState } from "react";
import axios from "axios";

const Summary = () => {
  const [holdings, setHoldings] = useState([]);
  const [positions, setPositions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEverything = async () => {
      try {
        const [userRes, holdingsRes, positionsRes] = await Promise.all([
          axios.get("http://localhost:3002/auth/verify", {
            withCredentials: true,
          }),
          axios.get("http://localhost:3002/holdings", {
            withCredentials: true,
          }),
          axios.get("http://localhost:3002/positions", {
            withCredentials: true,
          }),
        ]);
        if (userRes.data.status) {
          setUser(userRes.data.safeUser);
        }
        setHoldings(holdingsRes.data);
        setPositions(positionsRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching summary:", err);
        setLoading(false);
      }
    };
    fetchEverything();
  }, []);

  const calculatePL = (list) => {
    const investment = list.reduce((acc, s) => acc + s.avg * s.qty, 0);
    const currentValue = list.reduce((acc, s) => acc + s.price * s.qty, 0);
    const pnl = currentValue - investment;
    const percent = investment > 0 ? (pnl / investment) * 100 : 0;
    return { investment, currentValue, pnl, percent };
  };

  if (loading) return <div>Loading summary...</div>;
  const holdingsPL = calculatePL(holdings);
  const positionsPL = calculatePL(positions);

  return (
    <>
      <div className="username">
        <h6>Hi, {user?.name || "User"}!</h6>
        <hr className="divider" />
      </div>
      <div className="section">
        <span>
          <p>Positions ({positions.length})</p>
        </span>
        <div className="data">
          <div className="first">
            <h3 className={positionsPL.pnl >= 0 ? "profit" : "loss"}>
              {positionsPL.pnl.toFixed(2)}{" "}
              <small>({positionsPL.percent.toFixed(2)}%)</small>
            </h3>
            <p>P&L</p>
          </div>
          <hr />
          <div className="second">
            <p>
              Current Value <span>{positionsPL.currentValue.toFixed(2)}</span>
            </p>
            <p>
              Cost <span>{positionsPL.investment.toFixed(2)}</span>
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
            <h3 className={holdingsPL.pnl >= 0 ? "profit" : "loss"}>
              {holdingsPL.pnl.toFixed(2)}{" "}
              <small>({holdingsPL.percent.toFixed(2)}%)</small>
            </h3>
            <p>P&L</p>
          </div>
          <hr />
          <div className="second">
            <p>
              Current Value <span>{holdingsPL.currentValue.toFixed(2)}</span>
            </p>
            <p>
              Investment <span>{holdingsPL.investment.toFixed(2)}</span>
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>
    </>
  );
};

export default Summary;
