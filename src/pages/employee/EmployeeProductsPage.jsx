import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Plus, Edit2, X, RefreshCw } from "lucide-react";
import PageHeader from "../../components/employee/PageHeader";
import DataTable from "../../components/employee/DataTable";
import StatusBadge from "../../components/employee/StatusBadge";
import { productsClient } from "../../api/productsClient";
import { PRODUCT_CATEGORIES } from "../../constants/productCategories";

export default function EmployeeProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchName = searchParams.get("name") || "";
  const categoryId = searchParams.get("categoryId") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    description: "",
    categoryId: "",
    price: "",
    isActive: true,
    initialStock: "",
    quantityAvailable: "", // for edit
    lowStockThreshold: ""
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (searchName) params.name = searchName;
      if (categoryId) params.categoryId = categoryId;
      
      const data = await productsClient.getList(params);
      setProducts(data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchName, categoryId]);

  const updateSearchParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (!value || value === "ALL") {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    setSearchParams(nextParams);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      sku: "", name: "", description: "", categoryId: "", price: "", isActive: true, initialStock: "", lowStockThreshold: ""
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    setFormData({
      sku: product.sku || "",
      name: product.name || "",
      description: product.description || "",
      categoryId: product.categoryId || "",
      price: product.price || "",
      isActive: product.isActive ?? true,
      quantityAvailable: product.quantityAvailable ?? "",
      lowStockThreshold: product.lowStockThreshold || ""
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const payload = {
        sku: formData.sku,
        name: formData.name,
        description: formData.description,
        categoryId: parseInt(formData.categoryId, 10),
        price: parseFloat(formData.price),
        isActive: formData.isActive,
        lowStockThreshold: parseInt(formData.lowStockThreshold, 10)
      };

      if (editingId) {
        payload.quantityAvailable = parseInt(formData.quantityAvailable, 10);
        await productsClient.update(editingId, payload);
      } else {
        payload.initialStock = parseInt(formData.initialStock, 10);
        await productsClient.create(payload);
      }

      setIsModalOpen(false);
      fetchProducts(); // Refresh the list
    } catch (err) {
      setFormError(err.message || "Validation failed or API error.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: "SKU", key: "sku", render: r => <span className="font-mono text-xs text-gray-500">{r.sku}</span> },
    { title: "Name", key: "name", render: r => <span className="font-medium text-[#213555]">{r.name}</span> },
    { title: "Category", key: "categoryId", render: r => PRODUCT_CATEGORIES.find(c => c.id === r.categoryId)?.name || "Unknown" },
    { title: "Price", key: "price", render: r => `$${Number(r.price || 0).toFixed(2)}` },
    { title: "Available", key: "quantityAvailable" },
    { title: "Status", key: "isActive", render: r => <StatusBadge status={r.isActive ? "active" : "inactive"} label={r.isActive ? "Active" : "Inactive"} /> },
    { title: "Actions", key: "actions", render: r => (
      <button 
        onClick={(e) => { e.stopPropagation(); openEditModal(r); }}
        className="p-1 text-gray-400 hover:text-[#4F709C] transition-colors"
      >
        <Edit2 size={16} />
      </button>
    ) }
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Product Catalog" subtitle="Manage your products and inventory metadata.">
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#4F709C] hover:bg-[#3d5a80] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Add Product
        </button>
      </PageHeader>

      <div className="bg-white p-4 rounded-xl border border-[#D8C4B6] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 w-full gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by product name (server-side)..."
              className="pl-10 block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-[#4F709C] focus:border-[#4F709C] outline-none"
              value={searchName}
              onChange={(e) => updateSearchParam("name", e.target.value)}
            />
          </div>
          
          <select
            className="rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-[#4F709C] focus:border-[#4F709C] outline-none bg-white"
            value={categoryId}
            onChange={(e) => updateSearchParam("categoryId", e.target.value)}
          >
            <option value="ALL">All Categories</option>
            {PRODUCT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-rose-50 text-rose-800 rounded-lg border border-rose-200">
          {error}
        </div>
      ) : (
        <DataTable 
          columns={columns}
          data={products}
          loading={loading}
          emptyMessage="No products found in the catalog."
        />
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col transform transition-transform animate-slide-left">
            <div className="px-6 py-4 border-b border-[#D8C4B6] flex items-center justify-between bg-[#F5EFE7]">
              <h3 className="text-lg font-bold text-[#213555]">{editingId ? "Edit Product" : "New Product"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              {formError && (
                <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-sm rounded-lg border border-rose-200">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#213555] mb-1">SKU <span className="text-rose-500">*</span></label>
                  <input required type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-[#4F709C] focus:border-[#4F709C] outline-none uppercase" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} disabled={!!editingId} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#213555] mb-1">Name <span className="text-rose-500">*</span></label>
                  <input required type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-[#4F709C] focus:border-[#4F709C] outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#213555] mb-1">Description</label>
                  <textarea className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-[#4F709C] focus:border-[#4F709C] outline-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#213555] mb-1">Category <span className="text-rose-500">*</span></label>
                    <select required className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-[#4F709C] focus:border-[#4F709C] outline-none bg-white" value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})}>
                      <option value="" disabled>Select...</option>
                      {PRODUCT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#213555] mb-1">Price <span className="text-rose-500">*</span></label>
                    <input required type="number" step="0.01" min="0" className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-[#4F709C] focus:border-[#4F709C] outline-none" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {!editingId ? (
                    <div>
                      <label className="block text-sm font-medium text-[#213555] mb-1">Initial Stock <span className="text-rose-500">*</span></label>
                      <input required type="number" min="0" className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-[#4F709C] focus:border-[#4F709C] outline-none" value={formData.initialStock} onChange={(e) => setFormData({...formData, initialStock: e.target.value})} />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-[#213555] mb-1">Quantity <span className="text-rose-500">*</span></label>
                      <input required type="number" min="0" className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-[#4F709C] focus:border-[#4F709C] outline-none" value={formData.quantityAvailable} onChange={(e) => setFormData({...formData, quantityAvailable: e.target.value})} />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-[#213555] mb-1">Low Stock Alert <span className="text-rose-500">*</span></label>
                    <input required type="number" min="0" className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-[#4F709C] focus:border-[#4F709C] outline-none" value={formData.lowStockThreshold} onChange={(e) => setFormData({...formData, lowStockThreshold: e.target.value})} />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" id="isActive" className="h-4 w-4 rounded border-gray-300 text-[#4F709C] focus:ring-[#4F709C]" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} />
                  <label htmlFor="isActive" className="text-sm font-medium text-[#213555]">Product is Active</label>
                </div>

                <div className="pt-6 border-t border-[#D8C4B6] flex justify-end gap-2 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-[#4F709C] hover:bg-[#3d5a80] rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2">
                    {submitting && <RefreshCw size={14} className="animate-spin" />}
                    {editingId ? "Save Changes" : "Create Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
