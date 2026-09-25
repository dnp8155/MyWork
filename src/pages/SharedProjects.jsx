import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "@/hooks/useAppData";
import { computeProjectFinancials, formatCurrency } from "@/lib/finance";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Image } from "@/components/ui/image";
import StatusBadge from "@/components/StatusBadge";
import { Briefcase, Users, FolderKanban } from "lucide-react";

export default function SharedProjects() {
  const { projects, projectMembers, projectDocuments, loading } = useAppData();
  const navigate = useNavigate();

  const all = (projects || []).filter((p) => p.status !== "archived");

  return (
    <div>
      <PageHeader
        title="Shared Projects"
        subtitle="Team workspaces — open any project to see its team, salaries and documents."
      />
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-44 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : all.length === 0 ? (
        <EmptyState title="No projects yet" message="Create a project first — its shared workspace will appear here." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {all.map((p) => {
            const memberCount = (projectMembers || []).filter((m) => m.project_id === p.id && m.status !== "removed").length;
            const docCount = (projectDocuments || []).filter((d) => d.project_id === p.id).length;
            const monthlyPayout = (projectMembers || [])
              .filter((m) => m.project_id === p.id && m.status !== "removed" && m.salary_type === "monthly")
              .reduce((s, m) => s + (Number(m.salary_amount) || 0), 0);
            return (
              <div
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}/shared`)}
                className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-4 flex flex-col hover:shadow-md hover:border-indigo-200 transition cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {p.logo ? <Image src={p.logo} className="w-full h-full" fittingType="fill" /> : <Briefcase className="w-5 h-5 text-slate-400" />}
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="font-semibold text-slate-900 text-sm line-clamp-1">{p.name}</div>
                <div className="text-[11px] text-slate-400 mb-2.5">{p.project_number} • {p.client_name || "No client"}</div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-auto">
                  <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {memberCount} members</span>
                  <span className="inline-flex items-center gap-1"><FolderKanban className="w-3.5 h-3.5" /> {docCount} docs</span>
                </div>
                {monthlyPayout > 0 && (
                  <div className="text-[11px] text-slate-500 mt-1.5">Monthly payout: {formatCurrency(monthlyPayout)}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}