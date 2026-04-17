import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, ArrowLeft, RefreshCw } from "lucide-react";
import { forecastingClient } from "../../api/forecastingClient";
import { ordersClient } from "../../api/ordersClient";
import { useAuth } from "../../context/AuthContext";
import AlertsMenu from "../../components/common/AlertsMenu";
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
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);

  const handleGenerateAllForecasts = async () => {
    setGenerating(true);
    setGenerateError(null);
    try {
      const response = await forecastingClient.getAllForecasts();
      if (response?.results) {
        const byProductId = {};
        response.results.forEach(r => { byProductId[r.productId] = r; });
        sessionStorage.setItem("erp_all_forecasts", JSON.stringify(byProductId));
      }
    } catch (err) {
      setGenerateError("Failed to generate forecasts. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

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
          // Forecasting API returns { products: [...], count: X }
          const data = forecastRes.value;
          setProducts(data?.products || data || []);
        } else {
          setForecastError(forecastRes.reason?.status === 403 
            ? "Permission denied for product metrics." 
            : "Forecasting service unreachable.");
        }

        // Handle Orders Data (apiUtils usually unwraps the .data envelope)
        if (ordersRes.status === 'fulfilled') {
          const orders = ordersRes.value || [];
          setCustomerCount(new Set(orders.map(o => o.customerId)).size);
        } else {
          setOrderError(true);
        }

        if (summaryRes.status === 'fulfilled') {
          setOrderSummary(summaryRes.value || null);
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
          <button className="analytics-back-btn" onClick={() => navigate("/")}>
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <h1 style={{ margin: 0 }}>Product Insights</h1>
            <AlertsMenu />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button
              className="analytics-generate-btn"
              onClick={handleGenerateAllForecasts}
              disabled={generating}
            >
              <RefreshCw size={15} className={generating ? "analytics-spin" : ""} />
              {generating ? "Generating..." : "Retrain & Generate All Forecasts"}
            </button>
            {generateError && <span className="analytics-error-text">{generateError}</span>}
          </div>
        </div>

        <div className="analytics-grid">
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
                          {product.productId ? (
                            <Link to={`/manager/product-analytics/${product.productId}`} className="analytics-product-link">
                              {product.productName}
                            </Link>
                          ) : (
                            <span className="analytics-product-link" style={{ cursor: "default", opacity: 0.5 }} title="Product ID unavailable">
                              {product.productName}
                            </span>
                          )}
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

      <div style={{ marginTop: "2rem", textAlign: "center", paddingTop: "1.5rem", borderTop: "1px solid var(--ink-10)" }}>
        <Link
          to="/manager/about/forecast"
          style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}
        >
          How does the sales forecast model work? →
        </Link>
      </div>
    </div>
  );
}
