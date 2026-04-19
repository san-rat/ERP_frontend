import { useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, AlertTriangle, TrendingDown, CheckCircle, BarChart3, Users } from "lucide-react";
import "./InfoPage.css";

export default function ChurnInfoPage() {
  const navigate = useNavigate();

  return (
    <div className="info-root">
      <button className="info-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Back
      </button>

      <header className="info-hero">
        <div className="info-hero-icon"><Brain size={28} /></div>
        <div>
          <h1>Churn Prediction Service</h1>
          <p>Answers: <em>"Which customers are likely to stop buying from us?"</em></p>
        </div>
      </header>

      {/* Overview */}
      <section className="info-card">
        <h2>What it is</h2>
        <p>
          The churn model uses <strong>ML.NET</strong> with an <strong>SdcaLogisticRegression</strong> algorithm —
          a machine learning model trained on historical customer order data. It learns patterns
          from past churned customers and scores new ones, outputting a probability between 0 and 1.
        </p>
      </section>

      {/* Pipeline */}
      <section className="info-card">
        <h2>How it works — step by step</h2>
        <div className="info-pipeline">
          <div className="info-step">
            <div className="info-step-num">1</div>
            <div>
              <strong>Feature extraction</strong>
              <p>Pulls five customer signals from the database for each customer:</p>
              <ul className="info-list">
                <li><strong>Recency</strong> — days since their last order</li>
                <li><strong>Cancellation Rate</strong> — % of orders they cancelled</li>
                <li><strong>Return Rate</strong> — % of orders they returned</li>
                <li><strong>Order Frequency</strong> — how often they order</li>
                <li><strong>Total Spend</strong> — lifetime revenue from that customer</li>
              </ul>
            </div>
          </div>
          <div className="info-step">
            <div className="info-step-num">2</div>
            <div>
              <strong>Normalisation</strong>
              <p>All five numbers are scaled to a 0–1 range so the algorithm can compare them fairly regardless of unit differences.</p>
            </div>
          </div>
          <div className="info-step">
            <div className="info-step-num">3</div>
            <div>
              <strong>Prediction</strong>
              <p>The trained model outputs a single <code>churnProbability</code> value between 0 and 1 for each customer.</p>
            </div>
          </div>
          <div className="info-step">
            <div className="info-step-num">4</div>
            <div>
              <strong>Risk classification</strong>
              <p>The probability is mapped to a label:</p>
              <div className="info-risk-table">
                <div className="info-risk-row info-risk-high">
                  <span className="info-risk-badge">HIGH</span>
                  <span>churnProbability ≥ 0.6 — very likely to leave</span>
                </div>
                <div className="info-risk-row info-risk-medium">
                  <span className="info-risk-badge">MEDIUM</span>
                  <span>churnProbability ≥ 0.3 — at risk</span>
                </div>
                <div className="info-risk-row info-risk-low">
                  <span className="info-risk-badge">LOW</span>
                  <span>churnProbability &lt; 0.3 — likely to stay</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key driver */}
      <section className="info-card info-card--accent">
        <div className="info-card-accent-header">
          <AlertTriangle size={18} />
          <h2>Biggest driver in your data</h2>
        </div>
        <p>
          <strong>Cancellation Rate</strong> is the dominant signal. Customers who cancel a high
          proportion of their orders score extremely high churn probability regardless of recency
          or other factors. A customer with a 75% cancellation rate will almost always be
          classified HIGH even if they ordered yesterday.
        </p>
      </section>

      {/* Top factors explained */}
      <section className="info-card">
        <h2>Understanding "Top Factors" in the results</h2>
        <p>
          Each prediction includes a <code>topFactors</code> array with a <code>weight</code> per factor.
          The weight represents how much that signal contributed to this specific customer's score.
          A weight of 0 means that factor had no influence. A high weight on Cancellation Rate
          means cancellations are why that customer is flagged as high risk.
        </p>
        <div className="info-example-box">
          <p className="info-example-label">Example reading:</p>
          <p>Customer with <strong>Cancellation Rate weight: 0.679</strong> → cancellations are driving nearly all of their churn score. Reducing cancellations (better fulfilment, inventory availability) is the actionable lever.</p>
        </div>
      </section>

      {/* Retraining */}
      <section className="info-card">
        <h2>Retraining the model</h2>
        <p>
          When you press <strong>"Run AI Risk Assessment"</strong>, the system first retrains the model
          on the latest order history (<code>POST /api/ml/retrain</code>), then immediately scores
          all customers (<code>POST /api/ml/churn/predict-all</code>). This ensures predictions
          always reflect the most recent data. Retraining typically completes in 2–5 seconds.
        </p>
      </section>
    </div>
  );
}
