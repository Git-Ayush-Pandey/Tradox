import { useState } from "react";
import WatchListActions from "./WatchlistActions";

const WatchListItem = ({ stock, onDelete }) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="watchlist-item"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="stock-info">
        <div className="stock-name">{stock.symbol}</div>
        <div className="stock-details">
          <span className="price">$ {stock.price}</span>
          <span className={`percent ${stock.isDown ? "down" : "up"}`}>
            {stock.percent}
          </span>
        </div>
      </div>

      {hover && (
        <div className="actions-container">
          <WatchListActions stock={stock} onDelete={onDelete} />
        </div>
      )}
    </div>
  );
};

export default WatchListItem;
