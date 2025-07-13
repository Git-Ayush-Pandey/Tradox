import { useState, useContext, useEffect } from "react";
import {
  Tooltip,
  Grow,
  TextField,
  Paper,
  Box,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import GeneralContext from "../contexts/GeneralContext";
import axios from "axios";
import {
  BarChartOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Delete,
  Search,
  Close,
} from "@mui/icons-material";
import { DoughnoutChart } from "./DoughnoutChart";

const WatchList = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:3002/watchlist", {
        withCredentials: true,
      })
      .then((res) => {
        setWatchlist(res.data);
      })
      .catch((err) => {
        console.log("Error fetching watchlist:", err);
      });
  }, []);

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
          { withCredentials: true }
        )
        .then((res) => {
          if (res.data.bestMatches) {
            setSearchResults(res.data.bestMatches);
          } else {
            setSearchResults([]);
          }
        })
        .catch((err) => {
          console.error("API fetch error:", err);
          setSearchResults([]);
        });
    }, 500);
    setTypingTimeout(timeout);
  };
  const handleAddToWatchlist = async (stock) => {
    try {
      const res = await axios.post(
        "http://localhost:3002/watchlist/add",
        stock,
        { withCredentials: true }
      );

      setWatchlist((prev) => [...prev, res.data.item]);
      setSearchTerm("");
      setSearchResults([]);
    } catch (err) {
      console.error("Failed to add to watchlist:", err);
      alert(err.response?.data?.message || "Failed to add to watchlist");
    }
  };

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
      {/* Centered Search Box */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 3,
          mb: 4,
        }}
      >
        <Box sx={{ position: "relative", width: 400 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search eg: infy, bse, gold mcx"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {searchTerm ? (
                    <IconButton
                      edge="end"
                      onClick={() => {
                        setSearchTerm("");
                        setSearchResults([]);
                      }}
                    >
                      <Close />
                    </IconButton>
                  ) : (
                    <Search sx={{ color: "gray", mr: 1 }} />
                  )}
                </InputAdornment>
              ),
            }}
            sx={{
              backgroundColor: "white",
              borderRadius: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          {searchResults.length > 0 && (
            <Paper
              elevation={3}
              sx={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                mt: 1,
                zIndex: 10,
                borderRadius: 2,
                maxHeight: 300,
                overflowY: "auto",
              }}
            >
              {searchResults.map((item, index) => (
                <Box
                  key={index}
                  onClick={() =>
                    handleAddToWatchlist({
                      name: item["1. symbol"],
                      price: 0, // You can fetch live price later
                      percent: "0.00%",
                      isDown: false,
                    })
                  }
                  sx={{
                    px: 2,
                    py: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      cursor: "pointer",
                    },
                  }}
                >
                  <Typography variant="body1" fontWeight="bold">
                    {item["1. symbol"]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item["2. name"]}
                  </Typography>
                </Box>
              ))}
            </Paper>
          )}
        </Box>
      </Box>

      {/* Styled Watchlist Title */}
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
          Watchlist 1
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            backgroundColor: "#e0e0e0",
            px: 2,
            py: 0.5,
            borderRadius: 2,
            fontSize: "0.9rem",
          }}
        >
          {watchlist.length} / 50
        </Typography>
      </Box>

      {/* Watchlist Items */}
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
      await axios.delete(
        `http://localhost:3002/watchlist/delete/${stock._id}`,
        { withCredentials: true }
      );
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
        <Tooltip
          title="Analytics (A)"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button className="action">
            <BarChartOutlined className="icon" />
          </button>
        </Tooltip>
        <Tooltip
          title="Delete"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button className="action" onClick={handleDeletaWatchlist}>
            <Delete className="icon" />
          </button>
        </Tooltip>
      </span>
    </span>
  );
};
