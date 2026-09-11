import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppData } from "@/hooks/useAppData";
import { computeInvoiceFinancials, formatCurrency } from "@/lib/finance";
import { Image } from "@/components/ui/image";
import { ArrowLeft, Printer } from "lucide-react";
import Watermark from "@/components/Watermark";

const numberToWords = (n) => {
  n = Math.round(Number(n) || 0);
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const two = (x) => (x < 20 ? a[x] : b[Math.floor(x / 10)] + (x % 10 ? " " + a[x % 10] : ""));
  const three = (x) => (x >= 100 ? a[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " : "") + two(x % 100) : two(x));
  if (n === 0) return "Zero";
  let words = "";
  const parts = [
    [10000000, "Crore"], [100000, "Lakh"], [1000, "Thousand"], [1, ""],
  ];
  for (const [val, label] of parts) {
    if (n >= val) { words += (three(Math.floor(n / val)) + " " + label + " ").trim() + " "; n %= val; }
  }
  return words.trim() + " Rupees Only";
};

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoices, clients, projects, payments, settings, loading } = useAppData();
  const invoice = (invoices || []).find((i) => i.id === id);
  const client = (clients || []).find((c) => c.id === invoice?.client_id);
  const project = (projects || []).find((p) => p.id === invoice?.project_id);
  const company = settings || {};

  if (loading) return <div className="h-96 bg-slate-100 rounded-xl animate-pulse" />;
  if (!invoice) return <div className="text-center py-20 text-slate-500">Invoice not found. <Link to="/invoices" className="text-indigo-600">Back to invoices</Link></div>;

  const f = computeInvoiceFinancials(invoice, payments);
  const invPayments = (payments || []).filter((p) => p.invoice_id === invoice.id);
  const symbol = company.currency_symbol || "₹";

  return (
    <div>
      <div className="flex items-center justify-between mb-4 print:hidden">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
          <Printer className="w-4 h-4" /> Print / PDF
        </button>
      </div>

      <div className="relative bg-white border border-slate-200 rounded-xl p-8 max-w-3xl mx-auto print:border-0 print:rounded-none overflow-hidden">
        <Watermark logo={company.logo} />
        {/* Header */}
        <div className="flex justify-between items-start gap-6 pb-6 border-b-2 border-slate-900">
          <div className="flex items-start gap-3">
            {company.logo && <Image src={company.logo} className="h-14 w-14 rounded-lg object-contain" fittingType="fit" />}
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">{company.company_name || "MeWork"}</h2>
              {company.address && <p className="text-xs text-slate-500 whitespace-pre-line mt-0.5">{company.address}</p>}
              <p className="text-xs text-slate-500 mt-0.5">
                {company.phone && <>Ph: {company.phone} · </>}{company.email}
              </p>
              {company.gst_number && <p className="text-xs text-slate-500">GSTIN: {company.gst_number}{company.pan && ` · PAN: ${company.pan}`}</p>}
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-extrabold tracking-wide text-slate-900">INVOICE</h1>
            <p className="text-sm font-semibold text-indigo-600 mt-1">{invoice.invoice_number}</p>
            <span className={`inline-block mt-2 px-2.5 py-0.5 text-[11px] font-semibold uppercase rounded-full ${f.status === "paid" ? "bg-emerald-50 text-emerald-700" : f.status === "overdue" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>
              {f.status.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Bill To / meta */}
        <div className="grid grid-cols-2 gap-6 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Bill To</p>
            <p className="font-semibold text-slate-900 text-sm">{invoice.client_name || client?.name}</p>
            {client?.company_name && <p className="text-xs text-slate-500">{client.company_name}</p>}
            {client?.address && <p className="text-xs text-slate-500 whitespace-pre-line mt-0.5">{client.address}</p>}
            <p className="text-xs text-slate-500 mt-0.5">{client?.phone}{client?.email && ` · ${client.email}`}</p>
            {client?.gst_number && <p className="text-xs text-slate-500">GSTIN: {client.gst_number}</p>}
          </div>
          <div className="text-xs space-y-1.5">
            <div className="flex justify-between"><span className="text-slate-400">Invoice Date</span><span className="font-medium text-slate-900">{invoice.invoice_date}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Due Date</span><span className="font-medium text-slate-900">{invoice.due_date || "—"}</span></div>
            {project && <div className="flex justify-between"><span className="text-slate-400">Project</span><span className="font-medium text-slate-900">{project.name}</span></div>}
            {invoice.quotation_number && <div className="flex justify-between"><span className="text-slate-400">Quotation Ref</span><span className="font-medium text-slate-900">{invoice.quotation_number}</span></div>}
          </div>
        </div>

        {/* Items */}
        <table className="w-full text-sm border border-slate-200">
          <thead>
            <tr className="bg-slate-100 text-left text-[11px] uppercase tracking-wide text-slate-600">
              <th className="px-3 py-2 border-b border-r border-slate-200 w-10">#</th>
              <th className="px-3 py-2 border-b border-r border-slate-200">Description</th>
              <th className="px-3 py-2 border-b border-r border-slate-200 text-right w-16">Qty</th>
              <th className="px-3 py-2 border-b border-r border-slate-200 text-right w-28">Rate</th>
              <th className="px-3 py-2 border-b border-slate-200 text-right w-28">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(invoice.items || []).map((it, i) => (
              <tr key={i}>
                <td className="px-3 py-2 border-r border-slate-100 text-slate-400">{i + 1}</td>
                <td className="px-3 py-2 border-r border-slate-100 text-slate-800">{it.description}</td>
                <td className="px-3 py-2 border-r border-slate-100 text-right">{it.quantity}</td>
                <td className="px-3 py-2 border-r border-slate-100 text-right">{formatCurrency(it.unit_price, symbol)}</td>
                <td className="px-3 py-2 text-right font-medium">{formatCurrency((Number(it.quantity) || 0) * (Number(it.unit_price) || 0), symbol)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-between gap-8 mt-5">
          <div className="flex-1 text-xs">
            <p className="text-slate-400 uppercase text-[10px] font-semibold tracking-wider mb-1">Amount in Words</p>
            <p className="text-slate-700 font-medium">{numberToWords(invoice.total)}</p>
            {invPayments.length > 0 && (
              <div className="mt-4">
                <p className="text-slate-400 uppercase text-[10px] font-semibold tracking-wider mb-1">Payments Received</p>
                {invPayments.map((p) => (
                  <div key={p.id} className="flex justify-between"><span className="text-slate-500">{p.date} · {p.payment_method?.replace("_", " ")}</span><span className="text-emerald-600 font-medium">{formatCurrency(p.amount, symbol)}</span></div>
                ))}
              </div>
            )}
          </div>
          <div className="w-64 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatCurrency(invoice.subtotal, symbol)}</span></div>
            {Number(invoice.discount) > 0 && <div className="flex justify-between"><span className="text-slate-500">Discount</span><span>-{formatCurrency(invoice.discount, symbol)}</span></div>}
            <div className="flex justify-between"><span className="text-slate-500">Tax{invoice.tax_rate ? ` (${invoice.tax_rate}%)` : ""}</span><span>{formatCurrency(invoice.tax, symbol)}</span></div>
            <div className="flex justify-between font-bold text-base pt-1.5 border-t border-slate-200"><span>Total</span><span className="text-indigo-600">{formatCurrency(invoice.total, symbol)}</span></div>
            {f.paid > 0 && <div className="flex justify-between text-emerald-600"><span>Paid</span><span>{formatCurrency(f.paid, symbol)}</span></div>}
            {f.pending > 0 && <div className="flex justify-between text-amber-600 font-medium"><span>Balance Due</span><span>{formatCurrency(f.pending, symbol)}</span></div>}
          </div>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-2 gap-6 mt-8 pt-5 border-t border-slate-200 text-xs">
          <div>
            {invoice.notes && <p className="text-slate-600 whitespace-pre-line">{invoice.notes}</p>}
            <p className="text-slate-400 mt-2">Thank you for your business.</p>
          </div>
          <div className="text-right">
            <p className="text-slate-600 font-semibold">For {company.company_name || "MeWork"}</p>
            <div className="h-12" />
            <p className="border-t border-slate-300 pt-1 text-slate-500 inline-block ml-auto">Authorised Signatory</p>
          </div>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-6">This is a computer generated invoice.</p>
      </div>
    </div>
  );
}