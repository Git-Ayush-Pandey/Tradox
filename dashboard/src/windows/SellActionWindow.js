import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import GeneralContext from "../contexts/GeneralContext";
import "./Window.css";

const SellActionWindow = ({ uid }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);
  const { closeSellWindow } = useContext(GeneralContext);
  const [positions, setPositions] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [availableQty, setAvailableQty] = useState(0);

  // Fetch positions and holdings
  useEffect(() => {
    axios.get("http://localhost:3002/positions").then((res) => {
      setPositions(res.data);
    });

    axios.get("http://localhost:3002/holdings").then((res) => {
      setHoldings(res.data);
    });
  }, []);

  // Update available quantity when data or uid changes
  useEffect(() => {
    const posQty = positions
      .filter((item) => item.name === uid)
      .reduce((acc, item) => acc + item.qty, 0);

    const holdQty = holdings
      .filter((item) => item.name === uid)
      .reduce((acc, item) => acc + item.qty, 0);

    setAvailableQty(posQty + holdQty);
  }, [positions, holdings, uid]);

  const handleSellClick = () => {
    if (availableQty === 0) {
      alert("You don't own this stock.");
      return;
    }

    if (stockQuantity > availableQty) {
      alert(`You can only sell up to ${availableQty} shares.`);
      return;
    }

    axios.post("http://localhost:3002/newOrder", {
      name: uid,
      qty: Number(stockQuantity),
      price: Number(stockPrice),
      mode: "SELL",
    });

    closeSellWindow();
  };

  const handleCancelClick = () => {
    closeSellWindow();
  };

  return (
    <div className="container" id="buy-window" draggable="true">
      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty. (Available: {availableQty})</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              min="1"
              max={availableQty}
              onChange={(e) => setStockQuantity(Number(e.target.value))}
              value={stockQuantity}
              disabled={availableQty === 0}
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              name="price"
              id="price"
              step="0.05"
              onChange={(e) => setStockPrice(Number(e.target.value))}
              value={stockPrice}
            />
          </fieldset>
        </div>
      </div>

      <div className="buttons" >
        <div>
          <Link
            className={`btn btn-blue ${availableQty === 0 ? "disabled" : ""}`}
            onClick={handleSellClick}
          >
            Sell
          </Link>
          <Link to="" className="btn btn-grey" onClick={handleCancelClick}>
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellActionWindow;
