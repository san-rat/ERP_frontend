import { useState } from "react";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import "./RegisterPage.css";

const ROLES = ["Admin", "Manager", "Employee", "Customer"];

export default function RegisterPage({ onRegistered, onBackToLogin }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors]           = useState({});
  const [apiError, setApiError]       = useState("");
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);

  /* ── Helpers ── */
  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!form.firstName.trim())   e.firstName = "First name is required.";
    if (!form.lastName.trim())    e.lastName  = "Last name is required.";
    if (!form.email)              e.email     = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.role)               e.role      = "Please select a role.";
    if (!form.password)           e.password  = "Password is required.";
    else if (form.password.length < 8) e.password = "Minimum 8 characters.";
    else if (!/[A-Z]/.test(form.password)) e.password = "Include at least one uppercase letter.";
    else if (!/[0-9]/.test(form.password)) e.password = "Include at least one number.";
    if (!form.confirmPassword)    e.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match.";
    return e;
  };

  /* Password strength */
  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8)        s++;
    if (/[A-Z]/.test(p))      s++;
    if (/[0-9]/.test(p))      s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s; // 0–4
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthClass = ["", "rp-str--weak", "rp-str--fair", "rp-str--good", "rp-str--strong"][strength];

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      // ── Replace with real API call ──
      // const res = await fetch("http://localhost:5000/api/auth/register", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     firstName: form.firstName,
      //     lastName: form.lastName,
      //     email: form.email,
      //     role: form.role,
      //     password: form.password,
      //   }),
      // });
      // if (!res.ok) {
      //   const data = await res.json();
      //   throw new Error(data.message || "Registration failed.");
      // }

      // Temporary mock — remove when backend is ready
      await new Promise((r) => setTimeout(r, 1400));
      setSuccess(true);
      setTimeout(() => onRegistered?.(), 1800);
    } catch (err) {
      setApiError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Success screen ── */
  if (success) {
    return (
      <div className="rp-root rp-root--success">
        <div className="rp-success-card">
          <div className="rp-success-icon">✓</div>
          <h2 className="rp-success-title">Account Created!</h2>
          <p className="rp-success-sub">
            {form.firstName}, your account has been registered successfully.
            Redirecting to login…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rp-root">
      {/* Left brand panel */}
      <div className="rp-brand">
        <div className="rp-brand-top">
          <img src="/logo/logo.png" alt="InsightERP" className="rp-brand-logo" />
          <h1 className="rp-brand-name">InsightERP</h1>
          <p className="rp-brand-tagline">
            Create your account to access the full InsightERP platform.
          </p>
        </div>
        <ul className="rp-brand-list">
          {[
            "Secure role-based access",
            "Instant dashboard access",
            "Manage orders & customers",
            "Real-time analytics",
          ].map((f) => (
            <li key={f} className="rp-brand-item">
              <span className="rp-brand-dot" />
              {f}
            </li>
          ))}
        </ul>
        <p className="rp-brand-copy">© {new Date().getFullYear()} InsightERP</p>
      </div>

      {/* Right form panel */}
      <div className="rp-form-panel">
        {/* Mobile logo */}
        <div className="rp-mobile-logo">
          <img src="/logo/logo.png" alt="InsightERP" className="rp-mobile-logo-img" />
          <span className="rp-mobile-logo-name">InsightERP</span>
        </div>

        <div className="rp-card">
          <h2 className="rp-title">Create an account</h2>
          <p className="rp-subtitle">Fill in the details below to register</p>

          {apiError && (
            <div className="rp-api-error" role="alert">{apiError}</div>
          )}

          <form onSubmit={handleSubmit} noValidate className="rp-form">
            {/* Name row */}
            <div className="rp-row">
              <div className="rp-field">
                <label htmlFor="firstName" className="rp-label">
                  First name <span className="rp-required">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={set("firstName")}
                  placeholder="Nimal"
                  className={`rp-input${errors.firstName ? " rp-input--error" : ""}`}
                  disabled={loading}
                />
                {errors.firstName && <span className="rp-error">{errors.firstName}</span>}
              </div>
              <div className="rp-field">
                <label htmlFor="lastName" className="rp-label">
                  Last name <span className="rp-required">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  value={form.lastName}
                  onChange={set("lastName")}
                  placeholder="Perera"
                  className={`rp-input${errors.lastName ? " rp-input--error" : ""}`}
                  disabled={loading}
                />
                {errors.lastName && <span className="rp-error">{errors.lastName}</span>}
              </div>
            </div>

            {/* Email */}
            <div className="rp-field">
              <label htmlFor="reg-email" className="rp-label">
                Email address <span className="rp-required">*</span>
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@company.com"
                className={`rp-input${errors.email ? " rp-input--error" : ""}`}
                disabled={loading}
              />
              {errors.email && <span className="rp-error">{errors.email}</span>}
            </div>

            {/* Role */}
            <div className="rp-field">
              <label htmlFor="role" className="rp-label">
                Role <span className="rp-required">*</span>
              </label>
              <select
                id="role"
                value={form.role}
                onChange={set("role")}
                className={`rp-input rp-select${errors.role ? " rp-input--error" : ""}`}
                disabled={loading}
              >
                <option value="">Select a role…</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              {errors.role && <span className="rp-error">{errors.role}</span>}
            </div>

            {/* Password */}
            <div className="rp-field">
              <label htmlFor="reg-password" className="rp-label">
                Password <span className="rp-required">*</span>
              </label>
              <div className="rp-pwd-wrap">
                <input
                  id="reg-password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  className={`rp-input rp-input--pwd${errors.password ? " rp-input--error" : ""}`}
                  disabled={loading}
                />
                <button type="button" className="rp-pwd-toggle"
                  onClick={() => setShowPwd((v) => !v)} tabIndex={-1}
                  aria-label={showPwd ? "Hide" : "Show"}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Strength meter */}
              {form.password && (
                <div className="rp-strength">
                  <div className="rp-strength-bars">
                    {[1,2,3,4].map((n) => (
                      <span key={n} className={`rp-strength-bar${strength >= n ? ` ${strengthClass}` : ""}`} />
                    ))}
                  </div>
                  <span className={`rp-strength-label ${strengthClass}`}>{strengthLabel}</span>
                </div>
              )}
              {errors.password && <span className="rp-error">{errors.password}</span>}
            </div>

            {/* Confirm password */}
            <div className="rp-field">
              <label htmlFor="confirmPassword" className="rp-label">
                Confirm password <span className="rp-required">*</span>
              </label>
              <div className="rp-pwd-wrap">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  placeholder="Repeat your password"
                  className={`rp-input rp-input--pwd${errors.confirmPassword ? " rp-input--error" : ""}`}
                  disabled={loading}
                />
                <button type="button" className="rp-pwd-toggle"
                  onClick={() => setShowConfirm((v) => !v)} tabIndex={-1}
                  aria-label={showConfirm ? "Hide" : "Show"}>
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="rp-error">{errors.confirmPassword}</span>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="rp-btn">
              {loading ? (
                <><span className="rp-spinner" /> Creating account…</>
              ) : (
                <><UserPlus size={16} /> Create Account</>
              )}
            </button>
          </form>

          <p className="rp-login-link-text">
            Already have an account?{" "}
            <button className="rp-login-link" onClick={onBackToLogin}>
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}