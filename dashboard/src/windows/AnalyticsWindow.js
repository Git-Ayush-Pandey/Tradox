import {  useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";

const AnalyticsWindow = ({ stock, onClose }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!stock) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:3002/stock?function=TIME_SERIES_DAILY&symbol=${stock.name}`,
          { withCredentials: true }
        );
        const series = res.data["Time Series (Daily)"];
        const formatted = Object.entries(series)
          .slice(0, 30)
          .map(([date, value]) => ({
            date,
            price: parseFloat(value["4. close"]),
          }))
          .reverse();
        setChartData(formatted);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [stock]);

  return (
    <Dialog open={!!stock} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Analytics - {stock?.name}
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#1976d2"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No analytics data available.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AnalyticsWindow;
