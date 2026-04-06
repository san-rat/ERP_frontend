import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function EmployeeRouteGuard() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || user.role?.toUpperCase() !== "EMPLOYEE") {
    // If not logged in or not an employee, redirect to login
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
