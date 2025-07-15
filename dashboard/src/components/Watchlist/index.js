import { useEffect, useState } from "react";
import { Box, Typography, IconButton, MenuItem, Select } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchBox from "./SearchBox";
import { useWatchlist } from "./useWatchlist";
import WatchlistItem from "./WatchlistItem";

const Watchlist = () => {
  const {
    watchlists,
    activeList,
    setActiveList,
    handleCreateNewWatchlist,
    handleDeleteList,
    handleDeleteStock,
  } = useWatchlist();

  const [localList, setLocalList] = useState([]);

  // 🔁 Always sync localList when watchlists or activeList changes
  useEffect(() => {
    setLocalList(watchlists[activeList] || []);
  }, [watchlists, activeList]);

  return (
    <div className="watchlist-container">
      {/* Search Box */}
      <SearchBox />

      {/* Header */}
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
        <Typography sx={{ backgroundColor: "#eee", px: 2, py: 0.5, borderRadius: 2 }}>
          {localList.length} / 25
        </Typography>
        {Object.keys(watchlists).length > 1 && (
          <IconButton color="error" onClick={handleDeleteList}>
            <DeleteIcon />
          </IconButton>
        )}
        <Select size="small" value={activeList} onChange={(e) => setActiveList(e.target.value)}>
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
        {localList.length > 0 ? (
          localList.map((stock) => (
            <WatchlistItem
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

export default Watchlist;
