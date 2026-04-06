import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function KpiCard({ title, value, icon: Icon, trend, trendValue, isAlert }) {
  return (
    <div className={`p-5 rounded-xl border bg-white ${isAlert ? 'border-rose-300 ring-1 ring-rose-200 shadow-sm' : 'border-[#D8C4B6] shadow-sm'}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className={`text-2xl font-semibold ${isAlert ? 'text-rose-700' : 'text-[#213555]'}`}>
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg ${isAlert ? 'bg-rose-50 text-rose-600' : 'bg-[#F5EFE7] text-[#4F709C]'}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      
      {trendValue && (
        <div className="mt-4 flex items-center text-sm">
          {trend === 'up' ? (
            <span className="text-emerald-600 flex items-center font-medium">
              <TrendingUp size={16} className="mr-1" />
              {trendValue}
            </span>
          ) : trend === 'down' ? (
            <span className="text-rose-600 flex items-center font-medium">
              <TrendingDown size={16} className="mr-1" />
              {trendValue}
            </span>
          ) : (
            <span className="text-gray-500">{trendValue}</span>
          )}
          <span className="text-gray-400 ml-2">from last period</span>
        </div>
      )}
    </div>
  );
}
