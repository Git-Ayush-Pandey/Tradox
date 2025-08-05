import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Search, Close } from "@mui/icons-material";
import { searchStocks, getQuote } from "../hooks/api";

const SearchBox = ({ currentList, activeList, handleAddStock }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [timeoutId, setTimeoutId] = useState(null);
  const [adding, setAdding] = useState(false);


  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (timeoutId) clearTimeout(timeoutId);
    if (term.length < 2) return setSearchResults([]);

    const tId = setTimeout(() => {
      searchStocks(term)
        .then((res) => setSearchResults(res.data.bestMatches || []))
        .catch(() => setSearchResults([]));
    }, 1000);
    setTimeoutId(tId);
  };

  const handleAddToWatchlist = async (stock) => {
    if (adding) return;
    if (currentList.length >= 25) return alert("Limit reached");
    setAdding(true);
    try {
      const cleanSymbol = stock.name.replace(
        /\.(NS|NE|BO|TO|L|AX|V|SA|TWO)$/i,
        ""
      );
      const quote = await getQuote(cleanSymbol);
      console.log(quote)
      if (
        !quote?.data ||
        typeof quote.data.c !== "number" ||
        quote.data.c <= 0
      ) {
        alert("Live price not available for this stock");
        setAdding(false);
        return;
      }

      const payload = {
        name: cleanSymbol,
        price: quote.data.c,
        percent:
          quote.data.dp !== null ? `${quote.data.dp.toFixed(2)}%` : "0.00%",
        isDown: quote.data.d < 0,
        listName: activeList,
      };

      const result = await handleAddStock(payload);
      if (result.success) {
        setSearchTerm("");
        setSearchResults([]);
      } else {
        alert("Could not add stock: " + result.message);
      }
    } catch (err) {
      console.error("Add Error:", err);
      const msg = err.response?.data?.message || "Something went wrong.";
      alert(msg);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Box className="search-container p-4 pt-1 pb-1">
      <Box className="search-wrapper ">
        <TextField
          fullWidth
          placeholder="Search eg: infy, bse"
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
                  !adding &&
                  handleAddToWatchlist({
                    name: item.symbol,
                    price: 0,
                    percent: "0.00%",
                    isDown: false,
                  })
                }
                className={`search-item ${adding ? "disabled" : ""}`}
              >
                <Typography fontWeight="bold">{item.symbol}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
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
