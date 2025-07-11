import { useState, useContext, useEffect } from "react";
import { Tooltip, Grow } from "@mui/material";
import GeneralContext from "../contexts/GeneralContext";
import axios from "axios";
import {
  BarChartOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Delete,
} from "@mui/icons-material";
import { DoughnoutChart } from "./DoughnoutChart";

const WatchList = () => {
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3002/watchlist").then((res) => {
      setWatchlist(res.data);
    });
  }, []);

  const labels = watchlist.map((stock) => stock.name);
  const data = {
    labels,
    datasets: [
      {
        label: "price",
        data: watchlist.map((stock) => stock.price),
        backgroundColor: [
          "rgba(255, 99, 132,  0.5)",
          "rgba(54, 162, 235,  0.5)",
          "rgba(255, 206, 86,  0.5)",
          "rgba(75, 192, 192,  0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64,  0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="watchlist-container">
      <div className="search-container">
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search eg:infy, bse, nifty fut weekly, gold mcx"
          className="search"
        />
        <span className="counts"> {watchlist.length} / 50</span>
      </div>

      <ul className="list">
        {watchlist.map((stock) => (
          <WatchListItem
            stock={stock}
            key={stock._id}
            setWatchlist={setWatchlist}
          />
        ))}
      </ul>
      <DoughnoutChart data={data} />
    </div>
  );
};

export default WatchList;

const WatchListItem = ({ stock, setWatchlist }) => {
  const [showWatchlistActions, setShowWatchlistActions] = useState(false);

  return (
    <li
      onMouseEnter={() => setShowWatchlistActions(true)}
      onMouseLeave={() => setShowWatchlistActions(false)}
    >
      <div className="item">
        <p className={stock.isDown ? "down" : "up"}>{stock.name}</p>
        <div className="itemInfo">
          <span className="percent">{stock.percent}</span>
          {stock.isDown ? (
            <KeyboardArrowDown className="down" />
          ) : (
            <KeyboardArrowUp className="up" />
          )}
          <span className="price">{stock.price}</span>
        </div>
      </div>
      {showWatchlistActions && (
        <WatchListActions stock={stock} setWatchlist={setWatchlist} />
      )}
    </li>
  );
};

const WatchListActions = ({ stock, setWatchlist }) => {
  const generalContext = useContext(GeneralContext);

  const handleBuyClick = () => {
    generalContext.openBuyWindow({ id: stock._id, name: stock.name });
  };

  const handleSellClick = () => {
    generalContext.openSellWindow({ id: stock._id, name: stock.name });
  };

  const handleDeletaWatchlist = async () => {
    try {
      await axios.delete(`http://localhost:3002/watchlist/delete/${stock._id}`);
      setWatchlist((prev) => prev.filter((item) => item._id !== stock._id));
    } catch (error) {
      console.error("Failed to delete watchlist item", error);
      alert("Failed to delete item from watchlist");
    }
  };

  return (
    <span className="actions">
      <span style={{ alignItems: "center" }}>
        <Tooltip
          title="Buy (B)"
          placement="top"
          arrow
          TransitionComponent={Grow}
          onClick={handleBuyClick}
        >
          <button className="buy">Buy</button>
        </Tooltip>
        <Tooltip
          title="Sell (S)"
          placement="top"
          arrow
          TransitionComponent={Grow}
          onClick={handleSellClick}
        >
          <button className="sell">Sell</button>
        </Tooltip>
        <Tooltip title="Analytics (A)" placement="top" arrow TransitionComponent={Grow}>
          <button className="action">
            <BarChartOutlined className="icon" />
          </button>
        </Tooltip>
        <Tooltip title="Delete" placement="top" arrow TransitionComponent={Grow}>
          <button className="action" onClick={handleDeletaWatchlist}>
            <Delete className="icon" />
          </button>
        </Tooltip>
      </span>
    </span>
  );
};
