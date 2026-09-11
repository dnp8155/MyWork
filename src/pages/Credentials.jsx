import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAppData } from "@/hooks/useAppData";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import CredentialForm, { CATEGORIES, CATEGORY_STYLES } from "@/components/credentials/CredentialForm";
import { Input, Select } from "@/components/FormFields";
import {
  Plus, KeyRound, Eye, EyeOff, Copy, Check, Pencil, Trash2, FolderKanban,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Credentials() {
  const { credentials, projects, loading, refresh } = useAppData();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [revealed, setRevealed] = useState({});
  const [copied, setCopied] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { toast } = useToast();

  const list = (credentials || []).filter((c) => {
    const q = search.toLowerCase();
    const matchQ = !q || [c.title, c.username, c.project_name].some((v) => (v || "").toLowerCase().includes(q));
    const matchCat = categoryFilter === "all" || c.category === categoryFilter;
    const matchProj = projectFilter === "all" || c.project_id === projectFilter;
    return matchQ && matchCat && matchProj;
  });

  const projectsCovered = new Set((credentials || []).map((c) => c.project_id).filter(Boolean)).size;
  const categoriesUsed = new Set((credentials || []).map((c) => c.category)).size;

  const copy = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch (e) { /* clipboard unavailable */ }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete credential "${c.title}"?`)) return;
    await base44.entities.Credential.delete(c.id);
    await base44.entities.AuditLog.create({ action: "deleted", entity: "Credential", entity_id: c.id, description: `Deleted credential "${c.title}"` });
    refresh();
    toast({ title: "Credential deleted" });
  };

  const closeForm = () => { setModalOpen(false); setEditing(null); };

  return (
    <div>
      <PageHeader
        title="Credentials"
        subtitle="Store logins for domains, hosting, Google accounts and more — linked to projects"
        actions={
          <button onClick={() => { setEditing(null); setModalOpen(true); }} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> Add Credential
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Credentials" value={credentials?.length || 0} icon={KeyRound} tone="indigo" isCurrency={false} />
        <StatCard label="Projects Covered" value={projectsCovered} icon={FolderKanban} tone="blue" isCurrency={false} />
        <StatCard label="Categories Used" value={categoriesUsed} icon={FolderKanban} tone="green" isCurrency={false} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-3 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Input placeholder="Search title, username, project…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
          <Select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
            <option value="all">All Projects</option>
            {(projects || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </div>

        {loading ? (
          <div className="h-64 bg-slate-100 animate-pulse" />
        ) : list.length === 0 ? (
          <EmptyState
            title={credentials?.length ? "No matches" : "No credentials stored yet"}
            message={credentials?.length ? "Try changing the search or filters." : "Add domain, hosting, Google or any other account logins and link them to a project."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Title</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Project</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Username</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Password</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{c.title}</div>
                      {c.login_url && <a href={c.login_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">{c.login_url}</a>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_STYLES[c.category] || CATEGORY_STYLES.other}`}>
                        {(CATEGORIES.find((x) => x.value === c.category) || {}).label || c.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {c.project_id ? (
                        <Link to={`/projects/${c.project_id}`} className="text-slate-600 hover:text-indigo-600 hover:underline">{c.project_name}</Link>
                      ) : <span className="text-slate-400">General</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => copy(c.username, `u-${c.id}`)} className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 group">
                        <span className="truncate max-w-[180px]">{c.username}</span>
                        {copied === `u-${c.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 font-mono">{revealed[c.id] ? c.password : "••••••••"}</span>
                        <button onClick={() => setRevealed((r) => ({ ...r, [c.id]: !r[c.id] }))} className="text-slate-400 hover:text-slate-600">
                          {revealed[c.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button onClick={() => copy(c.password, `p-${c.id}`)} className="text-slate-400 hover:text-slate-600">
                          {copied === `p-${c.id}` ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditing(c); setModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(c)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <CredentialForm
          credential={editing}
          projects={projects}
          onClose={closeForm}
          onSaved={() => { closeForm(); refresh(); toast({ title: editing ? "Credential updated" : "Credential added" }); }}
        />
      )}
    </div>
  );
}