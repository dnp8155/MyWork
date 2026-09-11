import React, { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import { Input } from "@/components/FormFields";
import { Plus, Server, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Base44Accounts() {
  const { base44Accounts, loading, refresh } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [revealed, setRevealed] = useState({});
  const { toast } = useToast();

  const toggleReveal = (id) => setRevealed((r) => ({ ...r, [id]: !r[id] }));

  return (
    <div>
      <PageHeader title="Base44 Accounts" subtitle="Manage your Base44 account credentials"
        actions={<button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"><Plus className="w-4 h-4" /> New Account</button>} />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Accounts" value={base44Accounts?.length || 0} icon={Server} tone="indigo" isCurrency={false} />
      </div>
      {loading ? <div className="h-64 bg-slate-100 rounded-xl animate-pulse" /> : (base44Accounts || []).length === 0 ? (
        <EmptyState title="No Base44 accounts" message="Add a Base44 account with its name, email and password." />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200"><tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Password</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {(base44Accounts || []).map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{a.account_name}</td>
                  <td className="px-4 py-3 text-slate-600">{a.account_email || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 font-mono">{revealed[a.id] ? a.password || "—" : "••••••••"}</span>
                      <button onClick={() => toggleReveal(a.id)} className="text-slate-400 hover:text-slate-600">
                        {revealed[a.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
      {modalOpen && <AccountForm onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); refresh(); toast({ title: "Account created" }); }} />}
    </div>
  );
}

function AccountForm({ onClose, onSaved }) {
  const [form, setForm] = useState({ account_name: "", account_email: "", password: "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await base44.entities.Base44Account.create(form);
      await base44.entities.AuditLog.create({ action: "created", entity: "Base44Account", description: `Created Base44 account ${form.account_name}` });
      onSaved();
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  };
  return (
    <Modal open onClose={onClose} title="New Base44 Account">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Name" required value={form.account_name} onChange={(e) => set("account_name", e.target.value)} />
        <Input label="Email" type="email" value={form.account_email} onChange={(e) => set("account_email", e.target.value)} />
        <Input label="Password" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50">{saving ? "Saving…" : "Create"}</button>
        </div>
      </form>
    </Modal>
  );
}