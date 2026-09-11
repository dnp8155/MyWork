import React, { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { base44 } from "@/api/base44Client";
import { computeQuotationTotals, nextNumber, formatCurrency } from "@/lib/finance";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import { Input, Select, Textarea } from "@/components/FormFields";
import { Plus, FileText, CheckCircle2, XCircle, FileCheck } from "lucide-react";
import Watermark from "@/components/Watermark";
import { useToast } from "@/components/ui/use-toast";

export default function Quotations() {
  const { quotations, clients, projects, invoices, settings, loading, refresh } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [viewQuote, setViewQuote] = useState(null);
  const { toast } = useToast();

  const filtered = (quotations || []).filter((q) => filter === "all" || q.status === filter).sort((a, b) => (b.created_date || "").localeCompare(a.created_date || ""));
  const totalValue = (quotations || []).reduce((s, q) => s + (Number(q.total) || 0), 0);
  const approved = (quotations || []).filter((q) => q.status === "approved").length;

  const approve = async (q) => {
    await base44.entities.Quotation.update(q.id, { status: "approved" });
    await base44.entities.AuditLog.create({ action: "quotation_approved", entity: "Quotation", entity_id: q.id, description: `Approved quotation ${q.quotation_number}` });
    refresh(); toast({ title: "Quotation approved" });
  };
  const reject = async (q) => {
    await base44.entities.Quotation.update(q.id, { status: "rejected" });
    refresh(); toast({ title: "Quotation rejected" });
  };
  const convert = async (q) => {
    if (q.converted_invoice_id) { toast({ title: "Already converted" }); return; }
    const year = new Date().getFullYear();
    const existingInv = await base44.entities.Invoice.list();
    const invoice_number = nextNumber("INV", year, existingInv);
    const due = new Date(); due.setDate(due.getDate() + 15);
    const invoice = await base44.entities.Invoice.create({
      invoice_number, invoice_date: new Date().toISOString().slice(0, 10), due_date: due.toISOString().slice(0, 10),
      client_id: q.client_id, client_name: q.client_name, project_id: q.project_id, project_name: q.project_name,
      quotation_id: q.id, quotation_number: q.quotation_number, items: q.items, subtotal: q.subtotal,
      discount: q.discount, tax: q.tax, tax_rate: q.tax_rate, total: q.total, status: "sent",
    });
    await base44.entities.Quotation.update(q.id, { status: "approved", converted_invoice_id: invoice.id });
    await base44.entities.AuditLog.create({ action: "converted_to_invoice", entity: "Quotation", entity_id: q.id, description: `Converted ${q.quotation_number} to invoice ${invoice_number}` });
    refresh(); toast({ title: "Converted to invoice" });
    setViewQuote(null);
  };

  return (
    <div>
      <PageHeader title="Quotations" subtitle="Create, approve, and convert quotations to invoices"
        actions={<button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"><Plus className="w-4 h-4" /> New Quotation</button>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Quotations" value={quotations?.length || 0} icon={FileText} tone="indigo" isCurrency={false} />
        <StatCard label="Total Value" value={totalValue} icon={FileText} tone="blue" />
        <StatCard label="Approved" value={approved} icon={CheckCircle2} tone="green" isCurrency={false} />
        <StatCard label="Converted" value={(quotations || []).filter((q) => q.converted_invoice_id).length} icon={FileCheck} tone="indigo" isCurrency={false} />
      </div>
      <div className="flex gap-3 mb-4">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none">
          <option value="all">All Status</option>
          {["draft","sent","viewed","approved","rejected","expired"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {loading ? <div className="h-64 bg-slate-100 rounded-xl animate-pulse" /> : filtered.length === 0 ? (
        <EmptyState title="No quotations" message="Create a quotation for a client." />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200"><tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Number</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Client</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Project</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Total</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-indigo-600 cursor-pointer" onClick={() => setViewQuote(q)}>{q.quotation_number}</td>
                  <td className="px-4 py-3 text-slate-600">{q.client_name}</td>
                  <td className="px-4 py-3 text-slate-600">{q.project_name || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{q.date}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(q.total)}</td>
                  <td className="px-4 py-3"><StatusBadge status={q.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {q.status === "sent" || q.status === "viewed" ? (
                        <button onClick={() => approve(q)} title="Approve" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"><CheckCircle2 className="w-4 h-4" /></button>
                      ) : null}
                      {q.status !== "rejected" && q.status !== "approved" ? (
                        <button onClick={() => reject(q)} title="Reject" className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"><XCircle className="w-4 h-4" /></button>
                      ) : null}
                      {q.status === "approved" && !q.converted_invoice_id ? (
                        <button onClick={() => convert(q)} title="Convert to Invoice" className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"><FileCheck className="w-4 h-4" /></button>
                      ) : null}
                      {q.converted_invoice_id ? <span className="text-xs text-emerald-600">Converted</span> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
      {modalOpen && <QuoteForm clients={clients || []} projects={projects || []} existing={quotations || []} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); refresh(); toast({ title: "Quotation created" }); }} />}
      {viewQuote && <QuoteView quote={viewQuote} settings={settings} onClose={() => setViewQuote(null)} onApprove={() => { approve(viewQuote); setViewQuote(null); }} onConvert={() => convert(viewQuote)} />}
    </div>
  );
}

function QuoteForm({ clients, projects, existing, onClose, onSaved }) {
  const [form, setForm] = useState({ client_id: "", project_id: "", date: new Date().toISOString().slice(0, 10), valid_until: "", discount: 0, tax_rate: 18, notes: "", terms: "50% advance, 50% on delivery." });
  const [items, setItems] = useState([{ description: "", quantity: 1, unit_price: 0 }]);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const updateItem = (i, k, v) => setItems((arr) => arr.map((it, idx) => idx === i ? { ...it, [k]: v } : it));
  const addItem = () => setItems((a) => [...a, { description: "", quantity: 1, unit_price: 0 }]);
  const removeItem = (i) => setItems((arr) => arr.filter((_, idx) => idx !== i));
  const totals = computeQuotationTotals(items, form.discount, form.tax_rate);
  const clientProjects = projects.filter((p) => p.client_id === form.client_id);

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const year = new Date().getFullYear();
      const quotation_number = nextNumber("QT", year, existing);
      const client = clients.find((c) => c.id === form.client_id);
      const project = projects.find((p) => p.id === form.project_id);
      await base44.entities.Quotation.create({
        ...form, quotation_number, discount: Number(form.discount), tax_rate: Number(form.tax_rate),
        items, subtotal: totals.subtotal, tax: totals.tax, total: totals.total, status: "draft",
        client_name: client?.name, project_name: project?.name,
      });
      await base44.entities.AuditLog.create({ action: "created", entity: "Quotation", description: `Created quotation ${quotation_number}` });
      onSaved();
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  };

  return (
    <Modal open onClose={onClose} title="New Quotation" size="xl">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Select label="Client" required value={form.client_id} onChange={(e) => set("client_id", e.target.value)}>
            <option value="">Select</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select label="Project" value={form.project_id} onChange={(e) => set("project_id", e.target.value)}>
            <option value="">None</option>{clientProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <Input label="Date" type="date" required value={form.date} onChange={(e) => set("date", e.target.value)} />
          <Input label="Valid Until" type="date" value={form.valid_until} onChange={(e) => set("valid_until", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Line Items</label>
          <div className="space-y-2">
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input className="col-span-6 px-2 py-1.5 text-sm border border-slate-300 rounded" placeholder="Description" value={it.description} onChange={(e) => updateItem(i, "description", e.target.value)} />
                <input className="col-span-2 px-2 py-1.5 text-sm border border-slate-300 rounded" type="number" placeholder="Qty" value={it.quantity} onChange={(e) => updateItem(i, "quantity", Number(e.target.value))} />
                <input className="col-span-3 px-2 py-1.5 text-sm border border-slate-300 rounded" type="number" placeholder="Unit Price" value={it.unit_price} onChange={(e) => updateItem(i, "unit_price", Number(e.target.value))} />
                <button type="button" onClick={() => removeItem(i)} className="col-span-1 text-rose-500 text-sm">✕</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addItem} className="mt-2 text-sm text-indigo-600 hover:underline">+ Add item</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Input label="Discount (₹)" type="number" value={form.discount} onChange={(e) => set("discount", Number(e.target.value))} />
          <Input label="Tax Rate (%)" type="number" value={form.tax_rate} onChange={(e) => set("tax_rate", Number(e.target.value))} />
          <div><p className="text-xs text-slate-600 mb-1">Subtotal</p><p className="text-sm font-medium py-2">{formatCurrency(totals.subtotal)}</p></div>
          <div><p className="text-xs text-slate-600 mb-1">Total</p><p className="text-sm font-bold py-2 text-indigo-600">{formatCurrency(totals.total)}</p></div>
        </div>
        <Textarea label="Notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        <Textarea label="Terms & Conditions" value={form.terms} onChange={(e) => set("terms", e.target.value)} />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50">{saving ? "Saving…" : "Create"}</button>
        </div>
      </form>
    </Modal>
  );
}

function QuoteView({ quote, settings, onClose, onApprove, onConvert }) {
  return (
    <Modal open onClose={onClose} title={`Quotation ${quote.quotation_number}`} size="lg">
      <div className="relative space-y-4">
        <Watermark logo={settings?.logo} />
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs text-slate-400">Client</p><p className="font-medium">{quote.client_name}</p></div>
          <div><p className="text-xs text-slate-400">Date</p><p className="font-medium">{quote.date}</p></div>
          <div><p className="text-xs text-slate-400">Valid Until</p><p className="font-medium">{quote.valid_until || "—"}</p></div>
          <div><p className="text-xs text-slate-400">Status</p><StatusBadge status={quote.status} /></div>
        </div>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50"><tr><th className="text-left px-3 py-2">Description</th><th className="text-right px-3 py-2">Qty</th><th className="text-right px-3 py-2">Price</th><th className="text-right px-3 py-2">Total</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {(quote.items || []).map((it, i) => (
                <tr key={i}><td className="px-3 py-2">{it.description}</td><td className="px-3 py-2 text-right">{it.quantity}</td><td className="px-3 py-2 text-right">{formatCurrency(it.unit_price)}</td><td className="px-3 py-2 text-right">{formatCurrency(it.quantity * it.unit_price)}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="p-3 bg-slate-50 space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(quote.subtotal)}</span></div>
            <div className="flex justify-between"><span>Discount</span><span>-{formatCurrency(quote.discount)}</span></div>
            <div className="flex justify-between"><span>Tax ({quote.tax_rate}%)</span><span>{formatCurrency(quote.tax)}</span></div>
            <div className="flex justify-between font-bold text-base pt-1 border-t border-slate-200"><span>Grand Total</span><span className="text-indigo-600">{formatCurrency(quote.total)}</span></div>
          </div>
        </div>
        {quote.notes && <div><p className="text-xs text-slate-400 mb-1">Notes</p><p className="text-sm">{quote.notes}</p></div>}
        {quote.terms && <div><p className="text-xs text-slate-400 mb-1">Terms</p><p className="text-sm">{quote.terms}</p></div>}
        <div className="flex justify-end gap-2 pt-2">
          {(quote.status === "sent" || quote.status === "viewed") && <button onClick={onApprove} className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg">Approve</button>}
          {quote.status === "approved" && !quote.converted_invoice_id && <button onClick={onConvert} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg">Convert to Invoice</button>}
          {quote.converted_invoice_id && <span className="px-4 py-2 text-sm text-emerald-600">✓ Converted to invoice</span>}
        </div>
      </div>
    </Modal>
  );
}