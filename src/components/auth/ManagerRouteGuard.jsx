import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ManagerRouteGuard() {
  const { user, loading } = useAuth();

  if (loading) return null;

  const role = user?.role?.toUpperCase();
  if (!user || !["MANAGER", "ADMIN"].includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
