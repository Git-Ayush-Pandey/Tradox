import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";

const LivePriceContext = createContext();
const MAX_SUBSCRIPTIONS = 100;
const MAX_RETRIES = 5;

export function LivePriceProvider({ children }) {
  const [livePrices, setLivePrices] = useState({});
  const subscribedSymbolsRef = useRef(new Set());

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const subscriptionQueueRef = useRef([]);
  const isProcessingQueue = useRef(false);
  const retryCountRef = useRef(0);
  const lastSymbolsSent = useRef(new Set());

  // ✅ Queue processing
  const processSubscriptionQueue = useCallback(() => {
    if (isProcessingQueue.current || subscriptionQueueRef.current.length === 0)
      return;

    const socket = wsRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn("❗ Skipping queue: WebSocket not open.");
      isProcessingQueue.current = false;
      return;
    }

    isProcessingQueue.current = true;
    const queue = [...subscriptionQueueRef.current];
    subscriptionQueueRef.current = [];

    try {
      const subscriptions = queue.filter((q) => q.action === "subscribe");
      const unsubscriptions = queue.filter((q) => q.action === "unsubscribe");

      const subSymbols = [...new Set(subscriptions.map((s) => s.symbol))];
      const unsubSymbols = [...new Set(unsubscriptions.map((s) => s.symbol))];

      subSymbols.forEach((symbol) => {
        socket.send(JSON.stringify({ type: "subscribe", symbol }));
      });

      unsubSymbols.forEach((symbol) => {
        socket.send(JSON.stringify({ type: "unsubscribe", symbol }));
      });

      if (subSymbols.length)
        console.log(`📡 Subscribed to ${subSymbols.length}:`, subSymbols);
      if (unsubSymbols.length)
        console.log(
          `❎ Unsubscribed from ${unsubSymbols.length}:`,
          unsubSymbols
        );
    } catch (err) {
      console.error("❌ Error processing queue:", err);
    }

    isProcessingQueue.current = false;
  }, []);

  // ✅ Connect WebSocket (only once)
  const connectWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    try {
      const socket = new WebSocket("ws://localhost:4000/ws");
      wsRef.current = socket;

      socket.onopen = () => {
        console.log("📡 WebSocket connected ✅");
        retryCountRef.current = 0;

        // re-subscribe to all
        subscribedSymbolsRef.current.forEach((symbol) => {
          subscriptionQueueRef.current.push({ action: "subscribe", symbol });
        });
        setTimeout(processSubscriptionQueue, 100);
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
          console.error("❌ Invalid message:", event.data, err);
        }
      };

      socket.onclose = (event) => {
        console.warn("🔌 WebSocket disconnected", event.code, event.reason);
        wsRef.current = null;

        if (event.code !== 1000 && retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`🔁 Reconnect attempt ${retryCountRef.current}...`);
            connectWebSocket();
          }, 3000);
        }
      };

      socket.onerror = (err) => {
        console.error("❌ WebSocket error:", err);
      };
    } catch (error) {
      console.error("💥 Failed to setup WebSocket:", error);
    }
  }, [processSubscriptionQueue]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounted");
        console.log("🧹 WebSocket closed on unmount");
      }
    };
  }, [connectWebSocket]);

  // ✅ updateSymbols with ref tracking only
  const updateSymbols = useCallback(
    (symbols) => {
      const upperSymbols = new Set(symbols.map((s) => s.toUpperCase()));

      if (
        upperSymbols.size === lastSymbolsSent.current.size &&
        [...upperSymbols].every((v) => lastSymbolsSent.current.has(v))
      ) {
        console.warn(
          `⚠️ Requested ${upperSymbols.size} exceeds max (${MAX_SUBSCRIPTIONS})`
        );
        return;
      }
      lastSymbolsSent.current = upperSymbols;
      const prev = subscribedSymbolsRef.current;
      const toSubscribe = [...upperSymbols].filter((s) => !prev.has(s));
      const toUnsubscribe = [...prev].filter((s) => !upperSymbols.has(s));

      toSubscribe.forEach((symbol) => {
        subscriptionQueueRef.current.push({ action: "subscribe", symbol });
      });
      toUnsubscribe.forEach((symbol) => {
        subscriptionQueueRef.current.push({ action: "unsubscribe", symbol });
      });

      subscribedSymbolsRef.current = upperSymbols;
      setTimeout(() => {
        if (!isProcessingQueue.current) {
          processSubscriptionQueue();
        }
      }, 200);
    },
    [processSubscriptionQueue]
  );

  return (
    <LivePriceContext.Provider value={{ livePrices, updateSymbols }}>
      {children}
    </LivePriceContext.Provider>
  );
}

export const useLivePriceContext = () => useContext(LivePriceContext);
