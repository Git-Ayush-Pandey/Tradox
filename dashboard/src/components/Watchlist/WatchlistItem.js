import { useState } from "react";
import WatchListActions from "./WatchlistActions";

const WatchListItem = ({ stock, onDelete }) => {
  const [hover, setHover] = useState(false);

  return (
    <li
      className="watchlist-item"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="item">
        <div>
          <p
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: "1rem",
              color: stock.isDown ? "#e53935" : "#43a047",
            }}
          >
            {stock.name}
          </p>
        </div>
        <div className="item-info">
          <span className="price">₹{stock.price?.toFixed(2)}</span>
          {stock.isDown ? (
            <span
              className="down"
              style={{ color: stock.isDown ? "#e53935" : "#43a047" }}
            >
              ▼
            </span>
          ) : (
            <span
              className="up"
              style={{ color: stock.isDown ? "#e53935" : "#43a047" }}
            >
              ▲
            </span>
          )}
          <span style={{ color: stock.isDown ? "#e53935" : "#43a047" }}>
            {stock.percent}
          </span>
        </div>
      </div>

      {hover && <WatchListActions stock={stock} onDelete={onDelete} />}
    </li>
  );
};

export default WatchListItem;
