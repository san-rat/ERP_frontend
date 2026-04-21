import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Package, AlertTriangle, Play, CheckCircle } from "lucide-react";
import PageHeader from "../../components/employee/PageHeader";
import KpiCard from "../../components/employee/KpiCard";
import DataTable from "../../components/employee/DataTable";
import StatusBadge from "../../components/employee/StatusBadge";
import { ordersClient } from "../../api/ordersClient";
import { productsClient } from "../../api/productsClient";

export default function EmployeeOverviewPage() {
  const [orders, setOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const [ordersResult, stockResult] = await Promise.allSettled([
          ordersClient.getAll(),
          productsClient.getStock(),
        ]);

        if (active) {
          let nextError = null;

          if (ordersResult.status === "fulfilled") {
            setOrders(ordersResult.value || []);
          } else {
            setOrders([]);
            nextError = "Failed to load recent orders.";
          }

          if (stockResult.status === "fulfilled") {
            const lowStock = (stockResult.value || []).filter((item) => item.isLowStock);
            setLowStockProducts(lowStock);
          } else {
            setLowStockProducts([]);
            nextError = nextError
              ? "Failed to load recent orders and inventory alerts."
              : "Failed to load inventory alerts.";
          }

          setError(nextError);
        }
      } catch (err) {
        if (active) setError("Failed to load dashboard data.");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchData();
    return () => { active = false; };
  }, []);

  const createdCount = orders.filter(o => o.status?.toUpperCase() === "PENDING" || o.status?.toUpperCase() === "CREATED").length;
  const inProgressCount = orders.filter(o => o.status?.toUpperCase() === "PROCESSING").length;
  const shippedCount = orders.filter(o => o.status?.toUpperCase() === "SHIPPED").length;

  const orderColumns = [
    { title: "Order ID", key: "externalOrderId", render: (row) => <span className="font-mono text-xs">{row.externalOrderId || row.id}</span> },
    { title: "Customer ID", key: "customerId" },
    { title: "Amount", key: "totalAmount", render: (row) => `$${Number(row.totalAmount || 0).toFixed(2)}` },
    { title: "Status", key: "status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 8);

  const stockColumns = [
    { title: "SKU", key: "sku", render: (row) => <span className="font-mono text-xs text-gray-500">{row.sku}</span> },
    { title: "Product Name", key: "productName", render: (row) => <span className="font-medium text-[#213555]">{row.productName}</span> },
    { title: "Available", key: "quantityAvailable" },
    { title: "Threshold", key: "lowStockThreshold" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Overview" subtitle="Daily operational snapshot.">
        <Link 
          to="/employee/orders" 
          className="bg-[#4F709C] hover:bg-[#3d5a80] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Open Orders Queue
        </Link>
        <Link 
          to="/employee/products" 
          className="bg-white border border-[#4F709C] text-[#4F709C] hover:bg-[#F5EFE7] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Add Product
        </Link>
      </PageHeader>

      {error && (
        <div className="bg-rose-50 text-rose-800 p-4 rounded-lg border border-rose-200">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="New Orders" 
          value={loading ? "-" : createdCount} 
          icon={ShoppingCart} 
        />
        <KpiCard 
          title="In Progress" 
          value={loading ? "-" : inProgressCount} 
          icon={Play} 
        />
        <KpiCard 
          title="Shipped Items" 
          value={loading ? "-" : shippedCount} 
          icon={CheckCircle} 
        />
        <KpiCard 
          title="Low Stock Alerts" 
          value={loading ? "-" : lowStockProducts.length} 
          icon={AlertTriangle} 
          isAlert={lowStockProducts.length > 0} 
        />
      </div>

      {/* Main Data Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Orders */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#213555]">Recent Orders</h2>
            <Link to="/employee/orders" className="text-sm text-[#4F709C] hover:underline">View all orders</Link>
          </div>
          <DataTable 
            columns={orderColumns} 
            data={recentOrders} 
            loading={loading}
            emptyMessage="No recent orders found."
            onRowClick={(row) => navigate('/employee/orders?q=' + (row.externalOrderId || row.id))}
          />
        </div>

        {/* Right Column: Low Stock Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-rose-700 flex items-center gap-2">
              <AlertTriangle size={18} />
              Action Required
            </h2>
            <Link to="/employee/inventory" className="text-sm text-[#4F709C] hover:underline">View inventory</Link>
          </div>
          <DataTable 
            columns={stockColumns} 
            data={lowStockProducts.slice(0, 5)} 
            loading={loading}
            emptyMessage="All products are well stocked."
          />
        </div>
      </div>
    </div>
  );
}
