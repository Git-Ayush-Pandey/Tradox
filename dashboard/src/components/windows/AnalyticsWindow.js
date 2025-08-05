import { useEffect, useState, useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Typography,
  Button,
  Divider,
  Grid,
  Tabs,
  Tab,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  fetchGraphData,
  fetchOverview,
  fetchNews,
} from "../../hooks/api";
import GeneralContext from "../../contexts/GeneralContext";

const AnalyticsWindow = ({ stock, onClose }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [interval, setInterval] = useState("1month");
  const [priceData, setPriceData] = useState(null);
  const [overview, setOverview] = useState(null);
  const [news, setNews] = useState([]);
  const [tabValue, setTabValue] = useState("overview");
  const generalContext = useContext(GeneralContext);

  const handleIntervalChange = (_, newInterval) => {
    if (newInterval) setInterval(newInterval);
  };
  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (!stock) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetchGraphData(stock.name, interval);

        let series = {};
        if (res.data["Time Series (5min)"]) {
          series = res.data["Time Series (5min)"];
        } else if (res.data["Time Series (Daily)"]) {
          series = res.data["Time Series (Daily)"];
        } else if (res.data["Weekly Time Series"]) {
          series = res.data["Weekly Time Series"];
        } else if (res.data["Monthly Time Series"]) {
          series = res.data["Monthly Time Series"];
        }

        const formatted = Object.entries(series)
          .slice(0, 50)
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

    fetchData();
  }, [stock, interval]);

  useEffect(() => {
    const fetchPrice = async () => {
      if (!stock) return;
      try {
        const currPrice = stock.price ?? 0;
        const currPer = parseFloat((stock.percent ?? "0").replace("%", ""));
        const changeValue = +(
          (1 - 1 / (1 + currPer / 100)) *
          currPrice
        ).toFixed(2);

        const res = {
          currPrice,
          currPer,
          changeValue,
        };
        setPriceData(res);
      } catch (err) {
        console.error("Failed to fetch live price", err);
        setPriceData(null);
      }
    };

    fetchPrice();
  }, [stock]);

  useEffect(() => {
    if (!stock) return;

    const loadOverviewAndNews = async () => {
      try {
        const symbol = stock.name;
        const today = new Date();
        const from = new Date(today);
        from.setMonth(from.getMonth() - 1);

        const format = (d) => d.toISOString().split("T")[0];
        const [overviewRes, newsRes] = await Promise.all([
          fetchOverview(symbol),
          fetchNews(symbol, format(from), format(today)),
        ]);
        setOverview(overviewRes.data);
        setNews(newsRes.data);
      } catch (err) {
        console.error("Failed to load overview/news:", err);
        setOverview(null);
        setNews([]);
      }
    };

    loadOverviewAndNews();
  }, [stock]);

  const overviewData = overview
    ? [
        {
          label: "Market Cap",
          value: `₹${(overview.marketCapitalization || 0).toLocaleString()}`,
        },
        { label: "P/E (TTM)", value: overview.peTTM },
        { label: "P/B", value: overview.pb },
        { label: "EV/FCF (TTM)", value: overview["currentEv/freeCashFlowTTM"] },
        { label: "Net Margin", value: `${overview.netProfitMarginTTM}%` },
        { label: "Operating Margin", value: `${overview.operatingMarginTTM}%` },
        { label: "ROE", value: `${overview.roeTTM}%` },
        { label: "ROA", value: `${overview.roaTTM}%` },
        { label: "EPS Growth (5Y)", value: `${overview.epsGrowth5Y}%` },
        { label: "Revenue Growth (5Y)", value: `${overview.revenueGrowth5Y}%` },
        { label: "EBITDA CAGR (5Y)", value: `${overview.ebitdaCagr5Y}%` },
        { label: "Current Ratio", value: overview.currentRatioQuarterly },
        { label: "Quick Ratio", value: overview.quickRatioQuarterly },
        {
          label: "Debt/Equity",
          value: overview["totalDebt/totalEquityQuarterly"],
        },
        {
          label: "52W High",
          value: `₹${overview["52WeekHigh"]} (${overview["52WeekHighDate"]})`,
        },
        {
          label: "52W Low",
          value: `₹${overview["52WeekLow"]} (${overview["52WeekLowDate"]})`,
        },
        {
          label: "1M Return",
          value: `${overview["monthToDatePriceReturnDaily"]}%`,
        },
        { label: "1Y Return", value: `${overview["52WeekPriceReturnDaily"]}%` },
      ]
    : [];

  return (
    <Dialog open={!!stock} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Box display="flex" flexDirection="column" gap={1}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h6" fontWeight={600}>
              {stock?.fullName || stock?.name || "Stock"}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => generalContext.openBuyWindow(stock)}
            >
              Buy
            </Button>
          </Box>

          <Typography variant="h5">
            ₹{priceData?.currPrice ?? "--"}{" "}
            <Typography
              component="span"
              variant="body1"
              color={priceData?.currPer < 0 ? "error.main" : "success.main"}
            >
              ({priceData?.changeValue ?? "--"} /{" "}
              {priceData?.currPer?.toFixed(2) ?? "--"}%)
            </Typography>
          </Typography>
        </Box>

        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : chartData.length > 0 ? (
          <>
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

            <Box display="flex" justifyContent="center" mt={2}>
              <ToggleButtonGroup
                size="small"
                value={interval}
                exclusive
                onChange={handleIntervalChange}
              >
                <ToggleButton value="1day">1D</ToggleButton>
                <ToggleButton value="1week">1W</ToggleButton>
                <ToggleButton value="1month">1M</ToggleButton>
                <ToggleButton value="1year">1Y</ToggleButton>
                <ToggleButton value="5year">5Y</ToggleButton>
                <ToggleButton value="all">All</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </>
        ) : (
          <p>No analytics data available.</p>
        )}

        <Divider sx={{ my: 3 }} />

        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab value="overview" label="Overview" />
          <Tab value="news" label="News" />
        </Tabs>

        {tabValue === "overview" && (
          <Box my={3}>
            {overview ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                  },
                  gap: 2,
                }}
              >
                {overviewData.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "#f5f7fa",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      border: "1px solid #e0e0e0",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="text.secondary"
                      gutterBottom
                    >
                      {item.label}
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {item.value || "--"}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Overview data loading...
              </Typography>
            )}
          </Box>
        )}

        {tabValue === "news" && (
          <Box my={3}>
            {news?.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No news available.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {news.map((item, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box
                      p={2}
                      border={1}
                      borderRadius={2}
                      borderColor="grey.300"
                      sx={{ height: "100%" }}
                    >
                      <Typography variant="subtitle1" fontWeight={600}>
                        {item.headline}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ my: 1 }}
                      >
                        {new Date(item.datetime).toLocaleDateString()} |{" "}
                        {item.source}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {item.summary.length > 100
                          ? `${item.summary.slice(0, 100)}...`
                          : item.summary}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Read More
                      </Button>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AnalyticsWindow;
