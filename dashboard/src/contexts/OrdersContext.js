import React, {
  createContext,
  useEffect,
  useRef,
  useState,
  useContext,
} from "react";
import { executeOrder, FetchOrders } from "../hooks/api";
import { useLivePriceContext } from "./LivePriceContext";
import { isMarketOpen } from "../hooks/isMarketOpen";
import GeneralContext from "./GeneralContext";

export const OrdersContext = createContext();

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const { livePrices } = useLivePriceContext();
  const { showAlert, refreshData, refreshFunds } = useContext(GeneralContext);
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
      let executedAny = false;
      for (const order of orders) {
        if (order.executed || executingRef.current.has(order._id)) continue;

        const price =
          livePrices[order.name] ??
          livePrices[order.name?.toUpperCase?.()] ??
          livePrices[order.name?.toLowerCase?.()];
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
          executedAny = true;
          showAlert?.("success", `Order for ${order.name} executed.`);
        } catch (err) {
          console.error(`Failed to execute order ${order._id}`, err);
          showAlert?.("error", `Failed to execute order for ${order.name}.`);
        } finally {
          executingRef.current.delete(order._id);
        }
      }
      if (executedAny) {
        await refreshFunds();
        await refreshData();
      }
    };

    executeMatchingOrders();
    // eslint-disable-next-line
  }, [livePrices, orders, showAlert]);

  const fetchOrder = async () => {
      try {
        const res = await FetchOrders();
        setOrders(res.data || []);
      } catch (err) {
        console.error("Failed to refresh Orders:", err);
      }
    };

  const refreshOrders = async () => {
    await fetchOrder();
  };

  return (
    <OrdersContext.Provider value={{ orders, setOrders, refreshOrders }}>
      {children}
    </OrdersContext.Provider>
  );
}
