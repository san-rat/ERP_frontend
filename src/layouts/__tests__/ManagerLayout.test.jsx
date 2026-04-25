import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ManagerLayout from "../ManagerLayout.jsx";

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    user: { email: "manager@example.com" },
    logout: vi.fn(),
  }),
}));

vi.mock("../../components/common/NotificationPanel", () => ({
  default: () => <div>Notifications</div>,
}));

describe("ManagerLayout", () => {
  it("does not expose a broken product analytics sidebar link", () => {
    render(
      <MemoryRouter initialEntries={["/manager/analytics"]}>
        <Routes>
          <Route path="/manager" element={<ManagerLayout />}>
            <Route path="analytics" element={<div>Analytics Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "Product Insights" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Customer Insights" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Order History" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Product Analytics" })).not.toBeInTheDocument();
  });
});
