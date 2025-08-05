import { useState } from "react";
import WatchListActions from "./WatchlistActions";

const WatchListItem = ({ stock, onDelete }) => {
  const [hover, setHover] = useState(false);
  
  return (
    <div 
      className="watchlist-item"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        borderBottom: '1px solid #eee',
        backgroundColor: hover ? '#f5f5f5' : 'transparent',
        transition: 'background-color 0.2s ease'
      }}
    >
      <div className="stock-info" style={{ flex: 1 }}>
        <div className="stock-name" style={{ fontWeight: 'bold', fontSize: '14px' }}>
          {stock.name}
        </div>
        <div className="stock-details" style={{ fontSize: '12px', color: '#666' }}>
          <span className="price">₹{stock.price}</span>
          <span 
            className={`percent ${stock.isDown ? 'down' : 'up'}`}
            style={{ 
              marginLeft: '8px',
              color: stock.isDown ? '#f44336' : '#4caf50'
            }}
          >
            {stock.percent}
          </span>
        </div>
      </div>
      
      {hover && ( 
        <div className="actions-container">
          <WatchListActions 
            stock={stock} 
            onDelete={() => onDelete(stock._id)}
          />
        </div>
      )}
    </div>
  );
};

export default WatchListItem;