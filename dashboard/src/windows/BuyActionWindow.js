import { useState, useContext, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import GeneralContext from "../contexts/GeneralContext";

const BuyActionWindow = ({ uid }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);
  const [marginRequired, setMarginRequired] = useState(0.0);
  const [availableMargin, setAvailableMargin] = useState(null);
  const [orderType, setOrderType] = useState("Delivery");
  const { closeBuyWindow } = useContext(GeneralContext);

  useEffect(() => {
    setMarginRequired(stockQuantity * stockPrice);
  }, [stockQuantity, stockPrice]);

  useEffect(() => {
    axios
      .get("http://localhost:3002/funds", { withCredentials: true })
      .then((res) => {
        setAvailableMargin(res.data.availableMargin || 0);
      })
      .catch((err) => {
        console.error("Failed to fetch margin", err);
        setAvailableMargin(0);
      });
  }, []);

  const handleBuyClick = async () => {
    if (marginRequired > availableMargin) {
      alert(
        `Insufficient margin. Required: ₹${marginRequired.toFixed(
          2
        )}, Available: ₹${availableMargin.toFixed(2)}`
      );
      return;
    }

    try {
      await axios.post(
        "http://localhost:3002/orders/new",
        {
          name: uid.name,
          id: uid.id,
          qty: Number(stockQuantity),
          price: Number(stockPrice),
          mode: "BUY",
          type: orderType,
        },
        { withCredentials: true }
      );
      closeBuyWindow();
    } catch (err) {
      alert("Buy order failed. Please login again.");
      console.error("Buy order error:", err);
    }
  };

  return (
    <Dialog open onClose={closeBuyWindow} maxWidth="xs" fullWidth>
      <DialogTitle>
        Place Buy Order
        <IconButton
          onClick={closeBuyWindow}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Box display="flex" justifyContent="space-between" mt={2}>
        <Button
          variant={orderType === "Delivery" ? "contained" : "outlined"}
          color="secondary"
          onClick={() => setOrderType("Delivery")}
          fullWidth
          sx={{ mr: 1 }}
        >
          Delivery
        </Button>
        <Button
          variant={orderType === "Intraday" ? "contained" : "outlined"}
          color="secondary"
          onClick={() => setOrderType("Intraday")}
          fullWidth
          sx={{ ml: 1 }}
        >
          Intraday
        </Button>
      </Box>

      <DialogContent dividers>
        <TextField
          fullWidth
          label="Quantity"
          type="number"
          margin="normal"
          value={stockQuantity}
          onChange={(e) => setStockQuantity(Number(e.target.value))}
        />
        <TextField
          fullWidth
          label="Price (₹)"
          type="number"
          margin="normal"
          step="0.05"
          value={stockPrice}
          onChange={(e) => setStockPrice(Number(e.target.value))}
        />

        <Box mt={2}>
          <Typography variant="body2">
            Margin required: <strong>₹{marginRequired.toFixed(2)}</strong>
          </Typography>
          <Typography
            variant="body2"
            color={availableMargin < marginRequired ? "error" : "success.main"}
          >
            Available margin: ₹{availableMargin?.toFixed(2)}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={handleBuyClick}
          fullWidth
        >
          Buy
        </Button>
        <Button variant="outlined" onClick={closeBuyWindow} fullWidth>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BuyActionWindow;
