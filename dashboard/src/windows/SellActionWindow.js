import { useState, useContext, useEffect } from "react";
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

  // Destructure stock name and id from uid
  const stockName = uid.name;

  useEffect(() => {
    axios.get("http://localhost:3002/positions").then((res) => {
      setPositions(res.data);
    });

    axios.get("http://localhost:3002/holdings").then((res) => {
      setHoldings(res.data);
    });
  }, []);

  useEffect(() => {
    const posQty = positions
      .filter((item) => item.name === stockName)
      .reduce((acc, item) => acc + item.qty, 0);

    const holdQty = holdings
      .filter((item) => item.name === stockName)
      .reduce((acc, item) => acc + item.qty, 0);

    setAvailableQty(posQty + holdQty);
  }, [positions, holdings, stockName]);

 const handleSellClick = () => {

  axios.post("http://localhost:3002/newOrder", {
    name: stockName,
    qty: Number(stockQuantity),
    price: Number(stockPrice),
    mode: "SELL",
  }).then(() => {
    console.log("Order submitted successfully");
    closeSellWindow(); // make sure this is now correctly referenced
  }).catch((err) => {
    console.error("Error submitting order:", err);
  });
};


  const handleCancelClick = () => {
    closeSellWindow();
  };

  return (
<div className="container mb-5 sell-window-container" id="sell-window" draggable="true">
  <div className="row justify-content-center">
    <div className="col-md-8 col-lg-6">
      <form className="border p-4 rounded shadow-sm bg-light">
        <h2 className="fw-semibold text-dark">Place Sell Order</h2>

        <div className="form-group mb-3">
          <label htmlFor="qty" className="fw-semibold">
            Quantity <span className="text-muted">(Available: {availableQty})</span>
          </label>
          <input
            type="number"
            className="form-control"
            id="qty"
            name="qty"
            min="1"
            max={availableQty}
            value={stockQuantity}
            onChange={(e) => setStockQuantity(Number(e.target.value))}
            disabled={availableQty === 0}
            required
          />
        </div>

        <div className="form-group mb-3">
          <label htmlFor="price" className="fw-semibold">Price (₹)</label>
          <input
            type="number"
            className="form-control"
            id="price"
            name="price"
            step="0.05"
            value={stockPrice}
            onChange={(e) => setStockPrice(Number(e.target.value))}
            required
          />
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-danger w-50"
            onClick={handleSellClick}
            disabled={availableQty === 0}
          >
            Sell
          </button>
          <button
            type="button"
            className="btn btn-secondary w-50"
            onClick={handleCancelClick}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

  );
};

export default SellActionWindow;
