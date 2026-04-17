import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, TrendingUp, AlertTriangle, BookOpen, Activity } from "lucide-react";
import "./InfoPage.css";

export default function ForecastInfoPage() {
  const navigate = useNavigate();

  return (
    <div className="info-root">
      <button className="info-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Back
      </button>

      <header className="info-hero">
        <div className="info-hero-icon"><BarChart3 size={28} /></div>
        <div>
          <h1>Sales Forecast Service</h1>
          <p>Answers: <em>"How many units of each product will we sell in the next 7 / 30 days?"</em></p>
        </div>
      </header>

      {/* Overview */}
      <section className="info-card">
        <h2>What it is</h2>
        <p>
          The forecast service does <strong>time series forecasting</strong> — no ML training involved.
          It looks at historical daily sales figures and fits a mathematical curve to project future demand.
          It automatically selects the best algorithm per product based on the data pattern.
        </p>
        <div className="info-algo-table">
          <div className="info-algo-header">
            <span>Algorithm</span>
            <span>When it's selected</span>
          </div>
          <div className="info-algo-row">
            <span className="info-algo-tag">Exponential Smoothing (ETS)</span>
            <span>Steady sales with gradual trends</span>
          </div>
          <div className="info-algo-row">
            <span className="info-algo-tag">Linear Regression</span>
            <span>Clear upward or downward trend</span>
          </div>
          <div className="info-algo-row">
            <span className="info-algo-tag">SSA</span>
            <span>Seasonal or cyclical patterns</span>
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="info-card">
        <h2>Full pipeline — step by step</h2>
        <div className="info-pipeline">
          <div className="info-step">
            <div className="info-step-num">1</div>
            <div>
              <strong>Data retrieval</strong>
              <p>
                Fetches up to <strong>365 days</strong> of daily sales history per product.
                If a product has fewer than 3 days of real data, the service generates a
                synthetic baseline from its price:
              </p>
              <div className="info-price-table">
                <div className="info-price-row"><span>Price &gt; $500</span><span>0.3 units/day</span></div>
                <div className="info-price-row"><span>Price &gt; $100</span><span>1.0 unit/day</span></div>
                <div className="info-price-row"><span>Price &gt; $50</span><span>2.0 units/day</span></div>
                <div className="info-price-row"><span>Price &gt; $20</span><span>4.0 units/day</span></div>
                <div className="info-price-row"><span>Price &lt; $20</span><span>6.0 units/day</span></div>
              </div>
              <p className="info-note">This is why some forecasts look flat — they have no real order history yet and are running on the synthetic baseline.</p>
            </div>
          </div>

          <div className="info-step">
            <div className="info-step-num">2</div>
            <div>
              <strong>Exponential Smoothing (ETS) — the algorithm</strong>
              <p>The service applies exponential smoothing with <code>alpha = 0.3</code>:</p>
              <div className="info-formula-box">
                <code>smoothed[0] = actual[0]</code>
                <code>smoothed[i] = 0.3 × actual[i] + 0.7 × smoothed[i−1]</code>
              </div>
              <p>
                Each day's smoothed value is <strong>30% today's real sales</strong> + <strong>70% of the running average</strong>.
                This means the model reacts to recent changes but doesn't overreact to a single spike or dip.
                The last smoothed value becomes the base forecast for all future days, with a small ±5% sine
                wave variation added so the chart isn't completely flat.
              </p>
              <div className="info-example-box">
                <p className="info-example-label">Example:</p>
                <p>Day 1: 5 units → smoothed = <strong>5.0</strong></p>
                <p>Day 2: 1 unit → smoothed = 0.3×1 + 0.7×5.0 = <strong>3.8</strong> (not 1, history matters)</p>
                <p>Day 3: 8 units → smoothed = 0.3×8 + 0.7×3.8 = <strong>5.06</strong></p>
              </div>
            </div>
          </div>

          <div className="info-step">
            <div className="info-step-num">3</div>
            <div>
              <strong>Confidence intervals (minUnits / maxUnits)</strong>
              <p>The range around each forecast is calculated using standard statistics:</p>
              <div className="info-formula-box">
                <code>stdError = stdDev ÷ √(number of days)</code>
                <code>margin   = 1.96 × stdError</code>
                <code>minUnits = forecast − margin</code>
                <code>maxUnits = forecast + margin</code>
              </div>
              <p>
                <strong>1.96</strong> is the z-score that captures 95% of outcomes under a normal distribution.
                If your product has high volatility (large stdDev), the margin is wide and the min/max range
                will be far apart. If sales are consistent, the range is tight.
              </p>
            </div>
          </div>

          <div className="info-step">
            <div className="info-step-num">4</div>
            <div>
              <strong>Accuracy metrics — train/test split</strong>
              <p>
                The service splits historical data <strong>80% training / 20% test</strong>, runs the
                algorithm on the training portion, then checks its predictions against the test portion
                to produce accuracy scores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Accuracy metrics */}
      <section className="info-card">
        <h2>What the accuracy metrics mean</h2>
        <div className="info-metrics-grid">
          <div className="info-metric-card">
            <div className="info-metric-label">MAPE</div>
            <div className="info-metric-name">Mean Absolute Percentage Error</div>
            <p>Average of <code>|actual − predicted| / actual × 100</code>. On average, how wrong is the forecast as a percentage?</p>
            <div className="info-metric-scale">
              <span className="info-scale-good">8% → good</span>
              <span className="info-scale-bad">50% → poor</span>
            </div>
          </div>
          <div className="info-metric-card">
            <div className="info-metric-label">RMSE</div>
            <div className="info-metric-name">Root Mean Square Error</div>
            <p>The typical forecast error <em>in units</em>. If RMSE = 2.5 and you forecast 10 units, expect the real number to be roughly 10 ± 2.5. Large errors are penalised more than small ones.</p>
          </div>
          <div className="info-metric-card">
            <div className="info-metric-label">R²</div>
            <div className="info-metric-name">R-Squared</div>
            <p>How much of the sales variation does the model explain?</p>
            <div className="info-metric-scale">
              <span className="info-scale-good">0.91 → excellent (91% explained)</span>
              <span className="info-scale-bad">0.0 → no better than guessing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard metrics explained */}
      <section className="info-card">
        <h2>What your dashboard metrics mean</h2>
        <div className="info-def-list">
          <div className="info-def-row">
            <span className="info-def-term">Total Revenue</span>
            <span>Sum of all completed order values for this product</span>
          </div>
          <div className="info-def-row">
            <span className="info-def-term">Units Sold</span>
            <span>Total quantity sold across all orders</span>
          </div>
          <div className="info-def-row">
            <span className="info-def-term">Avg Daily Sales</span>
            <span>Units Sold ÷ number of days in the period</span>
          </div>
          <div className="info-def-row">
            <span className="info-def-term">Current Price</span>
            <span>The product's listed price right now</span>
          </div>
          <div className="info-def-row">
            <span className="info-def-term">Avg Unit Price</span>
            <span>Total Revenue ÷ Units Sold. Lower than Current Price if any orders had discounts or older prices</span>
          </div>
          <div className="info-def-row">
            <span className="info-def-term">Order Count</span>
            <span>Number of separate orders placed for this product</span>
          </div>
          <div className="info-def-row">
            <span className="info-def-term">Trend</span>
            <span>Compares avg of first 7 days vs last 7 days. &gt;+10% → Upward, &lt;−10% → Downward, else Stable</span>
          </div>
          <div className="info-def-row">
            <span className="info-def-term">Seasonality Index</span>
            <span>0 = no weekly pattern, 1 = strong weekly pattern. Compares variance of same weekdays across weeks</span>
          </div>
          <div className="info-def-row">
            <span className="info-def-term">Volatility</span>
            <span>Standard deviation of daily units sold over the last 90 days. High volatility = harder to forecast, wider min/max range</span>
          </div>
        </div>
      </section>

      {/* Volatility callout */}
      <section className="info-card info-card--accent">
        <div className="info-card-accent-header">
          <Activity size={18} />
          <h2>Why volatility matters most for forecasting</h2>
        </div>
        <p>
          Volatility directly controls the width of your confidence interval. A product with
          <strong> low volatility (&lt;30%)</strong> produces tight forecasts — the min and max units
          are close together, meaning the model is confident. A product with <strong>high volatility
          (80%+)</strong> produces wide forecasts — the model is saying <em>"we think ~1–2 units/day
          but it could easily be 0 or 4."</em> The forecast is mathematically correct; it is simply
          reflecting the reality that the product is inherently hard to predict.
        </p>
      </section>
    </div>
  );
}
