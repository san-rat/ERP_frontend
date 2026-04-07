import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search } from "lucide-react";
import { forecastingClient } from "../api/forecastingClient";
import { ordersClient } from "../api/ordersClient";
import { useAuth } from "../context/AuthContext";
import "./AnalyticsPage.css";

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orderSummary, setOrderSummary] = useState(null);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [forecastError, setForecastError] = useState(null);
  const [orderError, setOrderError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "totalRevenue", direction: "desc" });

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setForecastError(null);
      setOrderError(false);

      try {
        const results = await Promise.allSettled([
          forecastingClient.getProductMetrics(),
          ordersClient.getAll(),
          ordersClient.getSummary()
        ]);

        const [forecastRes, ordersRes, summaryRes] = results;

        // Handle Forecasting Data
        if (forecastRes.status === 'fulfilled') {
          setProducts(forecastRes.value?.products || []);
        } else {
          setForecastError(forecastRes.reason?.status === 403 
            ? "Permission denied for product metrics." 
            : "Forecasting service unreachable.");
        }

        // Handle Orders Data (Independently)
        if (ordersRes.status === 'fulfilled') {
          const orders = ordersRes.value?.data || [];
          setCustomerCount(new Set(orders.map(o => o.customerId)).size);
        } else {
          setOrderError(true);
        }

        if (summaryRes.status === 'fulfilled') {
          setOrderSummary(summaryRes.value?.data || null);
        } else {
          setOrderError(true);
        }

      } catch (err) {
        setForecastError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  // Calculated Metrics from Forecasting Data
  const totalRevenue = products.reduce((sum, p) => sum + (p.totalRevenue || 0), 0);
  const activeOrders = (orderSummary?.pending || 0) + (orderSummary?.processing || 0) + (orderSummary?.shipped || 0);

  // Sorting and Filtering Logic
  const requestSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const processedProducts = useMemo(() => {
    let items = [...products];
    
    // Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      items = items.filter(p => 
        p.productName.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q)
      );
    }

    // Sort
    items.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return items;
  }, [products, searchTerm, sortConfig]);

  return (
    <div className="analytics-root">
      <div className="analytics-panel">
        <div className="analytics-header">
          <div>
            <h1>Analytics</h1>
            <p>Track business performance, revenue trends, and key metrics in one place.</p>
          </div>
          <button className="analytics-btn-secondary" onClick={() => navigate("/")}>Back to Dashboard</button>
        </div>

        <div className="analytics-user-banner">
          <p>
            Signed in as: <strong>{user?.email}</strong> 
            <span className="analytics-role-tag">{user?.role}</span>
          </p>
        </div>

        <div className="analytics-grid">
          <section className="analytics-card">
            <h2>Total Revenue</h2>
            {forecastError ? (
              <p className="analytics-error-sm">{forecastError}</p>
            ) : (
              <>
                <p className="analytics-stat">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="analytics-note">Aggregated revenue from product metrics.</p>
              </>
            )}
          </section>

          <section className="analytics-card">
            <h2>Active Orders</h2>
            <p className="analytics-stat">{orderError ? "N/A" : activeOrders.toLocaleString()}</p>
            <p className="analytics-note">{orderError ? "Order service unreachable." : "Total orders pending, processing, or shipped."}</p>
          </section>

          <section className="analytics-card">
            <h2>Total Customers</h2>
            <p className="analytics-stat">{orderError ? "N/A" : customerCount.toLocaleString()}</p>
            <p className="analytics-note">{orderError ? "Order service unreachable." : "Unique customers found in system."}</p>
          </section>

          <section className="analytics-card analytics-full-width">
            <div className="analytics-table-header">
              <h2>Product Performance Metrics</h2>
              <div className="analytics-search-wrap">
                <Search size={16} className="analytics-search-icon" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="analytics-search-input"
                />
              </div>
            </div>

            {loading ? (
              <p className="analytics-loading">Fetching forecasting data...</p>
            ) : forecastError ? (
              <div className="analytics-error-state">
                <p className="analytics-error-text">{forecastError}</p>
              </div>
            ) : (
              <div className="analytics-table-scroll">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th onClick={() => requestSort("productName")} className="sortable">Product</th>
                      <th onClick={() => requestSort("sku")} className="sortable">SKU</th>
                      <th onClick={() => requestSort("totalRevenue")} className="sortable">Revenue</th>
                      <th onClick={() => requestSort("totalUnitsSold")} className="sortable">Units Sold</th>
                      <th onClick={() => requestSort("avgUnitPrice")} className="sortable">Avg. Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedProducts.map((product) => (
                      <tr key={product.productId}>
                        <td className="analytics-td-main">
                          <Link to={`/analytics/${product.productId}`} className="analytics-product-link">
                            {product.productName}
                          </Link>
                        </td>
                        <td className="analytics-td-mono">{product.sku}</td>
                        <td className="analytics-td-bold">${Number(product.totalRevenue).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td className="analytics-td-center">{product.totalUnitsSold}</td>
                        <td>${Number(product.avgUnitPrice).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {processedProducts.length === 0 && (
                  <div className="analytics-empty-state">No products match your search.</div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
