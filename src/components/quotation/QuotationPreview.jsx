import React, { useRef } from "react";
import { formatCurrency } from "@/lib/finance";
import { Image } from "@/components/ui/image";
import { X, Printer, CheckCircle2, Share2 } from "lucide-react";
import { shareOrDownloadPdf } from "@/lib/pdfUtils";

export default function QuotationPreview({ quote, settings, onClose, onApprove }) {
  const quoteCardRef = useRef(null);
  if (!quote) return null;
  const co = settings || {};
  const items = quote.items || [];
  const companyName = co.company_name || "MeWork";

  const handleSharePdf = () => {
    if (quoteCardRef.current) {
      shareOrDownloadPdf(
        quoteCardRef.current,
        `Quotation_${quote.quotation_number || "Draft"}.pdf`,
        `Quotation ${quote.quotation_number || ""}`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 overflow-y-auto print:bg-white print:static print:overflow-visible">
      <div className="print:hidden sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-700">Quotation {quote.quotation_number}</div>
        <div className="flex items-center gap-2">
          {quote.status !== "approved" && quote.status !== "rejected" && (
            <button onClick={onApprove} className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Approve → Create Project & Invoice
            </button>
          )}
          <button onClick={handleSharePdf} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            <Share2 className="w-4 h-4" /> Share PDF
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded"><X className="w-5 h-5" /></button>
        </div>
      </div>

      <div ref={quoteCardRef} className="bg-white border border-slate-200 rounded-xl max-w-3xl mx-auto my-6 print:border-0 print:rounded-none print:my-0 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-800 text-white p-6 flex items-center gap-4">
          {co.logo ? (
            <Image src={co.logo} className="h-14 w-14 rounded-lg object-contain bg-white/95" fittingType="fit" />
          ) : (
            <div className="h-14 w-14 rounded-lg bg-white/10 flex items-center justify-center text-2xl font-extrabold">{companyName.charAt(0)}</div>
          )}
          <div>
            <h2 className="text-xl font-bold tracking-tight">{companyName}</h2>
            <p className="text-xs text-indigo-200 tracking-widest uppercase">Software & Digital Solutions</p>
          </div>
          <div className="ml-auto text-right">
            <h1 className="text-3xl font-extrabold tracking-[0.15em]">QUOTATION</h1>
            <p className="text-sm font-semibold mt-1">{quote.quotation_number}</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><p className="text-[10px] uppercase tracking-wide text-slate-400">Quotation Date</p><p className="font-medium text-slate-800">{quote.date}</p></div>
            <div><p className="text-[10px] uppercase tracking-wide text-slate-400">Valid Until</p><p className="font-medium text-slate-800">{quote.valid_until || "\u2014"}</p></div>
            <div><p className="text-[10px] uppercase tracking-wide text-slate-400">Status</p><p className="font-medium capitalize text-slate-800">{quote.status}</p></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-2">Bill To</p>
              <p className="font-semibold text-slate-900">{quote.client_company || quote.client_name || "\u2014"}</p>
              <p className="text-sm text-slate-600">{quote.client_name}</p>
              {quote.client_email && <p className="text-xs text-slate-500">{quote.client_email}</p>}
              {quote.client_phone && <p className="text-xs text-slate-500">{quote.client_phone}</p>}
              {quote.client_address && <p className="text-xs text-slate-500 whitespace-pre-line">{quote.client_address}</p>}
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-2">Project Details</p>
              <p className="font-semibold text-slate-900">{quote.project_name || "\u2014"}</p>
              <p className="text-xs text-slate-500">{quote.project_type || "Custom Development"}</p>
              <p className="text-xs text-slate-500 mt-1">{quote.description || quote.details || "Scope as discussed in detail."}</p>
            </div>
          </div>

          <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-3 py-2.5 font-semibold text-slate-600 w-10">#</th>
                <th className="text-left px-3 py-2.5 font-semibold text-slate-600">Service / Description</th>
                <th className="text-right px-3 py-2.5 font-semibold text-slate-600 w-16">Qty</th>
                <th className="text-right px-3 py-2.5 font-semibold text-slate-600 w-28">Unit Price</th>
                <th className="text-right px-3 py-2.5 font-semibold text-slate-600 w-28">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((it, i) => (
                <tr key={i}>
                  <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                  <td className="px-3 py-2 text-slate-800">{it.description}</td>
                  <td className="px-3 py-2 text-right">{it.quantity}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(it.unit_price)}</td>
                  <td className="px-3 py-2 text-right font-medium">{formatCurrency((Number(it.quantity) || 0) * (Number(it.unit_price) || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatCurrency(quote.subtotal)}</span></div>
              {Number(quote.discount) > 0 && <div className="flex justify-between"><span className="text-slate-500">Discount</span><span>- {formatCurrency(quote.discount)}</span></div>}
              <div className="flex justify-between"><span className="text-slate-500">GST ({quote.tax_rate || 0}%)</span><span>{formatCurrency(quote.tax)}</span></div>
              <div className="flex justify-between font-bold text-base pt-1.5 border-t-2 border-slate-900"><span>Total Amount</span><span className="text-indigo-600">{formatCurrency(quote.total)}</span></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-1.5">Payment Terms</p>
              <p className="text-slate-600 whitespace-pre-line">{quote.terms || "50% advance, 50% on delivery."}</p>
            </div>
            {quote.notes && (
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-1.5">Notes</p>
                <p className="text-slate-600 whitespace-pre-line">{quote.notes}</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-end pt-6 border-t-2 border-slate-200">
            <div className="text-xs text-slate-500">
              <p>Thank you for your business.</p>
              <p className="mt-1">This is a computer generated quotation.</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">For {companyName}</p>
              <div className="h-12" />
              <p className="border-t border-slate-900 pt-1 text-xs text-slate-700 inline-block">Authorised Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}