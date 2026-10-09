import React from "react";
import { formatCurrency } from "@/lib/finance";

export default function StatCard({ label, value, sub, icon: Icon, tone = "default", isCurrency = true, symbol = "₹" }) {
  const negative = tone === "red" && isCurrency && Number(value) < 0;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">{label}</p>
          <p className={`text-xl font-bold mt-1 ${negative ? "text-rose-600" : "text-slate-900"}`}>
            {isCurrency ? formatCurrency(value, symbol) : value}
          </p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-100 text-slate-500">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}