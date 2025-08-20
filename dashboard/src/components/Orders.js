import { useState, useEffect, useContext, useMemo } from "react";
import { getQuote, cancelOrder } from "../hooks/api";
import GeneralContext from "../contexts/GeneralContext";
import { isMarketOpen } from "../hooks/isMarketOpen";
import { useLivePriceContext } from "../contexts/LivePriceContext";
import { OrdersContext } from "../contexts/OrdersContext";

const enrichOrder = (order, livePrice, basePrice) => ({
  ...order,
  livePrice,
  basePrice,
});

const Orders = () => {
  const [displayOrders, setDisplayOrders] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [loading, setLoading] = useState(true);

  const { openBuyWindow, openSellWindow, showAlert } = useContext(GeneralContext);
  const { livePrices, subscribe, unsubscribe } = useLivePriceContext();
  const { orders, setOrders } = useContext(OrdersContext);
  const symbols = useMemo(() => [...new Set(orders.map((o) => o.name))], [orders]);
  const marketOpen = useMemo(() => isMarketOpen(), []);
  const componentId = "orders-" + Math.random().toString(36).slice(2);

  useEffect(() => {
    const enrichInitial = async () => {
      try {
        setLoading(true);
        const priceResults = await Promise.all(
          orders.map(async (o, idx) => {
            try {
              await new Promise((r) => setTimeout(r, idx * 80));
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

        const enriched = orders.map((order) => {
          const found = priceResults.find((p) => p.symbol === order.name);
          return enrichOrder(order, found?.price ?? order.price, found?.basePrice ?? order.price);
        });

        enriched.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
        setDisplayOrders(enriched);

        if (marketOpen && symbols.length > 0) {
          subscribe?.(componentId, symbols.map((s) => s.toUpperCase()));
        }
      } catch (err) {
        console.error("Failed to enrich orders:", err);
        showAlert("error", "Failed to load order prices.");
      } finally {
        setLoading(false);
      }
    };

    if (orders.length > 0) enrichInitial();
    else setLoading(false);

    return () => {
      unsubscribe?.(componentId);
    };
    // eslint-disable-next-line
  }, [orders, marketOpen]);

  // Live price updates
  useEffect(() => {
    if (!marketOpen) return;
    setDisplayOrders((prev) =>
      prev.map((order) => {
        const live =
          livePrices[order.name] ??
          livePrices[order.name?.toUpperCase?.()] ??
          livePrices[order.name?.toLowerCase?.()];
        if (!live) return order;
        return enrichOrder(order, live, order.basePrice);
      })
    );
  }, [livePrices, marketOpen]);

  // Closed market polling
  useEffect(() => {
    if (marketOpen) return;
    if (displayOrders.length === 0) return;

    let mounted = true;
    const fetchClosedPrices = async () => {
      try {
        const results = await Promise.all(
          displayOrders.map(async (o, idx) => {
            try {
              await new Promise((r) => setTimeout(r, idx * 80));
              const quote = await getQuote(o.name);
              return {
                symbol: o.name,
                price: quote.data?.c ?? o.livePrice ?? o.price,
                basePrice: quote.data?.pc ?? o.basePrice ?? o.price,
              };
            } catch {
              return {
                symbol: o.name,
                price: o.livePrice ?? o.price,
                basePrice: o.basePrice ?? o.price,
              };
            }
          })
        );

        if (!mounted) return;
        setDisplayOrders((prev) =>
          prev.map((o) => {
            const upd = results.find((r) => r.symbol === o.name);
            return upd ? enrichOrder(o, upd.price, upd.basePrice) : o;
          })
        );
      } catch (err) {
        console.error("Closed-market order price refresh failed", err);
      }
    };

    fetchClosedPrices();
    const id = setInterval(fetchClosedPrices, 60000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
    // eslint-disable-next-line
  }, [marketOpen]);

  const handleCancel = async (id) => {
    try {
      await cancelOrder(id);
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, cancelled: true } : o)));
      showAlert("success", "Order cancelled.");
    } catch (err) {
      console.error("Failed to cancel order", err);
      showAlert("error", "Failed to cancel order.");
    }
  };

  if (loading) return <div className="text-center mt-4">Loading orders...</div>;

  if (displayOrders.length === 0)
    return (
      <div className="no-orders">
        <div className="icon mt-4">📉</div>
        <p className="mt-5">No active orders found.</p>
      </div>
    );

  return (
    <>
      <h3 className="title">Orders ({displayOrders.length})</h3>
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
            {displayOrders.map((order) => {
              const rowPriceClass = (() => {
                if (!order.executed) return "";
                if (order.mode === "BUY") {
                  return order.livePrice >= order.price ? "profit" : "loss";
                }
                if (order.mode === "SELL") {
                  return order.livePrice <= order.price ? "profit" : "loss";
                }
                return "";
              })();

              return (
                <tr
                  key={order._id}
                  onMouseEnter={() => setHoveredRow(order._id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="align-left" style={{ width: "200px" }}>
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="text-truncate" style={{ maxWidth: "60px" }}>
                        {order.name}
                      </span>
                      <div
                        className="d-flex gap-2"
                        style={{
                          visibility:
                            hoveredRow === order._id && !order.executed && !order.cancelled
                              ? "visible"
                              : "hidden",
                        }}
                      >
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() =>
                            order.mode === "BUY"
                              ? openBuyWindow({ name: order.name, id: order.id }, order)
                              : openSellWindow({ name: order.name, id: order.id }, order)
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
                  <td className={rowPriceClass}>
                    {(order.livePrice ?? order.price).toFixed(2)}
                  </td>
                  <td>
                    {order.cancelled ? (
                      <span className="text-muted" style={{ fontSize: "20px" }}>
                        Cancelled
                      </span>
                    ) : order.executed ? (
                      <span className="profit" style={{ fontSize: "20px" }}>
                        Executed
                      </span>
                    ) : (
                      <span style={{ color: "orange", fontSize: "20px" }}>
                        Pending
                      </span>
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
