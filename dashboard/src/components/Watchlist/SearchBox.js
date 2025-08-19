import { useState, useContext } from "react";
import {
  Box,
  Paper,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Search, Close } from "@mui/icons-material";
import { searchStocks, getQuote } from "../../hooks/api";
import GeneralContext from "../../contexts/GeneralContext";

const SearchBox = ({ currentList, activeList, handleAddStock }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [adding, setAdding] = useState(false);
  const { showAlert } = useContext(GeneralContext);
  let timeoutId;

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    clearTimeout(timeoutId);

    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    timeoutId = setTimeout(() => {
      searchStocks(term)
        .then((res) => {
          const matches = res.data?.bestMatches || [];
          const cleaned = matches
            .map((item) => ({
              name: item.symbol || item.displaySymbol || "",
              symbol: item.description || "",
            }))
            .filter((item) => !item.name.includes(".")); // remove all with suffix

          setSearchResults(cleaned);
        })
        .catch(() => setSearchResults([]));
    }, 1000);
  };

  const handleAddToWatchlist = async (stock) => {
    if (adding || currentList.length >= 25) {
      if (currentList.length >= 25) {
        showAlert?.("warning", "Limit reached. You can only add 25 stocks.");
      }
      return;
    }

    setAdding(true);

    try {
      const cleanSymbol = stock.name.replace(
        /\.(NS|NE|BO|TO|L|AX|V|SA|TWO)$/i,
        ""
      );
      const quote = await getQuote(cleanSymbol);
      if (!quote?.data?.c || typeof quote.data.c !== "number") {
        showAlert?.("error", "Live price not available for this stock.");
        return;
      }

      const payload = {
        name: cleanSymbol,
        symbol: stock.symbol,
        price: quote.data.c,
        percent:
          quote.data.dp !== null ? `${quote.data.dp.toFixed(2)}%` : "0.00%",
        isDown: quote.data.d < 0,
        listName: activeList,
      };

      const result = await handleAddStock(payload);

      if (result.success) {
        showAlert?.("success", `${cleanSymbol} added to watchlist.`);
        setSearchTerm("");
        setSearchResults([]);
      } else {
        showAlert?.("error", `Could not add stock: ${result.message}`);
      }
    } catch (err) {
      console.error("Add Error:", err);
      const msg = err.response?.data?.message || "Something went wrong.";
      showAlert?.("error", msg);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Box className="search-container p-4 pt-1 pb-1">
      <Box className="search-wrapper">
        <TextField
          fullWidth
          placeholder="Search eg: GOOG, META, TSLA"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search className="search-icon" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    setSearchTerm("");
                    setSearchResults([]);
                  }}
                >
                  <Close />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {searchResults.length > 0 && (
          <Paper className="search-results">
            {searchResults.map((item, i) => (
              <Box
                key={i}
                onClick={() =>
                  handleAddToWatchlist({
                    name: item.name,
                    symbol: item.symbol,
                    price: 0,
                    percent: "0.00%",
                    isDown: false,
                  })
                }
                className={`search-item ${adding ? "disabled" : ""}`}
              >
                <Typography fontWeight="bold">{item.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.symbol}
                </Typography>
              </Box>
            ))}
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default SearchBox;
