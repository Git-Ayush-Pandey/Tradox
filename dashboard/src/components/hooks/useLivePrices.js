import { useEffect, useRef } from "react";

const useLivePrices = (symbols, onUpdate) => {
  const ws = useRef(null);

  const symbolsKey = symbols.slice().sort().join(",");

  useEffect(() => {
    if (!symbols || symbols.length === 0) return;

    const uniqueSymbols = [...new Set(symbols)];
    console.log(
      "📶 Connecting to these WebSocket with symbols:",
      uniqueSymbols
    );

    ws.current = new WebSocket("ws://localhost:3002");

    ws.current.onopen = () => {
      console.log("📡 WebSocket isssss connected");

      uniqueSymbols.forEach((symbol) => {
        ws.current.send(JSON.stringify({ type: "subscribe", symbol }));
        console.log(`📨 Subscribed to ${symbol}`);
      });
    };
    ws.current.onmessage = async (event) => {
      try {
        const text = await event.data.text();
        const data = JSON.parse(text);
        if (data?.data) {
          data.data.forEach(({ s: symbol, p: price }) => {
            onUpdate(symbol, price);
            console.log(`📈 ${symbol} → ${price}`);
          });
        }
      } catch (err) {
        console.error("WebSocket parse error:", err);
      }
    };
    ws.current.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.current.onclose = () => {
      console.warn("🔌 WebSocket closed");
    };

    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        uniqueSymbols.forEach((symbol) => {
          ws.current.send(JSON.stringify({ type: "unsubscribe", symbol }));
        });
      }
      ws.current.close();
    };
  }, [symbols, symbolsKey, onUpdate]);
};

export default useLivePrices;
