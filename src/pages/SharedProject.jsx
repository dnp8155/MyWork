import React from "react";
import { useParams, Link } from "react-router-dom";
import { useAppData } from "@/hooks/useAppData";
import { computeProjectFinancials, formatCurrency } from "@/lib/finance";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import TeamSection from "@/components/projects/TeamSection";
import DocumentsSection from "@/components/projects/DocumentsSection";
import { ArrowLeft, Settings2, Calendar } from "lucide-react";

export default function SharedProject() {
  const { id } = useParams();
  const { projects, payments, expenses, recurringSchedules, projectMembers, projectDocuments, loading, refresh } = useAppData();

  const project = (projects || []).find((p) => p.id === id);
  if (loading) return <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />;
  if (!project) return (
    <div className="text-center py-16">
      <p className="text-slate-500">Project not found.</p>
      <Link to="/projects" className="text-indigo-600 text-sm">← Back to Projects</Link>
    </div>
  );

  const f = computeProjectFinancials(project, payments, expenses);
  const members = (projectMembers || []).filter((m) => m.project_id === id && m.status !== "removed");
  const documents = (projectDocuments || []).filter((d) => d.project_id === id);
  const projectSchedules = (recurringSchedules || []).filter((s) => s.project_id === id).sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""));
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }) : "—");

  return (
    <div>
      <Link to={`/projects/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-3">
        <ArrowLeft className="w-4 h-4" /> Back to Project
      </Link>
      <PageHeader
        title={project.name}
        subtitle={`${project.project_number} • ${project.client_name || "No client"} • Shared workspace`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={project.status} />
            <Link to={`/projects/${id}`} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">
              <Settings2 className="w-4 h-4" /> Manage Project
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Project Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-slate-400">Project Name</p><p className="text-slate-800">{project.name}</p></div>
            <div><p className="text-xs text-slate-400">Client</p><p className="text-slate-800">{project.client_name || "—"}</p></div>
            <div><p className="text-xs text-slate-400">Type</p><p className="text-slate-800 capitalize">{project.project_type === "recurring" ? "Recurring / Salary based" : "Fixed price"}</p></div>
            <div className="flex items-start gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
              <p className="text-slate-700">{fmtDate(project.start_date)} → {fmtDate(project.expected_completion_date || project.recurring_end_date)}</p>
            </div>
          </div>
          {project.description && <p className="text-sm text-slate-600 mt-3">{project.description}</p>}
          {project.project_type === "recurring" && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-slate-100 text-slate-600">{formatCurrency(project.monthly_amount)} / month</span>
              <span className="px-2 py-1 rounded bg-slate-100 text-slate-600">{project.number_of_months} months</span>
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Financials</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Project Value</span><span className="font-medium">{formatCurrency(f.value)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Received</span><span className="font-medium text-emerald-600">{formatCurrency(f.received)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Pending</span><span className="font-medium text-amber-600">{formatCurrency(f.pending)}</span></div>
          </div>
        </div>
      </div>

      {project.project_type === "recurring" && projectSchedules.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 overflow-x-auto">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Recurring Payment Schedule</h3>
          <table className="w-full text-sm">
            <thead className="bg-slate-50"><tr>
              <th className="text-left px-3 py-2 font-medium text-slate-600">#</th>
              <th className="text-left px-3 py-2 font-medium text-slate-600">Due Date</th>
              <th className="text-right px-3 py-2 font-medium text-slate-600">Amount</th>
              <th className="text-left px-3 py-2 font-medium text-slate-600">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {projectSchedules.map((s) => (
                <tr key={s.id}>
                  <td className="px-3 py-2 text-slate-500">{s.installment_number}</td>
                  <td className="px-3 py-2">{s.due_date}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(s.amount)}</td>
                  <td className="px-3 py-2"><StatusBadge status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-800 mb-3">Team & Salaries</h2>
        <TeamSection project={project} members={members} onChanged={refresh} />
      </div>

      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-3">Documents</h2>
        <DocumentsSection project={project} documents={documents} onChanged={refresh} />
      </div>
    </div>
  );
}