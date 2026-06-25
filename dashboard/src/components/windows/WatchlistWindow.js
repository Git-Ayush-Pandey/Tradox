import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect, useContext } from "react";
import GeneralContext from "../../contexts/GeneralContext";
const WatchlistWindow = ({
  open,
  type,
  loading = false,
  oldName = "",
  itemCount = 0,
  onClose,
  onCreate,
  onRename,
  onDelete,
}) => {
  const [input, setInput] = useState("");
  const { showAlert } = useContext(GeneralContext);

  useEffect(() => {
    if (type === "rename") {
      setInput(oldName);
    } else {
      setInput("");
    }
  }, [type, oldName]);

  const handleSubmit = async () => {
    const trimmed = input.trim();

    if (type === "create" && trimmed) {
      const result = await onCreate(trimmed);

      if (result?.success) {
        showAlert("success", `Watchlist "${trimmed}" created.`);
        onClose();
      } else {
        showAlert("error", result?.message || "Failed to create watchlist.");
      }
    }

    if (type === "rename" && trimmed && trimmed !== oldName) {
      const result = await onRename(oldName, trimmed);
      if (result?.success) {
        showAlert("success", `Renamed to "${trimmed}".`);
        onClose();
      } else {
        showAlert("error", result?.message || "Failed to rename watchlist.");
      }
    }

    if (type === "delete") {
      const result = await onDelete(oldName);
      if (result?.success) {
        showAlert("success", `Deleted "${oldName}".`);
        onClose();
      } else {
        showAlert("error", result?.message || "Failed to delete watchlist.");
      }
    }
  };

  const isDisabled =
    loading ||
    (type !== "delete" && !input.trim()) ||
    (type === "rename" && input.trim() === oldName);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {type === "create" && "Create New Watchlist"}
        {type === "rename" && `Rename "${oldName}"`}
        {type === "delete" && `Delete "${oldName}"?`}
      </DialogTitle>

      <DialogContent>
        {type === "delete" ? (
          <Typography>
            This will permanently delete the watchlist "{oldName}" and all{" "}
            {itemCount} stocks in it. This action cannot be undone.
          </Typography>
        ) : (
          <TextField
            fullWidth
            autoFocus
            label="Watchlist Name"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !isDisabled && handleSubmit()
            }
          />
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color={type === "delete" ? "error" : "primary"}
          onClick={handleSubmit}
          disabled={isDisabled}
        >
          {loading ? (
            <CircularProgress size={20} />
          ) : type === "create" ? (
            "Create"
          ) : type === "rename" ? (
            "Rename"
          ) : (
            "Delete"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WatchlistWindow;
