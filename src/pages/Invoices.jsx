import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "@/hooks/useAppData";
import { supabase } from "@/api/supabaseClient";
import { computeInvoiceFinancials, nextNumber, formatCurrency } from "@/lib/finance";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import { Input, Select } from "@/components/FormFields";
import { Plus, Receipt, Wallet, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Invoices() {
  const { invoices, clients, projects, payments, loading, refresh } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [payModal, setPayModal] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const filtered = (invoices || []).filter((i) => filter === "all" || i.status === filter).sort((a, b) => (b.created_date || "").localeCompare(a.created_date || ""));
  const totalInvoiced = (invoices || []).reduce((s, i) => s + (Number(i.total) || 0), 0);
  const totalPaid = (invoices || []).reduce((s, i) => s + computeInvoiceFinancials(i, payments).paid, 0);
  const totalPending = (invoices || []).reduce((s, i) => s + computeInvoiceFinancials(i, payments).pending, 0);

  const recordPayment = async (inv, amount, method, reference) => {
    const year = new Date().getFullYear();
    const { data: existing } = await supabase.from('payments').select('*');
    const payment_number = `PAY-${year}-${String(existing.length + 1).padStart(4, "0")}`;
    const payment = await supabase.from('payments').insert({
      payment_number, date: new Date().toISOString().slice(0, 10), amount: Number(amount), payment_method: method, reference,
      client_id: inv.client_id, client_name: inv.client_name, project_id: inv.project_id, project_name: inv.project_name,
      invoice_id: inv.id, invoice_number: inv.invoice_number, type: "invoice",
    });
    const newPaid = computeInvoiceFinancials(inv, [...(payments || []), { invoice_id: inv.id, amount: Number(amount) }]).paid;
    let status = inv.status;
    if (newPaid >= inv.total) status = "paid"; else if (newPaid > 0) status = "partially_paid";
    await supabase.from('invoices').update(inv.id, { status });
    await supabase.from('transactions').insert({
      transaction_number: `TXN-${Date.now()}`, date: new Date().toISOString().slice(0, 10), type: "income", category: "invoice_payment",
      amount: Number(amount), project_id: inv.project_id, project_name: inv.project_name, client_id: inv.client_id, client_name: inv.client_name,
      invoice_id: inv.id, payment_method: method, reference, description: `Payment for invoice ${inv.invoice_number}`, source_entity: "payment", source_id: payment.id,
    });
    await supabase.from('audit_logs').insert({ action: "payment_recorded", entity: "Invoice", entity_id: inv.id, description: `Recorded ${formatCurrency(amount)} against ${inv.invoice_number}` });
    refresh(); toast({ title: "Payment recorded" }); setPayModal(null);
  };

  return (
    <div>
      <PageHeader title="Invoices" subtitle="Track invoices and payments"
        actions={<button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"><Plus className="w-4 h-4" /> New Invoice</button>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Invoiced" value={totalInvoiced} icon={Receipt} tone="indigo" />
        <StatCard label="Total Paid" value={totalPaid} icon={Wallet} tone="green" />
        <StatCard label="Total Pending" value={totalPending} icon={Clock} tone="amber" />
        <StatCard label="Overdue" value={(invoices || []).filter((i) => i.status === "overdue").length} icon={AlertTriangle} tone="red" isCurrency={false} />
      </div>
      <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-slate-300 mb-4 focus:outline-none">
        <option value="all">All Status</option>
        {["draft","sent","partially_paid","paid","overdue","cancelled"].map((s) => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
      </select>
      {loading ? <div className="h-64 bg-slate-100 rounded-xl animate-pulse" /> : filtered.length === 0 ? (
        <EmptyState title="No invoices" message="Create an invoice or convert from an approved quotation." />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200"><tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Number</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Client</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Due</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Total</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Paid</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Pending</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((inv) => {
                const f = computeInvoiceFinancials(inv, payments);
                return (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-indigo-600 cursor-pointer" onClick={() => navigate(`/invoices/${inv.id}`)}>{inv.invoice_number}</td>
                    <td className="px-4 py-3 text-slate-600">{inv.client_name}</td>
                    <td className="px-4 py-3 text-slate-500">{inv.invoice_date}</td>
                    <td className="px-4 py-3 text-slate-500">{inv.due_date}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(f.total)}</td>
                    <td className="px-4 py-3 text-right text-emerald-600">{formatCurrency(f.paid)}</td>
                    <td className="px-4 py-3 text-right text-amber-600">{formatCurrency(f.pending)}</td>
                    <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                    <td className="px-4 py-3 text-right">
                      {f.pending > 0 && inv.status !== "cancelled" && inv.status !== "draft" && (
                        <button onClick={() => setPayModal(inv)} className="px-2 py-1 text-xs bg-indigo-600 text-white rounded">+ Payment</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        </div>
      )}
      {modalOpen && <InvoiceForm clients={clients || []} projects={projects || []} existing={invoices || []} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); refresh(); toast({ title: "Invoice created" }); }} />}
      {payModal && <PayModal invoice={payModal} onClose={() => setPayModal(null)} onSave={recordPayment} />}
    </div>
  );
}

function InvoiceForm({ clients, projects, existing, onClose, onSaved }) {
  const [form, setForm] = useState({ client_id: "", project_id: "", invoice_date: new Date().toISOString().slice(0, 10), due_date: "", discount: 0, tax_rate: 18 });
  const [items, setItems] = useState([{ description: "", quantity: 1, unit_price: 0 }]);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const updateItem = (i, k, v) => setItems((arr) => arr.map((it, idx) => idx === i ? { ...it, [k]: v } : it));
  const subtotal = items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0), 0);
  const afterDiscount = Math.max(subtotal - Number(form.discount || 0), 0);
  const tax = afterDiscount * (Number(form.tax_rate || 0) / 100);
  const total = afterDiscount + tax;
  const clientProjects = projects.filter((p) => p.client_id === form.client_id);

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const year = new Date().getFullYear();
      const invoice_number = nextNumber("INV", year, existing);
      const client = clients.find((c) => c.id === form.client_id);
      const project = projects.find((p) => p.id === form.project_id);
      await supabase.from('invoices').insert({
        ...form, invoice_number, discount: Number(form.discount), tax_rate: Number(form.tax_rate),
        items, subtotal, tax, total, status: "sent", client_name: client?.name, project_name: project?.name,
      });
      await supabase.from('audit_logs').insert({ action: "created", entity: "Invoice", description: `Created invoice ${invoice_number}` });
      onSaved();
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  };

  return (
    <Modal open onClose={onClose} title="New Invoice" size="xl">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Select label="Client" required value={form.client_id} onChange={(e) => set("client_id", e.target.value)}><option value="">Select</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
          <Select label="Project" value={form.project_id} onChange={(e) => set("project_id", e.target.value)}><option value="">None</option>{clientProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select>
          <Input label="Invoice Date" type="date" required value={form.invoice_date} onChange={(e) => set("invoice_date", e.target.value)} />
          <Input label="Due Date" type="date" value={form.due_date} onChange={(e) => set("due_date", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Line Items</label>
          <div className="space-y-2">
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input className="col-span-6 px-2 py-1.5 text-sm border border-slate-300 rounded" placeholder="Description" value={it.description} onChange={(e) => updateItem(i, "description", e.target.value)} />
                <input className="col-span-2 px-2 py-1.5 text-sm border border-slate-300 rounded" type="number" value={it.quantity} onChange={(e) => updateItem(i, "quantity", Number(e.target.value))} />
                <input className="col-span-3 px-2 py-1.5 text-sm border border-slate-300 rounded" type="number" value={it.unit_price} onChange={(e) => updateItem(i, "unit_price", Number(e.target.value))} />
                <button type="button" onClick={() => setItems((arr) => arr.filter((_, idx) => idx !== i))} className="col-span-1 text-rose-500">✕</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setItems((a) => [...a, { description: "", quantity: 1, unit_price: 0 }])} className="mt-2 text-sm text-indigo-600">+ Add item</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Input label="Discount (₹)" type="number" value={form.discount} onChange={(e) => set("discount", Number(e.target.value))} />
          <Input label="Tax Rate (%)" type="number" value={form.tax_rate} onChange={(e) => set("tax_rate", Number(e.target.value))} />
          <div><p className="text-xs text-slate-600 mb-1">Subtotal</p><p className="text-sm font-medium py-2">{formatCurrency(subtotal)}</p></div>
          <div><p className="text-xs text-slate-600 mb-1">Total</p><p className="text-sm font-bold py-2 text-indigo-600">{formatCurrency(total)}</p></div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50">{saving ? "Saving…" : "Create"}</button>
        </div>
      </form>
    </Modal>
  );
}

function PayModal({ invoice, onClose, onSave }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank_transfer");
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    await onSave(invoice, amount, method, reference);
    setSaving(false);
  };
  return (
    <Modal open onClose={onClose} title={`Payment — ${invoice.invoice_number}`}>
      <form onSubmit={submit} className="space-y-4">
        <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-1">
          <div className="flex justify-between"><span>Total</span><span>{formatCurrency(invoice.total)}</span></div>
          <div className="flex justify-between"><span>Pending</span><span className="text-amber-600 font-medium">{formatCurrency(invoice.total - (invoice.paid || 0))}</span></div>
        </div>
        <Input label="Amount (₹)" type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Select label="Payment Method" value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="cash">Cash</option><option value="bank_transfer">Bank Transfer</option><option value="upi">UPI</option><option value="card">Card</option><option value="other">Other</option>
        </Select>
        <Input label="Reference" value={reference} onChange={(e) => setReference(e.target.value)} />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50">{saving ? "Saving…" : "Record"}</button>
        </div>
      </form>
    </Modal>
  );
}