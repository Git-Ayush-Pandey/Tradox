import { useState, useContext, useEffect } from "react";
import { fetchHoldings, fetchPositions, editOrder, placeOrder } from "../components/hooks/api";
import GeneralContext from "../contexts/GeneralContext";
import "./Window.css";
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
const SellActionWindow = ({ uid, existingOrder = null }) => {
  const isEdit = !!existingOrder;
  const [stockQuantity, setStockQuantity] = useState(existingOrder?.qty || 1);
  const [stockPrice, setStockPrice] = useState(existingOrder?.price || 0);
  const [orderType, setOrderType] = useState(existingOrder?.type || "Delivery");
  const { closeSellWindow, user } = useContext(GeneralContext);
  const [positions, setPositions] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [availableQty, setAvailableQty] = useState(0);
  const stockName = uid.name;

  useEffect(() => {
    fetchPositions()
      .then((res) => {
        setPositions(res.data);
      });

   fetchHoldings
      .then((res) => {
        setHoldings(res.data);
      });
  }, []);

  useEffect(() => {
    const posQty = positions
      .filter((item) => item.name === stockName)
      .reduce((acc, item) => acc + item.qty, 0);

    const holdQty = holdings
      .filter((item) => item.name === stockName)
      .reduce((acc, item) => acc + item.qty, 0);

    if (orderType === "Delivery") {
      setAvailableQty(holdQty);
    } else {
      setAvailableQty(posQty);
    }
  }, [positions, holdings, stockName, orderType]);

  const handleSellClick = async () => {
    if (!user) {
      alert("You must be logged in to place a sell order.");
      closeSellWindow();
      return;
    }
    const payload = {
      name: stockName,
      qty: Number(stockQuantity),
      price: Number(stockPrice),
      mode: "SELL",
      type: orderType,
    };
    try {
      if (isEdit) {
        await editOrder(existingOrder._id, payload)
      } else {
        await placeOrder(payload);
      }
      closeSellWindow();
    } catch (err) {
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("An error occurred while placing the order.");
      }
      console.error("Sell order error:", err);
    }
  };
  return (
    <Dialog open onClose={closeSellWindow} maxWidth="xs" fullWidth>
      <DialogTitle>
        Place Sell Order for {stockName}
        <IconButton
          onClick={closeSellWindow}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box display="flex" justifyContent="space-between" mt={2} mx={2}>
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
          label={`Quantity (Available: ${availableQty})`}
          type="number"
          margin="normal"
          inputProps={{ min: 1, max: availableQty }}
          value={stockQuantity}
          onChange={(e) => setStockQuantity(Number(e.target.value))}
          disabled={availableQty === 0}
        />
        <TextField
          fullWidth
          label="Price (₹)"
          type="number"
          margin="normal"
          inputProps={{ step: 0.05 }}
          value={stockPrice}
          onChange={(e) => setStockPrice(Number(e.target.value))}
        />
        <Box mt={2}>
          <Typography variant="body2">
            Estimated value:{" "}
            <strong>₹{(stockPrice * stockQuantity).toFixed(2)}</strong>
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          color="error"
          onClick={handleSellClick}
          fullWidth
          disabled={availableQty === 0}
        >
          {isEdit ? "Update Order" : "Sell"}
        </Button>

        <Button variant="outlined" onClick={closeSellWindow} fullWidth>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SellActionWindow;
