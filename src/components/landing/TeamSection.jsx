import React from "react";
import { Users, Share2, Lock, Eye, CheckCircle2, FileText, History, Bell } from "lucide-react";
import { Reveal, SectionHead } from "@/components/landing/Reveal";

const MEMBERS = [
  ["Amit Kumar", "Manager", "₹60,000 / mo"],
  ["Sneha Reddy", "Developer", "₹45,000 / mo"],
  ["Vikram Singh", "Designer", "Per project"],
];
const ACCESS = [
  ["Financial summary", true],
  ["Team & salary", true],
  ["Documents", true],
  ["Client credentials", false],
  ["Audit trail", false],
];
const DOCS = [
  ["Scope-of-work.pdf", "Shared · 2 days ago"],
  ["design-handoff.fig", "Shared · 5 days ago"],
  ["contract-2026.pdf", "Private · owner only"],
];
const AUDIT = [
  ["You", "created project ABC E-commerce", "Today, 10:24 AM"],
  ["You", "recorded payment ₹50,000 (UPI)", "Yesterday, 4:02 PM"],
  ["Amit Kumar", "uploaded Scope-of-work.pdf", "2 days ago"],
  ["You", "added domain abcecommerce.com", "3 days ago"],
];
const NOTIFS = [
  ["Invoice due tomorrow", "INV-2026-0012 · Priya Patel", "bg-amber-50 border-amber-200 text-amber-800"],
  ["Invoice overdue", "INV-2026-0009 · Amit Kumar", "bg-rose-50 border-rose-200 text-rose-700"],
  ["Domain renewal in 7 days", "abcecommerce.com", "bg-indigo-50 border-indigo-200 text-indigo-800"],
  ["Hosting renewal in 14 days", "Hostinger · Cloud", "bg-indigo-50 border-indigo-200 text-indigo-800"],
  ["Project deadline approaching", "ABC E-commerce · in 5 days", "bg-slate-50 border-slate-200 text-slate-700"],
];

export default function TeamSection() {
  return (
    <section id="team" className="py-20 sm:py-28 bg-slate-50 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHead
          eyebrow="Team & governance"
          title="Every important detail has a place."
          sub="Share projects with your team, store documents where they belong, and see every change — while staying notified about what matters."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* team */}
          <Reveal className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Users className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} /></span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Project Team</h3>
                <p className="text-[11px] text-slate-400">Members · Roles · Salary</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {MEMBERS.map(([n, r, s]) => (
                <div key={n} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{n.charAt(0)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 truncate">{n}</p>
                    <p className="text-[10px] text-slate-400">{r}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600">{s}</span>
                </div>
              ))}
            </div>
          </Reveal>

          {/* shared view + permissions */}
          <Reveal delay={0.08} className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/50 to-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-9 h-9 rounded-xl bg-white border border-indigo-200 text-indigo-600 flex items-center justify-center"><Share2 className="w-4 h-4" /></span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Shared View</h3>
                <p className="text-[11px] text-slate-400">Project-level access</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Give your team access to the project information they need — without exposing everything.
            </p>
            <div className="space-y-2">
              {ACCESS.map(([label, on]) => (
                <div key={label} className="flex items-center gap-2.5 text-xs">
                  {on ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
                  <span className={on ? "text-slate-700 font-medium" : "text-slate-400"}>{label}</span>
                  <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${on ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {on ? "Shared" : "Private"}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>

          {/* documents */}
          <Reveal delay={0.16} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><FileText className="w-4 h-4" /></span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Documents</h3>
                <p className="text-[11px] text-slate-400">Stored with the project</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {DOCS.map(([f, m]) => (
                <div key={f} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{f}</p>
                    <p className="text-[10px] text-slate-400">{m}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* audit trail */}
          <Reveal className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><History className="w-4 h-4" /></span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Audit Trail</h3>
                <p className="text-[11px] text-slate-400">Who changed what · when</p>
              </div>
            </div>
            <div className="relative pl-4">
              <span className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-slate-200" />
              {AUDIT.map(([who, what, when]) => (
                <div key={what} className="relative flex items-start gap-3 pb-4 last:pb-0">
                  <span className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white" />
                  <div>
                    <p className="text-xs text-slate-600"><span className="font-semibold text-slate-800">{who}</span> {what}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{when}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* notifications */}
          <Reveal delay={0.08} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 relative flex items-center justify-center">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">5</span>
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                <p className="text-[11px] text-slate-400">Know what needs attention</p>
              </div>
            </div>
            <div className="space-y-2">
              {NOTIFS.map(([t, d, tone]) => (
                <div key={t} className={`rounded-lg border px-3 py-2 ${tone}`}>
                  <p className="text-[11px] font-semibold">{t}</p>
                  <p className="text-[10px] opacity-70">{d}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="mt-12 flex items-center justify-center gap-2 text-sm text-slate-500">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Teammates only see the projects shared with them — the rest of your workspace stays yours.
        </Reveal>
      </div>
    </section>
  );
}