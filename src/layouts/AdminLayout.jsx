import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, Users, LogOut, Shield } from "lucide-react";
import NotificationPanel from "../components/common/NotificationPanel";

export default function AdminLayout() {
  const { logout, user } = useAuth();
  
  return (
    <div className="flex bg-bg min-h-[100vh] text-ink font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-card flex flex-col justify-between hidden md:flex h-screen fixed">
        <div>
          <div className="flex items-center gap-2 px-6 h-16 border-b border-surface">
            <Shield className="text-primary" size={24} />
            <span className="font-bold text-lg">Admin Portal</span>
          </div>
          <nav className="p-4 space-y-2">
            <NavLink to="/admin" end className={({isActive}) => `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'text-ink hover:bg-surface'}`}>
              <LayoutDashboard size={20} /> Dashboard
            </NavLink>
            <NavLink to="/admin/users" className={({isActive}) => `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'text-ink hover:bg-surface'}`}>
              <Users size={20} /> Staff Management
            </NavLink>
          </nav>
        </div>
        
        {/* User / Logout */}
        <div className="p-4 border-t border-surface">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {user?.email?.[0]?.toUpperCase() ?? "A"}
              </div>
              <div className="text-sm">
                <p className="font-semibold truncate w-24">{user?.email || "Admin"}</p>
                <p className="text-xs opacity-70">Administrator</p>
              </div>
            </div>
            <button onClick={logout} className="p-2 hover:bg-danger-light hover:text-danger rounded-lg transition-colors" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-50 relative">
            <div className="flex items-center md:hidden">
              <Shield className="text-primary mr-2" size={24} />
              <span className="font-bold">Admin Portal</span>
            </div>
            
            {/* Right side stuff for all sizes */}
            <div className="flex items-center justify-end w-full md:w-auto ml-auto gap-4">
              <NotificationPanel />
            </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
