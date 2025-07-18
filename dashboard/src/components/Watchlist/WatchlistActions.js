import { useContext } from "react";
import { Tooltip, Grow } from "@mui/material";
import { Delete, BarChartOutlined } from "@mui/icons-material";
import GeneralContext from "../../contexts/GeneralContext";

const WatchListActions = ({ stock, onDelete }) => {
  const generalContext = useContext(GeneralContext);
  return (
    <span className="actions">
      <span>
        <Tooltip title="Buy (B)" arrow TransitionComponent={Grow}>
          <button
            className="buy"
            onClick={() => generalContext.openBuyWindow(stock)}
          >
            Buy
          </button>
        </Tooltip>
        <Tooltip title="Sell (S)" arrow TransitionComponent={Grow}>
          <button
            className="sell"
            onClick={() => generalContext.openSellWindow(stock)}
          >
            Sell
          </button>
        </Tooltip>
        <Tooltip title="Analytics (A)" arrow TransitionComponent={Grow}>
          <button
            className="action"
            onClick={() => generalContext.openAnalyticsWindow(stock)}
          >
            <BarChartOutlined className="icon" />
          </button>
        </Tooltip>
        <Tooltip title="Delete" arrow TransitionComponent={Grow}>
          <button className="action" onClick={onDelete}>
            <Delete className="icon" />
          </button>
        </Tooltip>
      </span>
    </span>
  );
};

export default WatchListActions;
