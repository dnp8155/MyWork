import React from "react";
import { Briefcase, Globe, Code2, Wrench, Megaphone } from "lucide-react";
import { Reveal, SectionHead } from "@/components/landing/Reveal";

const CASES = [
  ["Freelancers", "Manage every client and project from one place.", Briefcase],
  ["Web Agencies", "Track projects, domains, hosting, invoices and expenses.", Globe],
  ["Software Companies", "Keep projects, teams and finances connected.", Code2],
  ["IT Service Providers", "Manage recurring clients, support work and payments.", Wrench],
  ["Digital Agencies", "Know your revenue, expenses and project profitability.", Megaphone],
];

export default function UseCases() {
  return (
    <section id="solutions" className="py-20 sm:py-28 bg-white scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHead
          eyebrow="Use cases"
          title="Built for businesses that deliver work."
          sub="From solo freelancers to growing service companies — if your work is project-based, MyWork fits."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {CASES.map(([title, desc, Icon], i) => (
            <Reveal key={title} delay={i * 0.06} className={`rounded-2xl border p-6 transition-all hover:-translate-y-1 ${i === 4 ? "border-indigo-200 bg-gradient-to-b from-indigo-50/60 to-white sm:col-span-2 lg:col-span-1" : "border-slate-200 bg-white"} hover:shadow-[0_12px_32px_-12px_rgba(15,23,42,0.15)]`}>
              <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </span>
              <h3 className="mt-4 text-sm font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">{desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}