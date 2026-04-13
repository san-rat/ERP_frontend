import { useState, useEffect, useRef } from "react";
import {
  Bell,
  X,
  CheckCheck,
  AlertTriangle,
  Package,
  RefreshCw,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";

// ─── Helpers ────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function StockBadge({ qty, threshold }) {
  const pct = Math.round((qty / threshold) * 100);
  const color =
    pct <= 25
      ? { bar: "#ef4444", bg: "#fef2f2", text: "#b91c1c" }
      : pct <= 50
      ? { bar: "#f59e0b", bg: "#fffbeb", text: "#b45309" }
      : { bar: "#10b981", bg: "#f0fdf4", text: "#047857" };
  return (
    <div
      style={{ background: color.bg }}
      className="mt-2 rounded-lg p-2 flex flex-col gap-1"
    >
      <div className="flex justify-between text-[11px] font-semibold" style={{ color: color.text }}>
        <span>Stock: {qty} / {threshold}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-black/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(pct, 100)}%`, background: color.bar }}
        />
      </div>
    </div>
  );
}

// ─── Notification Item ───────────────────────────────────────────────────────
function NotificationItem({ notification, role, onResolve }) {
  // Managers and Employees can resolve — Admin doesn't get stock alerts
  const canResolve = ["MANAGER", "EMPLOYEE"].includes(role?.toUpperCase());
  const [resolving, setResolving] = useState(false);

  const handleResolve = async () => {
    setResolving(true);
    await onResolve(notification.id);
  };

  return (
    <div
      className={`group relative px-4 py-3 border-b border-gray-100 transition-colors hover:bg-orange-50/40 ${
        !notification.read ? "bg-amber-50/60" : ""
      }`}
    >
      {/* Unread dot */}
      {!notification.read && (
        <span className="absolute left-2 top-4 w-1.5 h-1.5 rounded-full bg-orange-400" />
      )}

      <div className="flex gap-3 items-start ml-2">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
          <AlertTriangle size={15} className="text-amber-600" />
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-bold text-gray-800 leading-snug">{notification.title}</p>
            <span className="text-[10px] text-gray-400 whitespace-nowrap flex items-center gap-1 mt-0.5">
              <Clock size={10} />
              {timeAgo(notification.triggeredAt)}
            </span>
          </div>

          <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{notification.message}</p>

          <div className="flex items-center gap-1.5 mt-1.5">
            <Package size={10} className="text-gray-400" />
            <span className="text-[10px] text-gray-400 font-mono">SKU: {notification.sku}</span>
          </div>

          <StockBadge qty={notification.quantityAtAlert} threshold={notification.lowStockThreshold} />

          {canResolve && (
            <button
              onClick={handleResolve}
              disabled={resolving}
              className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50 transition-colors"
            >
              <CheckCircle2 size={13} />
              {resolving ? "Resolving…" : "Mark as Resolved"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Panel ─────────────────────────────────────────────────────────────
export default function NotificationPanel() {
  const { user } = useAuth();
  const { notifications, unreadCount, loading, markAllRead, resolveNotification, refresh } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const role = user?.role?.toUpperCase();

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open) markAllRead();
  };

  const isAdmin = role === "ADMIN";

  // Role-specific label & hint
  const roleLabel =
    isAdmin
      ? "Notification Centre"
      : role === "MANAGER"
      ? "Manager Alerts"
      : "Notifications";

  const roleHint =
    isAdmin
      ? "System activity will appear here"
      : role === "MANAGER"
      ? "Low stock alerts requiring your attention"
      : "Items needing attention in your workspace";

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        id="notification-bell-btn"
        onClick={handleOpen}
        aria-label="Open notifications"
        className="relative p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all duration-150"
      >
        <Bell size={20} className={unreadCount > 0 ? "animate-[wiggle_1s_ease-in-out]" : ""} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-bold border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-96 max-h-[540px] flex flex-col rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100]"
          style={{ background: "linear-gradient(180deg,#fff 0%,#fafafa 100%)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900">{roleLabel}</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">{roleHint}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={refresh}
                disabled={isAdmin}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40"
                title={isAdmin ? "Stock alerts not available for Admin" : "Refresh"}
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
              {notifications.length > 0 && (
                <button
                  onClick={markAllRead}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                  title="Mark all read"
                >
                  <CheckCheck size={14} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Count pill */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">
                <AlertTriangle size={10} />
                {notifications.length} Low Stock {notifications.length === 1 ? "Alert" : "Alerts"}
              </span>
              {unreadCount === 0 && (
                <span className="text-[10px] text-gray-400">All caught up ✓</span>
              )}
            </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <RefreshCw size={24} className="text-gray-300 animate-spin" />
                <p className="text-xs text-gray-400">Loading notifications…</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCheck size={22} className="text-emerald-400" />
                </div>
                {isAdmin ? (
                  <>
                    <p className="text-sm font-medium text-gray-500">No notifications yet</p>
                    <p className="text-xs text-gray-400 text-center px-4">Stock alerts go to Managers &amp; Employees. System events will appear here.</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-500">All clear!</p>
                    <p className="text-xs text-gray-400">No active stock alerts right now.</p>
                  </>
                )}
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  role={role}
                  onResolve={resolveNotification}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
            <p className="text-[10px] text-gray-400 text-center">
              Auto-refreshes every 60 seconds • {notifications.length} active alert{notifications.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
