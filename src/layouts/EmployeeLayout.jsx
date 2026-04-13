import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Menu, X, LogOut,
  LayoutDashboard, ShoppingCart, Package, Archive
} from "lucide-react";
import NotificationPanel from "../components/common/NotificationPanel";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", path: "/employee/overview" },
  { icon: ShoppingCart, label: "Orders", path: "/employee/orders" },
  { icon: Package, label: "Products", path: "/employee/products" },
  { icon: Archive, label: "Inventory", path: "/employee/inventory" },
];

export default function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5EFE7] flex flex-col md:flex-row font-sans text-[#213555]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-[#213555] text-[#F5EFE7] transform transition-transform duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 bg-[#1a2a44]">
          <div className="flex items-center gap-3">
            <img src="/logo/logo.png" alt="InsightERP" className="w-8 h-8 object-contain" />
            <span className="font-bold tracking-wide">InsightERP</span>
          </div>
          <button 
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium
                  ${isActive ? "bg-[#4F709C] text-white" : "text-gray-300 hover:bg-[#2a4365] hover:text-white"}
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} strokeWidth={2} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="p-4 bg-[#1a2a44]">
          <button 
            onClick={logout}
            className="flex flex-row items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium text-rose-300 bg-rose-900 bg-opacity-30 rounded-lg hover:bg-opacity-50 transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-[#D8C4B6] flex items-center justify-between px-4 sm:px-6 z-50 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-[#213555] hidden sm:block">Employee Workspace</h1>
          </div>

          <div className="flex items-center gap-4">
            <NotificationPanel />
            
            <div className="h-8 w-px bg-gray-200"></div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#4F709C] flex items-center justify-center text-white font-semibold text-sm">
                {user?.email?.[0]?.toUpperCase() || "E"}
              </div>
              <div className="hidden md:block text-sm">
                <p className="font-semibold text-[#213555] leading-none mb-1">
                  {user?.email?.split('@')[0] || "Employee"}
                </p>
                <p className="text-xs text-gray-500 leading-none">
                  {user?.role || "Employee"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
