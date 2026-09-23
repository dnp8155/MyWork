import React from "react";
import { formatCurrency } from "@/lib/finance";
import { X, Printer } from "lucide-react";

export default function QuotationPreview({ quote, settings, onClose, onApprove }) {
  if (!quote) return null;
  const co = settings || {};
  const items = quote.items || [];
  const companyName = co.company_name || "MeWork";
  const print = () => window.print();

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 overflow-y-auto print:bg-white print:static print:overflow-visible">
      <style>{`
        .blt-quote{font-family:'Inter',Arial,sans-serif;color:#102746}
        .blt-quote *{box-sizing:border-box}
        .blt-quote .page{width:210mm;min-height:297mm;margin:20px auto;background:#fff;box-shadow:0 12px 45px #0a315225;overflow:hidden}
        .blt-quote .top{height:49mm;background:linear-gradient(135deg,#03182f,#063a68,#03172e);position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
        .blt-quote .top:before{content:"";position:absolute;inset:-20%;background:repeating-linear-gradient(145deg,transparent 0 38px,#0bcfff20 40px 42px,transparent 44px 90px)}
        .blt-quote .top:after{content:"";position:absolute;width:180mm;height:80mm;border:1px solid #00d9ff30;border-radius:50%;top:-45mm;left:15mm;box-shadow:0 0 0 12mm #008cff08,0 0 0 25mm #008cff06}
        .blt-quote .logo{position:relative;z-index:2;width:72mm;height:37mm;object-fit:contain;filter:drop-shadow(0 0 12px #00d9ff55)}
        .blt-quote .logo-text{position:relative;z-index:2;font-family:'Montserrat',Arial,sans-serif;font-size:16mm;font-weight:900;color:#fff;letter-spacing:.5px;text-align:center}
        .blt-quote .logo-text span{color:#08d8ff}
        .blt-quote .logo-sub{position:relative;z-index:2;margin-top:3mm;font-size:3mm;letter-spacing:2.4px;color:#dcecff;text-align:center}
        .blt-quote .content{padding:7mm 7mm 0}
        .blt-quote .title{display:flex;justify-content:space-between;gap:6mm;margin-bottom:5mm}
        .blt-quote h1{font:900 15mm/1 Montserrat;margin:0;color:#0a2543;letter-spacing:-.5px}
        .blt-quote h1 span{color:#087df0}
        .blt-quote .accent{height:1.2mm;width:34mm;margin-top:3mm;background:linear-gradient(90deg,#087df0 65%,#ffae00 65%);border-radius:5px}
        .blt-quote .intro{font-size:3.1mm;color:#536a83;line-height:1.45;margin-top:3mm}
        .blt-quote .meta{width:76mm;background:linear-gradient(135deg,#f0f8ff,#e2f0fc);border-radius:4mm;padding:3mm 4mm}
        .blt-quote .meta-row{display:grid;grid-template-columns:7mm 1fr 1fr;align-items:center;padding:2mm 0;border-bottom:1px solid #cadbea;font-size:2.9mm}
        .blt-quote .meta-row:last-child{border:0}
        .blt-quote .mi{width:5.5mm;height:5.5mm;background:#d5ecff;color:#087cf0;border-radius:1.5mm;display:flex;align-items:center;justify-content:center;font-weight:800}
        .blt-quote .meta-row span{text-align:right;font-weight:600}
        .blt-quote .grid2{display:grid;grid-template-columns:1fr 1fr;gap:4.5mm;margin-bottom:4.5mm}
        .blt-quote .card{border:1px solid #d9e5ef;border-radius:3.5mm;overflow:hidden;background:#fff}
        .blt-quote .head{height:9mm;padding:0 4mm;display:flex;align-items:center;gap:2.5mm;color:#fff;background:linear-gradient(100deg,#062546,#087ff0 75%,#10d0ff);font-size:3.4mm;font-weight:800}
        .blt-quote .body{padding:4mm;background:linear-gradient(135deg,#fff,#f7fbff)}
        .blt-quote .row{display:grid;grid-template-columns:32mm 4mm 1fr;gap:1mm;padding:1.25mm 0;border-bottom:1px solid #dce5ed;font-size:2.8mm;line-height:1.4}
        .blt-quote .row:last-child{border:0}
        .blt-quote .row b{font-weight:700}
        .blt-quote .colon{text-align:center;color:#66809a}
        .blt-quote .table{border:1px solid #d9e5ef;border-radius:3.5mm;overflow:hidden;margin-bottom:4.5mm}
        .blt-quote table{width:100%;border-collapse:collapse;font-size:2.75mm}
        .blt-quote th{background:#e6eff7;padding:2.5mm 2mm;border-right:1px solid #d2dfe9;text-align:left}
        .blt-quote td{padding:2.3mm 2mm;border-top:1px solid #dce5ed;border-right:1px solid #dce5ed;vertical-align:middle}
        .blt-quote th:last-child,.blt-quote td:last-child{border-right:0}
        .blt-quote .num{width:8mm;text-align:center}
        .blt-quote .qty{width:14mm;text-align:center}
        .blt-quote .money{width:31mm;text-align:right}
        .blt-quote .summary{width:100%}
        .blt-quote .summary td{padding:2mm;font-weight:600}
        .blt-quote .summary .lab{text-align:right;background:#f0f6fa}
        .blt-quote .summary .grand td{background:#0877e8;color:#fff;border-color:#0877e8;font-size:4mm;font-weight:800}
        .blt-quote .bottom{display:grid;grid-template-columns:1fr 1fr 1.12fr;gap:3.5mm;margin-bottom:4mm}
        .blt-quote .mini .body{min-height:38mm}
        .blt-quote .check{font-size:2.7mm;margin-bottom:2mm;padding-left:5mm;position:relative}
        .blt-quote .check:before{content:"✓";position:absolute;left:0;background:#0b88f2;color:#fff;border-radius:50%;width:3.2mm;height:3.2mm;text-align:center;font-size:2.1mm;display:flex;align-items:center;justify-content:center}
        .blt-quote .timeline{font-size:2.7mm;margin-bottom:3mm;line-height:1.4}
        .blt-quote .timeline b{display:block;font-size:2.8mm}
        .blt-quote .terms ol{margin:0;padding-left:5mm}
        .blt-quote .terms li{font-size:2.55mm;line-height:1.45;margin-bottom:1mm}
        .blt-quote .lower{display:grid;grid-template-columns:1.15fr 1fr .78fr;gap:3.5mm;margin-bottom:4.5mm}
        .blt-quote .sign{text-align:center}
        .blt-quote .signspace{height:17mm;display:flex;align-items:end;justify-content:center}
        .blt-quote .sigline{width:75%;border-bottom:1px solid #173d68}
        .blt-quote .sig{font:8mm "Brush Script MT",cursive;color:#0954b8;margin-bottom:-3mm}
        .blt-quote .thanks{text-align:center}
        .blt-quote .thanks .body{height:30mm;display:flex;flex-direction:column;align-items:center;justify-content:center}
        .blt-quote .ty{font:10mm "Brush Script MT",cursive;color:#8fc8f7}
        .blt-quote .thanks p{font-size:2.7mm;margin:0}
        .blt-quote .smallaccent{width:18mm;height:1mm;background:linear-gradient(90deg,#087df0 65%,#ffae00 65%);margin-top:2mm}
        .blt-quote .footer{height:13mm;background:linear-gradient(110deg,#04172e,#06345d,#03182f);color:#dcecff;display:flex;align-items:center;justify-content:space-between;padding:0 7mm;font-size:2.45mm}
        @media print{@page{size:A4;margin:0}body{background:#fff}.blt-quote .page{margin:0;box-shadow:none}.blt-quote .top,.blt-quote .head,.blt-quote .summary .grand,.blt-quote .footer{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
        @media(max-width:900px){.blt-quote .page{width:100%;margin:0}.blt-quote .title,.blt-quote .grid2,.blt-quote .bottom,.blt-quote .lower{display:grid;grid-template-columns:1fr}.blt-quote .meta{width:100%}.blt-quote .top{height:42mm}.blt-quote h1{font-size:12mm}}
      `}</style>

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

      <div className="blt-quote">
        <div className="page mx-auto my-6 print:my-0">
          {/* Header */}
          <header className="top">
            {co.logo ? (
              <img className="logo" src={co.logo} alt="logo" />
            ) : (
              <div>
                <div className="logo-text"><span>{companyName.split(" ")[0]}</span>{companyName.split(" ").slice(1).join(" ")}</div>
                <div className="logo-sub">SOFTWARE &amp; DIGITAL SOLUTIONS</div>
              </div>
            )}
          </header>

          {/* Content */}
          <main className="content">
            <section className="title">
              <div>
                <h1>QUOT<span>ATION</span></h1>
                <div className="accent"></div>
                <div className="intro">Thank you for considering <b>{companyName}.</b><br />
                We are pleased to provide you with the following quotation for your project.</div>
              </div>
              <div className="meta">
                <div className="meta-row"><div className="mi">▣</div><b>Quotation No.</b><span>{quote.quotation_number}</span></div>
                <div className="meta-row"><div className="mi">▦</div><b>Quotation Date</b><span>{quote.date}</span></div>
                <div className="meta-row"><div className="mi">▦</div><b>Valid Until</b><span>{quote.valid_until || "—"}</span></div>
              </div>
            </section>

            {/* Bill To + Project Details */}
            <section className="grid2">
              <div className="card"><div className="head">♙ &nbsp; BILL TO</div><div className="body">
                <div className="row"><b>Company Name</b><span className="colon">:</span><span>{quote.client_company || quote.client_name || "—"}</span></div>
                <div className="row"><b>Contact Person</b><span className="colon">:</span><span>{quote.client_name || "—"}</span></div>
                <div className="row"><b>Email</b><span className="colon">:</span><span>{quote.client_email || "—"}</span></div>
                <div className="row"><b>Phone</b><span className="colon">:</span><span>{quote.client_phone || "—"}</span></div>
                <div className="row"><b>Address</b><span className="colon">:</span><span>{quote.client_address || "—"}</span></div>
              </div></div>

              <div className="card"><div className="head">▤ &nbsp; PROJECT DETAILS</div><div className="body">
                <div className="row"><b>Project Name</b><span className="colon">:</span><span>{quote.project_name || "—"}</span></div>
                <div className="row"><b>Project Type</b><span className="colon">:</span><span>{quote.project_type || "Custom Development"}</span></div>
                <div className="row"><b>Description</b><span className="colon">:</span><span>{quote.description || quote.details || "Scope as discussed in detail."}</span></div>
              </div></div>
            </section>

            {/* Items */}
            <section className="table">
              <div className="head">⚙ &nbsp; SERVICES &amp; PRICING</div>
              <table>
                <thead><tr><th className="num">#</th><th>Service / Description</th><th className="qty">Qty</th><th className="money">Unit Price</th><th className="money">Amount</th></tr></thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i}>
                      <td className="num">{i + 1}</td>
                      <td>{it.description}</td>
                      <td className="qty">{it.quantity}</td>
                      <td className="money">{formatCurrency(it.unit_price)}</td>
                      <td className="money">{formatCurrency((it.quantity || 0) * (it.unit_price || 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <table className="summary">
                <tr><td className="lab">Subtotal</td><td className="money">{formatCurrency(quote.subtotal)}</td></tr>
                {Number(quote.discount) > 0 && <tr><td className="lab">Discount</td><td className="money">- {formatCurrency(quote.discount)}</td></tr>}
                <tr><td className="lab">GST ({quote.tax_rate || 0}%)</td><td className="money">{formatCurrency(quote.tax)}</td></tr>
                <tr className="grand"><td className="lab">Total Amount</td><td className="money">{formatCurrency(quote.total)}</td></tr>
              </table>
            </section>

            {/* Payment Terms + Timeline + T&C */}
            <section className="bottom">
              <div className="card mini"><div className="head">▣ &nbsp; PAYMENT TERMS</div><div className="body">
                <div className="check">50% Advance on project confirmation</div>
                <div className="check">30% on design &amp; development completion</div>
                <div className="check">20% on final delivery</div>
                <p style={{ fontSize: "2.6mm" }}>*Payment to be made via bank transfer / UPI.</p>
              </div></div>

              <div className="card mini"><div className="head" style={{ background: "linear-gradient(100deg,#f2a000,#ffc44e)" }}>◷ &nbsp; PROJECT TIMELINE</div><div className="body">
                <div className="timeline"><b>Estimated Duration</b><span>15 – 25 Working Days</span></div>
                <div className="timeline"><b>Project Start</b><span>After advance payment &amp; requirement confirmation.</span></div>
              </div></div>

              <div className="card mini terms"><div className="head">▤ &nbsp; TERMS &amp; CONDITIONS</div><div className="body"><ol>
                {(quote.terms ? quote.terms.split(/\n|\./).filter(Boolean).map(t => t.trim()).filter(Boolean) : [
                  "This quotation is valid until the mentioned date",
                  "Any additional requirements will be charged separately",
                  "Client must provide required content and approvals on time",
                  "Timeline may vary if content or approvals are delayed",
                  "Source files will be provided after full payment",
                  "Third-party services, licenses or premium plugins are charged as applicable"
                ]).map((t, i) => <li key={i}>{t}{t.endsWith(".") ? "" : "."}</li>)}
              </ol></div></div>
            </section>

            {/* Bank + Signature + Thanks */}
            <section className="lower">
              <div className="card"><div className="head">▥ &nbsp; BANK / PAYMENT DETAILS</div><div className="body">
                <div className="row"><b>Account Name</b><span className="colon">:</span><span>{companyName}</span></div>
                <div className="row"><b>Bank Name</b><span className="colon">:</span><span>{co.bank_name || "—"}</span></div>
                <div className="row"><b>Account No.</b><span className="colon">:</span><span>{co.bank_account || "—"}</span></div>
                <div className="row"><b>IFSC</b><span className="colon">:</span><span>{co.bank_ifsc || "—"}</span></div>
                <div className="row"><b>UPI ID</b><span className="colon">:</span><span>{co.upi_id || "—"}</span></div>
              </div></div>

              <div className="card sign"><div className="head">✎ &nbsp; AUTHORIZED SIGNATURE</div><div className="body">
                <div className="signspace"><div><div className="sig">{co.signatory_name || companyName.split(" ")[0]}</div><div className="sigline"></div></div></div>
                <div style={{ fontSize: "2.8mm", marginTop: "2mm" }}>Authorized Signature<br /><b>{companyName}</b></div>
              </div></div>

              <div className="card thanks"><div className="head">♥ &nbsp; THANK YOU</div><div className="body">
                <div className="ty">Thank You</div>
                <p>for your time and consideration.</p>
                <div className="smallaccent"></div>
              </div></div>
            </section>
          </main>

          {/* Footer */}
          <footer className="footer">
            <div>☎ &nbsp; {co.phone || "—"}</div>
            <div>✉ &nbsp; {co.email || "—"}</div>
            <div>⌖ &nbsp; {co.address || "—"}</div>
          </footer>
        </div>
      </div>
    </div>
  );
}