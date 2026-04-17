import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate, Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Calendar, DollarSign, Package, BarChart3, ShoppingCart, Tag, Hash } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { forecastingClient } from "../../api/forecastingClient";
import AlertsMenu from "../../components/common/AlertsMenu";
import "./ProductAnalyticsPage.css";

export default function ProductAnalyticsPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  // Guard: if no productId in the URL, redirect before any API calls fire
  if (!productId) return <Navigate to="/manager/analytics" replace />;

  const [data, setData] = useState({ metrics: null, analysis: null, forecast: null, schedule: null });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.allSettled([
          forecastingClient.getSingleProductMetrics(productId),
          forecastingClient.getSingleProductAnalysis(productId),
          forecastingClient.getLatestForecast(productId),
        ]);

        const [mRes, aRes, fRes] = results;

        if (mRes.status === 'rejected' && aRes.status === 'rejected') {
          throw new Error("Product data unavailable.");
        }

        // Prefer cached bulk forecast from sessionStorage over per-product API result
        let forecast = fRes.status === 'fulfilled' ? fRes.value : null;
        try {
          const stored = sessionStorage.getItem("erp_all_forecasts");
          if (stored) {
            const allForecasts = JSON.parse(stored);
            const cached = allForecasts[productId];
            if (cached) {
              forecast = {
                algorithm: cached.algorithm,
                accuracy: cached.accuracy,
                forecasts: cached.next30Days,
              };
            }
          }
        } catch { /* ignore parse errors */ }

        setData({
          metrics: mRes.status === 'fulfilled' ? mRes.value : null,
          analysis: aRes.status === 'fulfilled' ? aRes.value : null,
          forecast,
          schedule: null
        });
      } catch (err) {
        setError("Failed to load product intelligence data.");
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [productId]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await forecastingClient.retrainModel();
      const response = await forecastingClient.getAllForecasts();
      if (response?.results) {
        const byProductId = {};
        response.results.forEach(r => { byProductId[r.productId] = r; });
        sessionStorage.setItem("erp_all_forecasts", JSON.stringify(byProductId));
        const cached = byProductId[productId];
        if (cached) {
          setData(prev => ({
            ...prev,
            forecast: { algorithm: cached.algorithm, accuracy: cached.accuracy, forecasts: cached.next30Days },
          }));
        }
      }
    } catch (err) {
      alert("Failed to generate forecast. Please ensure the service is running.");
    } finally {
      setGenerating(false);
    }
  };


  if (loading) return <div className="pa-loading">Analyzing product data...</div>;
  if (error) return <div className="pa-error">{error}</div>;

  const { metrics, analysis, forecast } = data;

  const chartData = forecast?.forecasts?.map(f => ({
    date: new Date(f.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    units: f.forecastedUnits
  })) || [];

  return (
    <div className="pa-root">
      <div className="pa-container">
        <button onClick={() => navigate("/manager/analytics")} className="pa-back">
          <ArrowLeft size={18} /> Back to Analytics
        </button>

        <header className="pa-header">
          <div className="pa-title-section">
            <span className="pa-sku-badge">{metrics?.sku}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <h1 style={{ margin: 0 }}>{metrics?.productName}</h1>
              <AlertsMenu />
            </div>
            <p>Intelligence report for the current forecasting period</p>
          </div>
          <div className="pa-status-badge" data-trend={analysis?.trend}>
            {analysis?.trend}
          </div>
        </header>

        <div className="pa-grid">
          {/* Primary Metrics Row */}
          <div className="pa-card pa-stat-card">
            <div className="pa-icon-wrap"><DollarSign size={20} /></div>
            <div className="pa-stat-info">
              <label>Total Revenue</label>
              <h3>${metrics?.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
            </div>
          </div>

          <div className="pa-card pa-stat-card">
            <div className="pa-icon-wrap"><Package size={20} /></div>
            <div className="pa-stat-info">
              <label>Units Sold</label>
              <h3>{metrics?.totalUnitsSold}</h3>
            </div>
          </div>

          <div className="pa-card pa-stat-card">
            <div className="pa-icon-wrap"><BarChart3 size={20} /></div>
            <div className="pa-stat-info">
              <label>Avg Daily Sales</label>
              <h3>{analysis?.avgDailySales?.toFixed(1)}</h3>
            </div>
          </div>

          <div className="pa-card pa-stat-card">
            <div className="pa-icon-wrap"><Tag size={20} /></div>
            <div className="pa-stat-info">
              <label>Current Price</label>
              <h3>${metrics?.currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
            </div>
          </div>

          <div className="pa-card pa-stat-card">
            <div className="pa-icon-wrap"><DollarSign size={20} /></div>
            <div className="pa-stat-info">
              <label>Avg Unit Price</label>
              <h3>${metrics?.avgUnitPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
            </div>
          </div>

          <div className="pa-card pa-stat-card">
            <div className="pa-icon-wrap"><ShoppingCart size={20} /></div>
            <div className="pa-stat-info">
              <label>Order Count</label>
              <h3>{metrics?.orderCount}</h3>
            </div>
          </div>

          <div className="pa-card pa-stat-card">
            <div className="pa-icon-wrap">
              {metrics?.trendDirection === 1
                ? <TrendingUp size={20} style={{ color: '#2e7d52' }} />
                : metrics?.trendDirection === -1
                  ? <TrendingDown size={20} style={{ color: '#c0392b' }} />
                  : <Minus size={20} style={{ color: '#9a6a00' }} />}
            </div>
            <div className="pa-stat-info">
              <label>Trend</label>
              <h3 style={{ color: metrics?.trendDirection === 1 ? '#2e7d52' : metrics?.trendDirection === -1 ? '#c0392b' : '#9a6a00' }}>
                {metrics?.trendDirection === 1 ? 'Upward' : metrics?.trendDirection === -1 ? 'Downward' : 'Stable'}
              </h3>
            </div>
          </div>


          <div className="pa-card pa-stat-card">
            <div className="pa-icon-wrap"><BarChart3 size={20} /></div>
            <div className="pa-stat-info">
              <label>Seasonality</label>
              <h3>{analysis?.seasonalPattern?.replace(/_/g, ' ') || '—'}</h3>
              <span className="pa-stat-sub">Index: {metrics?.seasonalityIndex?.toFixed(4)}</span>
            </div>
          </div>

          <div className="pa-card pa-stat-card">
            <div className="pa-icon-wrap"><Hash size={20} /></div>
            <div className="pa-stat-info">
              <label>Volatility</label>
              <h3>{(metrics?.volatility * 100).toFixed(1)}%</h3>
              <span className="pa-stat-sub">Std dev: {analysis?.standardDeviation?.toFixed(2)}</span>
            </div>
          </div>

          {/* Forecast Chart Section */}
          <section className="pa-card pa-chart-section">
            <div className="pa-card-header">
              <h2>30-Day Unit Demand Forecast</h2>
            </div>
            <div className="pa-chart-container">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" fontSize={12} tickMargin={10} />
                    <YAxis fontSize={12} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="units" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="pa-no-data">
                  <p>No forecast data available for this product yet.</p>
                  <button className="pa-generate-btn" onClick={handleGenerate} disabled={generating}>
                    {generating ? 'Retraining & Generating...' : 'Retrain & Generate Forecasts'}
                  </button>
                </div>
              )}
            </div>
          </section>



          {/* Timeline Section */}
          <section className="pa-card pa-timeline-card">
            <h2>Transaction Timeline</h2>
            <div className="pa-timeline-row">
              <div className="pa-timeline-item">
                <Calendar size={16} />
                <div>
                  <label>First Sale</label>
                  <p>{new Date(analysis?.firstSaleDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="pa-timeline-item">
                <TrendingUp size={16} />
                <div>
                  <label>Last Sale</label>
                  <p>{new Date(analysis?.lastSaleDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </section>
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
    </div>
  );
}