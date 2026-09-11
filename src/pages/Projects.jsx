import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "@/hooks/useAppData";
import { base44 } from "@/api/base44Client";
import { computeProjectFinancials, formatCurrency } from "@/lib/finance";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import ProjectForm from "@/components/projects/ProjectForm";
import ProjectCard from "@/components/projects/ProjectCard";
import { useToast } from "@/components/ui/use-toast";
import { Image } from "@/components/ui/image";
import StatusBadge from "@/components/StatusBadge";
import { Plus, Download, LayoutGrid, List as ListIcon, FolderKanban } from "lucide-react";

const TABS = [
  { key: "all", label: "All Projects" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "on_hold", label: "On Hold" },
];

export default function Projects() {
  const { projects, clients, base44Accounts, payments, expenses, loading, refresh } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [view, setView] = useState("grid");
  const { toast } = useToast();
  const navigate = useNavigate();

  const all = (projects || []).filter((p) => p.status !== "archived");
  const counts = {
    all: all.length,
    active: all.filter((p) => p.status === "active").length,
    completed: all.filter((p) => p.status === "completed").length,
    on_hold: all.filter((p) => p.status === "on_hold").length,
  };
  const filtered = all
    .filter((p) => tab === "all" || p.status === tab)
    .filter((p) => typeFilter === "all" || (typeFilter === "fixed" ? p.project_type !== "recurring" : p.project_type === "recurring"))
    .filter((p) => clientFilter === "all" || p.client_id === clientFilter)
    .filter((p) =>
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.project_number?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (b.created_date || "").localeCompare(a.created_date || ""));

  const archiveProject = async (p) => {
    if (!window.confirm(`Archive project "${p.name}"?`)) return;
    await base44.entities.Project.update(p.id, { status: "archived" });
    await base44.entities.AuditLog.create({
      action: "updated", entity: "Project", entity_id: p.id,
      description: `Archived project ${p.name}`,
    });
    refresh();
    toast({ title: "Project archived" });
  };

  const exportCsv = () => {
    const rows = [["Project", "Number", "Client", "Type", "Status", "Value", "Received", "Pending", "Start Date", "End Date"]];
    filtered.forEach((p) => {
      const f = computeProjectFinancials(p, payments, expenses);
      rows.push([
        p.name, p.project_number, p.client_name || "",
        p.project_type === "recurring" ? "Recurring" : "Fixed",
        p.status, f.value, f.received, f.pending,
        p.start_date || "", p.expected_completion_date || p.recurring_end_date || "",
      ]);
    });
    const csv = rows.map((r) => r.map((v) => `"${String(v ?? "")}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `projects-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${filtered.length} projects exported to CSV` });
  };

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle="Manage all your fixed-price and recurring/salary projects in one place."
        actions={
          <>
            <button onClick={exportCsv} className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 bg-white text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50">
              <Download className="w-4 h-4" /> Export
            </button>
            <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
              <Plus className="w-4 h-4" /> New Project
            </button>
          </>
        }
      />

      {/* Filter bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 mb-5">
        <div className="inline-flex bg-slate-100 rounded-lg p-1 self-start overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition whitespace-nowrap ${
                tab === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label} <span className="text-slate-400">({counts[t.key]})</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-indigo-400 focus:outline-none w-44"
          />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-indigo-400 focus:outline-none">
            <option value="all">All Types</option>
            <option value="fixed">Fixed</option>
            <option value="recurring">Recurring</option>
          </select>
          <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-indigo-400 focus:outline-none max-w-40">
            <option value="all">All Clients</option>
            {(clients || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setView("grid")}
              className={`w-8 h-7 rounded-md flex items-center justify-center transition ${view === "grid" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`w-8 h-7 rounded-md flex items-center justify-center transition ${view === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              title="List view"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No projects found"
          message="Create your first project to start tracking finances."
          action={<button onClick={() => setModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg">New Project</button>}
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} payments={payments} expenses={expenses} onArchive={archiveProject} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_2px_rgba(16,24,40,0.04)] divide-y divide-slate-100 overflow-hidden">
          {filtered.map((p) => {
            const f = computeProjectFinancials(p, payments, expenses);
            return (
              <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition cursor-pointer">
                <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {p.logo ? <Image src={p.logo} className="w-full h-full" fittingType="fill" /> : <FolderKanban className="w-4 h-4 text-slate-400" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 truncate">{p.name}</div>
                  <div className="text-[11px] text-slate-400">{p.project_number} · {p.client_name || "No client"}</div>
                </div>
                <span className={`hidden sm:inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${p.project_type === "recurring" ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500"}`}>
                  {p.project_type === "recurring" ? "Recurring" : "Fixed"}
                </span>
                <span className="hidden md:block text-xs text-slate-600 w-28 text-right">{formatCurrency(f.received)} / {formatCurrency(f.value)}</span>
                <StatusBadge status={p.status} />
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <ProjectForm
          clients={clients || []}
          base44Accounts={base44Accounts || []}
          existing={projects || []}
          expenses={expenses || []}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); refresh(); toast({ title: "Project created" }); }}
        />
      )}
    </div>
  );
}