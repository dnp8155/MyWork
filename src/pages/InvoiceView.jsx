import React, { useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppData } from "@/hooks/useAppData";
import { computeInvoiceFinancials, formatCurrency } from "@/lib/finance";
import { Printer, ArrowLeft, Share2 } from "lucide-react";
import Watermark from "@/components/Watermark";
import { Image } from "@/components/ui/image";
import { shareOrDownloadPdf } from "@/lib/pdfUtils";

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
  const invoiceCardRef = useRef(null);
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

  const handleSharePdf = () => {
    if (invoiceCardRef.current) {
      shareOrDownloadPdf(
        invoiceCardRef.current,
        `Invoice_${invoice.invoice_number || "Draft"}.pdf`,
        `Invoice ${invoice.invoice_number || ""}`
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 print:p-0 print:m-0 print:max-w-none">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </button>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSharePdf}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Share2 className="w-4 h-4" /> Share PDF
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Main Invoice Card Container matching mockup */}
      <div ref={invoiceCardRef} className="relative bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden print:shadow-none print:border-0 print:rounded-none print:w-full print:bg-white print:m-0 print:p-0">
        <Watermark logo={company.logo} />

        {/* 1. Header Banner (Dark Gradient) */}
        <div className="bg-gradient-to-r from-[#1E2538] via-[#2A344D] to-[#3B2D54] text-white p-7 sm:p-8 print:p-8 print:bg-[#1E2538] print:text-white" style={{ WebkitPrintColorAdjust: "exact" }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
            {/* Logo & Company Info */}
            <div className="flex items-center gap-4">
              {company.logo ? (
                <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20">
                  <Image src={company.logo} className="h-12 w-12 rounded-lg object-contain" fittingType="fit" />
                </div>
              ) : (
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/20">
                  <span className="text-xl font-black text-indigo-300">N</span>
                </div>
              )}
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-white uppercase">{company.company_name || "MY COMPANY"}</h2>
                {company.gst_number && (
                  <p className="text-xs font-mono text-slate-300 mt-1">GSTIN: {company.gst_number}{company.pan && ` · PAN: ${company.pan}`}</p>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="w-full sm:w-auto text-left sm:text-right">
              <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-white uppercase">TAX INVOICE</h1>
            </div>
          </div>
        </div>

        <div className="p-7 sm:p-9 space-y-7">
          {/* 2. Dual Metadata Cards (Billed To + Invoice Details) */}
          <div className="grid sm:grid-cols-2 gap-5">
            {/* Billed To Card */}
            <div className="bg-slate-100/80 p-5 rounded-xl border border-slate-200/80 space-y-1.5">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-700 mb-2">BILLED TO:</p>
              <p className="text-xs text-slate-600 font-medium">
                <span className="font-bold text-slate-900">CLIENT NAME:</span> {invoice.client_name || client?.name || "N/A"}
              </p>
              {client?.address && (
                <p className="text-xs text-slate-600 font-medium">
                  <span className="font-bold text-slate-900">ADDRESS:</span> {client.address}
                </p>
              )}
              {(client?.phone || client?.email) && (
                <p className="text-xs text-slate-600 font-medium">
                  <span className="font-bold text-slate-900">CONTACT:</span> {client?.phone} {client?.phone && client?.email && "·"} {client?.email}
                </p>
              )}
              {client?.gst_number && (
                <p className="text-xs text-slate-600 font-medium font-mono">
                  <span className="font-bold text-slate-900 font-sans">GSTIN:</span> {client.gst_number}
                </p>
              )}
            </div>

            {/* Invoice Details Card */}
            <div className="bg-slate-100/80 p-5 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">INVOICE DETAILS</p>
              <div className="flex justify-between">
                <span className="font-bold text-slate-900">Invoice #:</span>
                <span className="font-semibold text-slate-800 font-mono">{invoice.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-900">Invoice Date:</span>
                <span className="font-medium text-slate-700">{invoice.invoice_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-900">Due Date:</span>
                <span className="font-medium text-slate-700">{invoice.due_date || "—"}</span>
              </div>
              {project && (
                <div className="flex justify-between">
                  <span className="font-bold text-slate-900">Project Name:</span>
                  <span className="font-semibold text-indigo-700">{project.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* 3. Items Table */}
          <div className="overflow-hidden rounded-xl border border-slate-300">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#374151] text-white font-bold uppercase tracking-wider text-[11px]">
                  <th className="px-4 py-3 w-12 text-center border-r border-slate-600">#</th>
                  <th className="px-4 py-3 border-r border-slate-600">ITEM DESCRIPTION</th>
                  <th className="px-4 py-3 text-center w-20 border-r border-slate-600">QTY</th>
                  <th className="px-4 py-3 text-right w-28 border-r border-slate-600">RATE</th>
                  <th className="px-4 py-3 text-right w-32">AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {(invoice.items || []).map((it, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-center font-bold text-slate-600 border-r border-slate-100">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800 border-r border-slate-100">{it.description}</td>
                    <td className="px-4 py-3 text-center font-medium text-slate-700 border-r border-slate-100">{it.quantity}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700 border-r border-slate-100">{formatCurrency(it.unit_price, symbol)}</td>
                    <td className="px-4 py-3 text-right font-bold font-mono text-slate-900">
                      {formatCurrency((Number(it.quantity) || 0) * (Number(it.unit_price) || 0), symbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="bg-slate-100 px-4 py-2 border-t border-slate-200 text-xs font-bold text-slate-700">
              Total Items: {(invoice.items || []).length}
            </div>
          </div>

          {/* 4. Total in Words */}
          <div className="text-xs">
            <p className="font-extrabold text-slate-900 uppercase">
              TOTAL IN WORDS: <span className="font-bold text-slate-700 normal-case">{numberToWords(invoice.total)}</span>
            </p>
          </div>

          {/* 5. Bank Details / Payment History & Financial Calculations */}
          <div className="grid sm:grid-cols-12 gap-6 items-start">
            {/* Left: Bank Account Info & Payment History */}
            <div className="sm:col-span-7 space-y-4">
              {/* Bank & Payment Acceptance Details Card (Conditional based on invoice.payment_method) */}
              {(company.bank_name || company.account_number || company.upi_id) && (
                <div className="bg-slate-50/90 border border-slate-200 p-4 rounded-xl space-y-1.5 text-xs">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                    {invoice.payment_method === "upi"
                      ? "UPI PAYMENT ACCEPTANCE DETAILS"
                      : invoice.payment_method === "bank_transfer"
                      ? "BANK TRANSFER DETAILS"
                      : "PAYMENT ACCEPTANCE DETAILS"}
                  </p>

                  {(invoice.payment_method === "bank_transfer" || invoice.payment_method === "all" || !invoice.payment_method) && (
                    <>
                      {company.bank_name && (
                        <div className="flex justify-between"><span className="text-slate-500 font-medium">Bank Name:</span><span className="font-bold text-slate-800">{company.bank_name}</span></div>
                      )}
                      {company.account_number && (
                        <div className="flex justify-between"><span className="text-slate-500 font-medium">Account No:</span><span className="font-mono font-bold text-slate-800">{company.account_number}</span></div>
                      )}
                      {company.ifsc_code && (
                        <div className="flex justify-between"><span className="text-slate-500 font-medium">IFSC Code:</span><span className="font-mono font-bold text-slate-800">{company.ifsc_code}</span></div>
                      )}
                    </>
                  )}

                  {(invoice.payment_method === "upi" || invoice.payment_method === "all" || !invoice.payment_method) && company.upi_id && (
                    <div className="flex justify-between pt-0.5 border-t border-slate-200/60 mt-1">
                      <span className="text-slate-500 font-medium">UPI / GPay ID:</span>
                      <span className="font-mono font-bold text-indigo-700">{company.upi_id}</span>
                    </div>
                  )}
                </div>
              )}

              {invPayments.length > 0 && (
                <div className="bg-slate-100/90 border border-slate-200 p-4 rounded-xl space-y-2">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-800">PAYMENT HISTORY</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] text-left">
                      <thead>
                        <tr className="text-slate-700 font-bold border-b border-slate-300">
                          <th className="pb-1">Date</th>
                          <th className="pb-1">Method</th>
                          <th className="pb-1">Reference</th>
                          <th className="pb-1 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60">
                        {invPayments.map((p) => (
                          <tr key={p.id}>
                            <td className="py-1 text-slate-600">{p.date}</td>
                            <td className="py-1 text-slate-600">{p.payment_method?.replace("_", " ")}</td>
                            <td className="py-1 font-mono text-slate-600">{p.reference || "—"}</td>
                            <td className="py-1 text-right font-bold font-mono text-slate-900">{formatCurrency(p.amount, symbol)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Calculations */}
            <div className="sm:col-span-5 space-y-1.5 text-xs font-semibold text-slate-700">
              <div className="flex justify-between py-1">
                <span>Subtotal:</span>
                <span className="font-bold font-mono text-slate-900">{formatCurrency(invoice.subtotal, symbol)}</span>
              </div>
              {Number(invoice.discount) > 0 && (
                <div className="flex justify-between py-1 text-emerald-700">
                  <span>Discount:</span>
                  <span className="font-bold font-mono">-{formatCurrency(invoice.discount, symbol)}</span>
                </div>
              )}
              {invoice.tax_rate ? (
                <>
                  <div className="flex justify-between py-1">
                    <span>CGST ({invoice.tax_rate / 2}%):</span>
                    <span className="font-bold font-mono text-slate-900">{formatCurrency((Number(invoice.tax) || 0) / 2, symbol)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>SGST ({invoice.tax_rate / 2}%):</span>
                    <span className="font-bold font-mono text-slate-900">{formatCurrency((Number(invoice.tax) || 0) / 2, symbol)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between py-1">
                  <span>Tax:</span>
                  <span className="font-bold font-mono text-slate-900">{formatCurrency(invoice.tax, symbol)}</span>
                </div>
              )}

              <div className="flex justify-between items-center py-2.5 px-3 bg-slate-100 rounded-lg text-sm font-black text-slate-900 border border-slate-200 mt-2">
                <span>TOTAL AMOUNT:</span>
                <span className="font-mono text-base">{formatCurrency(invoice.total, symbol)}</span>
              </div>

              {f.paid > 0 && (
                <div className="flex justify-between py-1 text-emerald-700">
                  <span>Paid Amount:</span>
                  <span className="font-bold font-mono">{formatCurrency(f.paid, symbol)}</span>
                </div>
              )}
              {f.pending > 0 && (
                <div className="flex justify-between py-1 text-amber-800">
                  <span>Balance Due:</span>
                  <span className="font-bold font-mono">{formatCurrency(f.pending, symbol)}</span>
                </div>
              )}
            </div>
          </div>

          {/* 6. Footer Terms & Authorized Signatory */}
          <div className="pt-6 border-t border-slate-200 grid sm:grid-cols-2 gap-8 items-end text-xs">
            <div>
              <p className="font-black uppercase tracking-wider text-slate-900 mb-1">TERMS & CONDITIONS</p>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {invoice.notes || invoice.description || "Standard T&C applied. Payment due within the stipulated period.\nContact for queries."}
              </p>
            </div>
            <div className="text-center sm:text-right space-y-1">
              <p className="font-bold text-slate-900">Authorized Signatory</p>
              <div className="h-10 flex items-center justify-center sm:justify-end">
                <span className="font-serif italic text-lg text-indigo-900 opacity-80 border-b border-slate-400 px-4">
                  {company.company_name || "Authorized Signature"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}