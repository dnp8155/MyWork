import React from "react";
import { CheckCircle2, Calendar, Sparkles } from "lucide-react";
import { Reveal, SectionHead, CountUp } from "@/components/landing/Reveal";

const SCHEDULE = [
  ["Jan", true], ["Feb", true], ["Mar", true], ["Apr", false], ["May", false], ["Jun", false],
];

export default function PaymentModes() {
  return (
    <section id="payments" className="py-20 sm:py-28 bg-slate-50 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHead
          eyebrow="Payment models"
          title="Built for the way you actually get paid."
          sub="Fixed-price or monthly salary projects — both first-class citizens in MyWork."
        />
        <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Fixed */}
          <Reveal className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 shadow-sm hover:shadow-[0_16px_40px_-16px_rgba(15,23,42,0.18)] transition-shadow">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">Fixed projects</span>
            <h3 className="mt-4 text-xl font-bold text-slate-900">Track one-time projects with payments, expenses and profitability.</h3>
            <div className="mt-7 grid grid-cols-2 gap-3">
              {[
                ["Project Value", 120000, "text-slate-900"],
                ["Received", 75000, "text-emerald-600"],
                ["Pending", 45000, "text-amber-600"],
                ["Expenses", 12500, "text-rose-500"],
              ].map(([l, v, c]) => (
                <div key={l} className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                  <p className="text-[10px] font-medium text-slate-400">{l}</p>
                  <p className={`text-lg font-bold ${c}`}><CountUp to={v} prefix="₹" /></p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1.5"><span>Received ₹75,000</span><span>of ₹1,20,000</span></div>
              <div className="h-2 bg-slate-100 rounded-full"><div className="h-full bg-indigo-600 rounded-full" style={{ width: "62.5%" }} /></div>
            </div>
            <p className="mt-5 text-sm font-semibold text-emerald-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Profit: ₹62,500
            </p>
          </Reveal>

          {/* Recurring */}
          <Reveal delay={0.12} className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/50 to-white p-7 sm:p-8 shadow-[0_4px_24px_-8px_rgba(0,103,214,0.18)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-white border border-indigo-200 px-2.5 py-1 rounded-full">Recurring / Salary</span>
            <h3 className="mt-4 text-xl font-bold text-slate-900">Manage monthly retainers and salary-based projects with automatic payment schedules.</h3>
            <div className="mt-7 flex items-end gap-3">
              <p className="text-4xl font-extrabold text-slate-900 tracking-tight">₹25,000<span className="text-base font-medium text-slate-400"> / month</span></p>
              <p className="text-sm text-slate-500 mb-1.5">· 12 months</p>
            </div>
            <p className="mt-6 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Payment Schedule</p>
            <div className="mt-3 grid grid-cols-6 gap-2">
              {SCHEDULE.map(([m, paid]) => (
                <div key={m} className={`rounded-xl border px-2 py-3 text-center ${paid ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"}`}>
                  <p className={`text-[11px] font-bold ${paid ? "text-emerald-700" : "text-slate-600"}`}>{m}</p>
                  <p className="text-xs mt-0.5">{paid ? <CheckCircle2 className="w-3.5 h-3.5 mx-auto text-emerald-600" /> : <Calendar className="w-3.5 h-3.5 mx-auto text-slate-300" />}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs text-slate-500 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Schedules are generated automatically the moment you create the project.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}