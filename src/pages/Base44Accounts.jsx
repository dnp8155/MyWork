import React, { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import { Input, fieldClass } from "@/components/FormFields";
import { Plus, Server, Eye, EyeOff, Copy, Check, Pencil, Trash2, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Base44Accounts() {
  const { base44Accounts, loading, refresh } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [revealed, setRevealed] = useState({});
  const [copied, setCopied] = useState("");
  const { toast } = useToast();

  const toggleReveal = (id) => setRevealed((r) => ({ ...r, [id]: !r[id] }));

  const copy = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch (e) { /* clipboard unavailable */ }
  };

  const handleDelete = async (a) => {
    if (!window.confirm(`Delete account "${a.account_name}"?`)) return;
    await base44.entities.Base44Account.delete(a.id);
    await base44.entities.AuditLog.create({ action: "deleted", entity: "Base44Account", entity_id: a.id, description: `Deleted Base44 account ${a.account_name}` });
    refresh();
    toast({ title: "Account deleted" });
  };

  const closeForm = () => { setModalOpen(false); setEditing(null); };

  return (
    <div>
      <PageHeader
        title="Base44 Accounts"
        subtitle="Manage your Base44 account credentials"
        actions={
          <button onClick={() => { setEditing(null); setModalOpen(true); }} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> Add Account
          </button>
        }
      />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Accounts" value={base44Accounts?.length || 0} icon={Server} tone="indigo" isCurrency={false} />
      </div>
      {loading ? (
        <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
      ) : (base44Accounts || []).length === 0 ? (
        <EmptyState title="No Base44 accounts" message="Add a Base44 account with its name, email and password." />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Password</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(base44Accounts || []).map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                          <Server className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-800">{a.account_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => copy(a.account_email, `e-${a.id}`)} className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 group">
                        <span className="truncate max-w-[220px]">{a.account_email || "—"}</span>
                        {copied === `e-${a.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 font-mono">{revealed[a.id] ? a.password || "—" : "••••••••"}</span>
                        <button onClick={() => toggleReveal(a.id)} className="text-slate-400 hover:text-slate-600">
                          {revealed[a.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button onClick={() => copy(a.password, `p-${a.id}`)} className="text-slate-400 hover:text-slate-600">
                          {copied === `p-${a.id}` ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditing(a); setModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(a)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {modalOpen && (
        <AccountForm
          account={editing}
          onClose={closeForm}
          onSaved={() => { closeForm(); refresh(); toast({ title: editing ? "Account updated" : "Account created" }); }}
        />
      )}
    </div>
  );
}

function AccountForm({ account, onClose, onSaved }) {
  const [form, setForm] = useState(account || { account_name: "", account_email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$&";
    let pw = "";
    for (let i = 0; i < 14; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length));
    set("password", pw);
    setShowPassword(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.account_name.trim() || !form.account_email.trim() || !form.password) {
      setError("Name, email and password are required.");
      return;
    }
    setSaving(true);
    try {
      if (account) {
        await base44.entities.Base44Account.update(account.id, form);
        await base44.entities.AuditLog.create({ action: "updated", entity: "Base44Account", entity_id: account.id, description: `Updated Base44 account ${form.account_name}` });
      } else {
        const created = await base44.entities.Base44Account.create(form);
        await base44.entities.AuditLog.create({ action: "created", entity: "Base44Account", entity_id: created.id, description: `Created Base44 account ${form.account_name}` });
      }
      onSaved();
    } catch (err) {
      setError(err.message || "Could not save the account.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={account ? "Edit Base44 Account" : "Add Base44 Account"}>
      <div className="flex items-start gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <Server className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Save the Base44 workspace login here. Projects link to these accounts, so you always know which account a project runs on.
        </p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <Input label="Account Name" placeholder="e.g. MeWork — Main Workspace" required value={form.account_name} onChange={(e) => set("account_name", e.target.value)} />
        <Input label="Email" type="email" placeholder="you@example.com" required value={form.account_email} onChange={(e) => set("account_email", e.target.value)} />
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className={`${fieldClass} pr-20`}
              required
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="••••••••"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              <button type="button" onClick={generatePassword} title="Generate a strong password" className="p-1.5 text-slate-400 hover:text-indigo-600 rounded">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setShowPassword((s) => !s)} title={showPassword ? "Hide password" : "Show password"} className="p-1.5 text-slate-400 hover:text-slate-600 rounded">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
        {error && <div className="p-2.5 rounded-lg bg-rose-100 text-rose-700 text-xs">{error}</div>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50">
            {saving ? "Saving…" : account ? "Save Changes" : "Create Account"}
          </button>
        </div>
      </form>
    </Modal>
  );
}