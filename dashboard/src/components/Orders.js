import { useState, useEffect } from "react";
import axios from "axios";

const Orders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    const fetchAndMaybeDelete = async () => {
      try {
        const res = await axios.get("http://localhost:3002/orders",{
          withCredentials: true,
        });

        const now = new Date();
        const isAfter3_30PM =
          now.getHours() > 15 || (now.getHours() === 15 && now.getMinutes() >= 30);

        if (isAfter3_30PM) {
          // Auto-delete all orders after 3:30 PM
          await Promise.all(
            res.data.map((order) =>
              axios.delete(`http://localhost:3002/orders/delete/${order._id}`)
            )
          );
          setAllOrders([]); // Clear local state
        } else {
          setAllOrders(res.data); // Just load
        }
      } catch (error) {
        console.error("Error loading or deleting orders:", error);
      }
    };

    fetchAndMaybeDelete();
  }, []);

  // Manual cancel
  const handleCancel = async (id) => {
    try {
      await axios.delete(`http://localhost:3002/orders/delete/${id}`);
      setAllOrders((prev) => prev.filter((order) => order._id !== id));
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Failed to cancel order");
    }
  };

  return (
    <>
      <h3 className="title">Orders ({allOrders.length})</h3>
      <div className="order-table table-responsive">
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Qty.</th>
              <th scope="col">Price</th>
              <th scope="col">Mode</th>
            </tr>
          </thead>
          <tbody>
            {allOrders.map((stock) => (
              <tr
                key={stock._id}
                onMouseEnter={() => setHoveredRow(stock._id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td>
                  <div className="d-flex align-items-center">
                    <span>{stock.name}</span>
                    {hoveredRow === stock._id && (
                      <button
                        className="btn btn-danger btn-sm ms-3"
                        onClick={() => handleCancel(stock._id)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
                <td>{stock.qty}</td>
                <td>{stock.price}</td>
                <td>{stock.mode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Orders;
