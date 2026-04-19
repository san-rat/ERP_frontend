import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Filter } from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminClient";
import AdminUsersTable from "../../components/admin/AdminUsersTable";
import AdminUserModal from "../../components/admin/AdminUserModal";
import ResetPasswordModal from "../../components/admin/ResetPasswordModal";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters + Pagination State
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isResetModalOpen, setResetModalOpen] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);

    // Build params to match backend contract (UserListQuery.cs)
    const params = { pageNumber: page, pageSize: 10 };
    if (search) params.search = search;
    if (roleFilter !== "ALL") params.role = roleFilter;
    if (statusFilter === "ACTIVE") params.isActive = true;
    if (statusFilter === "INACTIVE") params.isActive = false;

    adminApi.getUsers(params)
      .then(res => {
        // Backend returns PagedResponse with an `items` array
        const items = Array.isArray(res) ? res : (res.items || res.data || res.content || res.users || []);
        setUsers(items);
        setTotalPages(res.totalPages || Math.ceil(items.length / 10) || 1);
      })
      .catch(err => toast.error("Failed to fetch users: " + err.message))
      .finally(() => setLoading(false));
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  // Modal Handlers
  const handleOpenUserModal = (user = null) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  const handleCreateOrUpdateUser = async (payload) => {
    setIsSubmitting(true);
    try {
      if (selectedUser) {
        // Edit Mode
        await adminApi.updateUser(selectedUser.id || selectedUser.username, payload);
        toast.success("User updated successfully");
      } else {
        // Create Mode
        if (payload.role === "Manager") {
          await adminApi.createManager(payload);
        } else {
          await adminApi.createEmployee(payload);
        }
        toast.success("User created successfully");
      }
      setUserModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || "Action failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const isCurrentlyActive = user.isActive !== false && user.status !== "Inactive";
    if (!window.confirm(`Are you sure you want to ${isCurrentlyActive ? 'deactivate' : 'activate'} ${user.username || user.email}?`)) return;
    
    try {
      await adminApi.updateUserStatus(user.id || user.username, !isCurrentlyActive);
      toast.success(`User successfully ${isCurrentlyActive ? 'deactivated' : 'activated'}`);
      loadData();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleOpenResetModal = (user) => {
    setResetUser(user);
    setGeneratedPassword("");
    setResetModalOpen(true);
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      // Backend should return the new password
      const res = await adminApi.resetUserPassword(resetUser.id || resetUser.username);
      setGeneratedPassword(res.password || res.tempPassword || "Temp!Password123");
      toast.success("Password reset. Inform the user.");
      loadData();
    } catch (err) {
      toast.error("Reset failed: " + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">Staff Management</h1>
          <p className="text-sm text-ink/70">Manage Employee and Manager access levels.</p>
        </div>
        <button onClick={() => handleOpenUserModal(null)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:brightness-110 shadow-sm transition-all whitespace-nowrap">
          <Plus size={18} /> Add New User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-surface flex flex-col">
        {/* Filters Top Bar */}
        <div className="p-4 border-b border-surface flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="w-full pl-10 pr-4 py-2 bg-bg border border-surface rounded-lg focus:outline-none focus:border-primary text-sm"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="text-ink/60" size={16} />
              <select className="border border-surface rounded-lg px-3 py-2 text-sm focus:outline-none bg-white" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
                <option value="ALL">All Roles</option>
                <option value="Employee">Employees</option>
                <option value="Manager">Managers</option>
              </select>
            </div>
            <select className="border border-surface rounded-lg px-3 py-2 text-sm focus:outline-none bg-white" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Data Table Wrapper */}
        <div className="flex-1 overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex justify-center items-start pt-20 z-10">
               <span className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></span>
            </div>
          )}
          <AdminUsersTable 
            users={users} 
            onEdit={handleOpenUserModal} 
            onToggleStatus={handleToggleStatus} 
            onResetPassword={handleOpenResetModal} 
          />
        </div>

        {/* Pagination Console */}
        <div className="p-4 border-t border-surface flex items-center justify-between bg-bg/30">
          <span className="text-sm text-ink/70">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button 
              disabled={page <= 1} 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 border border-surface rounded-lg bg-white text-sm font-medium hover:bg-surface transition-colors disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              disabled={page >= totalPages} 
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border border-surface rounded-lg bg-white text-sm font-medium hover:bg-surface transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <AdminUserModal 
        isOpen={isUserModalOpen} 
        onClose={() => setUserModalOpen(false)} 
        user={selectedUser} 
        onSubmit={handleCreateOrUpdateUser}
        submitting={isSubmitting}
      />

      <ResetPasswordModal 
        isOpen={isResetModalOpen}
        onClose={() => setResetModalOpen(false)}
        user={resetUser}
        onConfirm={handleConfirmReset}
        generatedPassword={generatedPassword}
        isSubmitting={isResetting}
      />
    </div>
  );
}
