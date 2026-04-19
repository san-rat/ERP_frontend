import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, LogOut, BarChart2, Users } from "lucide-react";
import NotificationPanel from "../components/common/NotificationPanel";
import "../pages/HomePage.css";
import "./ManagerLayout.css";

const NAV_ITEMS = [
  { icon: BarChart2, label: "Product Insights", path: "/manager/analytics" },
  { icon: Users,     label: "Customer Insights", path: "/manager/customer-insights" },
];

export default function ManagerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="hp-root">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="hp-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`hp-sidebar${sidebarOpen ? " hp-sidebar--open" : ""}`}>
        {/* Logo */}
        <div className="hp-sidebar-logo">
          <img src="/logo/logo.png" alt="InsightERP" className="hp-sidebar-logo-img" />
          <span className="hp-sidebar-logo-name">InsightERP</span>
        </div>

        {/* Nav */}
        <nav className="hp-nav">
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `hp-nav-item${isActive ? " hp-nav-item--active" : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} strokeWidth={1.75} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button className="hp-sidebar-logout" onClick={logout}>
          <LogOut size={17} strokeWidth={1.75} />
          <span>Log out</span>
        </button>
      </aside>

      {/* Main */}
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
            <div className="ml-bell-wrap">
              <NotificationPanel />
            </div>
            <div className="hp-user-chip">
              <div className="hp-user-avatar">
                {user?.email?.[0]?.toUpperCase() ?? "M"}
              </div>
              <div className="hp-user-info">
                <span className="hp-user-email">{user?.email ?? "manager@company.com"}</span>
                <span className="hp-user-role">Manager</span>
              </div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: "2rem 2.5rem", overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
