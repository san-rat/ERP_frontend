import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, RefreshCw, X, AlertTriangle } from "lucide-react";
import PageHeader from "../../components/employee/PageHeader";
import DataTable from "../../components/employee/DataTable";
import StatusBadge from "../../components/employee/StatusBadge";
import { ordersClient } from "../../api/ordersClient";

export default function EmployeeOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qStr = searchParams.get("q") || "";
  const statusFilter = searchParams.get("status") || "ALL";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refetching, setRefetching] = useState(false);

  // Selected Order for Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Transition State
  const [transitioning, setTransitioning] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const fetchOrders = async (isRefetch = false) => {
    try {
      if (isRefetch) setRefetching(true);
      else setLoading(true);
      setError(null);
      const data = await ordersClient.getAll();
      setOrders(data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch orders.");
    } finally {
      setLoading(false);
      setRefetching(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus, reason = null) => {
    try {
      setTransitioning(true);
      setError(null);
      
      const payload = { status: newStatus };
      if (reason) payload.cancellationReason = reason;

      const updated = await ordersClient.updateStatus(orderId, payload);
      
      // Update local state instead of doing full refetch for better UX, or just refetch.
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, ...updated });
      }
      
      if (newStatus === "CANCELLED") {
        setCancelModalOpen(false);
        setCancelReason("");
      }
    } catch (err) {
      alert(`Error updating order: ${err.message}`);
    } finally {
      setTransitioning(false);
    }
  };

  // Client-side filtering
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Status match
      if (statusFilter !== "ALL" && o.status?.toUpperCase() !== statusFilter) {
        return false;
      }
      // Query match (Search by externalOrderId or customerId)
      if (qStr) {
        const query = qStr.toLowerCase();
        const extMatch = o.externalOrderId?.toLowerCase().includes(query);
        const cstMatch = o.customerId?.toLowerCase().includes(query);
        if (!extMatch && !cstMatch) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [orders, qStr, statusFilter]);

  const updateSearchParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (!value || value === "ALL") {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    setSearchParams(nextParams);
  };

  const columns = [
    { title: "Order ID", key: "externalOrderId", render: (r) => <span className="font-mono text-xs">{r.externalOrderId || r.id}</span> },
    { title: "Customer ID", key: "customerId", render: (r) => <span className="font-mono text-xs text-gray-500">{r.customerId}</span> },
    { title: "Amount", key: "totalAmount", render: (r) => `$${Number(r.totalAmount || 0).toFixed(2)}` },
    { title: "Date", key: "createdAt", render: (r) => new Date(r.createdAt || Date.now()).toLocaleDateString() },
    { title: "Status", key: "status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  // Helper for available actions
  const getNextActions = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "PENDING" || s === "CREATED") return ["PROCESSING", "CANCELLED"];
    if (s === "PROCESSING") return ["SHIPPED", "CANCELLED"];
    if (s === "SHIPPED") return ["DELIVERED"];
    return []; // DELIVERED and CANCELLED are terminal
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Order Management" subtitle="Process and track all customer orders." />

      <div className="bg-white p-4 rounded-xl border border-[#D8C4B6] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 w-full gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by Order ID or Customer ID..."
              className="pl-10 block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-[#4F709C] focus:border-[#4F709C] outline-none"
              value={qStr}
              onChange={(e) => updateSearchParam("q", e.target.value)}
            />
          </div>
          
          <select
            className="rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-[#4F709C] focus:border-[#4F709C] outline-none bg-white"
            value={statusFilter}
            onChange={(e) => updateSearchParam("status", e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <button 
          onClick={() => fetchOrders(true)} 
          disabled={loading || refetching}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#4F709C] bg-[#F5EFE7] hover:bg-[#E8DCCB] rounded-lg transition-colors border border-[#D8C4B6] disabled:opacity-50"
        >
          <RefreshCw size={16} className={refetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="p-4 bg-rose-50 text-rose-800 rounded-lg border border-rose-200">
          {error}
        </div>
      ) : (
        <DataTable 
          columns={columns}
          data={filteredOrders}
          loading={loading && !refetching}
          emptyMessage="No orders found matching your search criteria."
          onRowClick={(row) => setSelectedOrder(row)}
        />
      )}

      {/* Detail Modal / Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col transform transition-transform animate-slide-left">
            <div className="px-6 py-4 border-b border-[#D8C4B6] flex items-center justify-between bg-[#F5EFE7]">
              <h3 className="text-lg font-bold text-[#213555]">Order Details</h3>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div>
                <p className="text-sm text-gray-500">Order Reference</p>
                <p className="text-xl font-mono font-medium text-[#213555]">
                  {selectedOrder.externalOrderId || selectedOrder.id}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Customer ID</p>
                  <p className="font-mono text-sm">{selectedOrder.customerId}</p>
                </div>
                 <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium">${Number(selectedOrder.totalAmount || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="text-sm">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Status</p>
                  <div className="mt-1">
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                </div>
              </div>

              {selectedOrder.status === "CANCELLED" && selectedOrder.cancellationReason && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                  <p className="text-sm font-semibold text-rose-800 flex items-center gap-1">
                    <AlertTriangle size={14} /> Cancellation Reason
                  </p>
                  <p className="text-sm text-rose-700 mt-1">{selectedOrder.cancellationReason}</p>
                </div>
              )}

              <div className="pt-6 border-t border-[#D8C4B6]">
                <h4 className="text-sm font-medium text-gray-500 mb-3">Available Actions</h4>
                
                {getNextActions(selectedOrder.status).length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No further actions available for this order.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {getNextActions(selectedOrder.status).map(action => {
                      if (action === "CANCELLED") {
                        return (
                          <button
                            key={action}
                            onClick={() => setCancelModalOpen(true)}
                            disabled={transitioning}
                            className="px-4 py-2 text-sm font-medium text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 disabled:opacity-50 transition-colors text-left"
                          >
                            Cancel Order...
                          </button>
                        );
                      }
                      
                      let label = action;
                      if (action === "PROCESSING") label = "Start Processing";
                      if (action === "SHIPPED") label = "Mark Shipped";
                      if (action === "DELIVERED") label = "Mark Delivered";
                      
                      return (
                        <button
                          key={action}
                          onClick={() => handleUpdateStatus(selectedOrder.id, action)}
                          disabled={transitioning}
                          className="px-4 py-2 text-sm font-medium text-white bg-[#4F709C] hover:bg-[#3d5a80] rounded-lg disabled:opacity-50 transition-colors text-left"
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-bold text-rose-700 mb-2">Cancel Order</h3>
            <p className="text-sm text-gray-600 mb-4">Please provide a reason for cancelling this order. This action cannot be undone.</p>
            
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-rose-500 focus:border-rose-500 outline-none mb-4 min-h-[80px]"
              placeholder="e.g. Out of stock, Customer requested..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                disabled={transitioning}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedOrder.id, "CANCELLED", cancelReason)}
                disabled={transitioning || !cancelReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg disabled:opacity-50 transition-colors"
              >
                {transitioning ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
