import React, { createContext, useEffect, useRef, useState } from "react";
import { executeOrder, FetchOrders } from "../hooks/api";
import { useLivePriceContext } from "./LivePriceContext";
import { isMarketOpen } from "../hooks/isMarketOpen";

export const OrdersContext = createContext();

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const { livePrices } = useLivePriceContext();
  const executingRef = useRef(new Set());

  useEffect(() => {
    const loadOrders = async () => {
      const res = await FetchOrders();
      setOrders(res.data);
    };
    loadOrders();
  }, []);

  useEffect(() => {
    if (!isMarketOpen()) return;

    const executeMatchingOrders = async () => {
      for (const order of orders) {
        if (order.executed || executingRef.current.has(order._id)) continue;

        const price = livePrices[order.name];
        if (!price) continue;

        const match =
          (order.mode === "BUY" && price <= order.price) ||
          (order.mode === "SELL" && price >= order.price);

        if (!match) continue;

        executingRef.current.add(order._id);
        try {
          const res = await executeOrder(order._id);
          setOrders((prev) =>
            prev.map((o) => (o._id === order._id ? res.data.order : o))
          );
        } catch (err) {
          console.error(`Failed to execute order ${order._id}`, err);
        } finally {
          executingRef.current.delete(order._id);
        }
      }
    };

    executeMatchingOrders();
  }, [livePrices, orders]);

  return (
    <OrdersContext.Provider value={{ orders, setOrders }}>
      {children}
    </OrdersContext.Provider>
  );
}
