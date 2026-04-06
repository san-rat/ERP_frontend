import React, { useEffect, useState, useMemo } from "react";
import { Search, AlertTriangle, Edit2, X, RefreshCw } from "lucide-react";
import PageHeader from "../../components/employee/PageHeader";
import DataTable from "../../components/employee/DataTable";
import StatusBadge from "../../components/employee/StatusBadge";
import { productsClient } from "../../api/productsClient";

export default function EmployeeInventoryPage() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL, LOW_STOCK

  // Edit stock flow
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newQuantity, setNewQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchStock = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productsClient.getStock();
      setStock(data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const sortedAndFilteredStock = useMemo(() => {
    let result = stock;

    if (filterType === "LOW_STOCK") {
      result = result.filter(item => item.isLowStock);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        (item.sku && item.sku.toLowerCase().includes(q)) || 
        (item.productName && item.productName.toLowerCase().includes(q))
      );
    }

    // Sort low stock to the top by default
    return result.sort((a, b) => {
      if (a.isLowStock && !b.isLowStock) return -1;
      if (!a.isLowStock && b.isLowStock) return 1;
      return 0; // maintain original relative order or could sort alphabetically
    });
  }, [stock, searchQuery, filterType]);

  const openEditModal = async (item) => {
    try {
      setEditingItem(item);
      setNewQuantity(item.quantityAvailable?.toString() || "0");
      setIsEditModalOpen(true);
      
      // Optionally fetch fresh actual product DTO so we can PUT the product
      // Since Adjust Stock uses product edit flow (PUT /api/products/{id})
      // But we need the full product payload to do a PUT.
      const fullProduct = await productsClient.getById(item.productId);
      setEditingItem(fullProduct);
    } catch (err) {
      alert("Could not load product details for editing.");
      setIsEditModalOpen(false);
    }
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setSubmitting(true);
      const payload = {
        ...editingItem, // keep everything else unchanged
        quantityAvailable: parseInt(newQuantity, 10)
      };

      await productsClient.update(editingItem.id, payload);
      setIsEditModalOpen(false);
      fetchStock(); // Refresh stock table
    } catch (err) {
      alert(err.message || "Failed to adjust stock.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: "SKU", key: "sku", render: r => <span className="font-mono text-xs text-gray-500">{r.sku}</span> },
    { title: "Product Name", key: "productName", render: r => <span className="font-medium text-[#213555]">{r.productName}</span> },
    { title: "Available", key: "quantityAvailable" },
    { title: "Reserved", key: "quantityReserved", render: r => <span className="text-gray-400">{r.quantityReserved || 0}</span> }, // Shown but deprioritized
    { title: "Total (Target)", key: "totalStock", render: r => (r.quantityAvailable || 0) + (r.quantityReserved || 0) },
    { title: "Threshold", key: "lowStockThreshold" },
    { title: "Status", key: "status", render: r => (
      r.isLowStock 
        ? <StatusBadge status="warning" label="Low Stock" /> 
        : <StatusBadge status="success" label="Healthy" />
    ) },
    { title: "Actions", key: "actions", render: r => (
      <button 
        onClick={(e) => { e.stopPropagation(); openEditModal(r); }}
        className="p-1 text-gray-400 hover:text-[#4F709C] transition-colors"
        title="Adjust Stock"
      >
        <Edit2 size={16} />
      </button>
    ) }
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory Monitor" subtitle="Real-time stock levels across all active products." />

      <div className="bg-white p-4 rounded-xl border border-[#D8C4B6] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 w-full gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search SKU or Name..."
              className="pl-10 block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-[#4F709C] focus:border-[#4F709C] outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filterType === "ALL" ? "bg-white shadow-sm text-[#213555]" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setFilterType("ALL")}
            >
              All Items
            </button>
            <button
              className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filterType === "LOW_STOCK" ? "bg-white shadow-sm text-rose-700" : "text-rose-500 hover:text-rose-700"}`}
              onClick={() => setFilterType("LOW_STOCK")}
            >
              <AlertTriangle size={14} /> Low Stock Only
            </button>
          </div>
        </div>

        <button 
          onClick={fetchStock} 
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#4F709C] bg-[#F5EFE7] hover:bg-[#E8DCCB] rounded-lg transition-colors border border-[#D8C4B6] disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
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
          data={sortedAndFilteredStock}
          loading={loading}
          emptyMessage="No inventory records found."
        />
      )}

      {/* Adjust Stock Modal */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#213555]">Adjust Stock</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Update the available quantity for <strong>{editingItem.name}</strong> (SKU: <span className="font-mono text-xs">{editingItem.sku}</span>).
            </p>
            
            <form onSubmit={handleAdjustStock}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#213555] mb-1">New Available Quantity</label>
                <input 
                  required 
                  type="number" 
                  min="0"
                  className="w-full border border-gray-300 rounded-lg p-2 text-lg focus:ring-[#4F709C] focus:border-[#4F709C] outline-none" 
                  value={newQuantity} 
                  onChange={(e) => setNewQuantity(e.target.value)} 
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || newQuantity === ""}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#4F709C] hover:bg-[#3d5a80] rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {submitting && <RefreshCw size={14} className="animate-spin" />}
                  Save Quantity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
