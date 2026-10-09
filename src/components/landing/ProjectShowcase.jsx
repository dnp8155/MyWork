import React from "react";
import { Reveal, fmt } from "@/components/landing/Reveal";
import { Wallet, TrendingUp, Receipt, AlertCircle, CheckCircle2 } from "lucide-react";

const TABS = ["Financial", "Team", "Documents", "Quotations", "Invoices", "Domains", "Hosting", "Credentials", "Audit Trail"];
const STATS = [
  ["Project Value", 120000, "text-slate-900", Wallet],
  ["Received", 75000, "text-emerald-600", CheckCircle2],
  ["Pending", 45000, "text-amber-600", AlertCircle],
  ["Profit", 62500, "text-emerald-600", TrendingUp],
];
const ACTIVITY = [
  ["PAY-2026-0004", "Advance payment received", "+₹50,000", "UPI"],
  ["EXP-2026-0007", "Domain: abcecommerce.com", "−₹1,200", "Card"],
  ["PAY-2026-0009", "Milestone 2 payment", "+₹25,000", "Bank transfer"],
];

export default function ProjectShowcase() {
  return (
    <section id="projects" className="py-20 sm:py-28 bg-white scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <Reveal>
          <p className="text-xs font-semibold tracking-widest uppercase text-indigo-600 mb-3">Project management</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Projects, without the chaos.</h2>
          <p className="mt-4 text-base sm:text-lg text-slate-500 leading-relaxed">
            From the first payment to the final delivery, see everything connected to a project.
          </p>
          <ul className="mt-7 space-y-3.5">
            {[
              "Every payment, expense and document linked to the project",
              "Team members, roles and salary tracking in one place",
              "Domains, hosting and credentials attached to the work they belong to",
              "Complete audit trail — who changed what, and when",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-sm text-slate-600">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" /> {t}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm font-semibold text-indigo-700">One project. Complete visibility.</p>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_24px_64px_-16px_rgba(15,23,42,0.22)] overflow-hidden">
            {/* project header */}
            <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-slate-50/60">
              <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">A</div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">ABC E-commerce</p>
                <p className="text-[11px] text-slate-500">Rahul Sharma · PRJ-0003 · Fixed</p>
              </div>
              <span className="ml-auto text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
            </div>
            {/* stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-100 border-b border-slate-100">
              {STATS.map(([l, v, c, Ic]) => (
                <div key={l} className="bg-white px-3 py-3">
                  <p className="text-[9px] font-medium text-slate-400 flex items-center gap-1"><Ic className="w-2.5 h-2.5" />{l.toUpperCase()}</p>
                  <p className={`text-sm font-bold mt-0.5 ${c}`}>{fmt(v)}</p>
                </div>
              ))}
            </div>
            {/* tabs */}
            <div className="flex gap-1 overflow-x-auto px-2 pt-2 border-b border-slate-100">
              {TABS.map((t, i) => (
                <span key={t} className={`whitespace-nowrap text-[10px] font-semibold px-3 py-2 rounded-t-lg ${i === 0 ? "bg-indigo-600 text-white" : "text-slate-500 bg-slate-50"}`}>{t}</span>
              ))}
            </div>
            {/* financial tab content */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-700">Payments & Expenses</p>
                <span className="text-[10px] text-slate-400">Financial tab</span>
              </div>
              {ACTIVITY.map(([id, desc, amt, method]) => (
                <div key={id} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2">
                  <Receipt className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-slate-700 truncate">{id} · {desc}</p>
                    <p className="text-[9px] text-slate-400">{method}</p>
                  </div>
                  <span className={`text-[11px] font-bold ${amt.startsWith("+") ? "text-emerald-600" : "text-rose-500"}`}>{amt}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}