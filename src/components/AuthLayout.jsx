import React from "react";
import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";

const LOGO_URL = "https://media.base44.com/images/public/6aa4049391d33a443027588d/3321c12ed_ChatGPTImageSep11202607_58_37PM.png";

function BrandPanel({ title, sub, kpis }) {
  const kpiList = kpis || [
    ["Revenue", "₹12,40,000", "text-white"],
    ["Expenses", "₹2,85,000", "text-rose-200"],
    ["Profit", "₹9,55,000", "text-emerald-300"],
    ["Active Projects", "4", "text-white"],
    ["Pending Payments", "₹1,85,000", "text-white"],
  ];
  return (
    <div className="hidden md:flex md:w-[40%] lg:w-[45%] flex-col justify-between relative overflow-hidden bg-gradient-to-b from-indigo-600 via-indigo-700 to-indigo-900 text-white p-10 xl:p-14">
      {/* decorative backdrop */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:44px_44px]" />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-400/30 blur-3xl" />
        <div className="absolute -bottom-32 right-0 w-[420px] h-[420px] rounded-full bg-blue-500/20 blur-3xl" />
      </div>

      <div className="relative">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-2xl bg-white/95 flex items-center justify-center shadow-lg">
            <Image src={LOGO_URL} fittingType="fit" className="h-7 w-7" alt="MyWork" />
          </span>
          <span className="text-xl font-bold tracking-tight">MyWork</span>
        </div>

        <h2 className="mt-14 text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight">
          {title || <>Everything you work on.<br />All in one place.</>}
        </h2>
        <p className="mt-4 text-sm text-indigo-100/90 leading-relaxed max-w-sm">
          {sub || "Projects, clients, finances, invoices, domains, hosting and more — connected in one powerful workspace."}
        </p>
      </div>

      {/* subtle dashboard visualization */}
      <div className="relative mt-10 opacity-90" aria-hidden="true">
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 shadow-2xl">
          <div className="grid grid-cols-3 gap-2.5">
            {kpiList.slice(0, 3).map(([l, v, tone]) => (
              <div key={l} className="rounded-xl bg-white/10 px-3 py-2.5">
                <p className="text-[9px] uppercase tracking-wide text-indigo-100/70">{l}</p>
                <p className={`text-sm font-bold ${tone || "text-white"}`}>{v}</p>
              </div>
            ))}
          </div>
          {kpiList.length > 3 && (
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {kpiList.slice(3).map(([l, v, tone]) => (
                <div key={l} className="rounded-xl bg-white/10 px-3 py-2.5 flex items-center justify-between">
                  <p className="text-[10px] text-indigo-100/80">{l}</p>
                  <p className={`text-sm font-bold ${tone || "text-white"}`}>{v}</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex items-end gap-1.5 h-16">
            {[45, 70, 52, 85, 60, 95, 74, 88].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-white/25" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="absolute inset-x-10 -bottom-2 h-8 rounded-[100%] bg-black/30 blur-xl -z-10" />
      </div>

      <p className="relative mt-10 text-xs text-indigo-200/70">© 2026 MyWork</p>
    </div>
  );
}

export default function AuthLayout({ title, subtitle, footer, children, brandTitle, brandSub, brandKpis }) {
  return (
    <div className="min-h-screen flex bg-background">
      <BrandPanel title={brandTitle} sub={brandSub} kpis={brandKpis} />
      <div className="flex-1 flex items-center justify-center px-5 sm:px-10 py-12">
        <motion.div
          className="w-full max-w-[420px]"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <Image src={LOGO_URL} fittingType="fit" className="h-10 w-10" alt="MyWork logo" />
            <span className="text-lg font-bold tracking-tight text-slate-900">MyWork</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-center">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-2 text-center mb-8">{subtitle}</p>}
          {!subtitle && <div className="mb-8" />}
          {children}
          {footer && <p className="text-center text-sm text-slate-500 mt-6">{footer}</p>}
        </motion.div>
      </div>
    </div>
  );
}