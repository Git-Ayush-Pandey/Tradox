import { useContext } from "react";
import { Tooltip, Grow, IconButton } from "@mui/material";
import { Delete, BarChartOutlined } from "@mui/icons-material";
import GeneralContext from "../../contexts/GeneralContext";

const WatchListActions = ({ stock, onDelete }) => {
  const generalContext = useContext(GeneralContext);

  return (
    <div className="watchlist-actions" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      <Tooltip title="Buy" placement="top">
        <Grow in={true} timeout={300}>
          <button 
            className="action-btn buy-btn"
            onClick={() => generalContext.openBuyWindow(stock)}
            style={{
              background: '#4caf50',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Buy
          </button>
        </Grow>
      </Tooltip>

      <Tooltip title="Sell" placement="top">
        <Grow in={true} timeout={400}>
          <button 
            className="action-btn sell-btn"
            onClick={() => generalContext.openSellWindow(stock)}
            style={{
              background: '#f44336',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Sell
          </button>
        </Grow>
      </Tooltip>

      <Tooltip title="Analytics" placement="top">
        <Grow in={true} timeout={500}>
          <IconButton 
            size="small"
            onClick={() => generalContext.openAnalyticsWindow(stock)}
            style={{ padding: '4px' }}
          >
            <BarChartOutlined fontSize="small" />
          </IconButton>
        </Grow>
      </Tooltip>

      <Tooltip title="Delete" placement="top">
        <Grow in={true} timeout={600}>
          <IconButton 
            size="small"
            onClick={async () => {
              const result = await onDelete?.();
              if (result?.success) {
                generalContext.showAlert?.("success", "Removed from watchlist.");
              } else if (result?.message) {
                generalContext.showAlert?.("error", result.message);
              }
            }}
            style={{ padding: '4px' }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Grow>
      </Tooltip>
    </div>
  );
};

export default WatchListActions;
