import React, { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { base44 } from "@/api/base44Client";
import { formatCurrency, nextNumber } from "@/lib/finance";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import { Input, Select, Textarea } from "@/components/FormFields";
import { Plus, TrendingDown, Globe, HardDrive } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const CATEGORIES = ["domain","hosting","software","api","base44","server","development","marketing","employee_salary","other"];

export default function Expenses() {
  const { expenses, projects, clients, loading, refresh } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  const filtered = (expenses || []).filter((e) => filter === "all" || e.category === filter).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const total = (expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const autoExpenses = (expenses || []).filter((e) => e.source !== "manual").length;

  return (
    <div>
      <PageHeader title="Expenses" subtitle="All company and project expenses"
        actions={<button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"><Plus className="w-4 h-4" /> Add Expense</button>} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Expenses" value={total} icon={TrendingDown} tone="red" />
        <StatCard label="Total Count" value={expenses?.length || 0} icon={TrendingDown} tone="indigo" isCurrency={false} />
        <StatCard label="Auto-generated" value={autoExpenses} icon={Globe} tone="blue" isCurrency={false} />
      </div>
      <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-slate-300 mb-4 focus:outline-none capitalize">
        <option value="all">All Categories</option>
        {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
      </select>
      {loading ? <div className="h-64 bg-slate-100 rounded-xl animate-pulse" /> : filtered.length === 0 ? (
        <EmptyState title="No expenses" message="Add an expense or create a domain/hosting record (auto-expenses appear here)." />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200"><tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Number</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Category</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Project</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Source</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Amount</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500">{e.expense_number}</td>
                  <td className="px-4 py-3">{e.date}</td>
                  <td className="px-4 py-3 capitalize">{e.category?.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-slate-600">{e.project_name || "—"}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${e.source === "manual" ? "bg-slate-100 text-slate-600" : "bg-indigo-100 text-indigo-600"}`}>{e.source}</span></td>
                  <td className="px-4 py-3 text-right text-rose-600 font-medium">{formatCurrency(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
      {modalOpen && <ExpenseForm projects={projects || []} clients={clients || []} existing={expenses || []} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); refresh(); toast({ title: "Expense added" }); }} />}
    </div>
  );
}

function ExpenseForm({ projects, clients, existing, onClose, onSaved }) {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), amount: "", category: "development", subcategory: "", project_id: "", client_id: "", vendor: "", payment_method: "bank_transfer", description: "", recurring: false });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const year = new Date().getFullYear();
      const expense_number = nextNumber("EXP", year, existing);
      const project = projects.find((p) => p.id === form.project_id);
      const client = clients.find((c) => c.id === form.client_id) || (project ? clients.find((c) => c.id === project.client_id) : null);
      const expense = await base44.entities.Expense.create({
        ...form, amount: Number(form.amount), expense_number, source: "manual",
        project_name: project?.name, client_id: form.client_id || project?.client_id, client_name: client?.name,
      });
      await base44.entities.Transaction.create({
        transaction_number: `TXN-${Date.now()}`, date: form.date, type: "expense", category: form.category,
        amount: Number(form.amount), project_id: form.project_id, project_name: project?.name, client_id: form.client_id || project?.client_id, client_name: client?.name,
        payment_method: form.payment_method, description: form.description, source_entity: "expense", source_id: expense.id,
      });
      await base44.entities.AuditLog.create({ action: "expense_added", entity: "Expense", entity_id: expense.id, description: `Added expense ${formatCurrency(form.amount)} (${form.category})` });
      onSaved();
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  };
  return (
    <Modal open onClose={onClose} title="Add Expense" size="lg">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Date" type="date" required value={form.date} onChange={(e) => set("date", e.target.value)} />
          <Input label="Amount (₹)" type="number" required value={form.amount} onChange={(e) => set("amount", e.target.value)} />
          <Select label="Category" value={form.category} onChange={(e) => set("category", e.target.value)}>{CATEGORIES.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}</Select>
          <Input label="Subcategory" value={form.subcategory} onChange={(e) => set("subcategory", e.target.value)} />
          <Select label="Project" value={form.project_id} onChange={(e) => set("project_id", e.target.value)}><option value="">None</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select>
          <Input label="Vendor" value={form.vendor} onChange={(e) => set("vendor", e.target.value)} />
          <Select label="Payment Method" value={form.payment_method} onChange={(e) => set("payment_method", e.target.value)}><option value="cash">Cash</option><option value="bank_transfer">Bank Transfer</option><option value="upi">UPI</option><option value="card">Card</option><option value="other">Other</option></Select>
          <label className="flex items-center gap-2 text-sm text-slate-600 pt-6"><input type="checkbox" checked={form.recurring} onChange={(e) => set("recurring", e.target.checked)} /> Recurring</label>
        </div>
        <Textarea label="Description" value={form.description} onChange={(e) => set("description", e.target.value)} />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50">{saving ? "Saving…" : "Add"}</button>
        </div>
      </form>
    </Modal>
  );
}