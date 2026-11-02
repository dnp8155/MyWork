import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { formatCurrency } from "@/lib/finance";
import Modal from "@/components/Modal";
import StatCard from "@/components/StatCard";
import { Input, Select, Textarea } from "@/components/FormFields";
import { useToast } from "@/components/ui/use-toast";
import { useConfirm } from "@/components/ConfirmDialog";
import { Loader2 } from "lucide-react";
import { Users, UserPlus, Wallet, Banknote, Trash2, CheckCircle2, Copy, Check, Share2, Mail, MessageSquare, Send } from "lucide-react";
import { sendProjectInvitationEmail } from "@/lib/emailService";
import { useAuth } from "@/lib/AuthContext";

const ROLES = ["owner", "manager", "developer", "designer", "other"];

export const salaryText = (m) => {
  if (m.salary_type === "monthly" && Number(m.salary_amount) > 0) return `${formatCurrency(m.salary_amount)} / month`;
  if (m.salary_type === "per_project" && Number(m.salary_amount) > 0) return `${formatCurrency(m.salary_amount)} (project)`;
  return "\u2014";
};

export default function TeamSection({ project, members, onChanged }) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const confirm = useConfirm();

  const active = (members || []).filter((m) => m.status !== "removed");
  const monthlyPayout = active.filter((m) => m.salary_type === "monthly").reduce((s, m) => s + (Number(m.salary_amount) || 0), 0);
  const projectPayout = active.filter((m) => m.salary_type === "per_project").reduce((s, m) => s + (Number(m.salary_amount) || 0), 0);

  const copyShareLink = () => {
    const link = `${window.location.origin}/projects/${project.id}/shared`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({ title: "Link copied to clipboard!", description: "Share this link with your team member." });
    setTimeout(() => setCopied(false), 3000);
  };

  const removeMember = async (m) => {
    const ok = await confirm({
      title: "Remove Team Member",
      message: `Are you sure you want to remove "${m.name}" from this project? They will lose access to documents and updates.`,
      confirmText: "Remove Member",
      cancelText: "Cancel",
      variant: "danger"
    });
    if (!ok) return;
    await base44.entities.ProjectMember.update(m.id, { status: "removed" });
    await base44.entities.AuditLog.create({
      action: "updated", entity: "ProjectMember", entity_id: m.id,
      description: `Removed member ${m.name} from ${project.name}`,
    });
    onChanged?.();
    toast({ title: "Member removed" });
  };

  const activateMember = async (m) => {
    await base44.entities.ProjectMember.update(m.id, { status: "active" });
    onChanged?.();
    toast({ title: `${m.name} is now active` });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-slate-500">Everyone working on this shared project, with salary and payout details per member.</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyShareLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-300 text-slate-700 bg-white rounded-lg hover:bg-slate-50 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-500" />}
            {copied ? "Copied Link" : "Copy Project Link"}
          </button>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <UserPlus className="w-4 h-4" /> Invite Member
          </button>
        </div>
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
                      <div className="text-xs text-slate-400 truncate">{m.email || "\u2014"}</div>
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
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");
  const [invitedData, setInvitedData] = useState(null);
  const [copied, setCopied] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const shareUrl = `${window.location.origin}/projects/${project.id}/shared`;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.entities.ProjectMember.create({
        ...form,
        salary_amount: Number(form.salary_amount) || 0,
        project_id: project.id,
        project_name: project.name,
        client_id: project.client_id,
        status: "invited",
      });

      await base44.entities.AuditLog.create({
        action: "created",
        entity: "ProjectMember",
        entity_id: project.id,
        description: `Invited ${form.name} (${form.role}) to ${project.name}`,
      });

      // Trigger background direct email delivery
      if (form.email) {
        setEmailStatus("sending");
        sendProjectInvitationEmail({
          toEmail: form.email,
          toName: form.name,
          projectName: project.name,
          projectId: project.id,
          inviterName: user?.user_metadata?.full_name || user?.email || "Workspace Owner"
        }).then(res => {
          if (res.success) {
            setEmailStatus("sent");
          } else {
            setEmailStatus("fallback");
          }
        }).catch(() => {
          setEmailStatus("fallback");
        });
      }

      setInvitedData({ name: form.name, email: form.email, role: form.role });
    } catch (err) {
      alert(err.message || "Failed to add member");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Invitation to join project: ${project.name}`);
    const body = encodeURIComponent(
      `Hi ${invitedData?.name || "there"},\n\nYou have been invited to join the project "${project.name}" as a ${invitedData?.role || "team member"}.\n\nAccess the shared project workspace here:\n${shareUrl}\n\nBest regards,\nMyWork Team`
    );
    window.open(`mailto:${invitedData?.email || ""}?subject=${subject}&body=${body}`, "_blank");
  };

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(
      `Hi ${invitedData?.name || ""}, you've been invited to join project *${project.name}* on MyWork.\n\nOpen project workspace: ${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  if (invitedData) {
    return (
      <Modal open onClose={() => { onSaved(); }} title="Member Invited Successfully! 🎉">
        <div className="space-y-4 py-2">
          <p className="text-sm text-slate-600">
            <strong>{invitedData.name}</strong> has been added as a <strong>{invitedData.role}</strong>. Share the project link directly via Email or WhatsApp:
          </p>

          <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="text-xs text-slate-600 bg-transparent flex-1 outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded font-medium hover:bg-slate-50 flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleSendEmail}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium transition"
            >
              <Mail className="w-4 h-4" /> Send Email
            </button>
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-medium transition"
            >
              <MessageSquare className="w-4 h-4" /> WhatsApp
            </button>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="button"
              onClick={() => onSaved()}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open onClose={onClose} title="Invite Team Member">
      <form onSubmit={submit} className="space-y-4 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              required
              placeholder="e.g. Rahul Sharma"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
            <input
              required
              type="email"
              placeholder="rahul@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Project Role</label>
            <select
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition capitalize"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Type</label>
            <select
              value={form.salary_type}
              onChange={(e) => set("salary_type", e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            >
              <option value="monthly">Monthly</option>
              <option value="per_project">Per Project</option>
              <option value="none">Unpaid / Free</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹)</label>
            <input
              type="number"
              placeholder="0"
              value={form.salary_amount}
              onChange={(e) => set("salary_amount", e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Scope (Optional)</label>
          <textarea
            rows={2}
            placeholder="Responsibilities or task details..."
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition resize-none"
          />
        </div>

        <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center gap-2.5">
          <Send className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <p className="text-xs text-indigo-900 leading-relaxed">
            Member will get access to documents, tasks and salary records. An invite link will be prepared instantly.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm shadow-indigo-200 disabled:opacity-50 transition inline-flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding Member...
              </>
            ) : (
              <>
                Save & Invite
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}