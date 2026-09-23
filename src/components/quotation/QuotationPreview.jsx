import React from "react";
import { formatCurrency } from "@/lib/finance";
import { X, Printer } from "lucide-react";

export default function QuotationPreview({ quote, settings, onClose, onApprove }) {
  if (!quote) return null;
  const co = settings || {};
  const items = quote.items || [];
  const print = () => window.print();

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 overflow-y-auto print:bg-white print:static print:overflow-visible">
      {/* Top bar (hidden on print) */}
      <div className="print:hidden sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-700">Quotation {quote.quotation_number}</div>
        <div className="flex items-center gap-2">
          {quote.status !== "approved" && quote.status !== "rejected" && (
            <button onClick={onApprove} className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Approve → Create Project & Invoice</button>
          )}
          <button onClick={print} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><Printer className="w-4 h-4" /> Print</button>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded"><X className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Page */}
      <div className="qp-page mx-auto my-6 print:my-0 bg-white shadow-xl print:shadow-none" style={{ width: "210mm", minHeight: "297mm" }}>
        <style>{`
          .qp-page{font-family:'Inter',Arial,sans-serif;color:#102544;font-size:12px}
          .qp-header{height:55mm;position:relative;overflow:hidden;color:#fff;padding:8mm 10mm;
            background:radial-gradient(circle at 12% 80%,rgba(0,212,255,.2),transparent 28%),radial-gradient(circle at 80% 20%,rgba(0,126,255,.18),transparent 30%),linear-gradient(135deg,#061b36 0%,#04284d 50%,#03162d 100%)}
          .qp-header-inner{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;height:100%}
          .qp-brand{display:flex;align-items:center;gap:5mm;min-width:0;flex:1}
          .qp-logo{width:26mm;height:22mm;object-fit:contain;filter:drop-shadow(0 0 10px rgba(0,207,255,.35));flex:none}
          .qp-brand-name{font-family:'Montserrat',Arial,sans-serif;font-size:8.5mm;line-height:1;font-weight:900;letter-spacing:.3px;word-break:break-word}
          .qp-brand-name .blue{color:#08d8ff}
          .qp-tagline{margin-top:2.5mm;font-size:2.8mm;letter-spacing:2.4px;color:#fff}
          .qp-services{margin-top:1.8mm;font-size:2.5mm;letter-spacing:.9px;color:#dcecff}
          .qp-side{width:auto;max-width:48mm;flex:none;padding-left:5mm;border-left:1px solid rgba(255,255,255,.25);font-size:3mm;line-height:1.5;text-transform:uppercase;letter-spacing:1px}
          .qp-side b{color:#ffbd18}
          .qp-content{padding:8mm 8mm 0}
          .qp-title-row{display:flex;justify-content:space-between;gap:8mm;align-items:flex-start;margin-bottom:7mm}
          .qp-h1{margin:0;font-family:'Montserrat',Arial,sans-serif;font-size:14mm;line-height:.95;font-weight:900;letter-spacing:-.8px;color:#09233f}
          .qp-h1 span{color:#0878ed}
          .qp-accent{width:34mm;height:1.3mm;margin-top:3mm;background:linear-gradient(90deg,#087ff5 0 65%,#ffb000 65%);border-radius:5px}
          .qp-meta{width:70mm;background:linear-gradient(135deg,#f1f8ff,#e5f1fc);border-radius:4mm;padding:3.5mm 5mm}
          .qp-meta-row{display:flex;justify-content:space-between;padding:1.6mm 0;border-bottom:1px solid #c9d9e9;font-size:3mm}
          .qp-meta-row:last-child{border-bottom:0}
          .qp-meta-row b{font-weight:700}.qp-meta-row span{color:#203a58;font-weight:600}
          .qp-grid2{display:grid;grid-template-columns:1fr 1fr;gap:5mm;margin-bottom:5mm}
          .qp-card{border:1px solid #dce6ef;border-radius:3.5mm;overflow:hidden;background:#fff}
          .qp-card-head{height:9mm;padding:0 5mm;display:flex;align-items:center;gap:3mm;color:#fff;font-size:3.4mm;font-weight:800;letter-spacing:.3px;background:linear-gradient(100deg,#082546,#087ff1 72%,#0bd5ff)}
          .qp-card-body{padding:4mm 5mm;background:linear-gradient(135deg,#fff,#f7fbff)}
          .qp-info-row{display:grid;grid-template-columns:33mm 4mm 1fr;gap:1mm;padding:1.2mm 0;border-bottom:1px solid #dce6ef;font-size:2.9mm;line-height:1.45}
          .qp-info-row:last-child{border-bottom:0}.qp-info-row b{font-weight:700}.qp-info-row .colon{text-align:center;color:#5b7692}
          .qp-table-card{border:1px solid #d9e4ee;border-radius:3.5mm;overflow:hidden;margin-bottom:5mm}
          .qp-section-head{height:9mm;padding:0 5mm;display:flex;align-items:center;gap:3mm;color:#fff;background:linear-gradient(100deg,#082546,#087ff1 75%,#10cfff);font-size:3.4mm;font-weight:800}
          .qp-table{width:100%;border-collapse:collapse;font-size:2.9mm}
          .qp-table thead th{background:#e7eff7;color:#122c4a;font-weight:800;padding:2.8mm 2.5mm;border-right:1px solid #d4e0ea;text-align:left}
          .qp-table tbody td{padding:2.4mm 2.5mm;border-top:1px solid #dce5ed;border-right:1px solid #dce5ed;vertical-align:middle}
          .qp-table th:last-child,.qp-table td:last-child{border-right:0;text-align:right}
          .qp-num{text-align:center;width:8mm}.qp-qty{text-align:center;width:15mm}.qp-money{text-align:right;width:34mm}
          .qp-summary{width:100%}
          .qp-summary td{padding:2mm 2.8mm;font-size:3mm;font-weight:600}
          .qp-summary .label{text-align:right;background:#f1f6fa;width:60%}
          .qp-summary .total td{background:#0875e8;color:#fff;font-size:4mm;font-weight:800;border-color:#0875e8}
          .qp-bank-sign{display:grid;grid-template-columns:1.05fr 1fr .7fr;gap:4mm;margin-bottom:5mm}
          .qp-sign{text-align:center}
          .qp-sign-space{height:13mm}
          .qp-sign-line{width:70%;border-bottom:1px solid #193c67;margin:auto}
          .qp-sign-label{font-size:2.8mm;margin-top:1mm}
          .qp-thanks{text-align:center;display:flex;flex-direction:column;justify-content:center}
          .qp-thanks-title{font-family:'Brush Script MT',cursive;font-size:9mm;color:#91c8f7}
          .qp-thanks p{font-size:2.8mm;line-height:1.4;margin:1mm 0}
          .qp-thanks-accent{height:1mm;width:18mm;background:linear-gradient(90deg,#087ff1 0 65%,#ffb000 65%);margin:2mm auto}
          .qp-footer{min-height:13mm;background:linear-gradient(110deg,#061a34,#062f58 60%,#04182f);color:#fff;display:flex;align-items:center;justify-content:space-between;padding:3mm 8mm;position:relative;overflow:hidden}
          .qp-footer-item{font-size:2.5mm;color:#dcecff;z-index:2}
          .qp-footer-item b{color:#fff}
          @media(max-width:900px){.qp-page{width:100%;min-height:auto}.qp-header{height:auto}.qp-header-inner{flex-direction:column;align-items:flex-start;gap:5mm}.qp-side{width:auto;border-left:0;border-top:1px solid rgba(255,255,255,.25);padding:3mm 0 0}.qp-title-row,.qp-grid2,.qp-bank-sign{grid-template-columns:1fr}.qp-meta{width:100%}}
          @media print{@page{size:A4;margin:0}body{background:#fff}.qp-page{box-shadow:none}}
        `}</style>

        {/* Header */}
        <header className="qp-header">
          <div className="qp-header-inner">
            <div className="qp-brand">
              {co.logo ? (
                <img src={co.logo} className="qp-logo" alt="logo" />
              ) : null}
              <div style={{ minWidth: 0 }}>
                <div className="qp-brand-name"><span className="blue">{(co.company_name || "MeWork").split(" ")[0]}</span>{(co.company_name || "MeWork").split(" ").slice(1).join(" ")}</div>
                <div className="qp-tagline">SOFTWARE &amp; DIGITAL SOLUTIONS</div>
                <div className="qp-services">Web · App · Cloud · Automation · Branding</div>
              </div>
            </div>
            <div className="qp-side">
              <b>{co.company_name || "MeWork"}</b><br/>
              {co.address && <>{co.address}<br/></>}
              {co.email && <>{co.email}<br/></>}
              {co.phone && <>+{co.phone}</>}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="qp-content">
          <div className="qp-title-row">
            <div>
              <h1 className="qp-h1">QUO<span>TATION</span></h1>
              <div className="qp-accent"></div>
              <p style={{ fontSize: "3.2mm", color: "#53677f", marginTop: "3mm", lineHeight: 1.5 }}>
                Ref: <strong style={{ color: "#172d49" }}>{quote.quotation_number}</strong> &nbsp;|&nbsp; Date: <strong style={{ color: "#172d49" }}>{quote.date}</strong>{quote.valid_until ? <> &nbsp;|&nbsp; Valid until: <strong style={{ color: "#172d49" }}>{quote.valid_until}</strong></> : null}
              </p>
            </div>
            <div className="qp-meta">
              <div className="qp-meta-row"><b>Status</b><span style={{ textTransform: "capitalize" }}>{quote.status}</span></div>
              <div className="qp-meta-row"><b>Project</b><span>{quote.project_name || "—"}</span></div>
              <div className="qp-meta-row"><b>Prepared for</b><span>{quote.client_name}</span></div>
            </div>
          </div>

          {/* Client + Company cards */}
          <div className="qp-grid2">
            <div className="qp-card">
              <div className="qp-card-head">BILL TO</div>
              <div className="qp-card-body">
                <div className="qp-info-row"><b>Client</b><span className="colon">:</span><span>{quote.client_name || "—"}</span></div>
                <div className="qp-info-row"><b>Company</b><span className="colon">:</span><span>{quote.client_company || "—"}</span></div>
                <div className="qp-info-row"><b>Email</b><span className="colon">:</span><span>{quote.client_email || "—"}</span></div>
                <div className="qp-info-row"><b>Phone</b><span className="colon">:</span><span>{quote.client_phone || "—"}</span></div>
                <div className="qp-info-row"><b>Address</b><span className="colon">:</span><span>{quote.client_address || "—"}</span></div>
              </div>
            </div>
            <div className="qp-card">
              <div className="qp-card-head">FROM</div>
              <div className="qp-card-body">
                <div className="qp-info-row"><b>Company</b><span className="colon">:</span><span>{co.company_name || "MeWork"}</span></div>
                <div className="qp-info-row"><b>Email</b><span className="colon">:</span><span>{co.email || "—"}</span></div>
                <div className="qp-info-row"><b>Phone</b><span className="colon">:</span><span>{co.phone || "—"}</span></div>
                <div className="qp-info-row"><b>GST</b><span className="colon">:</span><span>{co.gst_number || "—"}</span></div>
                <div className="qp-info-row"><b>Website</b><span className="colon">:</span><span>{co.website || "—"}</span></div>
              </div>
            </div>
          </div>

          {/* Items table */}
          <div className="qp-table-card">
            <div className="qp-section-head">SCOPE OF WORK &amp; PRICING</div>
            <table className="qp-table">
              <thead>
                <tr>
                  <th className="qp-num">#</th>
                  <th>Description</th>
                  <th className="qp-qty">Qty</th>
                  <th className="qp-money">Unit Price</th>
                  <th className="qp-money">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i}>
                    <td className="qp-num">{i + 1}</td>
                    <td>{it.description}</td>
                    <td className="qp-qty">{it.quantity}</td>
                    <td className="qp-money">{formatCurrency(it.unit_price)}</td>
                    <td className="qp-money">{formatCurrency((it.quantity || 0) * (it.unit_price || 0))}</td>
                  </tr>
                ))}
              </tbody>
              <tbody className="qp-summary">
                <tr><td className="label">Subtotal</td><td>{formatCurrency(quote.subtotal)}</td></tr>
                {Number(quote.discount) > 0 && <tr><td className="label">Discount</td><td>- {formatCurrency(quote.discount)}</td></tr>}
                <tr><td className="label">Tax ({quote.tax_rate}%)</td><td>{formatCurrency(quote.tax)}</td></tr>
                <tr className="total"><td className="label">Grand Total</td><td>{formatCurrency(quote.total)}</td></tr>
              </tbody>
            </table>
          </div>

          {/* Terms + signature */}
          <div className="qp-bank-sign">
            <div className="qp-card">
              <div className="qp-card-head">TERMS &amp; CONDITIONS</div>
              <div className="qp-card-body" style={{ minHeight: "38mm" }}>
                <ol style={{ margin: 0, paddingLeft: "5mm", fontSize: "2.6mm", lineHeight: 1.5 }}>
                  {(quote.terms ? quote.terms.split(/\n|\./).filter(Boolean) : ["50% advance with work order, 50% on delivery.", "Quotation valid for 30 days from date of issue.", "Taxes & third-party costs extra as applicable."]).map((t, i) => (
                    <li key={i} style={{ marginBottom: "1.2mm" }}>{t.trim()}.</li>
                  ))}
                </ol>
                {quote.notes && <p style={{ fontSize: "2.6mm", color: "#53677f", marginTop: "3mm" }}>{quote.notes}</p>}
              </div>
            </div>
            <div className="qp-card">
              <div className="qp-card-head">PAYMENT DETAILS</div>
              <div className="qp-card-body" style={{ minHeight: "38mm" }}>
                <div className="qp-info-row"><b>Methods</b><span className="colon">:</span><span>UPI / Bank Transfer</span></div>
                <div className="qp-info-row"><b>Currency</b><span className="colon">:</span><span>{co.currency || "INR"}</span></div>
                <div className="qp-info-row"><b>Tax</b><span className="colon">:</span><span>GST {co.tax_rate || 18}%</span></div>
                <div className="qp-info-row"><b>Advance</b><span className="colon">:</span><span>50% with order</span></div>
              </div>
            </div>
            <div className="qp-sign">
              <div className="qp-sign-space"></div>
              <div className="qp-sign-line"></div>
              <div className="qp-sign-label">Authorised Signatory</div>
              <div className="qp-thanks" style={{ marginTop: "4mm" }}>
                <div className="qp-thanks-title">Thank You</div>
                <div className="qp-thanks-accent"></div>
                <p>We look forward to working with you.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="qp-footer">
          <div className="qp-footer-item"><b>{co.company_name || "MeWork"}</b> · {co.email || ""} · {co.phone || ""}</div>
          <div className="qp-footer-item">{quote.quotation_number} · Generated {new Date().toLocaleDateString()}</div>
        </footer>
      </div>
    </div>
  );
}