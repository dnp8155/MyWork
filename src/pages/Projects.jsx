import React, { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { computeProjectFinancials, formatCurrency } from "@/lib/finance";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Image } from "@/components/ui/image";
import EmptyState from "@/components/EmptyState";
import ProjectForm from "@/components/projects/ProjectForm";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Projects() {
  const { projects, clients, base44Accounts, payments, expenses, loading, refresh } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const filtered = (projects || [])
    .filter((p) => filter === "all" || p.status === filter)
    .filter((p) => !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.client_name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.created_date || "").localeCompare(a.created_date || ""));

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle="Manage fixed-price and recurring/salary projects"
        actions={
          <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> New Project
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects…" className="px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-indigo-400 focus:outline-none flex-1" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-indigo-400 focus:outline-none">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
        </select>
      </div>

      {loading ? <div className="h-64 bg-slate-100 rounded-xl animate-pulse" /> : filtered.length === 0 ? (
        <EmptyState title="No projects found" message="Create your first project to start tracking finances." action={<button onClick={() => setModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg">New Project</button>} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => {
            const f = computeProjectFinancials(p, payments, expenses);
            return (
              <div key={p.id} className="relative pt-3">
                <div className="absolute top-0 left-4 w-24 h-3 bg-white border border-slate-200 border-b-0 rounded-t-md" />
                <div onClick={() => navigate(`/projects/${p.id}`)} className="aspect-square bg-white rounded-xl border border-slate-200 p-4 flex flex-col hover:border-slate-300 hover:shadow-sm transition cursor-pointer overflow-hidden">
                <div className="relative -mx-4 -mt-4 mb-3 h-24 bg-slate-100 overflow-hidden">
                  {p.logo ? (
                    <Image src={p.logo} className="w-full h-full" fittingType="fill" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-300">
                      {(p.name || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={p.status} />
                  </div>
                </div>
                <div className="font-semibold text-slate-900 text-sm line-clamp-2">{p.name}</div>
                <div className="text-xs text-slate-400">{p.project_number}</div>
                <div className="text-xs text-slate-500 mt-1">{p.client_name || "—"}</div>
                <div className="mt-auto pt-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700">{formatCurrency(f.value)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.project_type === "recurring" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                    {p.project_type === "recurring" ? "Recurring" : "Fixed"}
                  </span>
                </div>
                </div>
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