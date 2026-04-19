import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";

export default function ResetPasswordModal({ isOpen, onClose, onConfirm, user, generatedPassword, isSubmitting }) {
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    if (isOpen) setConfirmText("");
  }, [isOpen]);

  if (!isOpen) return null;

  if (generatedPassword) {
    return (
      <div className="fixed inset-0 bg-ink/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center space-y-4 border border-surface">
          <div className="w-14 h-14 bg-success-light text-success rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
            <Check size={28} strokeWidth={3} />
          </div>
          <h2 className="font-semibold text-xl text-ink">Password Reset Complete</h2>
          <p className="text-sm text-ink/70">Please copy the new temporary password below. It will only be shown once.</p>
          
          <div className="bg-bg p-4 rounded-lg font-mono text-xl tracking-wider font-bold text-primary select-all">
            {generatedPassword}
          </div>

          <button onClick={() => { navigator.clipboard.writeText(generatedPassword); onClose(); }} className="w-full mt-4 bg-primary text-white py-2.5 rounded-lg hover:brightness-110 font-medium">
            Copy & Close
          </button>
        </div>
      </div>
    );
  }

  const expectedText = user?.username || user?.email?.split('@')[0] || "confirm";

  return (
    <div className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-surface bg-danger-light/30">
          <h2 className="font-semibold text-lg text-danger flex items-center gap-2">Reset User Password</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface rounded text-danger"><X size={20}/></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-ink/80 leading-relaxed">
            Are you sure you want to reset the password for <strong className="text-ink">{expectedText}</strong>? The user will immediately be logged out and a one-time temporary password will be generated for them to use.
          </p>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-ink/90">Type <strong className="select-all bg-surface px-1 py-0.5 rounded text-danger">{expectedText}</strong> to confirm:</label>
            <input type="text" className="w-full border border-danger/30 rounded-lg px-3 py-2 focus:outline-none focus:border-danger bg-bg/50" value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder="Confirmation required..." />
          </div>
        </div>
        <div className="p-4 border-t border-surface flex justify-end gap-3 bg-bg/50">
          <button onClick={onClose} className="px-4 py-2 border border-surface rounded-lg hover:bg-white text-sm font-medium transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={confirmText !== expectedText || isSubmitting} className="px-4 py-2 bg-danger text-white text-sm font-medium rounded-lg hover:brightness-110 disabled:opacity-50 disabled:grayscale flex items-center justify-center min-w-[140px] transition-all">
            {isSubmitting ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : "Confirm Reset"}
          </button>
        </div>
      </div>
    </div>
  );
}
