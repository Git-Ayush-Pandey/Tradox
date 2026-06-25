import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";

const LivePriceContext = createContext();

const MAX_RETRIES = 5;

export function LivePriceProvider({ children }) {
  const [livePrices, setLivePrices] = useState({});
  // FIX: wsStatus tracks connection state so UI can show a "Live data unavailable" banner
  const [wsStatus, setWsStatus] = useState("connecting"); // "connecting" | "connected" | "disconnected"
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const retryCountRef = useRef(0);

  const componentSubscriptionsRef = useRef(new Map());
  const activeWsSubscriptions = useRef(new Set());

  const updateWebSocketSubscriptions = useCallback(() => {
    const socket = wsRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    const allRequiredSymbols = new Set();
    for (const symbols of componentSubscriptionsRef.current.values()) {
      symbols.forEach((s) => allRequiredSymbols.add(s.toUpperCase()));
    }

    const currentSubs = activeWsSubscriptions.current;
    const toSubscribe = [...allRequiredSymbols].filter(
      (s) => !currentSubs.has(s)
    );
    const toUnsubscribe = [...currentSubs].filter(
      (s) => !allRequiredSymbols.has(s)
    );

    toSubscribe.forEach((symbol) =>
      socket.send(JSON.stringify({ type: "subscribe", symbol }))
    );
    toUnsubscribe.forEach((symbol) =>
      socket.send(JSON.stringify({ type: "unsubscribe", symbol }))
    );

    activeWsSubscriptions.current = allRequiredSymbols;
  }, []);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    try {
      const socket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);
      wsRef.current = socket;
      setWsStatus("connecting");

      socket.onopen = () => {
        retryCountRef.current = 0;
        setWsStatus("connected");
        updateWebSocketSubscriptions();
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data?.type === "trade" && Array.isArray(data?.data)) {
            const priceUpdates = {};
            data.data.forEach(({ s: symbol, p: price }) => {
              if (symbol && price) {
                priceUpdates[symbol.toUpperCase()] = price;
              }
            });
            if (Object.keys(priceUpdates).length > 0) {
              setLivePrices((prev) => ({ ...prev, ...priceUpdates }));
            }
          }
        } catch (err) {
          console.error("Invalid message:", event.data, err);
        }
      };

      socket.onclose = (event) => {
        console.warn("WebSocket disconnected", event.code, event.reason);
        wsRef.current = null;
        if (event.code !== 1000 && retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++;
          setWsStatus("connecting");
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 3000);
        } else if (retryCountRef.current >= MAX_RETRIES) {
          // FIX: Set disconnected state instead of silently giving up
          setWsStatus("disconnected");
          console.error("WebSocket gave up after", MAX_RETRIES, "retries. Live prices unavailable.");
        }
      };

      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
      };
    } catch (error) {
      console.error("Failed to setup WebSocket:", error);
      setWsStatus("disconnected");
    }
  }, [updateWebSocketSubscriptions]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounted");
      }
    };
  }, [connectWebSocket]);

  const subscribe = useCallback(
    (id, symbols) => {
      const upperSymbols = new Set(symbols.map((s) => s.toUpperCase()));
      componentSubscriptionsRef.current.set(id, upperSymbols);
      updateWebSocketSubscriptions();
    },
    [updateWebSocketSubscriptions]
  );

  const unsubscribe = useCallback(
    (id) => {
      if (componentSubscriptionsRef.current.has(id)) {
        componentSubscriptionsRef.current.delete(id);
        updateWebSocketSubscriptions();
      }
    },
    [updateWebSocketSubscriptions]
  );

  const value = { livePrices, subscribe, unsubscribe, wsStatus };

  return (
    <LivePriceContext.Provider value={value}>
      {/* FIX: Show banner when live data is permanently unavailable */}
      {wsStatus === "disconnected" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            background: "#ff9800",
            color: "#fff",
            textAlign: "center",
            padding: "6px 12px",
            zIndex: 10000,
            fontSize: "0.85rem",
          }}
        >
          ⚠️ Live price data is currently unavailable. Prices shown may be stale.
        </div>
      )}
      {children}
    </LivePriceContext.Provider>
  );
}

export const useLivePriceContext = () => useContext(LivePriceContext);
