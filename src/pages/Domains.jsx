import React, { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { base44 } from "@/api/base44Client";
import { formatCurrency, nextNumber, daysUntil } from "@/lib/finance";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import { Input, Select, Textarea } from "@/components/FormFields";
import { Plus, Globe, Wallet } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Domains() {
  const { domains, projects, clients, expenses, loading, refresh } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  const totalCost = (domains || []).filter((d) => d.purchased_by === "us").reduce((s, d) => s + Number(d.renewal_cost || d.purchase_cost || 0), 0);
  const expiringSoon = (domains || []).filter((d) => { const days = daysUntil(d.renewal_date); return days !== null && days <= 30 && days >= 0; }).length;

  const computeStatus = (d) => {
    const days = daysUntil(d.renewal_date);
    if (days !== null && days < 0) return "expired";
    if (days !== null && days <= 30) return "expiring_soon";
    return "active";
  };

  return (
    <div>
      <PageHeader title="Domains" subtitle="Manage domain registrations and renewals"
        actions={<button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"><Plus className="w-4 h-4" /> New Domain</button>} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Domains" value={domains?.length || 0} icon={Globe} tone="indigo" isCurrency={false} />
        <StatCard label="Our Cost (renewals)" value={totalCost} icon={Wallet} tone="red" />
        <StatCard label="Expiring Soon (30d)" value={expiringSoon} icon={Globe} tone="amber" isCurrency={false} />
      </div>
      {loading ? <div className="h-64 bg-slate-100 rounded-xl animate-pulse" /> : (domains || []).length === 0 ? (
        <EmptyState title="No domains" message="Add a domain. If purchased by us, an expense is auto-created." />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200"><tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Domain</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Registrar</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Project</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Purchased By</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Renewal</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Cost</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {(domains || []).map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{d.domain_name}</td>
                  <td className="px-4 py-3 text-slate-600">{d.registrar || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{d.project_name || "—"}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${d.purchased_by === "us" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"}`}>{d.purchased_by === "us" ? "Us" : "Client"}</span></td>
                  <td className="px-4 py-3 text-slate-500">{d.renewal_date}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(d.renewal_cost || d.purchase_cost)}</td>
                  <td className="px-4 py-3"><StatusBadge status={computeStatus(d) === "expired" ? "expired_domain" : computeStatus(d)} /></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
      {modalOpen && <DomainForm projects={projects || []} clients={clients || []} expenses={expenses || []} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); refresh(); toast({ title: "Domain added" }); }} />}
    </div>
  );
}

function DomainForm({ projects, clients, expenses, onClose, onSaved }) {
  const [form, setForm] = useState({ domain_name: "", registrar: "", purchase_date: new Date().toISOString().slice(0, 10), renewal_date: "", purchase_cost: 0, renewal_cost: 0, purchased_by: "us", project_id: "", client_id: "", auto_renewal: false, notes: "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const project = projects.find((p) => p.id === form.project_id);
      const client = clients.find((c) => c.id === form.client_id) || (project ? clients.find((c) => c.id === project.client_id) : null);
      const domain = await base44.entities.Domain.create({
        ...form, purchase_cost: Number(form.purchase_cost), renewal_cost: Number(form.renewal_cost),
        project_name: project?.name, client_id: form.client_id || project?.client_id, client_name: client?.name,
        status: "active",
      });
      // Auto-create expense if purchased by us
      if (form.purchased_by === "us" && (Number(form.purchase_cost) > 0 || Number(form.renewal_cost) > 0)) {
        const year = new Date().getFullYear();
        const expense_number = nextNumber("EXP", year, expenses);
        const amount = Number(form.renewal_cost) || Number(form.purchase_cost);
        const expense = await base44.entities.Expense.create({
          expense_number, date: form.purchase_date, amount, category: "domain", subcategory: form.domain_name,
          project_id: form.project_id, project_name: project?.name, client_id: form.client_id || project?.client_id, client_name: client?.name,
          vendor: form.registrar, payment_method: "bank_transfer", description: `Domain ${form.domain_name} (${form.registrar})`, source: "domain", linked_domain_id: domain.id,
        });
        await base44.entities.Domain.update(domain.id, { expense_id: expense.id });
        await base44.entities.Transaction.create({
          transaction_number: `TXN-${Date.now()}`, date: form.purchase_date, type: "expense", category: "domain",
          amount, project_id: form.project_id, project_name: project?.name, client_id: form.client_id || project?.client_id, client_name: client?.name,
          description: `Domain ${form.domain_name}`, source_entity: "domain", source_id: domain.id,
        });
      }
      await base44.entities.AuditLog.create({ action: "created", entity: "Domain", entity_id: domain.id, description: `Added domain ${form.domain_name}` });
      onSaved();
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  };

  return (
    <Modal open onClose={onClose} title="New Domain" size="lg">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Domain Name" required value={form.domain_name} onChange={(e) => set("domain_name", e.target.value)} placeholder="example.com" />
          <Input label="Registrar" value={form.registrar} onChange={(e) => set("registrar", e.target.value)} />
          <Input label="Purchase Date" type="date" value={form.purchase_date} onChange={(e) => set("purchase_date", e.target.value)} />
          <Input label="Renewal Date" type="date" value={form.renewal_date} onChange={(e) => set("renewal_date", e.target.value)} />
          <Input label="Purchase Cost (₹)" type="number" value={form.purchase_cost} onChange={(e) => set("purchase_cost", Number(e.target.value))} />
          <Input label="Renewal Cost (₹)" type="number" value={form.renewal_cost} onChange={(e) => set("renewal_cost", Number(e.target.value))} />
          <Select label="Purchased By" value={form.purchased_by} onChange={(e) => set("purchased_by", e.target.value)}><option value="us">Us (creates expense)</option><option value="client">Client (no expense)</option></Select>
          <Select label="Project" value={form.project_id} onChange={(e) => set("project_id", e.target.value)}><option value="">None</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={form.auto_renewal} onChange={(e) => set("auto_renewal", e.target.checked)} /> Auto Renewal</label>
        <Textarea label="Notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        {form.purchased_by === "us" && <p className="text-xs text-indigo-600 bg-indigo-50 p-2 rounded">An expense of {formatCurrency(Number(form.renewal_cost) || Number(form.purchase_cost))} will be auto-created in the "Domain" category.</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50">{saving ? "Saving…" : "Add"}</button>
        </div>
      </form>
    </Modal>
  );
}