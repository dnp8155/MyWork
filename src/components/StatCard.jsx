import React from "react";
import { formatCurrency } from "@/lib/finance";

export default function StatCard({ label, value, sub, icon: Icon, tone = "default", isCurrency = true, symbol = "₹" }) {
  const tones = {
    default: "bg-white border-slate-200",
    indigo: "bg-indigo-50 border-indigo-200",
    green: "bg-emerald-50 border-emerald-200",
    red: "bg-rose-50 border-rose-200",
    amber: "bg-amber-50 border-amber-200",
    blue: "bg-sky-50 border-sky-200",
  };
  const iconTones = {
    default: "bg-slate-100 text-slate-600",
    indigo: "bg-indigo-100 text-indigo-600",
    green: "bg-emerald-100 text-emerald-600",
    red: "bg-rose-100 text-rose-600",
    amber: "bg-amber-100 text-amber-600",
    blue: "bg-sky-100 text-sky-600",
  };
  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">{label}</p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {isCurrency ? formatCurrency(value, symbol) : value}
          </p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconTones[tone]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}