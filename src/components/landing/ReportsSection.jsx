import React from "react";
import { Reveal, SectionHead, CountUp } from "@/components/landing/Reveal";
import { BarChart3, FolderKanban, Users, Wallet, TrendingUp, Calendar } from "lucide-react";

const REPORTS = [
  ["Financial", "Income, expenses & profit overview"],
  ["Revenue", "Where your money comes from"],
  ["Expenses", "Category-wise spend"],
  ["Profit", "Net earnings across projects"],
  ["Project-wise", "Per-project performance"],
  ["Client-wise", "Business per client"],
  ["Monthly", "Trends over time"],
];
const TRENDS = [
  { m: "Apr", i: 62, e: 28 }, { m: "May", i: 78, e: 34 }, { m: "Jun", i: 54, e: 22 },
  { m: "Jul", i: 90, e: 40 }, { m: "Aug", i: 70, e: 30 }, { m: "Sep", i: 96, e: 36 },
];

export default function ReportsSection() {
  return (
    <section id="reports" className="py-20 sm:py-28 bg-white scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHead
          eyebrow="Reports"
          title="Turn your work into useful numbers."
          sub="Understand your business at a glance — reports generated from the same data you already manage."
        />
        <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <Reveal className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                ["Revenue", 1240000, "text-slate-900", Wallet],
                ["Expenses", 285000, "text-rose-500", Wallet],
                ["Profit", 955000, "text-emerald-600", TrendingUp],
                ["Pending", 185000, "text-amber-600", Calendar],
              ].map(([l, v, c, Ic]) => (
                <div key={l} className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                  <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1"><Ic className="w-3 h-3" />{l.toUpperCase()}</p>
                  <p className={`text-lg font-extrabold ${c}`}><CountUp to={v} prefix="₹" /></p>
                </div>
              ))}
            </div>
            <p className="text-sm font-bold text-slate-800 mb-3">Monthly trend — profit</p>
            <div className="flex items-end gap-2 h-28">
              {TRENDS.map((d) => (
                <div key={d.m} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full rounded-t bg-gradient-to-t from-indigo-600 to-indigo-400 transition-all" style={{ height: `${d.i - d.e}%` }} />
                  <span className="text-[9px] text-slate-400">{d.m}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.12} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-800 mb-4">Report types</p>
            <div className="space-y-2.5">
              {REPORTS.map(([t, d], i) => (
                <div key={t} className="flex items-center gap-3 rounded-xl bg-white border border-slate-100 px-4 py-3">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${i < 3 ? "bg-indigo-50 text-indigo-600" : i < 5 ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-600"}`}>
                    {i < 3 ? <BarChart3 className="w-4 h-4" /> : i === 3 ? <TrendingUp className="w-4 h-4" /> : i < 5 ? <FolderKanban className="w-4 h-4" /> : i === 5 ? <Users className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{t}</p>
                    <p className="text-[10px] text-slate-400">{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}