import { createBrowserRouter, RouterProvider, Outlet, useNavigate, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage    from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import HomePage     from "./pages/HomePage.jsx";
import AdminRouteGuard from "./components/auth/AdminRouteGuard.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import AdminUsersPage from "./pages/admin/AdminUsersPage.jsx";

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
  if (user) return <Navigate to={user.role?.toUpperCase() === "ADMIN" ? "/admin" : "/"} replace />;
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
      }
    ]
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}