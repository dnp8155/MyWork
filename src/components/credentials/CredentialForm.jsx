import React, { useState } from "react";
import { supabase } from "@/api/supabaseClient";
import Modal from "@/components/Modal";
import { Input, Select, Textarea, fieldClass } from "@/components/FormFields";
import { Eye, EyeOff, RefreshCw, KeyRound } from "lucide-react";

export const CATEGORIES = [
  { value: "domain", label: "Domain Registrar" },
  { value: "hosting", label: "Hosting" },
  { value: "google", label: "Google Account" },
  { value: "email", label: "Email" },
  { value: "server", label: "Server / VPS" },
  { value: "social", label: "Social Media" },
  { value: "payment", label: "Payment Gateway" },
  { value: "other", label: "Other" },
];

export const CATEGORY_STYLES = {
  domain: "bg-sky-100 text-sky-700",
  hosting: "bg-amber-100 text-amber-700",
  google: "bg-blue-100 text-blue-700",
  email: "bg-indigo-100 text-indigo-700",
  server: "bg-slate-200 text-slate-500",
  social: "bg-rose-100 text-rose-700",
  payment: "bg-emerald-100 text-emerald-700",
  other: "bg-slate-100 text-slate-600",
};

export default function CredentialForm({ credential, projects = [], fixedProjectId, onClose, onSaved }) {
  const [form, setForm] = useState(
    credential || {
      title: "", category: "domain", username: "", password: "",
      login_url: "", project_id: fixedProjectId || "", notes: "",
    }
  );
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
    if (!form.title.trim() || !form.username.trim() || !form.password) {
      setError("Title, username and password are required.");
      return;
    }
    setSaving(true);
    try {
      const projectId = fixedProjectId || form.project_id || null;
      const project = (projects || []).find((p) => p.id === projectId);
      const payload = {
        ...form,
        project_id: projectId,
        project_name: project?.name || "",
        client_id: project?.client_id || "",
        client_name: project?.client_name || "",
      };
      if (credential) {
        await supabase.from('credentials').update(credential.id, payload);
        await supabase.from('audit_logs').insert({
          action: "updated", entity: "Credential", entity_id: credential.id,
          description: `Updated credential "${payload.title}"`,
        });
      } else {
        const created = await supabase.from('credentials').insert(payload);
        await supabase.from('audit_logs').insert({
          action: "created", entity: "Credential", entity_id: created.id,
          description: `Added credential "${payload.title}"${payload.project_name ? ` for ${payload.project_name}` : ""}`,
        });
      }
      onSaved();
    } catch (err) {
      setError(err.message || "Could not save the credential.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={credential ? "Edit Credential" : "Add Credential"}>
      <div className="flex items-start gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <KeyRound className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Store any login — domain registrar, hosting, Google account, email, server — with its username and password,
          linked to the project it belongs to.
        </p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Title" placeholder="e.g. GoDaddy — Registrar Login" required value={form.title} onChange={(e) => set("title", e.target.value)} />
          <Select label="Category" value={form.category} onChange={(e) => set("category", e.target.value)}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
        </div>
        <Select label="Project" value={form.project_id} onChange={(e) => set("project_id", e.target.value)} disabled={!!fixedProjectId}>
          <option value="">— No project (general) —</option>
          {(projects || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
        <Input label="Username / Email" placeholder="login@example.com" required value={form.username} onChange={(e) => set("username", e.target.value)} />
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
        <Input label="Login URL (optional)" placeholder="https://..." value={form.login_url} onChange={(e) => set("login_url", e.target.value)} />
        <Textarea label="Notes (optional)" rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        {error && <div className="p-2.5 rounded-lg bg-rose-100 text-rose-700 text-xs">{error}</div>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50">
            {saving ? "Saving…" : credential ? "Save Changes" : "Add Credential"}
          </button>
        </div>
      </form>
    </Modal>
  );
}