import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Image } from "@/components/ui/image";
import StatusBadge from "@/components/StatusBadge";
import { computeProjectFinancials, formatCurrency } from "@/lib/finance";
import {
  Briefcase, Calendar, MoreVertical, Eye, Pencil, IndianRupee, Receipt,
  Globe, HardDrive, FileText, ReceiptText, Archive,
} from "lucide-react";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }) : "—";

export default function ProjectCard({ project: p, payments, expenses, onArchive }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const recurring = p.project_type === "recurring";
  const f = computeProjectFinancials(p, payments, expenses);

  const months = Number(p.number_of_months) || 0;
  const monthly = Number(p.monthly_amount) || 0;
  const paidMonths = recurring && monthly > 0 ? Math.min(months, Math.floor(f.received / monthly)) : 0;
  const progress = recurring
    ? (months > 0 ? (paidMonths / months) * 100 : 0)
    : (f.value > 0 ? (f.received / f.value) * 100 : 0);

  const items = [
    { label: "View Project", icon: Eye, go: `/projects/${p.id}` },
    { label: "Edit Project", icon: Pencil, go: `/projects/${p.id}` },
    { label: "Add Payment", icon: IndianRupee, go: `/projects/${p.id}` },
    { label: "Add Expense", icon: Receipt, go: `/projects/${p.id}` },
    { label: "Add Domain", icon: Globe, go: "/domains" },
    { label: "Add Hosting", icon: HardDrive, go: "/hosting" },
    { label: "Create Quotation", icon: FileText, go: "/quotations" },
    { label: "Create Invoice", icon: ReceiptText, go: "/invoices" },
  ];

  return (
    <>
      {menuOpen && (
        <div className="fixed inset-0 z-20" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
      )}
      <div
        onClick={() => navigate(`/projects/${p.id}`)}
        className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-4 flex flex-col hover:shadow-md hover:border-indigo-200 transition cursor-pointer"
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
            {p.logo ? (
              <Image src={p.logo} className="w-full h-full" fittingType="fill" />
            ) : (
              <Briefcase className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div className="flex items-center gap-1.5 relative">
            <StatusBadge status={p.status} />
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
              className="w-6 h-6 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center flex-shrink-0"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-7 z-30 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1"
              >
                {items.map((it) => (
                  <button
                    key={it.label}
                    onClick={() => { setMenuOpen(false); navigate(it.go); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 text-left"
                  >
                    <it.icon className="w-3.5 h-3.5" /> {it.label}
                  </button>
                ))}
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={() => { setMenuOpen(false); onArchive?.(p); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 text-left"
                >
                  <Archive className="w-3.5 h-3.5" /> Archive Project
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="font-semibold text-slate-900 text-sm line-clamp-1">{p.name}</div>
        <div className="text-[11px] text-slate-400 mb-2.5">{p.project_number || "—"}</div>

        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
            {(p.client_name || "?").charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-slate-600 truncate">{p.client_name || "No client"}</span>
          <span className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${recurring ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500"}`}>
            {recurring ? "Recurring" : "Fixed"}
          </span>
        </div>

        {p.description ? (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3">{p.description}</p>
        ) : (
          <div className="mb-3" />
        )}

        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-slate-800">{Math.round(progress)}%</span>
          <span className="text-[11px] text-slate-500">
            {recurring ? `${paidMonths}/${months} mo · ` : ""}{formatCurrency(f.received)} / {formatCurrency(f.value)}
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>

        <div className="mt-auto flex items-center gap-1.5 text-[11px] text-slate-500">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{fmtDate(p.start_date)} → {fmtDate(p.expected_completion_date || p.recurring_end_date)}</span>
        </div>
      </div>
    </>
  );
}