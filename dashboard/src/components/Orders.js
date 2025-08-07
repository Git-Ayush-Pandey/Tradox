import { useState, useEffect, useRef, useContext, useMemo } from "react";
import { FetchOrders, deleteOrder, executeOrder, getQuote } from "../hooks/api";
import GeneralContext from "../contexts/GeneralContext";
import { isMarketOpen } from "../hooks/isMarketOpen";
import { useLivePriceContext } from "../contexts/LivePriceContext";

const enrichOrder = (order, livePrice, basePrice) => {
  const change = livePrice - basePrice;
  const percent = basePrice ? (change / basePrice) * 100 : 0;
  return {
    ...order,
    livePrice,
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

  const { openBuyWindow, openSellWindow, showAlert } = useContext(GeneralContext);
  const { livePrices, updateSymbols } = useLivePriceContext();

  const symbols = useMemo(
    () => [...new Set(allOrders.map((o) => o.name))],
    [allOrders]
  );
  const marketOpen = useMemo(() => isMarketOpen(), []);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await FetchOrders();

        if (!marketOpen) {
          const toDelete = res.data.filter((o) => !o.executed);
          await Promise.all(toDelete.map((o) => deleteOrder(o._id)));
          setAllOrders([]);
          showAlert("warning", "Market closed. Pending orders auto-cancelled.");
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
          return enrichOrder(
            order,
            found?.price ?? order.price,
            found?.basePrice ?? order.price
          );
        });

        setAllOrders(enriched);
        const upperSymbols = enriched.map((o) => o.name.toUpperCase());
        updateSymbols(upperSymbols);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        showAlert("error", "Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateSymbols, marketOpen]);

  useEffect(() => {
    if (!marketOpen) return;

    setAllOrders((prev) =>
      prev.map((order) => {
        const live = livePrices[order.name.toUpperCase()];
        if (!live) return order;
        return enrichOrder(order, live, order.basePrice);
      })
    );
  }, [livePrices, allOrders.length, marketOpen]);

  useEffect(() => {
    if (marketOpen && symbols.length > 0) {
      updateSymbols(symbols);
    }
  }, [symbols, updateSymbols, marketOpen]);

  useEffect(() => {
    if (!marketOpen) return;

    const executeMatchingOrders = async () => {
      for (const order of allOrders) {
        if (order.executed) {
          continue;
        }
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
          showAlert("success", `Order for ${order.name} executed.`);
        } catch (err) {
          console.error(`Failed to execute order ${order._id}`, err);
        } finally {
          executingRef.current.delete(order._id);
          showAlert("error", `Failed to execute ${order.name}.`);
        }
      }
    };

    executeMatchingOrders();
     // eslint-disable-next-line
  }, [livePrices, allOrders, marketOpen]);

  const handleCancel = async (id) => {
    try {
      await deleteOrder(id);
      setAllOrders((prev) => prev.filter((o) => o._id !== id));
      showAlert("success", "Order cancelled.");
    } catch (err) {
      console.error("Failed to cancel order", err);
      showAlert("error", "Failed to cancel order.");
    }
  };

  if (loading) return <div className="text-center mt-4">Loading orders...</div>;

  if (allOrders.length === 0)
    return (
      <div className="text-center mt-4 text-muted">No active orders found.</div>
    );

  return (
    <>
      <h3 className="title">Orders ({allOrders.length})</h3>
      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Qty</th>
              <th>Order Price</th>
              <th>Mode</th>
              <th>Current Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {allOrders.map((order) => {
              const rowPriceClass =
                order.mode === "BUY" &&
                livePrices[order.name.toUpperCase()] <= order.price
                  ? "profit"
                  : order.mode === "SELL" &&
                    livePrices[order.name.toUpperCase()] >= order.price
                  ? "loss"
                  : "";

              return (
                <tr
                  key={order._id}
                  onMouseEnter={() => setHoveredRow(order._id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="align-left" style={{ width: "200px" }}>
                    <div className="d-flex align-items-center justify-content-between">
                      <span
                        className="text-truncate"
                        style={{ maxWidth: "60px" }}
                      >
                        {order.name}
                      </span>
                      <div
                        className="d-flex gap-2"
                        style={{
                          visibility:
                            hoveredRow === order._id && !order.executed
                              ? "visible"
                              : "hidden",
                        }}
                      >
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() =>
                            order.mode === "BUY"
                              ? openBuyWindow(
                                  { name: order.name, id: order.id },
                                  order
                                )
                              : openSellWindow(
                                  { name: order.name, id: order.id },
                                  order
                                )
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancel(order._id)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </td>

                  <td>{order.qty}</td>
                  <td>{order.price.toFixed(2)}</td>
                  <td>{order.mode}</td>
                  <td className={rowPriceClass}>{order.livePrice.toFixed(2)}</td>
                  <td>
                    {order.executed ? (
                      <span className="profit" style={{fontSize:"20px"}}>Executed</span>
                    ) : (
                      <span style={{color:"orange", fontSize:"20px"}}>Pending</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Orders;
