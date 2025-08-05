import { useState, useEffect, useRef, useContext, useMemo } from "react";
import { FetchOrders, deleteOrder, executeOrder, getQuote } from "./hooks/api";
import GeneralContext from "../contexts/GeneralContext";
import { isMarketOpen } from "./hooks/isMarketOpen";
import { useLivePriceContext } from "../contexts/LivePriceContext";

// Enrich order with price + basePrice and status
const enrichOrder = (order, price, basePrice) => {
  const change = price - basePrice;
  const percent = basePrice ? (change / basePrice) * 100 : 0;
  return {
    ...order,
    price,
    basePrice,
    change: change.toFixed(2),
    percent: percent.toFixed(2),
    isDown: change < 0,
  };
};

const Orders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const executingRef = useRef(new Set());
  const { openBuyWindow, openSellWindow } = useContext(GeneralContext);

  const { livePrices, updateSymbols } = useLivePriceContext();

  const symbols = useMemo(
    () => [...new Set(allOrders.map((o) => o.name))],
    [allOrders]
  );

  // Initial load — fetch orders and enrich with API prices
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await FetchOrders();

        if (!isMarketOpen()) {
          const toDelete = res.data.filter((o) => !o.executed);
          await Promise.all(toDelete.map((o) => deleteOrder(o._id)));
          setAllOrders([]);
          return;
        }

        const rawOrders = res.data;
        const priceResults = await Promise.all(
          rawOrders.map(async (o) => {
            try {
              await new Promise((r) => setTimeout(r, 100));
              const quote = await getQuote(o.name);
              return {
                symbol: o.name,
                price: quote.data?.c ?? o.price,
                basePrice: quote.data?.pc ?? o.price,
              };
            } catch {
              return {
                symbol: o.name,
                price: o.price,
                basePrice: o.price,
              };
            }
          })
        );

        const enriched = rawOrders.map((order) => {
          const found = priceResults.find((p) => p.symbol === order.name);
          return enrichOrder(order, found?.price ?? order.price, found?.basePrice ?? order.price);
        });

        setAllOrders(enriched);
        updateSymbols(symbols);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [symbols, updateSymbols]);

  // Apply live prices if market is open
  useEffect(() => {
    if (!isMarketOpen() || allOrders.length === 0 || !livePrices) return;

    setAllOrders((prev) =>
      prev.map((order) => {
        const live = livePrices[order.name];
        if (!live) return order;
        return enrichOrder(order, live, order.basePrice);
      })
    );
  }, [livePrices, allOrders.length]);

  // Re-subscribe on symbols change
  useEffect(() => {
    if (isMarketOpen() && symbols.length > 0) {
      updateSymbols(symbols);
    }
  }, [symbols, updateSymbols]);

  // Order execution logic (live prices)
  useEffect(() => {
    if (!isMarketOpen()) return;

    const executeMatchingOrders = async () => {
      for (const order of allOrders) {
        if (executingRef.current.has(order._id)) continue;

        const price = livePrices[order.name];
        if (!price) continue;

        const match =
          (order.mode === "BUY" && price <= order.price) ||
          (order.mode === "SELL" && price >= order.price);

        if (!match) continue;

        executingRef.current.add(order._id);
        try {
          const res = await executeOrder(order._id);
          setAllOrders((prev) =>
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
  }, [livePrices, allOrders]);

  const handleCancel = async (id) => {
    try {
      await deleteOrder(id);
      setAllOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      console.error("Failed to cancel order", err);
    }
  };

  const getPriceClass = (order) => {
    const p = order.price;
    if (p == null) return "";
    if (order.mode === "BUY" && p <= order.price) return "text-success";
    if (order.mode === "SELL" && p >= order.price) return "text-danger";
    return "";
  };

  if (loading)
    return <div className="text-center mt-4">Loading orders...</div>;

  if (allOrders.length === 0)
    return (
      <div className="text-center mt-4 text-muted">No active orders found.</div>
    );

  return (
    <>
      <h3 className="title">Orders ({allOrders.length})</h3>
      <div className="order-table table-responsive">
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th>Name</th>
              <th>Qty</th>
              <th>Order Price</th>
              <th>Mode</th>
              <th>Current Price</th>
              <th>% Change</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {allOrders.map((order) => (
              <tr
                key={order._id}
                onMouseEnter={() => setHoveredRow(order._id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td>
                  <div className="d-flex align-items-center">
                    <span>{order.name}</span>
                    {hoveredRow === order._id && !order.executed && (
                      <>
                        <button
                          className="btn btn-secondary btn-sm ms-2"
                          onClick={() =>
                            order.mode === "BUY"
                              ? openBuyWindow({ name: order.name, id: order.id }, order)
                              : openSellWindow({ name: order.name, id: order.id }, order)
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm ms-2"
                          onClick={() => handleCancel(order._id)}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </td>
                <td>{order.qty}</td>
                <td>{order.price.toFixed(2)}</td>
                <td>{order.mode}</td>
                <td className={getPriceClass(order)}>
                  {order.price?.toFixed(2) ?? "-"}
                </td>
                <td className={order.isDown ? "text-danger" : "text-success"}>
                  {order.percent}%
                </td>
                <td>
                  {order.executed ? (
                    <span className="badge bg-success">Executed</span>
                  ) : (
                    <span className="badge bg-warning text-dark">Pending</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Orders;
