import React from "react";
import { Globe, HardDrive, Bell, Copy, KeyRound, RefreshCw, ShieldCheck } from "lucide-react";
import { Reveal, SectionHead } from "@/components/landing/Reveal";

const DOMAINS = [
  ["Domain name", "abcecommerce.com"], ["Registrar", "GoDaddy"], ["Purchase cost", "₹1,200"],
  ["Renewal date", "12 Oct 2026"], ["Renewal cost", "₹1,400"], ["Linked project", "ABC E-commerce"],
];
const HOSTING = [
  ["Provider", "Hostinger"], ["Plan", "Cloud Professional"], ["Cost", "₹8,500 / yr"],
  ["Renewal date", "24 Oct 2026"], ["Billing cycle", "Yearly"], ["Linked project", "ABC E-commerce"],
];
const CREDS = [
  ["Domain", "admin@agency.in", "GoDaddy login"],
  ["Hosting", "deploy@agency.in", "Hostinger panel"],
  ["Google", "devs@agency.in", "Workspace admin"],
  ["Email", "support@abcecommerce.com", "Client mailbox"],
  ["Server", "ubuntu@203.0.113.9", "SSH access"],
];

function DetailCard({ icon: Icon, title, rows, delay }) {
  return (
    <Reveal delay={delay} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-[0_16px_40px_-16px_rgba(15,23,42,0.18)] transition-shadow">
      <div className="flex items-center gap-3 mb-5">
        <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Icon className="w-5 h-5" /></span>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
      </div>
      <dl className="space-y-2.5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between text-sm border-b border-dashed border-slate-100 pb-2 last:border-0">
            <dt className="text-slate-400">{k}</dt>
            <dd className="font-semibold text-slate-700">{v}</dd>
          </div>
        ))}
      </dl>
    </Reveal>
  );
}

export default function AssetsSection() {
  return (
    <section id="assets" className="py-20 sm:py-28 bg-white scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHead
          eyebrow="Digital assets"
          title="Your digital assets, under control."
          sub="Domains, hosting and credentials — linked to the projects they belong to, with expiry reminders before anything lapses."
        />

        {/* renewal notifications */}
        <Reveal className="flex flex-col sm:flex-row justify-center gap-3 max-w-2xl mx-auto mb-12">
          {[
            ["Domain renewal in 12 days", Globe, "bg-amber-50 border-amber-200 text-amber-800"],
            ["Hosting renewal in 24 days", HardDrive, "bg-indigo-50 border-indigo-200 text-indigo-800"],
          ].map(([msg, Icon, tone]) => (
            <div key={msg} className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm ${tone}`}>
              <Bell className="w-4 h-4" /> {msg}
            </div>
          ))}
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <DetailCard icon={Globe} title="Domains" rows={DOMAINS} />
          <DetailCard icon={HardDrive} title="Hosting" rows={HOSTING} delay={0.1} />
        </div>

        {/* credentials */}
        <Reveal className="max-w-4xl mx-auto mt-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 justify-center">
              <KeyRound className="w-5 h-5 text-indigo-600" />
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">Access what you need. When you need it.</h3>
            </div>
            <p className="mt-3 text-sm text-slate-500 max-w-xl mx-auto">
              Keep project and client credentials organized inside the workspace — with a built-in password generator and copy-to-clipboard. Shown here: masked demo values only.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-[0_16px_40px_-16px_rgba(15,23,42,0.18)]">
            <div className="grid grid-cols-[1fr_1.4fr_1fr_auto] gap-3 px-5 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              <span>Service</span><span>Username / Email</span><span>Password</span><span />
            </div>
            {CREDS.map(([service, user, note]) => (
              <div key={service} className="grid grid-cols-[1fr_1.4fr_1fr_auto] gap-3 items-center px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                <span className="text-sm font-semibold text-slate-800">{service}</span>
                <span className="text-xs text-slate-500 truncate">{user}</span>
                <span className="text-xs text-slate-400 font-mono">••••••••</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-600 border border-indigo-200 rounded-md px-2 py-1 bg-indigo-50/60">
                  <Copy className="w-3 h-3" /> Copy
                </span>
              </div>
            ))}
          </div>
          <p className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            Credentials in your workspace are visible only to you and the teammates you grant access to.
            <RefreshCw className="w-3 h-3 ml-1" />
          </p>
        </Reveal>
      </div>
    </section>
  );
}