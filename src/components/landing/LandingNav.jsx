import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Menu, X, ArrowRight } from "lucide-react";
import { LOGO_URL } from "@/components/landing/Reveal";

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "Solutions", href: "#solutions" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Reports", href: "#reports" },
  { label: "Security", href: "#security" },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/85 backdrop-blur-md border-b border-slate-200/70 shadow-[0_1px_3px_rgba(15,23,42,0.04)]" : "bg-transparent"
      }`}
    >
      <div className={`mx-auto max-w-7xl px-4 lg:px-8 flex items-center justify-between transition-all duration-300 ${scrolled ? "h-14" : "h-[72px]"}`}>
        <a href="#top" className="flex items-center gap-2.5">
          <Image src={LOGO_URL} fittingType="fit" className="h-9 w-9" alt="MyWork logo" />
          <span className="text-lg font-bold tracking-tight text-slate-900">MyWork</span>
        </a>

        <nav className="hidden md:flex items-center gap-7">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 transition-colors">Log in</Link>
          <Link
            to="/register"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-[0_1px_2px_rgba(0,103,214,0.35),inset_0_1px_0_rgba(255,255,255,0.12)]"
          >
            Get Started <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <button className="md:hidden text-slate-700 p-2" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-1 shadow-lg">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
              {l.label}
            </a>
          ))}
          <div className="pt-3 flex gap-3">
            <Link to="/login" className="flex-1 text-center px-4 py-2.5 text-sm font-medium border border-slate-300 rounded-lg text-slate-700">Log in</Link>
            <Link to="/register" className="flex-1 text-center px-4 py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-lg">Get Started</Link>
          </div>
        </div>
      )}
    </header>
  );
}