import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { productsClient } from "../api/productsClient";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  const fetchAlerts = useCallback(async () => {
    // Low-stock alerts are only relevant to Manager and Employee
    const role = user?.role?.toUpperCase();
    if (!role || !["MANAGER", "EMPLOYEE"].includes(role)) return;

    try {
      setLoading(true);
      const data = await productsClient.getAlerts(true);
      const alerts = (data || []).map((a) => ({
        id: a.id,
        type: "low_stock",
        title: "Low Stock Alert",
        message: `${a.productName} is running low — only ${a.quantityAtAlert} units remaining (threshold: ${a.lowStockThreshold}).`,
        productName: a.productName,
        sku: a.sku,
        quantityAtAlert: a.quantityAtAlert,
        lowStockThreshold: a.lowStockThreshold,
        triggeredAt: a.triggeredAt,
        read: false,
      }));

      setNotifications(alerts);
      setUnreadCount(alerts.length);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchAlerts();
    intervalRef.current = setInterval(fetchAlerts, 60_000);
    return () => clearInterval(intervalRef.current);
  }, [user, fetchAlerts]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const resolveNotification = async (id) => {
    try {
      await productsClient.resolveAlert(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to resolve alert", err);
    }
  };

  const refresh = () => fetchAlerts();

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAllRead,
        resolveNotification,
        refresh,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
