import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";
import { ordersClient } from "../api/ordersClient";
import { useAuth } from "../context/AuthContext";
import "./CustomerInsightsPage.css";

const STATUS_CLASS = {
  DELIVERED: "cip-badge--success",
  COMPLETED: "cip-badge--success",
  PENDING: "cip-badge--warning",
  CREATED: "cip-badge--warning",
  PROCESSING: "cip-badge--info",
  SHIPPED: "cip-badge--info",
  CANCELLED: "cip-badge--error",
};

export default function CustomerInsightsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const data = await ordersClient.getAll();
        setOrders(data || []);
      } catch (err) {
        setError("Failed to load customer order history.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    const q = searchTerm.toLowerCase();
    return orders.filter(o => 
      o.id.toLowerCase().includes(q) || 
      o.customerId.toLowerCase().includes(q) ||
      (o.externalOrderId && o.externalOrderId.toLowerCase().includes(q))
    );
  }, [orders, searchTerm]);

  if (loading) return <div className="cip-loading">Loading order data...</div>;

  return (
    <div className="cip-root">
      <div className="cip-container">
        <div className="cip-header">
          <button className="cip-back-btn" onClick={() => navigate("/")}>
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
          <h1>Customer Insights</h1>
          <p>Comprehensive overview of all customer transactions and order statuses.</p>
        </div>

        <div className="cip-stats-row">
          <div className="cip-stat-card">
            <label>Total Orders</label>
            <h3>{orders.length}</h3>
          </div>
          <div className="cip-stat-card">
            <label>Unique Customers</label>
            <h3>{new Set(orders.map(o => o.customerId)).size}</h3>
          </div>
        </div>

        <div className="cip-table-card">
          <div className="cip-table-header">
            <h2>Order History</h2>
            <div className="cip-search-wrap">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search by ID or Customer..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="cip-table-scroll">
            <table className="cip-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer ID</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="cip-td-mono">{order.externalOrderId || order.id}</td>
                    <td className="cip-td-mono">{order.customerId}</td>
                    <td className="cip-td-bold">${Number(order.totalAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`cip-badge ${STATUS_CLASS[order.status?.toUpperCase()] || ""}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="cip-empty">No matching orders found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}