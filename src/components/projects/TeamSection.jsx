import React, { useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { formatCurrency } from "@/lib/finance";
import Modal from "@/components/Modal";
import StatCard from "@/components/StatCard";
import { Input, Select, Textarea } from "@/components/FormFields";
import { useToast } from "@/components/ui/use-toast";
import { Users, UserPlus, Wallet, Banknote, Trash2, CheckCircle2 } from "lucide-react";

const ROLES = ["owner", "manager", "developer", "designer", "other"];

export const salaryText = (m) => {
  if (m.salary_type === "monthly" && Number(m.salary_amount) > 0) return `${formatCurrency(m.salary_amount)} / month`;
  if (m.salary_type === "per_project" && Number(m.salary_amount) > 0) return `${formatCurrency(m.salary_amount)} (project)`;
  return "—";
};

export default function TeamSection({ project, members, onChanged }) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const { toast } = useToast();

  const active = (members || []).filter((m) => m.status !== "removed");
  const monthlyPayout = active.filter((m) => m.salary_type === "monthly").reduce((s, m) => s + (Number(m.salary_amount) || 0), 0);
  const projectPayout = active.filter((m) => m.salary_type === "per_project").reduce((s, m) => s + (Number(m.salary_amount) || 0), 0);

  const removeMember = async (m) => {
    if (!window.confirm(`Remove "${m.name}" from this project?`)) return;
    await supabase.from('project_members').update({ status: "removed" }).eq('id', m.id);
    await supabase.from('audit_logs').insert({
      action: "updated", entity: "ProjectMember", entity_id: m.id,
      description: `Removed member ${m.name} from ${project.name}`,
    });
    onChanged?.();
    toast({ title: "Member removed" });
  };

  const activateMember = async (m) => {
    await supabase.from('project_members').update({ status: "active" }).eq('id', m.id);
    onChanged?.();
    toast({ title: `${m.name} is now active` });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-slate-500">Everyone working on this shared project, with salary and payout details per member.</p>
        <button onClick={() => setInviteOpen(true)} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <UserPlus className="w-4 h-4" /> Invite Member
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Team Members" value={active.length} icon={Users} isCurrency={false} />
        <StatCard label="Monthly Payout" value={monthlyPayout} icon={Wallet} sub="Sum of monthly salaries" />
        <StatCard label="Project Payouts" value={projectPayout} icon={Banknote} sub="One-time / per-project payments" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-3 py-2 font-medium text-slate-600">Member</th>
              <th className="text-left px-3 py-2 font-medium text-slate-600">Role</th>
              <th className="text-left px-3 py-2 font-medium text-slate-600">Salary / Payout</th>
              <th className="text-left px-3 py-2 font-medium text-slate-600">Status</th>
              <th className="text-right px-3 py-2 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {active.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-slate-400">No team members yet. Invite people working on this project.</td></tr>
            )}
            {active.map((m) => (
              <tr key={m.id}>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {(m.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-slate-800 truncate">{m.name}</div>
                      <div className="text-xs text-slate-400 truncate">{m.email || "—"}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">{m.role}</span>
                </td>
                <td className="px-3 py-2 font-medium text-slate-700">{salaryText(m)}</td>
                <td className="px-3 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                    {m.status === "active" ? "Active" : "Invited"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-1">
                    {m.status === "invited" && (
                      <button onClick={() => activateMember(m)} className="p-1.5 text-slate-400 hover:text-emerald-600 rounded" title="Mark as active">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => removeMember(m)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded" title="Remove">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {inviteOpen && (
        <InviteModal
          project={project}
          onClose={() => setInviteOpen(false)}
          onSaved={() => { setInviteOpen(false); onChanged?.(); toast({ title: "Invitation sent" }); }}
        />
      )}
    </div>
  );
}

function InviteModal({ project, onClose, onSaved }) {
  const [form, setForm] = useState({ name: "", email: "", role: "developer", salary_type: "monthly", salary_amount: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await supabase.from('project_members').insert({
        ...form,
        salary_amount: Number(form.salary_amount) || 0,
        project_id: project.id,
        project_name: project.name,
        client_id: project.client_id,
        status: "invited",
      });
      if (form.email) {
        /* user invite via auth skipped */
      }
      await supabase.from('audit_logs').insert({
        action: "created", entity: "ProjectMember", entity_id: project.id,
        description: `Invited ${form.name} (${form.role}) to ${project.name}`,
      });
      onSaved();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Invite Team Member">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Name" required value={form.name} onChange={(e) => set("name", e.target.value)} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Select label="Role" value={form.role} onChange={(e) => set("role", e.target.value)}>
            {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </Select>
          <Select label="Salary Type" value={form.salary_type} onChange={(e) => set("salary_type", e.target.value)}>
            <option value="monthly">Monthly</option>
            <option value="per_project">Per Project</option>
            <option value="none">Unpaid / None</option>
          </Select>
          <Input label="Amount (₹)" type="number" value={form.salary_amount} onChange={(e) => set("salary_amount", e.target.value)} />
        </div>
        <Textarea label="Notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        <p className="text-xs text-slate-400">The member will be invited to the app by email and added to this shared project.</p>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50">{saving ? "Inviting…" : "Send Invite"}</button>
        </div>
      </form>
    </Modal>
  );
}