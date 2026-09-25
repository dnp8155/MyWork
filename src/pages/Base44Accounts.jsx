import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAppData } from "@/hooks/useAppData";
import { supabase } from "@/api/supabaseClient";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import { Input, Select, Textarea, fieldClass } from "@/components/FormFields";
import { Plus, Eye, EyeOff, Copy, Check, Pencil, Trash2, RefreshCw, Server, Database, Github, Globe } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const CATEGORIES = [
  { key: "base44", label: "Base44", icon: Server, tint: "bg-indigo-100 text-indigo-600", dot: "bg-indigo-500" },
  { key: "supabase", label: "Supabase", icon: Database, tint: "bg-emerald-100 text-emerald-600", dot: "bg-emerald-500" },
  { key: "github", label: "GitHub", icon: Github, tint: "bg-slate-200 text-slate-700", dot: "bg-slate-700" },
  { key: "vercel", label: "Vercel", icon: Globe, tint: "bg-slate-900 text-white", dot: "bg-slate-900" },
];

const catOf = (a) => a.category || "base44";

export default function Base44Accounts() {
  const { base44Accounts, projects, loading, refresh } = useAppData();
  const [active, setActive] = useState("base44");
  const [view, setView] = useState("accounts");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { toast } = useToast();

  const accounts = base44Accounts || [];
  const counts = CATEGORIES.reduce((acc, c) => {
    acc[c.key] = accounts.filter((a) => catOf(a) === c.key).length;
    return acc;
  }, {});
  const list = accounts.filter((a) => catOf(a) === active).sort((a, b) => (b.created_date || "").localeCompare(a.created_date || ""));
  const activeMeta = CATEGORIES.find((c) => c.key === active);

  const handleDelete = async (a) => {
    if (!window.confirm(`Delete account "${a.account_name}"?`)) return;
    await supabase.from('base44_accounts').delete().eq('id', a.id);
    await supabase.from('audit_logs').insert({ action: "deleted", entity: "Base44Account", entity_id: a.id, description: `Deleted ${catOf(a)} account ${a.account_name}` });
    refresh();
    toast({ title: "Account deleted" });
  };

  const closeForm = () => { setModalOpen(false); setEditing(null); };

  return (
    <div>
      <PageHeader
        title="Accounts"
        subtitle="Manage your Base44, Supabase, GitHub and Vercel accounts — category-wise."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex bg-slate-100 rounded-lg p-1 text-xs font-medium">
              <button onClick={() => setView("accounts")} className={`px-3 py-1.5 rounded-md transition ${view === "accounts" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Accounts</button>
              <button onClick={() => setView("projects")} className={`px-3 py-1.5 rounded-md transition ${view === "projects" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Project Connections</button>
            </div>
            {view === "accounts" && (
              <button onClick={() => { setEditing(null); setModalOpen(true); }} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
                <Plus className="w-4 h-4" /> Add Account
              </button>
            )}
          </div>
        }
      />

      {view === "accounts" && (
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
        {/* Left category panel — fixed height, scrolls internally */}
        <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-7.5rem)] lg:overflow-y-auto bg-white rounded-xl border border-slate-200 p-3">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-2 mb-2">Categories</p>
          <nav className="space-y-1 lg:max-h-none max-h-60 overflow-y-auto">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setActive(c.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active === c.key ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${active === c.key ? "bg-white/20 text-white" : c.tint}`}>
                  <c.icon className="w-3.5 h-3.5" />
                </span>
                <span className="flex-1 text-left">{c.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active === c.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>{counts[c.key]}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Right — accounts of selected category */}
        <div className="min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : list.length === 0 ? (
            <EmptyState
              title={`No ${activeMeta.label} accounts`}
              message={`Add a ${activeMeta.label} account to link with your projects.`}
              action={<button onClick={() => { setEditing(null); setModalOpen(true); }} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg">Add {activeMeta.label} Account</button>}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {list.map((a) => (
                <AccountCard key={a.id} account={a} meta={activeMeta} projects={projects || []} onEdit={() => { setEditing(a); setModalOpen(true); }} onDelete={() => handleDelete(a)} />
              ))}
            </div>
          )}
        </div>
      </div>
      )}

      {view === "projects" && (
        <ProjectConnections projects={projects || []} accounts={base44Accounts || []} />
      )}

      {modalOpen && (
        <AccountForm
          account={editing}
          defaultCategory={active}
          onClose={closeForm}
          onSaved={() => { closeForm(); refresh(); toast({ title: editing ? "Account updated" : "Account created" }); }}
        />
      )}
    </div>
  );
}

function ProjectConnections({ projects, accounts }) {
  const services = [
    { key: "base44", field: "base44_account_id", label: "Base44", icon: Server, tint: "bg-indigo-50 text-indigo-600" },
    { key: "github", field: "github_account_id", label: "GitHub", icon: Github, tint: "bg-slate-100 text-slate-600" },
    { key: "supabase", field: "supabase_account_id", label: "Supabase", icon: Database, tint: "bg-emerald-50 text-emerald-600" },
    { key: "vercel", field: "vercel_account_id", label: "Vercel", icon: Globe, tint: "bg-slate-900 text-white" },
  ];
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Project</th>
              {services.map((s) => <th key={s.key} className="text-left px-4 py-3 font-semibold text-slate-600">{s.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No projects yet.</td></tr>
            ) : projects.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link to={`/projects/${p.id}`} className="font-medium text-slate-800 hover:text-indigo-600">{p.name}</Link>
                  <div className="text-[11px] text-slate-400">{p.project_number} · {p.client_name || "No client"}</div>
                </td>
                {services.map((s) => {
                  const acc = accounts.find((a) => a.id === p[s.field] && (a.category || "base44") === s.key);
                  return (
                    <td key={s.key} className="px-4 py-3">
                      {acc ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.tint}`}>
                          <s.icon className="w-3 h-3" /> <span className="truncate max-w-[120px]">{acc.account_name}</span>
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SecretRow({ label, value, id }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  const copy = async () => { try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch (e) { /* noop */ } };
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-slate-400">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-slate-600 truncate max-w-[140px]">{revealed ? value : "••••••••"}</span>
        <button onClick={() => setRevealed((r) => !r)} className="text-slate-400 hover:text-slate-600">{revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
        <button onClick={copy} className="text-slate-400 hover:text-indigo-600">{copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}</button>
      </div>
    </div>
  );
}

const CATEGORY_FIELD = {
  base44: "base44_account_id",
  supabase: "supabase_account_id",
  github: "github_account_id",
  vercel: "vercel_account_id",
};

function AccountCard({ account, meta, projects, onEdit, onDelete }) {
  const a = account;
  const linked = (projects || []).filter((p) => p[CATEGORY_FIELD[meta.key]] === a.id);
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.tint}`}>
          <meta.icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-slate-800 truncate">{a.account_name}</div>
          {a.account_email && <div className="text-xs text-slate-500 truncate">{a.account_email}</div>}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded" title="Edit"><Pencil className="w-4 h-4" /></button>
          <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-rose-600 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {a.team && <div className="text-xs text-slate-500"><span className="text-slate-400">Team/Org: </span>{a.team}</div>}
        {(a.repo_url || a.project_url) && (
          <a href={a.repo_url || a.project_url} target="_blank" rel="noreferrer" className="block text-xs text-indigo-600 hover:underline truncate">{a.repo_url || a.project_url}</a>
        )}
        <SecretRow label="Password" value={a.password} id={`p-${a.id}`} />
        <SecretRow label="API Key / Token" value={a.api_key} id={`k-${a.id}`} />
        {a.notes && <p className="text-xs text-slate-400 pt-1 border-t border-slate-100 mt-1">{a.notes}</p>}

        <div className="pt-2 mt-2 border-t border-slate-100">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Linked Projects ({linked.length})</div>
          {linked.length === 0 ? (
            <div className="text-xs text-slate-300">No projects linked.</div>
          ) : (
            <div className="space-y-1">
              {linked.map((p) => (
                <Link key={p.id} to={`/projects/${p.id}`} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 transition-colors group">
                  <span className={`w-1.5 h-1.5 rounded-full ${p.status === "active" ? "bg-emerald-500" : "bg-slate-300"}`} />
                  <span className="text-xs font-medium text-slate-700 group-hover:text-indigo-700 truncate flex-1">{p.name}</span>
                  <span className="text-[10px] text-slate-400">{p.project_number}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Field layout per category: which fields to show and their labels
const FIELD_SPEC = {
  base44: [
    { f: "account_name", label: "Account Name", placeholder: "e.g. MeWork — Main Workspace" },
    { f: "account_email", label: "Email", type: "email", placeholder: "you@example.com" },
    { f: "password", label: "Password", secret: true },
    { f: "team", label: "Workspace ID", placeholder: "Workspace id" },
    { f: "project_url", label: "App URL", placeholder: "https://app.base44.com/..." },
  ],
  supabase: [
    { f: "account_name", label: "Project Name", placeholder: "e.g. MeWork DB" },
    { f: "account_email", label: "Email", type: "email", placeholder: "you@example.com" },
    { f: "password", label: "Password", secret: true },
    { f: "team", label: "Organization", placeholder: "Org name" },
    { f: "project_url", label: "Project URL", placeholder: "https://xxx.supabase.co" },
    { f: "api_key", label: "Anon / Service Key", secret: true },
  ],
  github: [
    { f: "account_name", label: "Repo Name", placeholder: "owner/repo" },
    { f: "account_email", label: "Email", type: "email", placeholder: "you@example.com" },
    { f: "password", label: "Password / Token", secret: true },
    { f: "repo_url", label: "Repo URL", placeholder: "https://github.com/owner/repo" },
    { f: "team", label: "Owner", placeholder: "Owner / org" },
    { f: "api_key", label: "Personal Access Token", secret: true },
  ],
  vercel: [
    { f: "account_name", label: "Project Name", placeholder: "e.g. MeWork Web" },
    { f: "account_email", label: "Email", type: "email", placeholder: "you@example.com" },
    { f: "password", label: "Password / Token", secret: true },
    { f: "team", label: "Team Slug", placeholder: "team slug" },
    { f: "project_url", label: "Project URL", placeholder: "https://meework.vercel.app" },
    { f: "api_key", label: "Token", secret: true },
  ],
};

function AccountForm({ account, defaultCategory, onClose, onSaved }) {
  const [form, setForm] = useState(() => {
    const base = account || { account_name: "", account_email: "", password: "", api_key: "", team: "", project_url: "", repo_url: "", notes: "" };
    return { ...base, category: account?.category || defaultCategory || "base44" };
  });
  const [showSecret, setShowSecret] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const spec = FIELD_SPEC[form.category] || [];

  const generatePassword = (field) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$&";
    let pw = "";
    for (let i = 0; i < 16; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length));
    set(field, pw);
    setShowSecret((s) => ({ ...s, [field]: true }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.account_name.trim()) { setError("Name is required."); return; }
    setSaving(true);
    try {
      if (account) {
        await supabase.from('base44_accounts').update(form).eq('id', account.id);
        await supabase.from('audit_logs').insert({ action: "updated", entity: "Base44Account", entity_id: account.id, description: `Updated ${form.category} account ${form.account_name}` });
      } else {
        const created = await supabase.from('base44_accounts').insert(form);
        await supabase.from('audit_logs').insert({ action: "created", entity: "Base44Account", entity_id: created.id, description: `Created ${form.category} account ${form.account_name}` });
      }
      onSaved();
    } catch (err) {
      setError(err.message || "Could not save the account.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={account ? "Edit Account" : "Add Account"} size="lg">
      <form onSubmit={submit} className="space-y-4">
        <Select label="Category" value={form.category} onChange={(e) => set("category", e.target.value)}>
          {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
        </Select>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {spec.map((fld) => (
            <div key={fld.f} className={fld.secret ? "sm:col-span-1" : ""}>
              <label className="block text-xs font-medium text-slate-600 mb-1">{fld.label}</label>
              {fld.secret ? (
                <div className="relative">
                  <input
                    type={showSecret[fld.f] ? "text" : "password"}
                    className={`${fieldClass} pr-20`}
                    value={form[fld.f] || ""}
                    onChange={(e) => set(fld.f, e.target.value)}
                    placeholder="••••••••"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                    <button type="button" onClick={() => generatePassword(fld.f)} title="Generate" className="p-1.5 text-slate-400 hover:text-indigo-600 rounded">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setShowSecret((s) => ({ ...s, [fld.f]: !s[fld.f] }))} title={showSecret[fld.f] ? "Hide" : "Show"} className="p-1.5 text-slate-400 hover:text-slate-600 rounded">
                      {showSecret[fld.f] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                <Input type={fld.type || "text"} placeholder={fld.placeholder} value={form[fld.f] || ""} onChange={(e) => set(fld.f, e.target.value)} />
              )}
            </div>
          ))}
        </div>
        <Textarea label="Notes" value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} />
        {error && <div className="p-2.5 rounded-lg bg-rose-100 text-rose-700 text-xs">{error}</div>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50">{saving ? "Saving…" : account ? "Save Changes" : "Create Account"}</button>
        </div>
      </form>
    </Modal>
  );
}