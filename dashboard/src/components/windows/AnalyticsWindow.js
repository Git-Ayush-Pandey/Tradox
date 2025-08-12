import { useEffect, useState, useContext } from "react";
import StockChart from "../ChartJs/StockChart";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Button,
  Divider,
  Grid,
  Tabs,
  Tab,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { fetchOverview, fetchNews } from "../../hooks/api";
import GeneralContext from "../../contexts/GeneralContext";

const AnalyticsWindow = ({ stock, onClose }) => {
  const [priceData, setPriceData] = useState(null);
  const [overview, setOverview] = useState(null);
  const [news, setNews] = useState([]);
  const [tabValue, setTabValue] = useState("overview");
  const generalContext = useContext(GeneralContext);
  const { showAlert } = useContext(GeneralContext);
  const [visibleCount, setVisibleCount] = useState(10);

  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
  };

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
    if (!stock || stock.type === "index") return;

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
        showAlert?.("error", "Failed to load stock overview or news.");
      }
    };

    loadOverviewAndNews();
    // eslint-disable-next-line
  }, [stock]);

  if (!stock) return null;

  const overviewData = overview
    ? [
        {
          label: "Market Cap",
          value: `$${(overview.marketCapitalization || 0).toLocaleString()}`,
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
          value: `$${overview["52WeekHigh"]} (${overview["52WeekHighDate"]})`,
        },
        {
          label: "52W Low",
          value: `$${overview["52WeekLow"]} (${overview["52WeekLowDate"]})`,
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
        {stock.type !== "index" ? (
          <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h6" fontWeight={600}>
                {stock.symbol || "Stock"}
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
              ${priceData?.currPrice ?? "--"}{" "}
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
        ) : (
          <div style={{ height: "10px" }}></div>
        )}

        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <>
          <StockChart symbol={stock.name} />

          {stock.type === "index" ? (
            <Typography variant="body2" sx={{ mt: 2 }}>
              This is a market index chart. Live price is not available for
              index. F&O, overview, and news data are not available for indices.
            </Typography>
          ) : (
            <>
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
                    <>
                      <Grid container spacing={2}>
                        {news.slice(0, visibleCount).map((item, index) => (
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

                      {visibleCount < news.length && (
                        <Box mt={3} textAlign="center">
                          <Button
                            variant="contained"
                            onClick={() => setVisibleCount((prev) => prev + 10)}
                          >
                            More
                          </Button>
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              )}
            </>
          )}
        </>
      </DialogContent>
    </Dialog>
  );
};

export default AnalyticsWindow;
