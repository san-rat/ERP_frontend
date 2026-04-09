import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Calendar, DollarSign, Package, BarChart3, Brain, RotateCcw, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { forecastingClient } from "../../api/forecastingClient";
import "./ProductAnalyticsPage.css";

export default function ProductAnalyticsPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ metrics: null, analysis: null, forecast: null, schedule: null });
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
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
          forecastingClient.getRetrainingSchedule(productId)
        ]);

        const [mRes, aRes, fRes, sRes] = results;

        if (mRes.status === 'rejected' && aRes.status === 'rejected') {
          throw new Error("Product data unavailable.");
        }

        setData({ 
          metrics: mRes.status === 'fulfilled' ? mRes.value : null, 
          analysis: aRes.status === 'fulfilled' ? aRes.value : null,
          forecast: fRes.status === 'fulfilled' ? fRes.value : null,
          schedule: sRes.status === 'fulfilled' ? sRes.value : null
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
      const newForecast = await forecastingClient.generateForecast(productId);
      setData(prev => ({ ...prev, forecast: newForecast }));
    } catch (err) {
      alert("Failed to generate forecast. Please ensure the service is running.");
    } finally {
      setGenerating(false);
    }
  };

  const handleRetrain = async () => {
    setRetraining(true);
    try {
      await forecastingClient.retrainModel(productId);
      // Refresh data after retraining
      const newForecast = await forecastingClient.generateForecast(productId);
      setData(prev => ({ ...prev, forecast: newForecast }));
    } catch (err) {
      alert("Model retraining initiated. Please refresh in a few minutes.");
    } finally {
      setRetraining(false);
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

          {/* Forecast Chart Section */}
          <section className="pa-card pa-chart-section">
            <div className="pa-card-header">
              <h2>30-Day Unit Demand Forecast</h2>
              <span className="pa-algo-tag">Algorithm: {forecast?.algorithm || 'Prophet'}</span>
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
                    {generating ? 'Generating...' : 'Generate Initial Forecast'}
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Retraining Control Card */}
          <section className="pa-card pa-retrain-card">
            <div className="pa-retrain-info">
              <div className="pa-icon-wrap"><Brain size={20} /></div>
              <div>
                <h2>AI Model Lifecycle</h2>
                <div className="pa-retrain-dates">
                  <span title="Last Generated At"><Clock size={14} /> Last Trained: {forecast?.generatedAt ? new Date(forecast.generatedAt).toLocaleString() : 'Never'}</span>
                  <span><Calendar size={14} /> Next Scheduled: {data.schedule?.nextRunDate ? new Date(data.schedule.nextRunDate).toLocaleDateString() : 'Weekly Sync'}</span>
                </div>
              </div>
            </div>
            <button 
              className={`pa-retrain-btn ${retraining ? 'loading' : ''}`} 
              onClick={handleRetrain}
              disabled={retraining}
            >
              <RotateCcw size={16} /> {retraining ? 'Processing...' : 'Retrain Model'}
            </button>
          </section>

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