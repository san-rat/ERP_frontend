import { useNavigate } from "react-router-dom";
import "./AnalyticsPage.css";

export default function AnalyticsPage() {
  const navigate = useNavigate();

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

        <div className="analytics-grid">
          <section className="analytics-card">
            <h2>Revenue Overview</h2>
            <p className="analytics-stat">$128,450</p>
            <p className="analytics-note">Revenue increased 14% over the last 30 days.</p>
          </section>
          <section className="analytics-card">
            <h2>Orders Processed</h2>
            <p className="analytics-stat">3,420</p>
            <p className="analytics-note">Order volume remains strong for the quarter.</p>
          </section>
          <section className="analytics-card analytics-chart-card">
            <h2>Performance Snapshot</h2>
            <div className="analytics-chart-placeholder">Chart preview</div>
          </section>
        </div>
      </div>
    </div>
  );
}
