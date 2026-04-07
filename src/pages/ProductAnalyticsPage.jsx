import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Calendar, DollarSign, Package, BarChart3 } from "lucide-react";
import { forecastingClient } from "../api/forecastingClient";
import "./ProductAnalyticsPage.css";

export default function ProductAnalyticsPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ metrics: null, analysis: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.allSettled([
          forecastingClient.getSingleProductMetrics(productId),
          forecastingClient.getSingleProductAnalysis(productId)
        ]);

        const [mRes, aRes] = results;

        if (mRes.status === 'rejected' && aRes.status === 'rejected') {
          throw new Error("Product data unavailable.");
        }

        setData({ 
          metrics: mRes.status === 'fulfilled' ? mRes.value : null, 
          analysis: aRes.status === 'fulfilled' ? aRes.value : null 
        });
      } catch (err) {
        setError("Failed to load product intelligence data.");
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [productId]);

  if (loading) return <div className="pa-loading">Analyzing product data...</div>;
  if (error) return <div className="pa-error">{error}</div>;

  const { metrics, analysis } = data;

  return (
    <div className="pa-root">
      <div className="pa-container">
        <button onClick={() => navigate("/analytics")} className="pa-back">
          <ArrowLeft size={18} /> Back to Analytics
        </button>

        <header className="pa-header">
          <div className="pa-title-section">
            <span className="pa-sku-badge">{metrics?.sku}</span>
            <h1>{metrics?.productName}</h1>
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

          {/* Intelligence Section */}
          <section className="pa-intelligence-section">
            <h2>Sales Intelligence</h2>
            <div className="pa-intel-grid">
              <div className="pa-intel-card">
                <label>Growth Rate</label>
                <div className={`pa-value ${analysis?.growthRate > 0 ? 'pos' : ''}`}>
                  {analysis?.growthRate > 0 && '+'}{(analysis?.growthRate * 100).toFixed(1)}%
                </div>
                <p>Period-over-period performance</p>
              </div>
              <div className="pa-intel-card">
                <label>Seasonality</label>
                <div className="pa-value">{analysis?.seasonalPattern?.replace('_', ' ')}</div>
                <p>Based on index: {metrics?.seasonalityIndex}</p>
              </div>
              <div className="pa-intel-card">
                <label>Volatility</label>
                <div className="pa-value">{(metrics?.volatility * 100).toFixed(1)}%</div>
                <p>Standard deviation: {analysis?.standardDeviation}</p>
              </div>
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
      </div>
    </div>
  );
}