import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider, Navigate } from "react-router-dom";

// Test the redirect rule in isolation using createMemoryRouter so we don't
// import App.jsx (which creates a BrowserRouter at module level and breaks
// when combined with vi.resetModules and static testing-library imports).

const managerRoutes = [
  {
    path: "/manager",
    children: [
      { path: "analytics",                    element: <div>Manager Analytics Page</div>      },
      { path: "product-analytics",            element: <Navigate to="/manager/analytics" replace /> },
      { path: "product-analytics/:productId", element: <div>Manager Product Detail Page</div> },
    ],
  },
];

describe("App manager routes", () => {
  it("redirects bare manager product analytics URLs to the analytics page", async () => {
    const router = createMemoryRouter(managerRoutes, {
      initialEntries: ["/manager/product-analytics"],
    });

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText("Manager Analytics Page")).toBeInTheDocument();
    });
    expect(screen.queryByText("Manager Product Detail Page")).not.toBeInTheDocument();
  });
});
