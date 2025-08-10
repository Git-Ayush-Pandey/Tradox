import { useEffect, useRef } from "react";

const TradingViewChart = ({ symbol }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!symbol || !containerRef.current) return;

    // Clean up any previous widget
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          container_id: "tradingview_widget",
          autosize: true,
          symbol: symbol, // e.g., "NSE:INFY"
          interval: "D",
          timezone: "Etc/UTC",
          theme: "light",
          style: "1", // 1 = candlestick
          locale: "en",
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
        });
      }
    };

    containerRef.current.appendChild(script);
  }, [symbol]);

  return <div id="tradingview_widget" ref={containerRef} style={{ height: "500px" }} />;
};

export default TradingViewChart;
