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
  Bell,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { forecastingClient } from "../api/forecastingClient";
import { ordersClient } from "../api/ordersClient";
import AlertsMenu from "../components/common/AlertsMenu";
import "./HomePage.css";

/* ── Navigation items ── */
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: BarChart2, label: "Product Insights", active: false },
  { icon: Users, label: "Customer Insights", active: false },
];

const STATUS_CLASS = {
  DELIVERED: "hp-badge hp-badge--success",
  COMPLETED: "hp-badge hp-badge--success",
  PENDING: "hp-badge hp-badge--warning",
  CREATED: "hp-badge hp-badge--warning",
  PROCESSING: "hp-badge hp-badge--info",
  SHIPPED: "hp-badge hp-badge--info",
  CANCELLED: "hp-badge hp-badge--error",
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
    orders: [],
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
        let orders = [];

        // Calculate Revenue from Forecasting
        if (forecastRes.status === 'fulfilled') {
          const products = forecastRes.value?.products || forecastRes.value || [];
          revenue = products.reduce((sum, p) => sum + (p.totalRevenue || 0), 0);
        }

        // Calculate Customers from Orders
        if (ordersRes.status === 'fulfilled') {
          orders = ordersRes.value || [];
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
          orders: orders,
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
      navigate("/manager/analytics");
    }
    if (label === "Customer Insights") {
      navigate("/manager/customer-insights");
    }
  };

  // Get the last 5 orders
  const recentOrders = [...kpiData.orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

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
            <AlertsMenu />
            <div className="hp-user-chip">
              <div className="hp-user-avatar">
                {user?.email?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="hp-user-info">
                <span className="hp-user-email">{user?.email ?? "manager@company.com"}</span>
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
              <h1 className="hp-page-title">Manager Dashboard</h1>
              <p className="hp-page-sub">Welcome back {user?.email?.split("@")[0] ?? ""}</p>
            </div>
            <div className="hp-page-actions">
              <button className="hp-btn-secondary" onClick={() => navigate("/manager/analytics")}>Product Insights</button>
              <button className="hp-btn-secondary" onClick={() => navigate("/manager/customer-insights")}>Customer Insights</button>
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
              <button className="hp-btn-secondary" onClick={() => navigate("/manager/customer-insights")}>View all</button>
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
                  {recentOrders.map((row) => (
                    <tr key={row.id}>
                      <td className="hp-td-mono">{row.externalOrderId || row.id}</td>
                      <td>{row.customerId}</td>
                      <td>${Number(row.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td>
                        <span className={STATUS_CLASS[row.status?.toUpperCase()] || "hp-badge"}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {recentOrders.length === 0 && !kpiData.loading && (
                <div style={{ padding: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--ink-60)' }}>
                  No recent orders found.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}