import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function AdminUserModal({ isOpen, onClose, onSubmit, user, submitting }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Employee");
  
  useEffect(() => {
    if (user) {
      setUsername(user.username || user.email?.split('@')[0] || "");
      setEmail(user.email || "");
      setRole(user.role || "Employee");
    } else {
      setUsername("");
      setEmail("");
      setRole("Employee");
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ username, email, role, id: user?.id });
  };

  return (
    <div className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-surface">
          <h2 className="font-semibold text-lg">{user ? "Edit User Properties" : "Add New Staff"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface rounded text-ink/70 hover:text-ink transition-colors"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-ink/90">Username <span className="text-danger">*</span></label>
            <input required type="text" className="w-full border border-surface rounded-lg px-3 py-2 focus:outline-none focus:border-primary disabled:bg-surface/50 disabled:text-ink/50" value={username} onChange={e => setUsername(e.target.value)} disabled={!!user} placeholder="System login handle" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-ink/90">Email Address</label>
            <input type="email" className="w-full border border-surface rounded-lg px-3 py-2 focus:outline-none focus:border-primary" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email routing identity" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-ink/90">System Role <span className="text-danger">*</span></label>
            <select className="w-full border border-surface rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-primary" value={role} onChange={e => setRole(e.target.value)}>
               <option value="Employee">Employee (Base Access)</option>
               <option value="Manager">Manager (Elevated Access)</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-surface rounded-lg text-sm font-medium hover:bg-surface transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:brightness-110 transition-all disabled:opacity-70 flex items-center justify-center min-w-[100px]">
               {submitting ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : (user ? "Save Changes" : "Create User")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
