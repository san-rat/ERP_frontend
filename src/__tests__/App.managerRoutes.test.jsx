import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("../context/AuthContext", () => ({
  AuthProvider: ({ children }) => <>{children}</>,
  useAuth: () => ({
    user: { role: "MANAGER", email: "manager@example.com" },
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock("../context/NotificationContext", () => ({
  NotificationProvider: ({ children }) => <>{children}</>,
}));

vi.mock("../components/auth/AdminRouteGuard.jsx", async () => {
  const { Outlet } = await import("react-router-dom");
  return { default: () => <Outlet /> };
});

vi.mock("../components/auth/EmployeeRouteGuard.jsx", async () => {
  const { Outlet } = await import("react-router-dom");
  return { default: () => <Outlet /> };
});

vi.mock("../components/auth/ManagerRouteGuard.jsx", async () => {
  const { Outlet } = await import("react-router-dom");
  return { default: () => <Outlet /> };
});

vi.mock("../layouts/AdminLayout.jsx", async () => {
  const { Outlet } = await import("react-router-dom");
  return { default: () => <Outlet /> };
});

vi.mock("../layouts/EmployeeLayout.jsx", async () => {
  const { Outlet } = await import("react-router-dom");
  return { default: () => <Outlet /> };
});

vi.mock("../layouts/ManagerLayout.jsx", async () => {
  const { Outlet } = await import("react-router-dom");
  return { default: () => <Outlet /> };
});

vi.mock("../pages/HomePage.jsx", () => ({
  default: () => <div>Home Page</div>,
}));

vi.mock("../pages/LoginPage.jsx", () => ({
  default: () => <div>Login Page</div>,
}));

vi.mock("../pages/RegisterPage.jsx", () => ({
  default: () => <div>Register Page</div>,
}));

vi.mock("../pages/admin/AdminDashboardPage.jsx", () => ({
  default: () => <div>Admin Dashboard</div>,
}));

vi.mock("../pages/admin/AdminUsersPage.jsx", () => ({
  default: () => <div>Admin Users</div>,
}));

vi.mock("../pages/employee/EmployeeOverviewPage.jsx", () => ({
  default: () => <div>Employee Overview</div>,
}));

vi.mock("../pages/employee/EmployeeOrdersPage.jsx", () => ({
  default: () => <div>Employee Orders</div>,
}));

vi.mock("../pages/employee/EmployeeProductsPage.jsx", () => ({
  default: () => <div>Employee Products</div>,
}));

vi.mock("../pages/employee/EmployeeInventoryPage.jsx", () => ({
  default: () => <div>Employee Inventory</div>,
}));

vi.mock("../pages/manager/AnalyticsPage.jsx", () => ({
  default: () => <div>Manager Analytics Page</div>,
}));

vi.mock("../pages/manager/ProductAnalyticsPage.jsx", () => ({
  default: () => <div>Manager Product Detail Page</div>,
}));

vi.mock("../pages/manager/CustomerInsightsPage.jsx", () => ({
  default: () => <div>Customer Insights Page</div>,
}));

vi.mock("../pages/manager/CustomerOrderHistoryPage.jsx", () => ({
  default: () => <div>Customer Order History Page</div>,
}));

describe("App manager routes", () => {
  beforeEach(() => {
    vi.resetModules();
    window.history.pushState({}, "", "/");
  });

  it("redirects bare manager product analytics URLs to the analytics page", async () => {
    window.history.pushState({}, "", "/manager/product-analytics");

    const { default: App } = await import("../App.jsx");

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Manager Analytics Page")).toBeInTheDocument();
    });
    expect(screen.queryByText("Manager Product Detail Page")).not.toBeInTheDocument();
  });
});
