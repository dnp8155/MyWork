import React from "react";

const statusStyles = {
  active: "bg-blue-50 text-blue-700",
  completed: "bg-blue-50 text-blue-700",
  paid: "bg-blue-50 text-blue-700",
  approved: "bg-blue-50 text-blue-700",
  sent: "bg-blue-50 text-blue-700",
  viewed: "bg-blue-50 text-blue-700",
  on_hold: "bg-slate-100 text-slate-600",
  pending: "bg-slate-100 text-slate-600",
  draft: "bg-slate-100 text-slate-600",
  upcoming: "bg-slate-100 text-slate-600",
  due: "bg-slate-100 text-slate-600",
  expiring_soon: "bg-slate-100 text-slate-600",
  partially_paid: "bg-slate-100 text-slate-600",
  rejected: "bg-rose-50 text-rose-600",
  overdue: "bg-rose-50 text-rose-600",
  suspended: "bg-rose-50 text-rose-600",
  expired: "bg-rose-50 text-rose-600",
  expired_domain: "bg-rose-50 text-rose-600",
  cancelled: "bg-slate-200 text-slate-500",
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