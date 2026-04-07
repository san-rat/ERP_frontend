import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  TrendingUp,
  TrendingDown,
  ChevronRight,
} from "lucide-react";
import "./HomePage.css";

/* ── Navigation items ── */
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: BarChart2, label: "Product Insights", active: false },
  { icon: Users, label: "Customer Insights", active: false },
];

/* ── KPI data ── */
const KPIS = [
  { label: "Total Revenue", value: "$84,320", change: "+12.4%", up: true },
  { label: "Active Orders", value: "1,248", change: "+8.1%", up: true },
  { label: "Total Customers", value: "5,610", change: "+3.7%", up: true },
  { label: "Pending Issues", value: "24", change: "-5.2%", up: false },
];

/* ── Recent orders ── */
const RECENT_ORDERS = [
  { id: "#ORD-0041", customer: "Nimal Perera", amount: "$1,200", status: "Completed" },
  { id: "#ORD-0042", customer: "Amara Silva", amount: "$450", status: "Pending" },
  { id: "#ORD-0043", customer: "Kasun Fernando", amount: "$3,100", status: "Processing" },
  { id: "#ORD-0044", customer: "Dilani Mendis", amount: "$720", status: "Completed" },
  { id: "#ORD-0045", customer: "Ruwan Bandara", amount: "$990", status: "Cancelled" },
];

const STATUS_CLASS = {
  Completed: "hp-badge hp-badge--success",
  Pending: "hp-badge hp-badge--warning",
  Processing: "hp-badge hp-badge--info",
  Cancelled: "hp-badge hp-badge--error",
};

export default function HomePage({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const navigate = useNavigate();

  const handleNavClick = (label) => {
    setActiveNav(label);
    setSidebarOpen(false);
    if (label === "Product Insights") {
      navigate("/analytics");
    }
  };

  return (
    <div className="hp-root">
      {/* ═══════════════ SIDEBAR ═══════════════ */}
      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div className="hp-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`hp-sidebar${sidebarOpen ? " hp-sidebar--open" : ""}`}>
        {/* Logo */}
        <div className="hp-sidebar-logo">
          <img src="/logo/logo.png" alt="InsightERP" className="hp-sidebar-logo-img" />
          <span className="hp-sidebar-logo-name">InsightERP</span>
          <button
            className="hp-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="hp-nav">
          {NAV_ITEMS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              className={`hp-nav-item${activeNav === label ? " hp-nav-item--active" : ""}`}
              onClick={() => handleNavClick(label)}
            >
              <Icon size={18} strokeWidth={1.75} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button className="hp-sidebar-logout" onClick={onLogout}>
          <LogOut size={17} strokeWidth={1.75} />
          <span>Log out</span>
        </button>
      </aside>

      {/* ═══════════════ MAIN ═══════════════ */}
      <div className="hp-main">
        {/* Topbar */}
        <header className="hp-topbar">
          <div className="hp-topbar-left">
            <button
              className="hp-hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div className="hp-topbar-brand">
              <img src="/logo/logo.png" alt="" className="hp-topbar-logo" />
              <span className="hp-topbar-name">InsightERP</span>
            </div>
          </div>
          <div className="hp-topbar-right">
            <button className="hp-topbar-icon" aria-label="Notifications">
              <Bell size={20} strokeWidth={1.75} />
              <span className="hp-notif-dot" />
            </button>
            <div className="hp-user-chip">
              <div className="hp-user-avatar">
                {user?.email?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="hp-user-info">
                <span className="hp-user-email">{user?.email ?? "user@company.com"}</span>
                <span className="hp-user-role">{user?.role ?? "Admin"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="hp-content">
          {/* Page header */}
          <div className="hp-page-header">
            <div>
              <h1 className="hp-page-title">Dashboard</h1>
              <p className="hp-page-sub">Welcome back, {user?.email?.split("@")[0] ?? "User"}</p>
            </div>
            <div className="hp-page-actions">
              <button className="hp-btn-secondary" onClick={() => navigate("/analytics")}>Product Insights</button>
              <button className="hp-btn-primary">
                New Order <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* KPI cards */}
          <div className="hp-kpi-grid">
            {KPIS.map((k) => (
              <div key={k.label} className="hp-kpi-card">
                <p className="hp-kpi-label">{k.label}</p>
                <p className="hp-kpi-value">{k.value}</p>
                <span className={`hp-kpi-change${k.up ? " hp-kpi-change--up" : " hp-kpi-change--down"}`}>
                  {k.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {k.change} vs last month
                </span>
              </div>
            ))}
          </div>

          {/* Recent orders table */}
          <div className="hp-section-card">
            <div className="hp-section-header">
              <h2 className="hp-section-title">Recent Orders</h2>
              <button className="hp-btn-secondary">View all</button>
            </div>

            <div className="hp-table-wrap">
              <table className="hp-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_ORDERS.map((row) => (
                    <tr key={row.id}>
                      <td className="hp-td-mono">{row.id}</td>
                      <td>{row.customer}</td>
                      <td>{row.amount}</td>
                      <td>
                        <span className={STATUS_CLASS[row.status]}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}