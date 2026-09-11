import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FolderKanban, Users, IndianRupee, Receipt, CreditCard, Globe, HardDrive, KeyRound, ArrowRight } from "lucide-react";
import { Reveal, CountUp } from "@/components/landing/Reveal";

const MONTHS = [
  { m: "Apr", i: 62, e: 28 }, { m: "May", i: 78, e: 34 }, { m: "Jun", i: 54, e: 22 },
  { m: "Jul", i: 90, e: 40 }, { m: "Aug", i: 70, e: 30 }, { m: "Sep", i: 96, e: 36 },
];

function DashboardMockup() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_24px_80px_-12px_rgba(15,23,42,0.25),0_4px_12px_rgba(15,23,42,0.06)] overflow-hidden text-left">
      {/* window chrome */}
      <div className="flex items-center gap-1.5 px-4 h-9 bg-slate-50 border-b border-slate-100">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 text-[10px] text-slate-400">meework.base44.app</span>
      </div>
      <div className="flex">
        {/* mini sidebar */}
        <div className="hidden sm:flex flex-col w-40 border-r border-slate-100 p-3 gap-1">
          <div className="flex items-center gap-1.5 mb-3 px-1">
            <div className="w-5 h-5 rounded bg-indigo-600" />
            <span className="text-[11px] font-bold text-slate-800">MyWork</span>
          </div>
          {["Dashboard", "Projects", "Clients", "Invoices", "Finance", "Domains", "Hosting"].map((n, i) => (
            <div key={n} className={`text-[10px] px-2 py-1.5 rounded-md font-medium ${i === 0 ? "bg-indigo-600 text-white" : "text-slate-400"}`}>{n}</div>
          ))}
        </div>
        {/* content */}
        <div className="flex-1 p-4 sm:p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { l: "Total Revenue", v: 1240000, c: "text-slate-900" },
              { l: "Total Expenses", v: 285000, c: "text-slate-900" },
              { l: "Net Profit", v: 955000, c: "text-emerald-600" },
              { l: "Pending", v: 185000, c: "text-amber-600" },
            ].map((k) => (
              <div key={k.l} className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                <p className="text-[9px] text-slate-400 font-medium">{k.l.toUpperCase()}</p>
                <p className={`text-sm sm:text-base font-bold ${k.c}`}>
                  <CountUp to={k.v} prefix="₹" />
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-1 lg:grid-cols-5 gap-3">
            {/* bar chart */}
            <div className="lg:col-span-3 rounded-xl border border-slate-100 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-semibold text-slate-600">Income vs Expenses</p>
                <div className="flex items-center gap-2 text-[8px] text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-indigo-600 inline-block" />Income</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-slate-300 inline-block" />Expenses</span>
                </div>
              </div>
              <div className="flex items-end justify-between gap-2 h-28">
                {MONTHS.map((d) => (
                  <div key={d.m} className="flex-1 flex items-end justify-center gap-1 h-full">
                    <div className="w-2.5 sm:w-3 rounded-t bg-indigo-600 transition-all" style={{ height: `${d.i}%` }} />
                    <div className="w-2.5 sm:w-3 rounded-t bg-slate-300" style={{ height: `${d.e}%` }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1.5 text-[8px] text-slate-400">
                {MONTHS.map((d) => <span key={d.m}>{d.m}</span>)}
              </div>
            </div>
            {/* donut */}
            <div className="lg:col-span-2 rounded-xl border border-slate-100 p-3">
              <p className="text-[10px] font-semibold text-slate-600 mb-2">Project Distribution</p>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-full shrink-0" style={{ background: "conic-gradient(#007bff 0 38%, #0054ab 38% 72%, #8ec2ff 72% 88%, #cbd5e1 88% 100%)" }}>
                  <div className="absolute inset-2.5 bg-white rounded-full" />
                </div>
                <div className="space-y-1.5 text-[9px] text-slate-500 w-full">
                  {[["ABC E-commerce", "38%", "#007bff"], ["XYZ ERP", "34%", "#0054ab"], ["Marketing Website", "16%", "#8ec2ff"], ["Monthly Support", "12%", "#cbd5e1"]].map(([n, p, c]) => (
                    <div key={n} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 truncate"><span className="w-2 h-2 rounded-sm inline-block shrink-0" style={{ background: c }} />{n}</span>
                      <span className="font-semibold text-slate-700">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const CAPS = [
  ["Projects", FolderKanban], ["Clients", Users], ["Finance", IndianRupee], ["Invoices", Receipt],
  ["Payments", CreditCard], ["Domains", Globe], ["Hosting", HardDrive], ["Credentials", KeyRound],
];

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-white pt-32 sm:pt-40 pb-16">
      {/* subtle grid + glow backdrop */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.045)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[420px] rounded-full bg-indigo-400/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <Reveal className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 backdrop-blur px-3.5 py-1.5 text-xs font-medium text-indigo-700 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            The all-in-one workspace for service businesses
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.08]">
            Your entire work,<br />finally in one place.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
            Manage projects, clients, finances, invoices, domains, hosting and everything in between — from one powerful workspace.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register" className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-[0_8px_20px_-6px_rgba(0,103,214,0.5)] hover:bg-indigo-700 hover:shadow-[0_10px_24px_-6px_rgba(0,103,214,0.6)] transition-all">
              Get Started Free <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href="#features" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:border-slate-400 hover:bg-slate-50 transition-all">
              Explore MyWork
            </a>
          </div>
          <p className="mt-4 text-xs text-slate-400">No spreadsheets. No scattered tools. No missing information.</p>
        </Reveal>

        {/* floating dashboard mockup */}
        <motion.div
          className="relative mt-14 sm:mt-16 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: [0, -10, 0] }}
          transition={{ opacity: { duration: 0.9 }, y: { duration: 7, repeat: Infinity, ease: "easeInOut" } }}
        >
          <DashboardMockup />
          <div className="absolute inset-x-8 -bottom-3 h-10 rounded-[100%] bg-indigo-900/10 blur-lg -z-10 hidden lg:block" aria-hidden="true" />
        </motion.div>

        {/* trust strip */}
        <Reveal delay={0.15} className="mt-20 max-w-4xl mx-auto text-center">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Everything your business needs to manage work</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            {CAPS.map(([label, Icon]) => (
              <span key={label} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-600 shadow-sm hover:border-indigo-300 hover:text-indigo-700 transition-colors">
                <Icon className="w-3.5 h-3.5 text-indigo-500" /> {label}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}