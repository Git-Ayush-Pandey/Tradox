import { useState, useEffect, useRef, useContext } from "react";
import { FetchOrders, deleteOrder, executeOrder } from "./hooks/api";
import useLivePrices from "../components/hooks/useLivePrices";
import GeneralContext from "../contexts/GeneralContext";

const Orders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [livePrices, setLivePrices] = useState({});
  const executingRef = useRef(new Set());
  const symbols = [...new Set(allOrders.map((o) => o.name))];
  const { openBuyWindow, openSellWindow } = useContext(GeneralContext);

  useLivePrices(symbols, (symbol, price) => {
    console.log(`Live price update for ${symbol}: ${price}`);
    setLivePrices((prev) => ({
      ...prev,
      [symbol]: price,
    }));
  });
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await FetchOrders();
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const isAfter1_30AM = hour > 1 || (hour === 1 && minute >= 30);

        if (isAfter1_30AM) {
          await Promise.all(
            res.data
              .filter((order) => !order.executed)
              .map((order) =>
                deleteOrder(order._id)
              )
          );
          setAllOrders([]);
        } else {
          setAllOrders(res.data);
        }
      } catch (err) {
        console.error("Error loading orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleCancel = async (id) => {
    try {
      await deleteOrder(id)

      setAllOrders((prev) => prev.filter((order) => order._id !== id));
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert("Failed to cancel order.");
    }
  };

  useEffect(() => {
    const checkAndExecuteOrders = async () => {
      console.log("🔍 Checking orders for execution...");
      for (const order of allOrders) {
        const livePrice = livePrices[order.name];
        if (!livePrice) {
          console.log(`⏳ Skipping ${order.name} — no live price yet`);
          continue;
        }
        if (executingRef.current.has(order._id)) {
          console.log(`⏳ Already processing → ${order.name}`);
          continue;
        }
        console.log(
          `🧮 Evaluating ${order.mode} order for ${order.name} → Order Price: ${order.price}, Live Price: ${livePrice}`
        );
        const shouldExecute =
          (order.mode === "BUY" && livePrice <= order.price) ||
          (order.mode === "SELL" && livePrice >= order.price);

        if (!shouldExecute) {
          console.log(`Not eligible yet → ${order.name}`);
          continue;
        }
        executingRef.current.add(order._id);
        try {
          const res = executeOrder(order._id);
          setAllOrders((prev) =>
            prev.map((o) => (o._id === order._id ? res.data.order : o))
          );
          console.log(
            `✅ Executed ${order.mode} order for ${order.name} at live price ${livePrice}`
          );
        } catch (err) {
          console.error(`Failed to execute order ${order._id}:`, err);
        } finally {
          executingRef.current.delete(order._id);
        }
      }
    };
    if (Object.keys(livePrices).length > 0 && allOrders.length > 0) {
      checkAndExecuteOrders();
    }
  }, [livePrices, allOrders]);

  if (loading) return <div className="text-center mt-4">Loading orders...</div>;
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
              <th>Price</th>
              <th>Mode</th>
              <th>Live</th>
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
                        {order.mode === "BUY" ? (
                          <button
                            className="btn btn-secondary btn-sm ms-2"
                            onClick={() =>
                              openBuyWindow(
                                { name: order.name, id: order.id },
                                order
                              )
                            }
                          >
                            Edit
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm ms-2"
                            onClick={() =>
                              openSellWindow(
                                { name: order.name, id: order.id },
                                order
                              )
                            }
                          >
                            Edit
                          </button>
                        )}

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
                <td>{order.price}</td>
                <td>{order.mode}</td>
                <td>{livePrices[order.name]?.toFixed(2) || "-"}</td>
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
