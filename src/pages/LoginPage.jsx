import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "./LoginPage.css";

export default function LoginPage({ onLogin, onRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!username.trim()) e.username = "Username is required.";
    if (!password) e.password = "Password is required.";
    else if (password.length < 6) e.password = "Minimum 6 characters.";
    return e;
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Invalid credentials.");
      }
      const data = await res.json();
      // data = { token, role, userId, expiresAt }
      sessionStorage.setItem("erp_token", data.token);
      onLogin({ username, token: data.token, role: data.role });
    } catch (err) {
      setApiError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field) =>
    setErrors((prev) => ({ ...prev, [field]: "" }));

  return (
    <div className="lp-root">
      {/* ── Left brand panel ── */}
      <div className="lp-brand">
        <div className="lp-brand-top">
          <img src="/logo/logo.png" alt="InsightERP logo" className="lp-brand-logo" />
          <h1 className="lp-brand-name">InsightERP</h1>
          <p className="lp-brand-tagline">
            Enterprise Resource Planning — simplified for modern teams.
          </p>
        </div>

        <ul className="lp-brand-features">
          {[
            "Role-based access control",
            "Real-time dashboards & reports",
            "Secure JWT authentication",
            "Customer & order management",
          ].map((f) => (
            <li key={f} className="lp-brand-feature">
              <span className="lp-feature-dot" />
              {f}
            </li>
          ))}
        </ul>

        <p className="lp-brand-copy">© {new Date().getFullYear()} InsightERP</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="lp-form-panel">
        {/* Mobile logo — only shown < 1024px */}
        <div className="lp-mobile-logo">
          <img src="/logo/logo.png" alt="InsightERP" className="lp-mobile-logo-img" />
          <span className="lp-mobile-logo-name">InsightERP</span>
        </div>

        <div className="lp-card">
          <h2 className="lp-title">Welcome back</h2>
          <p className="lp-subtitle">Sign in to your account to continue</p>

          {/* API error banner */}
          {apiError && (
            <div className="lp-api-error" role="alert">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="lp-form">
            {/* Username */}
            <div className="lp-field">
              <label htmlFor="username" className="lp-label">
                Username <span className="lp-required">*</span>
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); clearError("username"); }}
                placeholder="e.g. admin"
                className={`lp-input${errors.username ? " lp-input--error" : ""}`}
                disabled={loading}
                aria-describedby={errors.username ? "username-err" : undefined}
              />
              {errors.username && (
                <span id="username-err" className="lp-field-error">{errors.username}</span>
              )}
            </div>

            {/* Password */}
            <div className="lp-field">
              <div className="lp-label-row">
                <label htmlFor="password" className="lp-label">
                  Password <span className="lp-required">*</span>
                </label>
                <a href="#" className="lp-forgot" tabIndex={loading ? -1 : 0}>
                  Forgot password?
                </a>
              </div>
              <div className="lp-pwd-wrap">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                  placeholder="••••••••"
                  className={`lp-input lp-input--pwd${errors.password ? " lp-input--error" : ""}`}
                  disabled={loading}
                  aria-describedby={errors.password ? "pwd-err" : undefined}
                />
                <button
                  type="button"
                  className="lp-pwd-toggle"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <span id="pwd-err" className="lp-field-error">{errors.password}</span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="lp-btn"
            >
              {loading ? (
                <>
                  <span className="lp-spinner" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="lp-help">
            Need help?{" "}
            <a href="mailto:support@insighterp.com" className="lp-help-link">
              Contact support
            </a>
          </p>

          {onRegister && (
            <p className="lp-register-text">
              Don't have an account?{" "}
              <button className="lp-register-link" onClick={onRegister}>
                Create account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}