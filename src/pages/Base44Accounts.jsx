import React, { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { base44 } from "@/api/base44Client";
import { formatCurrency } from "@/lib/finance";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import { Input, Select, Textarea } from "@/components/FormFields";
import { Plus, Server, Wallet } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Base44Accounts() {
  const { base44Accounts, projects, loading, refresh } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  const totalCost = (base44Accounts || []).reduce((s, a) => s + (Number(a.subscription_cost) || 0), 0);

  return (
    <div>
      <PageHeader title="Base44 Accounts" subtitle="Manage your Base44 workspace accounts"
        actions={<button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"><Plus className="w-4 h-4" /> New Account</button>} />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Accounts" value={base44Accounts?.length || 0} icon={Server} tone="indigo" isCurrency={false} />
        <StatCard label="Active Accounts" value={(base44Accounts || []).filter((a) => a.status === "active").length} icon={Server} tone="green" isCurrency={false} />
        <StatCard label="Total Subscription Cost" value={totalCost} icon={Wallet} tone="blue" />
      </div>
      {loading ? <div className="h-64 bg-slate-100 rounded-xl animate-pulse" /> : (base44Accounts || []).length === 0 ? (
        <EmptyState title="No Base44 accounts" message="Add a Base44 account to link projects to it." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(base44Accounts || []).map((a) => {
            const linked = (projects || []).filter((p) => p.base44_account_id === a.id);
            const linkedValue = linked.reduce((s, p) => {
              const v = p.project_type === "recurring" ? (Number(p.monthly_amount) || 0) * (Number(p.number_of_months) || 0) : Number(p.total_amount) || 0;
              return s + v;
            }, 0);
            return (
              <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center"><Server className="w-5 h-5 text-indigo-600" /></div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{a.status}</span>
                </div>
                <h3 className="font-semibold text-slate-900">{a.account_name}</h3>
                <p className="text-xs text-slate-400">{a.account_email}</p>
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-sm">
                  <div><p className="text-[10px] text-slate-400 uppercase">Plan</p><p className="font-medium">{a.plan || "—"}</p></div>
                  <div><p className="text-[10px] text-slate-400 uppercase">Cost</p><p className="font-medium">{formatCurrency(a.subscription_cost)}</p></div>
                  <div><p className="text-[10px] text-slate-400 uppercase">Projects</p><p className="font-medium">{linked.length}</p></div>
                  <div><p className="text-[10px] text-slate-400 uppercase">Value</p><p className="font-medium">{formatCurrency(linkedValue)}</p></div>
                </div>
                {linked.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase mb-1">Linked Projects</p>
                    {linked.map((p) => <div key={p.id} className="text-xs text-slate-600 py-0.5">• {p.name}</div>)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {modalOpen && <AccountForm onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); refresh(); toast({ title: "Account created" }); }} />}
    </div>
  );
}

function AccountForm({ onClose, onSaved }) {
  const [form, setForm] = useState({ account_name: "", account_email: "", account_identifier: "", status: "active", plan: "", subscription_cost: 0, billing_cycle: "monthly", start_date: "", renewal_date: "", notes: "", account_owner: "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await base44.entities.Base44Account.create({ ...form, subscription_cost: Number(form.subscription_cost) });
      await base44.entities.AuditLog.create({ action: "created", entity: "Base44Account", description: `Created Base44 account ${form.account_name}` });
      onSaved();
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  };
  return (
    <Modal open onClose={onClose} title="New Base44 Account" size="lg">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Account Name" required value={form.account_name} onChange={(e) => set("account_name", e.target.value)} />
          <Input label="Account Email" type="email" value={form.account_email} onChange={(e) => set("account_email", e.target.value)} />
          <Input label="Identifier / Login" value={form.account_identifier} onChange={(e) => set("account_identifier", e.target.value)} />
          <Input label="Account Owner" value={form.account_owner} onChange={(e) => set("account_owner", e.target.value)} />
          <Input label="Plan" value={form.plan} onChange={(e) => set("plan", e.target.value)} />
          <Input label="Subscription Cost (₹)" type="number" value={form.subscription_cost} onChange={(e) => set("subscription_cost", Number(e.target.value))} />
          <Select label="Billing Cycle" value={form.billing_cycle} onChange={(e) => set("billing_cycle", e.target.value)}><option value="monthly">Monthly</option><option value="yearly">Yearly</option><option value="custom">Custom</option></Select>
          <Select label="Status" value={form.status} onChange={(e) => set("status", e.target.value)}><option value="active">Active</option><option value="suspended">Suspended</option><option value="cancelled">Cancelled</option></Select>
          <Input label="Start Date" type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
          <Input label="Renewal Date" type="date" value={form.renewal_date} onChange={(e) => set("renewal_date", e.target.value)} />
        </div>
        <Textarea label="Notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        <p className="text-xs text-slate-400">Never store passwords here. Use a password manager for credentials.</p>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50">{saving ? "Saving…" : "Create"}</button>
        </div>
      </form>
    </Modal>
  );
}