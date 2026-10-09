import React from "react";
import { FileText, Send, CheckCircle2, Receipt, CreditCard, TrendingUp, ArrowRight, MousePointerClick } from "lucide-react";
import { Reveal, SectionHead, LOGO_URL } from "@/components/landing/Reveal";
import { Image } from "@/components/ui/image";

const STEPS = [
  ["01", "Create Quotation", FileText],
  ["02", "Send to Client", Send],
  ["03", "Approve", CheckCircle2],
  ["04", "Convert to Invoice", Receipt],
  ["05", "Record Payment", CreditCard],
  ["06", "Track Revenue", TrendingUp],
];

function QuotationPreview() {
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_40px_-16px_rgba(15,23,42,0.18)] overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Image src={LOGO_URL} fittingType="fit" className="h-7 w-7" alt="MyWork" />
          <span className="text-sm font-bold text-slate-900">QUOTATION</span>
        </div>
        <span className="text-[10px] font-semibold text-slate-400">QT-2026-0007</span>
      </div>
      <p className="mt-4 text-[11px] text-slate-500">To: <span className="font-semibold text-slate-700">Priya Patel · Patel Softwares</span></p>
      <div className="mt-4 space-y-2">
        {[["XYZ ERP — Development Phase 1", "₹1,80,000"], ["XYZ ERP — UI/UX Design", "₹70,000"], ["Domain & Hosting (Year 1)", "₹12,000"]].map(([d, v]) => (
          <div key={d} className="flex justify-between text-[11px] text-slate-600 border-b border-dashed border-slate-100 pb-1.5"><span>{d}</span><span className="font-semibold text-slate-700">{v}</span></div>
        ))}
      </div>
      <div className="mt-4 space-y-1 text-[11px]">
        <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>₹2,62,000</span></div>
        <div className="flex justify-between text-slate-500"><span>GST (18%)</span><span>₹47,160</span></div>
        <div className="flex justify-between font-bold text-slate-900 text-xs pt-1.5 border-t border-slate-200 mt-1.5"><span>Total</span><span>₹3,09,160</span></div>
      </div>
      <span className="inline-block mt-4 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Sent · Valid 30 days</span>
    </div>
  );
}

function InvoicePreview() {
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_40px_-16px_rgba(15,23,42,0.18)] overflow-hidden">
      <Image src={LOGO_URL} fittingType="fit" className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 opacity-[0.05]" alt="" />
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Image src={LOGO_URL} fittingType="fit" className="h-7 w-7" alt="MyWork" />
          <span className="text-sm font-bold text-slate-900">INVOICE</span>
        </div>
        <span className="text-[10px] font-semibold text-slate-400">INV-2026-0012</span>
      </div>
      <p className="mt-4 text-[11px] text-slate-500">To: <span className="font-semibold text-slate-700">Priya Patel · Patel Softwares</span></p>
      <div className="mt-4 space-y-2">
        {[["XYZ ERP — Development Phase 1", "₹1,80,000"], ["XYZ ERP — UI/UX Design", "₹70,000"]].map(([d, v]) => (
          <div key={d} className="flex justify-between text-[11px] text-slate-600 border-b border-dashed border-slate-100 pb-1.5"><span>{d}</span><span className="font-semibold text-slate-700">{v}</span></div>
        ))}
      </div>
      <div className="mt-4 space-y-1 text-[11px]">
        <div className="flex justify-between text-slate-500"><span>Taxable value</span><span>₹2,50,000</span></div>
        <div className="flex justify-between text-slate-500"><span>GST (18%)</span><span>₹45,000</span></div>
        <div className="flex justify-between text-slate-500"><span>Discount</span><span>−₹10,000</span></div>
        <div className="flex justify-between font-bold text-slate-900 text-xs pt-1.5 border-t border-slate-200 mt-1.5"><span>Total</span><span>₹2,85,000</span></div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Partially Paid · ₹1,25,000</span>
        <span className="text-[10px] font-bold text-slate-500">Due 15 Oct 2026</span>
      </div>
    </div>
  );
}

export default function DocWorkflow() {
  return (
    <section id="documents" className="py-20 sm:py-28 bg-slate-50 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHead
          eyebrow="Quotations & Invoices"
          title="From quotation to payment, without the paperwork."
          sub="Professional documents with your branding — and a workflow that connects them."
        />

        {/* steps */}
        <Reveal className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {STEPS.map(([n, label, Icon], i) => (
              <div key={n} className="relative rounded-xl border border-slate-200 bg-white px-4 py-4 text-center shadow-sm">
                <span className="text-[10px] font-extrabold text-indigo-500">{n}</span>
                <Icon className="w-5 h-5 mx-auto text-slate-700 my-1.5" />
                <p className="text-[11px] font-semibold text-slate-700 leading-tight">{label}</p>
                {i < STEPS.length - 1 && <ArrowRight className="hidden lg:block w-3.5 h-3.5 text-indigo-400 absolute top-1/2 -right-2.5 -translate-y-1/2 z-10" />}
              </div>
            ))}
          </div>
        </Reveal>

        {/* previews */}
        <div className="mt-12 grid md:grid-cols-2 gap-6 lg:gap-10 max-w-4xl mx-auto">
          <Reveal><QuotationPreview /></Reveal>
          <Reveal delay={0.12}><InvoicePreview /></Reveal>
        </div>

        <Reveal delay={0.2} className="mt-10 text-center">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 bg-white border border-indigo-200 rounded-full px-5 py-2.5 shadow-sm">
            <MousePointerClick className="w-4 h-4" /> Approved quotations can become invoices in one click.
          </p>
        </Reveal>
      </div>
    </section>
  );
}