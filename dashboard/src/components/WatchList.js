import { useState, useEffect, useContext } from "react";
import {
  TextField,
  Paper,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  Tooltip,
  Grow,
} from "@mui/material";
import {
  Search,
  Close,
  Delete,
  KeyboardArrowUp,
  KeyboardArrowDown,
  BarChartOutlined,
} from "@mui/icons-material";
import axios from "axios";
import GeneralContext from "../contexts/GeneralContext";
const MAX_STOCKS_PER_LIST = 25;

const WatchList = () => {
  const [watchlists, setWatchlists] = useState({});
  const [activeList, setActiveList] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:3002/watchlist", { withCredentials: true })
      .then((res) => {
        const data = res.data;
        const firstList = Object.keys(data)[0] || "Watchlist 1";
        setWatchlists(data);
        setActiveList(firstList);
      })
      .catch((err) => {
        console.error("Error fetching watchlists:", err);
      });
  }, []);

  const currentList = watchlists[activeList] || [];

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (typingTimeout) clearTimeout(typingTimeout);
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      axios
        .get(
          `http://localhost:3002/stock?function=SYMBOL_SEARCH&keywords=${term}`,
          {
            withCredentials: true,
          }
        )
        .then((res) => {
          setSearchResults(res.data.bestMatches || []);
        })
        .catch(() => setSearchResults([]));
    }, 500);
    setTypingTimeout(timeout);
  };
  const fetchPriceForStock = async (symbol) => {
    const res = await axios.get(
      `http://localhost:3002/stock?function=GLOBAL_QUOTE&symbol=${symbol}`,
      { withCredentials: true }
    );
    const quote = res.data["Global Quote"];
    return {
      price: parseFloat(quote["05. price"]),
      percent: quote["10. change percent"],
      isDown: parseFloat(quote["09. change"]) < 0,
    };
  };
  const handleAddToWatchlist = async (stock) => {
    if (currentList.length >= MAX_STOCKS_PER_LIST) {
      alert("Watchlist limit reached (25 stocks).");
      return;
    }

    try {
      const quote = await fetchPriceForStock(stock.name);
      const payload = { ...stock, ...quote, listName: activeList };
      const res = await axios.post(
        "http://localhost:3002/watchlist/add",
        payload,
        {
          withCredentials: true,
        }
      );

      setWatchlists((prev) => ({
        ...prev,
        [activeList]: [...(prev[activeList] || []), res.data.item],
      }));

      setSearchTerm("");
      setSearchResults([]);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add to watchlist");
    }
  };

  const handleDeleteStock = async (stockId) => {
    try {
      await axios.delete(`http://localhost:3002/watchlist/delete/${stockId}`, {
        withCredentials: true,
      });

      const updatedList = watchlists[activeList].filter(
        (s) => s._id !== stockId
      );
      if (updatedList.length === 0) {
        // Delete watchlist if now empty
        const updatedWatchlists = { ...watchlists };
        delete updatedWatchlists[activeList];
        const remainingLists = Object.keys(updatedWatchlists);

        setWatchlists(updatedWatchlists);
        setActiveList(
          remainingLists[0] || createDefaultWatchlist(updatedWatchlists)
        );
      } else {
        setWatchlists((prev) => ({
          ...prev,
          [activeList]: updatedList,
        }));
      }
    } catch (err) {
      alert("Failed to delete item");
    }
  };

  const createDefaultWatchlist = (prevLists = {}) => {
    const newName = getNextWatchlistName(prevLists);
    setWatchlists({
      ...prevLists,
      [newName]: [],
    });
    return newName;
  };

  const getNextWatchlistName = (lists) => {
    let index = 1;
    while (`Watchlist ${index}` in lists) {
      index++;
    }
    return `Watchlist ${index}`;
  };

  const handleCreateNewWatchlist = () => {
    const newName = getNextWatchlistName(watchlists);
    setWatchlists((prev) => ({
      ...prev,
      [newName]: [],
    }));
    setActiveList(newName);
  };

  return (
    <div className="watchlist-container">
      {/* Search Box */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ position: "relative", width: 400, mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search eg: infy, bse"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchTerm("")}>
                    <Close />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {searchResults.length > 0 && (
            <Paper
              sx={{
                position: "absolute",
                top: "100%",
                width: "100%",
                maxHeight: 300,
                overflowY: "auto",
                zIndex: 10,
              }}
            >
              {searchResults.map((item, i) => (
                <Box
                  key={i}
                  onClick={() =>
                    handleAddToWatchlist({
                      name: item["1. symbol"],
                      price: 0,
                      percent: "0.00%",
                      isDown: false,
                    })
                  }
                  sx={{
                    p: 2,
                    "&:hover": { backgroundColor: "#eee", cursor: "pointer" },
                  }}
                >
                  <Typography fontWeight="bold">{item["1. symbol"]}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item["2. name"]}
                  </Typography>
                </Box>
              ))}
            </Paper>
          )}
        </Box>
      </Box>

      {/* Header with selector and new list option */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          mb: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {activeList}
        </Typography>
        <Typography
          sx={{ backgroundColor: "#eee", px: 2, py: 0.5, borderRadius: 2 }}
        >
          {currentList.length} / 25
        </Typography>
        {Object.keys(watchlists).length > 1 && (
          <IconButton
            color="error"
            onClick={() => {
              const updated = { ...watchlists };
              delete updated[activeList];
              const remaining = Object.keys(updated);
              const newActive = remaining[0] || createDefaultWatchlist(updated);
              setWatchlists(updated);
              setActiveList(newActive);
            }}
          >
            <Delete />
          </IconButton>
        )}
        <Select
          size="small"
          value={activeList}
          onChange={(e) => setActiveList(e.target.value)}
        >
          {Object.keys(watchlists).map((name, i) => (
            <MenuItem key={i} value={name}>
              {name}
            </MenuItem>
          ))}
          <MenuItem onClick={handleCreateNewWatchlist} value="__new">
            ➕ New Watchlist
          </MenuItem>
        </Select>
      </Box>

      {/* Watchlist Items */}
      <ul className="list">
        {currentList.length > 0 ? (
          currentList.map((stock) => (
            <WatchListItem
              key={stock._id}
              stock={stock}
              onDelete={() => handleDeleteStock(stock._id)}
            />
          ))
        ) : (
          <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
            No stocks in this watchlist.
          </Typography>
        )}
      </ul>
    </div>
  );
};

export default WatchList;

const WatchListItem = ({ stock, onDelete }) => {
  const [hover, setHover] = useState(false);
  return (
    <li
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        listStyle: "none",
        padding: "12px 16px",
        borderBottom: "1px solid #eee",
        transition: "background 0.2s",
        backgroundColor: hover ? "#f9f9f9" : "transparent",
      }}
    >
      <div
        className="item"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Left: Stock Name & Full Name */}
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
          {stock.fullName && (
            <p
              style={{
                margin: 0,
                fontSize: "0.85rem",
                color: "#666",
                marginTop: "2px",
              }}
            >
              {stock.fullName}
            </p>
          )}
        </div>

        {/* Right: % change, arrow, price */}
        <div
          className="itemInfo"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: "140px",
            justifyContent: "flex-end",
          }}
        >
          <span
            className="percent"
            style={{
              fontWeight: 500,
              color: stock.isDown ? "#e53935" : "#43a047",
            }}
          >
            {stock.percent}
          </span>
          {stock.isDown ? (
            <KeyboardArrowDown className="down" style={{ color: "#e53935" }} />
          ) : (
            <KeyboardArrowUp className="up" style={{ color: "#43a047" }} />
          )}
          <span
            className="price"
            style={{ fontWeight: 600, fontSize: "1rem", color: "#333" }}
          >
            ₹{stock.price?.toFixed(2)}
          </span>
        </div>
      </div>

      {hover && <WatchListActions stock={stock} onDelete={onDelete} />}
    </li>
  );
};

const WatchListActions = ({ stock, onDelete }) => {
  const generalContext = useContext(GeneralContext);

  const handleDelete = async () => {
    try {
      onDelete();
    } catch {
      alert("Failed to delete stock from watchlist");
    }
  };

  return (
    <span className="actions">
      <span>
        <Tooltip
          title="Buy (B)"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button
            className="buy"
            onClick={() => generalContext.openBuyWindow(stock)}
          >
            Buy
          </button>
        </Tooltip>
        <Tooltip
          title="Sell (S)"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button
            className="sell"
            onClick={() => generalContext.openSellWindow(stock)}
          >
            Sell
          </button>
        </Tooltip>
        <Tooltip
          title="Analytics (A)"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button
            className="action"
            onClick={() => generalContext.openAnalyticsWindow(stock)}
          >
            <BarChartOutlined className="icon" />
          </button>
        </Tooltip>
        <Tooltip
          title="Delete"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button className="action" onClick={handleDelete}>
            <Delete className="icon" />
          </button>
        </Tooltip>
      </span>
    </span>
  );
};
