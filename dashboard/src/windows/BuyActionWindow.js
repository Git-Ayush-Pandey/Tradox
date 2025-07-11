import { useState, useContext, useEffect } from "react";
import axios from "axios";
import GeneralContext from "../contexts/GeneralContext";
import "./Window.css";

const BuyActionWindow = ({ uid }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);
  const [marginRequired, setMarginRequired] = useState(0.0);

  const { closeBuyWindow } = useContext(GeneralContext);
  useEffect(() => {
    const total = stockQuantity * stockPrice;
    const margin = total;
    setMarginRequired(margin);
  }, [stockQuantity, stockPrice]);

  const handleBuyClick = () => {
    axios.post("http://localhost:3002/orders/new", {
      name: uid.name,
      id: uid.id,
      qty: Number(stockQuantity),
      price: Number(stockPrice),
      mode: "BUY",
    });

    closeBuyWindow();
  };

  const handleCancelClick = () => {
    closeBuyWindow();
  };

  return (
    <div className="container mb-5" style={{ position: "absolute", bottom: 0, zIndex: 1000 }}>
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <form className="border p-4 rounded shadow-sm bg-light">
        <h2 className="fw-semibold" style={{ color: "#404040" }}>Place Buy Order</h2>

            <div className="form-group mb-3">
              <label htmlFor="qty" className="fw-semibold">Quantity</label>
              <input
                type="number"
                className="form-control"
                id="qty"
                min="1"
                name="qty"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
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

            <div className="form-group mb-3">
              <span className="text-muted">
                Margin required: <strong>₹{marginRequired.toFixed(2)}</strong>
              </span>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-primary w-50"
                onClick={handleBuyClick}
              >
                Buy
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

export default BuyActionWindow;
