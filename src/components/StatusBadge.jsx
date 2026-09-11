import React from "react";

const statusStyles = {
  active: "bg-emerald-100 text-emerald-700",
  completed: "bg-blue-100 text-blue-700",
  on_hold: "bg-amber-100 text-amber-700",
  pending: "bg-slate-100 text-slate-600",
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-sky-100 text-sky-700",
  viewed: "bg-indigo-100 text-indigo-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
  expired: "bg-slate-200 text-slate-500",
  paid: "bg-emerald-100 text-emerald-700",
  partially_paid: "bg-amber-100 text-amber-700",
  overdue: "bg-rose-100 text-rose-700",
  cancelled: "bg-slate-200 text-slate-500",
  suspended: "bg-rose-100 text-rose-700",
  upcoming: "bg-slate-100 text-slate-600",
  due: "bg-amber-100 text-amber-700",
  expiring_soon: "bg-amber-100 text-amber-700",
  expired_domain: "bg-rose-100 text-rose-700",
};

const labelMap = {
  on_hold: "On Hold", partially_paid: "Partially Paid", expiring_soon: "Expiring Soon",
  bank_transfer: "Bank Transfer", other_income: "Other Income", other: "Other",
  employee_salary: "Employee Salary",
};

export default function StatusBadge({ status }) {
  const style = statusStyles[status] || "bg-slate-100 text-slate-600";
  const label = labelMap[status] || (status ? status.charAt(0).toUpperCase() + status.slice(1) : "");
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}