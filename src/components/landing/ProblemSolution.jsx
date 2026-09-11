import React from "react";
import { X, FolderKanban, Users, FileText, Receipt, CreditCard, Wallet, TrendingUp, ArrowRight } from "lucide-react";
import { Reveal, SectionHead } from "@/components/landing/Reveal";

const WITHOUT = [
  "Projects in one place", "Client details somewhere else", "Invoices in spreadsheets",
  "Payments tracked manually", "Domains forgotten", "Hosting renewals missed",
  "Credentials scattered", "Expenses disconnected", "Profit unclear",
];

const FLOW = [
  ["Projects", FolderKanban], ["Clients", Users], ["Quotes", FileText], ["Invoices", Receipt],
  ["Payments", CreditCard], ["Expenses", Wallet], ["Profit", TrendingUp],
];

export default function ProblemSolution() {
  return (
    <section id="problem" className="py-20 sm:py-28 bg-white scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHead
          eyebrow="The problem"
          title="Your work is connected. Your tools shouldn't be scattered."
          sub="Running a business from disconnected tools means every answer lives somewhere else. MyWork connects the whole workflow."
        />
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-stretch max-w-6xl mx-auto">
          {/* without */}
          <Reveal className="rounded-2xl border border-slate-200 bg-slate-50/50 p-7 sm:p-9">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-5">Without MyWork</p>
            <ul className="space-y-3.5">
              {WITHOUT.map((w) => (
                <li key={w} className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="w-5 h-5 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                    <X className="w-3 h-3" />
                  </span>
                  {w}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* with */}
          <Reveal delay={0.12} className="relative rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/60 to-white p-7 sm:p-9 shadow-[0_4px_24px_-8px_rgba(0,103,214,0.15)]">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-5">With MyWork</p>
            <p className="text-xl font-bold text-slate-900 mb-6">One connected workspace.</p>
            <div className="flex flex-wrap items-center gap-2">
              {FLOW.map(([label, Icon], i) => (
                <React.Fragment key={label}>
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
                    <Icon className="w-3.5 h-3.5 text-indigo-600" /> {label}
                  </span>
                  {i < FLOW.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />}
                </React.Fragment>
              ))}
            </div>
            <div className="mt-8 rounded-xl bg-white/80 border border-indigo-100 px-4 py-3 text-sm text-slate-600">
              Every piece of information flows into the next — so nothing gets lost in between.
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}