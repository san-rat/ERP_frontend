import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { ordersClient } from "../../api/ordersClient";
import { useAuth } from "../../context/AuthContext";
import AlertsMenu from "../../components/common/AlertsMenu";
import "./CustomerOrderHistoryPage.css";

const STATUS_CLASS = {
  DELIVERED: "coh-badge--success",
  COMPLETED: "coh-badge--success",
  PENDING: "coh-badge--warning",
  CREATED: "coh-badge--warning",
  PROCESSING: "coh-badge--info",
  SHIPPED: "coh-badge--info",
  CANCELLED: "coh-badge--error",
};

export default function CustomerOrderHistoryPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const data = await ordersClient.getAll();
        setAllOrders(data || []);
      } catch (err) {
        if (err.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError("Failed to load customer order history.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const customerOrders = useMemo(() => {
    return allOrders.filter(order => order.customerId === customerId);
  }, [allOrders, customerId]);

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return customerOrders;
    const q = searchTerm.toLowerCase();
    return customerOrders.filter(o => 
      o.id.toLowerCase().includes(q) || 
      (o.externalOrderId && o.externalOrderId.toLowerCase().includes(q)) ||
      o.status.toLowerCase().includes(q)
    );
  }, [customerOrders, searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    return filteredOrders.slice(firstIndex, lastIndex);
  }, [filteredOrders, currentPage]);

  if (loading) return <div className="coh-loading">Loading order data...</div>;

  return (
    <div className="coh-root">
      <div className="coh-container">
        <div className="coh-header">
          <button className="coh-back-btn" onClick={() => navigate("/customer-insights")}>
            <ArrowLeft size={18} /> Back to Customer Insights
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <h1 style={{ margin: 0 }}>Order History for <span className="coh-customer-id">{customerId}</span></h1>
            <AlertsMenu />
          </div>
          <p>Detailed transaction history for this customer.</p>
          {error && <div className="coh-error-banner">{error}</div>}
        </div>

        <div className="coh-table-card">
          <div className="coh-table-header">
            <h2>All Orders</h2>
            <div className="coh-search-wrap">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search by Order ID or Status..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="coh-table-scroll">
            <table className="coh-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Product(s)</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="coh-td-mono">{order.externalOrderId || order.id}</td>
                    <td>
                      {order.items && order.items.length > 0 
                        ? order.items.map(i => i.productName).join(", ") 
                        : "No items listed"}
                    </td>
                    <td className="coh-td-bold">${Number(order.totalAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`coh-badge ${STATUS_CLASS[order.status?.toUpperCase()] || ""}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length === 0 && <div className="coh-empty">No matching orders found.</div>}
          </div>

          {totalPages > 1 && (
            <div className="coh-pagination">
              <button className="coh-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                <ChevronLeft size={16} />
              </button>
              <div className="coh-page-numbers">Page {currentPage} of {totalPages}</div>
              <button className="coh-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}