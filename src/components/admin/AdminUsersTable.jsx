import { Edit2, Key, Ban, Power } from "lucide-react";

export default function AdminUsersTable({ users, onEdit, onToggleStatus, onResetPassword }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[700px]">
        <thead>
          <tr className="border-b border-surface text-sm text-ink/70 bg-bg/50">
            <th className="p-4 font-medium">User Details</th>
            <th className="p-4 font-medium">Role</th>
            <th className="p-4 font-medium">Status</th>
            <th className="p-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm bg-white">
          {users.map(u => {
            const isAdmin = u.role?.toUpperCase() === "ADMIN";
            const isActive = u.isActive !== false && u.status !== "Inactive";
            
            return (
              <tr key={u.id || u.username} className="border-b border-surface hover:bg-bg transition-colors">
                <td className="p-4">
                  <p className="font-semibold">{u.username || u.email?.split('@')[0]}</p>
                  <p className="text-xs text-ink/60">{u.email}</p>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium border ${isAdmin ? 'bg-primary/5 text-primary border-primary/20' : 'bg-surface/30 text-ink border-surface'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-success-light text-success-text' : 'bg-warning-light text-warning-text'}`}>
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4 flex items-center justify-end gap-2">
                  <button disabled={isAdmin} onClick={() => onEdit(u)} className="p-2 text-ink/70 hover:text-primary hover:bg-primary/10 rounded disabled:opacity-30 disabled:cursor-not-allowed" title="Edit Role">
                    <Edit2 size={16} />
                  </button>
                  <button disabled={isAdmin} onClick={() => onToggleStatus(u)} className={`p-2 rounded disabled:opacity-30 disabled:cursor-not-allowed ${isActive ? 'text-ink/70 hover:text-warning hover:bg-warning/10' : 'text-ink/70 hover:text-success hover:bg-success/10'}`} title={isActive ? "Deactivate" : "Activate"}>
                    {isActive ? <Ban size={16} /> : <Power size={16} />}
                  </button>
                  <button disabled={isAdmin} onClick={() => onResetPassword(u)} className="p-2 text-ink/70 hover:text-danger hover:bg-danger/10 rounded disabled:opacity-30 disabled:cursor-not-allowed" title="Reset Password">
                    <Key size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
          {users.length === 0 && (
            <tr><td colSpan="4" className="p-8 text-center text-ink/60">No users found. Try adjusting your filters.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
