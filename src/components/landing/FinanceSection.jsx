import React from "react";
import { Reveal, SectionHead, CountUp } from "@/components/landing/Reveal";
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp } from "lucide-react";

const MONTHS = [
  { m: "Apr", i: 62, e: 28 }, { m: "May", i: 78, e: 34 }, { m: "Jun", i: 54, e: 22 },
  { m: "Jul", i: 90, e: 40 }, { m: "Aug", i: 70, e: 30 }, { m: "Sep", i: 96, e: 36 },
];
const LEDGER = [
  ["PAY-2026-0004", "XYZ ERP · monthly payment", "+₹25,000", "UPI", true],
  ["EXP-2026-0007", "Hosting · Hostinger Cloud", "−₹8,500", "Card", false],
  ["PAY-2026-0009", "ABC E-commerce · milestone", "+₹25,000", "Bank", true],
  ["EXP-2026-0011", "Domain · abcecommerce.com", "−₹1,200", "UPI", false],
];

export default function FinanceSection() {
  return (
    <section id="finance" className="py-20 sm:py-28 bg-white scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHead
          eyebrow="Finance"
          title="See the real picture behind every project."
          sub="Every payment and expense flows into your financial picture automatically."
        />
        <Reveal className="max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-white shadow-[0_24px_64px_-16px_rgba(15,23,42,0.2)] overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100">
            {[
              ["Total Revenue", 1240000, "text-slate-900", Wallet],
              ["Total Expenses", 285000, "text-rose-500", Wallet],
              ["Net Profit", 955000, "text-emerald-600", TrendingUp],
              ["Pending Payments", 185000, "text-amber-600", Wallet],
            ].map(([l, v, c, Ic]) => (
              <div key={l} className="bg-white px-5 py-5">
                <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5"><Ic className="w-3 h-3" />{l.toUpperCase()}</p>
                <p className={`text-xl sm:text-2xl font-extrabold mt-1 ${c}`}><CountUp to={v} prefix="₹" /></p>
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-px bg-slate-100 border-t border-slate-100">
            {/* income vs expense chart */}
            <div className="bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-slate-800">Income vs Expenses</p>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-indigo-600 inline-block" />Income</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-slate-300 inline-block" />Expenses</span>
                </div>
              </div>
              <div className="flex items-end justify-between gap-3 h-36">
                {MONTHS.map((d) => (
                  <div key={d.m} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="flex items-end justify-center gap-1 w-full h-full">
                      <div className="w-3.5 sm:w-5 rounded-t bg-indigo-600" style={{ height: `${d.i}%` }} />
                      <div className="w-3.5 sm:w-5 rounded-t bg-slate-300" style={{ height: `${d.e}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400">{d.m}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* distribution */}
            <div className="bg-white p-6">
              <p className="text-sm font-bold text-slate-800 mb-4">Project-wise Revenue Distribution</p>
              <div className="space-y-3.5">
                {[["ABC E-commerce", 38, "₹4,75,000"], ["XYZ ERP", 34, "₹3,00,000"], ["Marketing Website", 16, "₹85,000"], ["Monthly Support", 12, "₹1,80,000"]].map(([n, p, v]) => (
                  <div key={n}>
                    <div className="flex justify-between text-[11px] mb-1"><span className="font-medium text-slate-600">{n}</span><span className="font-bold text-slate-700">{v}</span></div>
                    <div className="h-1.5 bg-slate-100 rounded-full"><div className="h-full bg-indigo-600 rounded-full" style={{ width: `${p}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* ledger */}
          <div className="border-t border-slate-100 p-6 bg-slate-50/50">
            <p className="text-sm font-bold text-slate-800 mb-3">Transaction Ledger</p>
            <div className="space-y-2">
              {LEDGER.map(([id, desc, amt, method, income]) => (
                <div key={id} className="flex items-center gap-3 rounded-lg bg-white border border-slate-100 px-4 py-2.5">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${income ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                    {income ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-700 truncate">{id} · {desc}</p>
                    <p className="text-[10px] text-slate-400">{method}</p>
                  </div>
                  <span className={`text-xs font-bold ${income ? "text-emerald-600" : "text-rose-500"}`}>{amt}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}