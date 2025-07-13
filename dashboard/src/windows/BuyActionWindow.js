import { useState, useContext, useEffect } from "react";
import axios from "axios";
import GeneralContext from "../contexts/GeneralContext";
import "./Window.css";

const BuyActionWindow = ({ uid }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);
  const [marginRequired, setMarginRequired] = useState(0.0);
  const [availableMargin, setAvailableMargin] = useState(null); // ✅
  const { closeBuyWindow } = useContext(GeneralContext);
  useEffect(() => {
    setMarginRequired(stockQuantity * stockPrice);
  }, [stockQuantity, stockPrice]);

  useEffect(() => {
    axios
      .get("http://localhost:3002/funds", { withCredentials: true })
      .then((res) => {
        setAvailableMargin(res.data.availableMargin || 0);
      })
      .catch((err) => {
        console.error("Failed to fetch margin", err);
        setAvailableMargin(0);
      });
  }, []);

  const isMarketOpen = () => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const isWeekday = day >= 1 && day <= 5;
    const isOpen = hour > 9 || (hour === 9 && minute >= 0);
    const isBeforeClose = hour < 15 || (hour === 15 && minute <= 30);

    return isWeekday && isOpen && isBeforeClose;
  };

  const handleBuyClick = async () => {
    if (!isMarketOpen()) {
      alert("Orders can only be placed between 9:00 AM and 3:30 PM on weekdays.");
      closeBuyWindow();
      return;
    }

    if (marginRequired > availableMargin) {
      alert(`Insufficient margin. Required: ₹${marginRequired.toFixed(2)}, Available: ₹${availableMargin.toFixed(2)}`);
      return;
    }

    try {
      await axios.post(
        "http://localhost:3002/orders/new",
        {
          name: uid.name,
          id: uid.id,
          qty: Number(stockQuantity),
          price: Number(stockPrice),
          mode: "BUY",
        },
        { withCredentials: true }
      );
      closeBuyWindow();
    } catch (err) {
      alert("Buy order failed. Please login again.");
      console.error("Buy order error:", err);
    }
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

            <div className="form-group mb-2 text-muted">
              <p>
                Margin required: <strong>₹{marginRequired.toFixed(2)}</strong>
              </p>
              <p>
                Available margin:{" "}
                <strong style={{ color: availableMargin < marginRequired ? "red" : "green" }}>
                  ₹{availableMargin?.toFixed(2)}
                </strong>
              </p>
            </div>

            <div className="d-flex gap-2">
              <button type="button" className="btn btn-primary w-50" onClick={handleBuyClick}>
                Buy
              </button>
              <button type="button" className="btn btn-secondary w-50" onClick={handleCancelClick}>
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
