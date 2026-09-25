import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { Reveal, LOGO_URL } from "@/components/landing/Reveal";
import { Image } from "@/components/ui/image";

const COLS = [
  ["Product", ["Features", "Projects", "Finance", "Quotations", "Invoices", "Reports"]],
  ["Company", ["About", "Contact", "Security"]],
  ["Resources", ["Documentation", "Help Center"]],
  ["Legal", ["Privacy", "Terms"]],
];

export function LandingFooter() {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-14">
        <div className="grid lg:grid-cols-6 gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <Image src={LOGO_URL} fittingType="fit" className="h-9 w-9" alt="MyWork logo" />
              <span className="text-lg font-bold tracking-tight text-slate-900">MyWork</span>
            </div>
            <p className="mt-4 text-sm text-slate-500 max-w-xs leading-relaxed">Everything you work on. All in one place.</p>
          </div>
          {COLS.map(([title, items]) => (
            <div key={title}>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900">{title}</p>
              <ul className="mt-4 space-y-2.5">
                {items.map((it) => (
                  <li key={it}>
                    <a href="#top" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">{it}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">© 2026 MyWork. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            {["Projects", "Clients", "Finance", "Invoices", "Domains", "Hosting"].map((t) => (
              <span key={t} className="hidden sm:inline text-[10px] text-slate-300">· {t}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function CtaSection() {
  return (
    <>
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[640px] h-[360px] rounded-full bg-indigo-400/20 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,black,transparent)]" />
        </div>
        <Reveal className="relative mx-auto max-w-3xl px-4 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">Bring your work together.</h2>
          <p className="mt-4 text-base sm:text-lg text-slate-500 leading-relaxed">
            Projects, clients, money and everything in between — managed from one place.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register" className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-[0_10px_28px_-8px_rgba(0,103,214,0.6)] hover:bg-indigo-700 transition-all">
              Get Started Free <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:border-slate-400 hover:bg-slate-50 transition-all">
              <Play className="w-4 h-4 text-indigo-600" /> See How It Works
            </a>
          </div>
        </Reveal>
      </section>
      <LandingFooter />
    </>
  );
}