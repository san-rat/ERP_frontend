import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { forecastingClient } from "../api/forecastingClient";
import { useAuth } from "../context/AuthContext";
import "./AnalyticsPage.css";

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({ message: null, status: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "totalRevenue", direction: "desc" });

  useEffect(() => {
    async function fetchForecastingData() {
      try {
        const result = await forecastingClient.getProductMetrics();
        setProducts(result?.products || []);
      } catch (err) {
        // Check if it's a permission error (403)
        setError({ 
          message: err.status === 403 ? "You do not have permission to view forecasting data." : "Could not load product metrics.",
          status: err.status 
        });
      } finally {
        setLoading(false);
      }
    }
    fetchForecastingData();
  }, []);

  // Calculated Metrics from Forecasting Data
  const totalRevenue = products.reduce((sum, p) => sum + (p.totalRevenue || 0), 0);
  const totalOrders = products.reduce((sum, p) => sum + (p.orderCount || 0), 0);

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
            <p className="analytics-stat">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="analytics-note">Aggregated revenue from {products.length} monitored products.</p>
          </section>
          <section className="analytics-card">
            <h2>Order Count</h2>
            <p className="analytics-stat">{totalOrders.toLocaleString()}</p>
            <p className="analytics-note">Total transaction volume for tracked items.</p>
          </section>
          <section className="analytics-card analytics-chart-card">
            <h2>Performance Snapshot</h2>
            <div className="analytics-chart-placeholder">Chart preview</div>
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
            ) : error.message ? (
              <div className="analytics-error-state">
                <p className="analytics-error-text">{error.message}</p>
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
                      <th onClick={() => requestSort("volatility")} className="sortable">Volatility</th>
                      <th>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedProducts.map((product) => (
                      <tr key={product.productId}>
                        <td className="analytics-td-main">{product.productName}</td>
                        <td className="analytics-td-mono">{product.sku}</td>
                        <td className="analytics-td-bold">${Number(product.totalRevenue).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td className="analytics-td-center">{product.totalUnitsSold}</td>
                        <td>${Number(product.avgUnitPrice).toFixed(2)}</td>
                        <td>
                          <span className={`analytics-volatility-tag ${product.volatility > 1 ? 'high' : 'low'}`}>
                            {(product.volatility * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="analytics-td-center">
                          {product.trendDirection > 0 ? (
                            <TrendingUp size={18} className="text-success" />
                          ) : product.trendDirection < 0 ? (
                            <TrendingDown size={18} className="text-error" />
                          ) : (
                            <Minus size={18} className="text-muted" />
                          )}
                        </td>
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
