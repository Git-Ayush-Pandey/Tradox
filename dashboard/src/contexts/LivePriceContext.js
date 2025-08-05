
// Fixed LivePriceContext.js - Optimized subscription management

import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';

const LivePriceContext = createContext();

export function LivePriceProvider({ children }) {
  const [livePrices, setLivePrices] = useState({});
  const [subscribedSymbols, setSubscribedSymbols] = useState(new Set());
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const subscriptionQueueRef = useRef([]);
  const isProcessingQueue = useRef(false);

  // 🔥 DEBOUNCED SUBSCRIPTION PROCESSING
  const processSubscriptionQueue = useCallback(async () => {
    if (isProcessingQueue.current || subscriptionQueueRef.current.length === 0) {
      return;
    }

    isProcessingQueue.current = true;
    const socket = wsRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      isProcessingQueue.current = false;
      return;
    }

    // 🔥 BATCH PROCESS QUEUE
    const queue = [...subscriptionQueueRef.current];
    subscriptionQueueRef.current = [];

    try {
      // Group by action type
      const subscriptions = queue.filter(q => q.action === 'subscribe');
      const unsubscriptions = queue.filter(q => q.action === 'unsubscribe');

      // 🔥 SEND BATCHED SUBSCRIPTIONS
      if (subscriptions.length > 0) {
        const symbols = [...new Set(subscriptions.map(s => s.symbol))];
        symbols.forEach(symbol => {
          socket.send(JSON.stringify({ type: 'subscribe', symbol }));
        });
        console.log(`📡 Batched subscribe to ${symbols.length} symbols:`, symbols);
      }

      if (unsubscriptions.length > 0) {
        const symbols = [...new Set(unsubscriptions.map(s => s.symbol))];
        symbols.forEach(symbol => {
          socket.send(JSON.stringify({ type: 'unsubscribe', symbol }));
        });
        console.log(`❎ Batched unsubscribe from ${symbols.length} symbols:`, symbols);
      }

    } catch (error) {
      console.error('Error processing subscription queue:', error);
    }

    isProcessingQueue.current = false;
  }, []);

  // 🔥 CONNECT WEBSOCKET WITH RECONNECTION LOGIC
  const connectWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      const socket = new WebSocket('ws://localhost:3002');
      wsRef.current = socket;

      socket.onopen = () => {
        console.log("📡 WebSocket connected");

        // 🔥 RE-SUBSCRIBE TO EXISTING SYMBOLS
        subscribedSymbols.forEach((symbol) => {
          subscriptionQueueRef.current.push({ action: 'subscribe', symbol });
        });

        // Process queue after a short delay to batch subscriptions
        setTimeout(processSubscriptionQueue, 100);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data?.type === 'trade' && data?.data) {
            // 🔥 BATCH PRICE UPDATES
            const priceUpdates = {};
            data.data.forEach(({ s: symbol, p: price }) => {
              if (symbol && price) {
                priceUpdates[symbol] = price;
              }
            });

            if (Object.keys(priceUpdates).length > 0) {
              setLivePrices(prev => ({ ...prev, ...priceUpdates }));
            }
          }
        } catch (err) {
          console.error("Invalid WebSocket message:", event.data, err);
        }
      };

      socket.onclose = (event) => {
        console.log("🔌 WebSocket disconnected", event.code, event.reason);
        wsRef.current = null;

        // 🔥 RECONNECT AFTER DELAY (unless intentionally closed)
        if (event.code !== 1000) {
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
        }
      };

      socket.onerror = (err) => {
        console.error("❌ WebSocket error:", err);
      };

    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
    }
  }, [subscribedSymbols, processSubscriptionQueue]);

  // 🔥 CONNECT ON MOUNT
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, [connectWebSocket]);

  // 🔥 OPTIMIZED SYMBOL UPDATES
  const updateSymbols = useCallback((symbols) => {
    const newSet = new Set(symbols.filter(Boolean)); // Remove empty symbols

    // 🔥 SKIP IF NO CHANGES
    if (
      newSet.size === subscribedSymbols.size &&
      [...newSet].every(sym => subscribedSymbols.has(sym))
    ) {
      return;
    }

    const toSubscribe = [...newSet].filter((s) => !subscribedSymbols.has(s));
    const toUnsubscribe = [...subscribedSymbols].filter((s) => !newSet.has(s));

    // 🔥 QUEUE SUBSCRIPTION CHANGES
    toSubscribe.forEach(symbol => {
      subscriptionQueueRef.current.push({ action: 'subscribe', symbol });
    });

    toUnsubscribe.forEach(symbol => {
      subscriptionQueueRef.current.push({ action: 'unsubscribe', symbol });
    });

    setSubscribedSymbols(newSet);

    // 🔥 PROCESS QUEUE WITH DEBOUNCE
    setTimeout(processSubscriptionQueue, 200);
  }, [subscribedSymbols, processSubscriptionQueue]);

  const value = {
    livePrices,
    updateSymbols
  };

  return (
    <LivePriceContext.Provider value={value}>
      {children}
    </LivePriceContext.Provider>
  );
}

export const useLivePriceContext = () => useContext(LivePriceContext);
