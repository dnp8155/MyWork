import React from "react";
import { UserPlus, FolderKanban, Wallet, LayoutDashboard, ShieldCheck, KeyRound, History, Users, FileCheck } from "lucide-react";
import { Reveal, SectionHead } from "@/components/landing/Reveal";

const STEPS = [
  ["01", "Add your clients", "Names, contacts and details — or fill them in as you go.", UserPlus],
  ["02", "Create your projects", "Fixed or monthly, with pricing that matches how you bill.", FolderKanban],
  ["03", "Track money, documents and assets", "Payments, expenses, quotations, domains, hosting, credentials.", Wallet],
  ["04", "See everything in one dashboard", "Profit, pending payments and what needs attention next.", LayoutDashboard],
];

const SECURITY = [
  ["Authentication", "Every user signs in with a verified account."],
  ["Role-based access", "Admins and users get the permissions their role needs."],
  ["Project-level access", "Shared projects expose only what you choose to share."],
  ["Audit trail", "Changes across projects and finances are recorded."],
  ["Controlled credentials access", "Credentials stay visible only to you and teammates you grant."],
];

export default function HowItWorks() {
  return (
    <>
      <section id="how-it-works" className="py-20 sm:py-28 bg-slate-50 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHead eyebrow="How MyWork works" title="Simple from day one." />
          <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <span className="hidden lg:block absolute top-9 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent" aria-hidden="true" />
            {STEPS.map(([n, title, desc, Icon], i) => (
              <Reveal key={n} delay={i * 0.08} className="relative rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm hover:shadow-[0_12px_32px_-12px_rgba(15,23,42,0.15)] transition-shadow">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-[0_6px_16px_-4px_rgba(0,103,214,0.5)]">
                  <Icon className="w-5 h-5" />
                </div>
                <p className="mt-4 text-[10px] font-extrabold tracking-widest text-indigo-500">{n}</p>
                <h3 className="mt-1 text-sm font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">{desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="py-20 sm:py-28 bg-slate-900 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHead
            light
            eyebrow="Security & control"
            title="Your workspace. Your control."
            sub="MyWork gives you the tools to decide who sees what — no more, no less."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto lg:grid-cols-3">
            {SECURITY.map(([title, desc], i) => {
              const icons = [ShieldCheck, Users, FileCheck, History, KeyRound];
              const Icon = icons[i % icons.length];
              return (
                <Reveal key={title} delay={i * 0.05} className="rounded-2xl border border-slate-700/60 bg-slate-800/50 backdrop-blur p-6 hover:border-indigo-500/50 transition-colors">
                  <Icon className="w-5 h-5 text-indigo-400" />
                  <h3 className="mt-3 text-sm font-bold text-white">{title}</h3>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{desc}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}