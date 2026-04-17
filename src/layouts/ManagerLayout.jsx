import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Menu, X, LogOut,
  BarChart2, Users,
  Briefcase
} from "lucide-react";
import NotificationPanel from "../components/common/NotificationPanel";

const NAV_ITEMS = [
  { icon: BarChart2,   label: "Analytics",        path: "/manager/analytics" },
  { icon: Users,       label: "Customer Insights", path: "/manager/customer-insights" },
];

export default function ManagerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#F0F4FF] flex flex-col md:flex-row font-sans text-[#1e2d4d]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-[#1e2d4d] text-white transform transition-transform duration-300 ease-in-out flex flex-col
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 bg-[#16233b]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Briefcase size={16} className="text-white" />
            </div>
            <span className="font-bold tracking-wide text-sm">Manager Portal</span>
          </div>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm
                  ${isActive ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-[#2a3f6b] hover:text-white"}
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} strokeWidth={2} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 bg-[#16233b]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
              {user?.email?.[0]?.toUpperCase() || "M"}
            </div>
            <div className="text-xs">
              <p className="font-semibold text-white truncate w-32">{user?.email || "Manager"}</p>
              <p className="text-gray-400">Manager</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium text-rose-300 bg-rose-900 bg-opacity-30 rounded-lg hover:bg-opacity-50 transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-indigo-100 flex items-center justify-between px-4 sm:px-6 z-50 sticky top-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-[#1e2d4d] hidden sm:block">
              Manager Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <NotificationPanel />
            <div className="h-8 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                {user?.email?.[0]?.toUpperCase() || "M"}
              </div>
              <div className="hidden md:block text-sm">
                <p className="font-semibold text-[#1e2d4d] leading-none mb-1">
                  {user?.email?.split("@")[0] || "Manager"}
                </p>
                <p className="text-xs text-gray-400 leading-none">Manager</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
