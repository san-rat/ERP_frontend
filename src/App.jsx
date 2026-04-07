import { createBrowserRouter, RouterProvider, Outlet, useNavigate, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage    from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import HomePage     from "./pages/HomePage.jsx";
import AdminRouteGuard from "./components/auth/AdminRouteGuard.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import AdminUsersPage from "./pages/admin/AdminUsersPage.jsx";
import EmployeeRouteGuard from "./components/auth/EmployeeRouteGuard.jsx";
import EmployeeLayout from "./layouts/EmployeeLayout.jsx";
import EmployeeOverviewPage from "./pages/employee/EmployeeOverviewPage.jsx";
import EmployeeOrdersPage from "./pages/employee/EmployeeOrdersPage.jsx";
import EmployeeProductsPage from "./pages/employee/EmployeeProductsPage.jsx";
import EmployeeInventoryPage from "./pages/employee/EmployeeInventoryPage.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import ProductAnalyticsPage from "./pages/ProductAnalyticsPage.jsx";
import CustomerInsightsPage from "./pages/CustomerInsightsPage.jsx";

const RootLayout = () => {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
};

// --- Route Wrappers ---
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
};

const HomeWrapper = () => {
  const { user, logout } = useAuth();
  return (
    <ProtectedRoute>
      <HomePage user={user} onLogout={logout} />
    </ProtectedRoute>
  );
};

const LoginWrapper = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  if (user) {
    const role = user.role?.toUpperCase();
    if (role === "ADMIN") return <Navigate to="/admin" replace />;
    if (role === "EMPLOYEE") return <Navigate to="/employee/overview" replace />;
    return <Navigate to="/" replace />;
  }
  return <LoginPage onLogin={login} onRegister={() => navigate("/register")} />;
};

const RegisterWrapper = () => {
  const navigate = useNavigate();
  return <RegisterPage onRegistered={() => navigate("/login")} onBackToLogin={() => navigate("/login")} />;
};

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <HomeWrapper /> },
      { path: "/analytics", element: <ProtectedRoute><AnalyticsPage /></ProtectedRoute> },
      { path: "/analytics/:productId", element: <ProtectedRoute><ProductAnalyticsPage /></ProtectedRoute> },
      { path: "/customer-insights", element: <ProtectedRoute><CustomerInsightsPage /></ProtectedRoute> },
      { path: "/login", element: <LoginWrapper /> },
      { path: "/register", element: <RegisterWrapper /> },
      {
        path: "/admin",
        element: <AdminRouteGuard />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashboardPage /> },
              { path: "users", element: <AdminUsersPage /> }
            ]
          }
        ]
      },
      {
        path: "/employee",
        element: <EmployeeRouteGuard />,
        children: [
          {
            element: <EmployeeLayout />,
            children: [
              { path: "overview", element: <EmployeeOverviewPage /> },
              { path: "orders", element: <EmployeeOrdersPage /> },
              { path: "products", element: <EmployeeProductsPage /> },
              { path: "inventory", element: <EmployeeInventoryPage /> }
            ]
          }
        ]
      }
    ]
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}