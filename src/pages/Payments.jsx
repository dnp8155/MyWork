import React, { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { supabase } from "@/api/supabaseClient";
import { formatCurrency, nextNumber } from "@/lib/finance";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import { Input, Select, Textarea } from "@/components/FormFields";
import { Plus, Wallet, TrendingUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Payments() {
  const { payments, clients, projects, invoices, loading, refresh } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const sorted = (payments || []).slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const filtered = sorted.filter((p) => !search || p.project_name?.toLowerCase().includes(search.toLowerCase()) || p.client_name?.toLowerCase().includes(search.toLowerCase()) || p.payment_number?.toLowerCase().includes(search.toLowerCase()));
  const totalReceived = (payments || []).reduce((s, p) => s + (Number(p.amount) || 0), 0);

  return (
    <div>
      <PageHeader title="Payments" subtitle="Unified payment ledger"
        actions={<button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"><Plus className="w-4 h-4" /> Record Payment</button>} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Payments" value={payments?.length || 0} icon={Wallet} tone="indigo" isCurrency={false} />
        <StatCard label="Total Received" value={totalReceived} icon={TrendingUp} tone="green" />
        <StatCard label="This Month" value={(payments || []).filter((p) => { const d = new Date(p.date); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }).reduce((s, p) => s + Number(p.amount || 0), 0)} icon={TrendingUp} tone="blue" />
      </div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search payments…" className="w-full sm:w-80 px-3 py-2 text-sm rounded-lg border border-slate-300 mb-4 focus:outline-none" />
      {loading ? <div className="h-64 bg-slate-100 rounded-xl animate-pulse" /> : filtered.length === 0 ? (
        <EmptyState title="No payments" message="Record a payment against a project or invoice." />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200"><tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Number</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Client</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Project / Invoice</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Method</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Amount</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500">{p.payment_number}</td>
                  <td className="px-4 py-3">{p.date}</td>
                  <td className="px-4 py-3 text-slate-600">{p.client_name}</td>
                  <td className="px-4 py-3 text-slate-600">{p.project_name || p.invoice_number || "—"}</td>
                  <td className="px-4 py-3 capitalize text-slate-500">{p.payment_method?.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-medium">{formatCurrency(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
      {modalOpen && <PaymentForm clients={clients || []} projects={projects || []} invoices={invoices || []} existing={payments || []} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); refresh(); toast({ title: "Payment recorded" }); }} />}
    </div>
  );
}

function PaymentForm({ clients, projects, invoices, existing, onClose, onSaved }) {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), amount: "", client_id: "", project_id: "", invoice_id: "", payment_method: "bank_transfer", reference: "", notes: "", type: "project" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const clientProjects = projects.filter((p) => p.client_id === form.client_id);
  const clientInvoices = invoices.filter((i) => i.client_id === form.client_id && i.status !== "paid" && i.status !== "cancelled");

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const year = new Date().getFullYear();
      const payment_number = nextNumber("PAY", year, existing);
      const client = clients.find((c) => c.id === form.client_id);
      const project = projects.find((p) => p.id === form.project_id);
      const invoice = invoices.find((i) => i.id === form.invoice_id);
      const payment = await supabase.from('payments').insert({
        ...form, amount: Number(form.amount), payment_number,
        client_name: client?.name, project_name: project?.name, invoice_number: invoice?.invoice_number,
      });
      await supabase.from('transactions').insert({
        transaction_number: `TXN-${Date.now()}`, date: form.date, type: "income", category: form.invoice_id ? "invoice_payment" : "project_payment",
        amount: Number(form.amount), project_id: form.project_id, project_name: project?.name, client_id: form.client_id, client_name: client?.name,
        invoice_id: form.invoice_id, payment_method: form.payment_method, reference: form.reference, description: `Payment recorded`, source_entity: "payment", source_id: payment.id,
      });
      // update invoice status if linked
      if (form.invoice_id) {
        const inv = invoice;
        const allPayments = await supabase.from('payments').select('*');
        const paid = allPayments.filter((p) => p.invoice_id === inv.id).reduce((s, p) => s + Number(p.amount || 0), 0);
        let status = inv.status;
        if (paid >= inv.total) status = "paid"; else if (paid > 0) status = "partially_paid";
        await supabase.from('invoices').update(inv.id, { status });
      }
      await supabase.from('audit_logs').insert({ action: "payment_recorded", entity: "Payment", entity_id: payment.id, description: `Recorded payment ${formatCurrency(form.amount)}` });
      onSaved();
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  };

  return (
    <Modal open onClose={onClose} title="Record Payment" size="lg">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Date" type="date" required value={form.date} onChange={(e) => set("date", e.target.value)} />
          <Input label="Amount (₹)" type="number" required value={form.amount} onChange={(e) => set("amount", e.target.value)} />
          <Select label="Client" required value={form.client_id} onChange={(e) => set("client_id", e.target.value)}><option value="">Select</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
          <Select label="Payment Method" value={form.payment_method} onChange={(e) => set("payment_method", e.target.value)}>
            <option value="cash">Cash</option><option value="bank_transfer">Bank Transfer</option><option value="upi">UPI</option><option value="card">Card</option><option value="other">Other</option>
          </Select>
          <Select label="Project (optional)" value={form.project_id} onChange={(e) => set("project_id", e.target.value)}><option value="">None</option>{clientProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select>
          <Select label="Invoice (optional)" value={form.invoice_id} onChange={(e) => set("invoice_id", e.target.value)}><option value="">None</option>{clientInvoices.map((i) => <option key={i.id} value={i.id}>{i.invoice_number} — {formatCurrency(i.total)}</option>)}</Select>
        </div>
        <Input label="Reference" value={form.reference} onChange={(e) => set("reference", e.target.value)} />
        <Textarea label="Notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50">{saving ? "Saving…" : "Record"}</button>
        </div>
      </form>
    </Modal>
  );
}