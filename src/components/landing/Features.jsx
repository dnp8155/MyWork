import React from "react";
import {
  FolderKanban, Users, IndianRupee, FileText, Globe, KeyRound,
  CheckCircle2, ArrowRight, Clock, TrendingUp,
} from "lucide-react";
import { Reveal, SectionHead } from "@/components/landing/Reveal";

function Card({ icon: Icon, title, copy, tags, visual, delay }) {
  return (
    <Reveal delay={delay} className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-indigo-200 hover:shadow-[0_12px_32px_-12px_rgba(15,23,42,0.15)] transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </span>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
      </div>
      <p className="text-sm text-slate-500 leading-relaxed">{copy}</p>
      <div className="mt-5">{visual}</div>
      <div className="mt-5 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="text-[10px] font-medium px-2 py-1 rounded-md bg-slate-100 text-slate-500">{t}</span>
        ))}
      </div>
    </Reveal>
  );
}

function ProjectsVisual() {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-2">
      {[["ABC E-commerce", "Rahul Sharma", 62, "₹1,20,000"], ["XYZ ERP", "Priya Patel", 34, "₹3,00,000"]].map(([n, c, p, v]) => (
        <div key={n} className="rounded-lg bg-white border border-slate-100 p-2.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
            <span>{n}</span><span className="text-slate-500">{v}</span>
          </div>
          <p className="text-[10px] text-slate-400">{c}</p>
          <div className="h-1 bg-slate-100 rounded-full mt-2"><div className="h-full bg-indigo-600 rounded-full" style={{ width: `${p}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

function ClientsVisual() {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-2">
      {[["Rahul Sharma", "2 projects · ₹1,85,000"], ["Priya Patel", "1 project · ₹3,00,000"]].map(([n, d]) => (
        <div key={n} className="flex items-center gap-2.5 rounded-lg bg-white border border-slate-100 p-2.5">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{n.charAt(0)}</span>
          <div>
            <p className="text-[11px] font-semibold text-slate-700">{n}</p>
            <p className="text-[10px] text-slate-400">{d}</p>
          </div>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto" />
        </div>
      ))}
    </div>
  );
}

function FinanceVisual() {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-2">
      {[["Revenue", "₹12,40,000", "text-emerald-600", TrendingUp], ["Expenses", "₹2,85,000", "text-rose-500", Clock], ["Net Profit", "₹9,55,000", "text-emerald-600", TrendingUp]].map(([l, v, c, Ic]) => (
        <div key={l} className="flex items-center justify-between rounded-lg bg-white border border-slate-100 px-3 py-2">
          <span className="text-[11px] text-slate-500 flex items-center gap-1.5"><Ic className="w-3 h-3 text-slate-400" />{l}</span>
          <span className={`text-[11px] font-bold ${c}`}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function DocFlowVisual() {
  const steps = ["Quotation", "Approved", "Invoice", "Payment", "Paid"];
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
      <div className="flex items-center flex-wrap gap-1.5">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <span className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-md ${i === steps.length - 1 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-white text-slate-600 border border-slate-200"}`}>{s}</span>
            {i < steps.length - 1 && <ArrowRight className="w-3 h-3 text-indigo-400" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function AssetsVisual({ rows }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-2">
      {rows.map(([name, meta, state, tone]) => (
        <div key={name} className="flex items-center justify-between rounded-lg bg-white border border-slate-100 px-3 py-2">
          <div>
            <p className="text-[11px] font-semibold text-slate-700">{name}</p>
            <p className="text-[10px] text-slate-400">{meta}</p>
          </div>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${tone}`}>{state}</span>
        </div>
      ))}
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-slate-50 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHead
          eyebrow="Features"
          title="Everything connected. Nothing overlooked."
          sub="One workspace for every part of your business workflow."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            icon={FolderKanban} title="Projects" delay={0}
            copy="Manage fixed-price and recurring projects with complete financial visibility."
            tags={["Project logo", "Progress", "Revenue", "Expenses", "Profit"]}
            visual={<ProjectsVisual />}
          />
          <Card
            icon={Users} title="Clients" delay={0.06}
            copy="Keep every client, project and financial relationship organized."
            tags={["Client profile", "Linked projects", "Invoices", "Payments"]}
            visual={<ClientsVisual />}
          />
          <Card
            icon={IndianRupee} title="Finance" delay={0.12}
            copy="Know exactly where your money is coming from and where it's going."
            tags={["Revenue", "Expenses", "Profit", "Transactions", "Ledger"]}
            visual={<FinanceVisual />}
          />
          <Card
            icon={FileText} title="Quotations & Invoices" delay={0}
            copy="Create professional documents and turn approved quotations into invoices in seconds."
            tags={["Line items", "Tax & discount", "Branding", "Print-ready"]}
            visual={<DocFlowVisual />}
          />
          <Card
            icon={Globe} title="Domains & Hosting" delay={0.06}
            copy="Never lose track of renewals, costs or ownership."
            tags={["Registrar", "Renewal dates", "Costs", "Expiry reminders"]}
            visual={<AssetsVisual rows={[["abcecommerce.com", "GoDaddy · renews 12 Oct", "Active", "bg-emerald-50 text-emerald-700"], ["Hostinger · Cloud", "renews 24 Oct · ₹8,500", "Renew soon", "bg-amber-50 text-amber-700"]]} />}
          />
          <Card
            icon={KeyRound} title="Credentials" delay={0.12}
            copy="Keep project-related access organized and easy to retrieve."
            tags={["Domain login", "Hosting", "Google", "Email", "Server"]}
            visual={<AssetsVisual rows={[["GoDaddy Account", "admin@agency.in", "Copy", "bg-indigo-50 text-indigo-700"], ["Server SSH", "dev@xyz.co.in", "Copy", "bg-indigo-50 text-indigo-700"]]} />}
          />
        </div>
      </div>
    </section>
  );
}