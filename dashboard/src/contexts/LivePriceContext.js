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

    if (toSubscribe.length > 0) {
      toSubscribe.forEach((symbol) =>
        socket.send(JSON.stringify({ type: "subscribe", symbol }))
      );
    }

    if (toUnsubscribe.length > 0) {
      toUnsubscribe.forEach((symbol) =>
        socket.send(JSON.stringify({ type: "unsubscribe", symbol }))
      );
    }

    activeWsSubscriptions.current = allRequiredSymbols;
  }, []);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    try {
       const socket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);
      wsRef.current = socket;

      socket.onopen = () => {
        retryCountRef.current = 0;
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
        console.warn(" WebSocket disconnected", event.code, event.reason);
        wsRef.current = null;
        if (event.code !== 1000 && retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 3000);
        }
      };

      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
      };
    } catch (error) {
      console.error(" Failed to setup WebSocket:", error);
    }
  }, [updateWebSocketSubscriptions]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounted");
        console.log("WebSocket closed on unmount");
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

  const value = { livePrices, subscribe, unsubscribe };

  return (
    <LivePriceContext.Provider value={value}>
      {children}
    </LivePriceContext.Provider>
  );
}

export const useLivePriceContext = () => useContext(LivePriceContext);
