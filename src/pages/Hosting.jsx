import React, { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { supabase } from "@/api/supabaseClient";
import { formatCurrency, nextNumber, daysUntil } from "@/lib/finance";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import { Input, Select, Textarea } from "@/components/FormFields";
import { Plus, HardDrive, Wallet } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Hosting() {
  const { hosting, projects, clients, expenses, loading, refresh } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  const totalCost = (hosting || []).filter((h) => h.purchased_by === "us").reduce((s, h) => s + Number(h.cost || 0), 0);
  const computeStatus = (h) => { const days = daysUntil(h.renewal_date); if (days !== null && days < 0) return "expired"; if (days !== null && days <= 30) return "expiring_soon"; return "active"; };

  return (
    <div>
      <PageHeader title="Hosting" subtitle="Manage hosting accounts and renewals"
        actions={<button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"><Plus className="w-4 h-4" /> New Hosting</button>} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Hosting" value={hosting?.length || 0} icon={HardDrive} tone="indigo" isCurrency={false} />
        <StatCard label="Our Cost" value={totalCost} icon={Wallet} tone="red" />
        <StatCard label="Expiring Soon" value={(hosting || []).filter((h) => { const d = daysUntil(h.renewal_date); return d !== null && d <= 30 && d >= 0; }).length} icon={HardDrive} tone="amber" isCurrency={false} />
      </div>
      {loading ? <div className="h-64 bg-slate-100 rounded-xl animate-pulse" /> : (hosting || []).length === 0 ? (
        <EmptyState title="No hosting" message="Add a hosting account. If purchased by us, an expense is auto-created." />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200"><tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Provider</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Plan</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Project</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Purchased By</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Renewal</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Cost</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {(hosting || []).map((h) => (
                <tr key={h.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{h.provider}<div className="text-xs text-slate-400">{h.name}</div></td>
                  <td className="px-4 py-3 text-slate-600">{h.plan}</td>
                  <td className="px-4 py-3 text-slate-600">{h.project_name || "—"}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${h.purchased_by === "us" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"}`}>{h.purchased_by === "us" ? "Us" : "Client"}</span></td>
                  <td className="px-4 py-3 text-slate-500">{h.renewal_date}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(h.cost)}</td>
                  <td className="px-4 py-3"><StatusBadge status={computeStatus(h) === "expired" ? "expired_domain" : computeStatus(h)} /></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
      {modalOpen && <HostingForm projects={projects || []} clients={clients || []} expenses={expenses || []} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); refresh(); toast({ title: "Hosting added" }); }} />}
    </div>
  );
}

function HostingForm({ projects, clients, expenses, onClose, onSaved }) {
  const [form, setForm] = useState({ provider: "", plan: "", name: "", server_identifier: "", purchase_date: new Date().toISOString().slice(0, 10), renewal_date: "", cost: 0, billing_cycle: "yearly", purchased_by: "us", project_id: "", client_id: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const project = projects.find((p) => p.id === form.project_id);
      const client = clients.find((c) => c.id === form.client_id) || (project ? clients.find((c) => c.id === project.client_id) : null);
      const hosting = await supabase.from('hosting_accounts').insert({
        ...form, cost: Number(form.cost),
        project_name: project?.name, client_id: form.client_id || project?.client_id, client_name: client?.name, status: "active",
      });
      if (form.purchased_by === "us" && Number(form.cost) > 0) {
        const year = new Date().getFullYear();
        const expense_number = nextNumber("EXP", year, expenses);
        const expense = await supabase.from('expenses').insert({
          expense_number, date: form.purchase_date, amount: Number(form.cost), category: "hosting", subcategory: form.provider,
          project_id: form.project_id, project_name: project?.name, client_id: form.client_id || project?.client_id, client_name: client?.name,
          vendor: form.provider, payment_method: "bank_transfer", description: `Hosting ${form.provider} (${form.plan})`, source: "hosting", linked_hosting_id: hosting.id,
        });
        await supabase.from('hosting_accounts').update(hosting.id, { expense_id: expense.id });
        await supabase.from('transactions').insert({
          transaction_number: `TXN-${Date.now()}`, date: form.purchase_date, type: "expense", category: "hosting",
          amount: Number(form.cost), project_id: form.project_id, project_name: project?.name, client_id: form.client_id || project?.client_id, client_name: client?.name,
          description: `Hosting ${form.provider}`, source_entity: "hosting", source_id: hosting.id,
        });
      }
      await supabase.from('audit_logs').insert({ action: "created", entity: "Hosting", entity_id: hosting.id, description: `Added hosting ${form.provider}` });
      onSaved();
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  };

  return (
    <Modal open onClose={onClose} title="New Hosting" size="lg">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Provider" required value={form.provider} onChange={(e) => set("provider", e.target.value)} placeholder="Hostinger, AWS…" />
          <Input label="Plan" value={form.plan} onChange={(e) => set("plan", e.target.value)} />
          <Input label="Hosting Name" required value={form.name} onChange={(e) => set("name", e.target.value)} />
          <Input label="Server Identifier" value={form.server_identifier} onChange={(e) => set("server_identifier", e.target.value)} />
          <Input label="Purchase Date" type="date" value={form.purchase_date} onChange={(e) => set("purchase_date", e.target.value)} />
          <Input label="Renewal Date" type="date" value={form.renewal_date} onChange={(e) => set("renewal_date", e.target.value)} />
          <Input label="Cost (₹)" type="number" value={form.cost} onChange={(e) => set("cost", Number(e.target.value))} />
          <Select label="Billing Cycle" value={form.billing_cycle} onChange={(e) => set("billing_cycle", e.target.value)}><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option><option value="custom">Custom</option></Select>
          <Select label="Purchased By" value={form.purchased_by} onChange={(e) => set("purchased_by", e.target.value)}><option value="us">Us (creates expense)</option><option value="client">Client (no expense)</option></Select>
          <Select label="Project" value={form.project_id} onChange={(e) => set("project_id", e.target.value)}><option value="">None</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select>
        </div>
        <Textarea label="Notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        {form.purchased_by === "us" && <p className="text-xs text-indigo-600 bg-indigo-50 p-2 rounded">An expense of {formatCurrency(form.cost)} will be auto-created in the "Hosting" category.</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50">{saving ? "Saving…" : "Add"}</button>
        </div>
      </form>
    </Modal>
  );
}