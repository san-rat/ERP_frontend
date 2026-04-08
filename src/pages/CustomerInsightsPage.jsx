import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowLeft, ChevronLeft, ChevronRight, BrainCircuit, RefreshCw } from "lucide-react";
import { ordersClient } from "../api/ordersClient";
import { mlClient } from "../api/mlClient";
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

const CHURN_STATUS_CLASS = {
  LOW: "cip-badge--success",
  MEDIUM: "cip-badge--warning",
  HIGH: "cip-badge--error",
  CRITICAL: "cip-badge--error",
  UNKNOWN: "cip-badge--info",
};

export default function CustomerInsightsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [churnPredictions, setChurnPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const data = await ordersClient.getAll();
        setOrders(data || []);
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

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    const q = searchTerm.toLowerCase();
    return orders.filter(o => 
      o.id.toLowerCase().includes(q) || 
      o.customerId.toLowerCase().includes(q) ||
      (o.externalOrderId && o.externalOrderId.toLowerCase().includes(q))
    );
  }, [orders, searchTerm]);

  const uniqueCustomerIds = useMemo(() => [...new Set(orders.map(o => o.customerId))], [orders]);

  const runChurnAnalysis = async () => {
    setAnalyzing(true);
    const newPredictions = { ...churnPredictions };
    try {
      // Parallel fetch for all unique customers
      await Promise.allSettled(uniqueCustomerIds.map(async (id) => {
        if (!newPredictions[id]) {
          const res = await mlClient.getChurnPrediction(id);
          if (res) newPredictions[id] = res;
        }
      }));
      setChurnPredictions(newPredictions);
    } catch (err) {
      console.error("Churn analysis failed:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    return filteredOrders.slice(firstIndex, lastIndex);
  }, [filteredOrders, currentPage]);

  const handlePageChange = (page) => setCurrentPage(page);

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
          {error && (
            <div className="cip-error-banner">
              {error} 
              {error.includes("expired") && <button onClick={logout} className="cip-inline-link">Log out now</button>}
            </div>
          )}
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

        <div className="cip-table-card cip-ml-section">
          <div className="cip-table-header">
            <div className="cip-title-with-icon">
              <BrainCircuit size={20} className="text-primary" />
              <h2>Customer Churn Analysis</h2>
            </div>
            <button 
              className="cip-analyze-btn" 
              onClick={runChurnAnalysis} 
              disabled={analyzing || uniqueCustomerIds.length === 0}
            >
              {analyzing ? <RefreshCw size={16} className="cip-spin" /> : "Run AI Risk Assessment"}
            </button>
          </div>
          <div className="cip-table-scroll" style={{maxHeight: '300px'}}>
            <table className="cip-table">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Risk Status</th>
                  <th>Churn Probability</th>
                  <th>Model Version</th>
                  <th>Last Assessment</th>
                </tr>
              </thead>
              <tbody>
                {uniqueCustomerIds.map(id => {
                  const pred = churnPredictions[id];
                  return (
                    <tr key={id}>
                      <td className="cip-td-mono">{id}</td>
                      <td>
                        <span className={`cip-badge ${CHURN_STATUS_CLASS[pred?.churnRiskLabel] || "cip-badge--info"}`}>
                          {pred?.churnRiskLabel || "NOT ANALYZED"}
                        </span>
                      </td>
                      <td className="cip-td-bold">
                        {pred ? `${(pred.churnProbability * 100).toFixed(1)}%` : "--"}
                      </td>
                      <td>{pred?.modelVersion || "--"}</td>
                      <td className="cip-td-mono">
                        {pred ? new Date(pred.predictedAt).toLocaleString() : "Never"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {uniqueCustomerIds.length === 0 && (
              <div className="cip-empty">No customers available for analysis.</div>
            )}
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
                {paginatedOrders.map((order) => (
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

          {totalPages > 1 && (
            <div className="cip-pagination">
              <button 
                className="cip-page-btn" 
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              <div className="cip-page-numbers">
                Page {currentPage} of {totalPages}
              </div>
              <button 
                className="cip-page-btn" 
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}