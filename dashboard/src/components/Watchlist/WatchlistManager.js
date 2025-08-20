import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  MenuItem,
  Select,
  Button,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Folder as FolderIcon,
} from "@mui/icons-material";

import WatchlistWindow from "../windows/WatchlistWindow";

const WatchlistManager = ({
  watchlists,
  activeList,
  loading,
  error,
  onSetActiveList,
  onCreateWatchlist,
  onDeleteWatchlist,
  onRenameWatchlist,
  onClearError,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuWatchlistName, setMenuWatchlistName] = useState("");

  const watchlistNames = Object.keys(watchlists);
  const canDeleteWatchlist = watchlistNames.length > 1;

  const handleOpenDialog = (type, watchlistName = "") => {
    setDialogType(type);
    setMenuWatchlistName(watchlistName);
    setDialogOpen(true);
    setAnchorEl(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setMenuWatchlistName("");
  };

  const handleMenuOpen = (event, watchlistName) => {
    setAnchorEl(event.currentTarget);
    setMenuWatchlistName(watchlistName);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuWatchlistName("");
  };

  return (
    <Box sx={{ mb: 3 }}>
      {error && (
        <Alert severity="error" onClose={onClearError} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        {loading && <CircularProgress size={20} />}

        <Select
          size="small"
          value={activeList}
          onChange={(e) => {
            if (e.target.value === "__new") {
              handleOpenDialog("create");
            } else {
              onSetActiveList(e.target.value);
            }
          }}
          sx={{ minWidth: 150 }}
        >
          {watchlistNames.map((name) => (
            <MenuItem key={name} value={name}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  width: "100%",
                }}
              >
                <FolderIcon fontSize="small" />
                <Typography sx={{ flexGrow: 1 }}>{name}</Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuOpen(e, name);
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
            </MenuItem>
          ))}
          <Divider />
          <MenuItem value="__new">
            <ListItemIcon>
              <AddIcon />
            </ListItemIcon>
            <ListItemText primary="Create New Watchlist" />
          </MenuItem>
        </Select>

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog("create")}
          size="small"
        >
          New List
        </Button>
      </Box>

      <Box sx={{ textAlign: "center", mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {watchlistNames.length} watchlist
          {watchlistNames.length !== 1 ? "s" : ""} total
        </Typography>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleOpenDialog("rename", menuWatchlistName)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Rename" />
        </MenuItem>
        <MenuItem
          onClick={() => handleOpenDialog("delete", menuWatchlistName)}
          disabled={!canDeleteWatchlist}
        >
          <ListItemIcon>
            <DeleteIcon
              fontSize="small"
              color={canDeleteWatchlist ? "error" : "disabled"}
            />
          </ListItemIcon>
          <ListItemText
            primary="Delete"
            sx={{ color: canDeleteWatchlist ? "error.main" : "text.disabled" }}
          />
        </MenuItem>
      </Menu>

      <WatchlistWindow
        open={dialogOpen}
        type={dialogType}
        loading={loading}
        oldName={menuWatchlistName}
        itemCount={watchlists[menuWatchlistName]?.length || 0}
        onClose={handleCloseDialog}
        onCreate={onCreateWatchlist}
        onRename={async (oldName, newName) => {
          const result = await onRenameWatchlist(oldName, newName);
          if (result?.success) handleCloseDialog();
          return result;
        }}
        onDelete={onDeleteWatchlist}
      />
    </Box>
  );
};

export default WatchlistManager;
