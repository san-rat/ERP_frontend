import React from 'react';
import { Search } from 'lucide-react';

export default function DataTable({ 
  columns, 
  data, 
  loading, 
  emptyMessage, 
  onRowClick,
  actions
}) {
  return (
    <div className="bg-white shadow-sm rounded-xl border border-[#D8C4B6] overflow-hidden">
      {/* Optional Toolbar/Actions space if needed, passed from parent */}
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#213555]">
          <thead className="bg-[#D8C4B6] bg-opacity-30 border-b border-[#D8C4B6]">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4 font-semibold whitespace-nowrap">
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              // Loading Skeleton Matrix
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx}>
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data && data.length > 0 ? (
              // Render Data
              data.map((row, rIdx) => (
                <tr 
                  key={rIdx} 
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`hover:bg-[#F5EFE7] transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className={`px-6 py-4 ${col.className || ""}`}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              // Empty State
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="h-8 w-8 text-gray-300 mb-3" />
                    <p>{emptyMessage || "No data available."}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
