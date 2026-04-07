import { useState, useEffect } from "react";
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
} from "lucide-react";
import { forecastingClient } from "../api/forecastingClient";
import { ordersClient } from "../api/ordersClient";
import "./HomePage.css";

/* ── Navigation items ── */
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: BarChart2, label: "Product Insights", active: false },
  { icon: Users, label: "Customer Insights", active: false },
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
  
  // KPI State
  const [kpiData, setKpiData] = useState({
    totalRevenue: 0,
    activeOrders: 0,
    totalCustomers: 0,
    loading: true
  });

  useEffect(() => {
    async function fetchKpis() {
      try {
        const results = await Promise.allSettled([
          forecastingClient.getProductMetrics(),
          ordersClient.getAll(),
          ordersClient.getSummary()
        ]);

        const [forecastRes, ordersRes, summaryRes] = results;

        let revenue = 0;
        let customers = 0;
        let active = 0;

        // Calculate Revenue from Forecasting
        if (forecastRes.status === 'fulfilled') {
          const products = forecastRes.value?.products || forecastRes.value || [];
          revenue = products.reduce((sum, p) => sum + (p.totalRevenue || 0), 0);
        }

        // Calculate Customers from Orders
        if (ordersRes.status === 'fulfilled') {
          const orders = ordersRes.value || [];
          customers = new Set(orders.map(o => o.customerId)).size;
        }

        // Calculate Active Orders from Summary
        if (summaryRes.status === 'fulfilled') {
          const summary = summaryRes.value || {};
          active = (summary.pending || 0) + (summary.processing || 0) + (summary.shipped || 0);
        }

        setKpiData({
          totalRevenue: revenue,
          activeOrders: active,
          totalCustomers: customers,
          loading: false
        });
      } catch (err) {
        console.error("Dashboard KPI fetch error:", err);
        setKpiData(prev => ({ ...prev, loading: false }));
      }
    }

    fetchKpis();
  }, []);

  const handleNavClick = (label) => {
    setActiveNav(label);
    setSidebarOpen(false);
    if (label === "Product Insights") {
      navigate("/analytics");
    }
    if (label === "Customer Insights") {
      navigate("/customer-insights");
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
              <button className="hp-btn-secondary" onClick={() => navigate("/customer-insights")}>Customer Insights</button>
            </div>
          </div>

          {/* KPI cards */}
          <div className="hp-kpi-grid">
            {/* Total Revenue Card */}
            <div className="hp-section-card">
              <div className="hp-section-header">
                <h2 className="hp-section-title">Total Revenue</h2>
              </div>
              <div className="hp-kpi-card" style={{ border: 'none', boxShadow: 'none' }}>
                <p className="hp-kpi-value">
                  {kpiData.loading ? "..." : `$${kpiData.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                </p>
                <span className="hp-kpi-change hp-kpi-change--up">Real-time data</span>
              </div>
            </div>

            {/* Active Orders Card */}
            <div className="hp-section-card">
              <div className="hp-section-header">
                <h2 className="hp-section-title">Active Orders</h2>
              </div>
              <div className="hp-kpi-card" style={{ border: 'none', boxShadow: 'none' }}>
                <p className="hp-kpi-value">
                  {kpiData.loading ? "..." : kpiData.activeOrders.toLocaleString()}
                </p>
                <span className="hp-kpi-change hp-kpi-change--up">Current queue</span>
              </div>
            </div>

            {/* Total Customers Card */}
            <div className="hp-section-card">
              <div className="hp-section-header">
                <h2 className="hp-section-title">Total Customers</h2>
              </div>
              <div className="hp-kpi-card" style={{ border: 'none', boxShadow: 'none' }}>
                <p className="hp-kpi-value">
                  {kpiData.loading ? "..." : kpiData.totalCustomers.toLocaleString()}
                </p>
                <span className="hp-kpi-change hp-kpi-change--up">Unique clients</span>
              </div>
            </div>
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