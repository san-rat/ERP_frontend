import React from "react";

// Guidelines enforce muted, professional colors without neon or flashy effects.
const STATUS_COLORS = {
  // Common states
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  success: "bg-emerald-100 text-emerald-800 border-emerald-200",
  
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  
  error: "bg-rose-100 text-rose-800 border-rose-200",
  cancelled: "bg-rose-100 text-rose-800 border-rose-200",
  
  info: "bg-blue-100 text-blue-800 border-blue-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  inactive: "bg-gray-100 text-gray-800 border-gray-200",
};

export default function StatusBadge({ status, label }) {
  const normalizedKey = status?.toLowerCase() || "info";
  const mappedClasses = STATUS_COLORS[normalizedKey] || STATUS_COLORS.info;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${mappedClasses}`}>
      {label || status}
    </span>
  );
}
