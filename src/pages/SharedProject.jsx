import React, { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { getSupabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { computeProjectFinancials, formatCurrency } from "@/lib/finance";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import TeamSection from "@/components/projects/TeamSection";
import DocumentsSection from "@/components/projects/DocumentsSection";
import { 
  ArrowLeft, Settings2, Calendar, LogIn, UserPlus, 
  Briefcase, Building2, Layers, CheckCircle2, DollarSign,
  TrendingUp, Clock
} from "lucide-react";

export default function SharedProject() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoadingAuth } = useAuth();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const invitedEmail = searchParams.get("invitedEmail");

  const loadData = async () => {
    try {
      const sb = await getSupabase();
      const [
        { data: proj },
        { data: mems },
        { data: docs },
        { data: scheds },
        { data: pays },
        { data: exps }
      ] = await Promise.all([
        sb.from("projects").select("*").eq("id", id).maybeSingle(),
        sb.from("project_members").select("*").eq("project_id", id),
        sb.from("project_documents").select("*").eq("project_id", id),
        sb.from("recurring_payment_schedules").select("*").eq("project_id", id),
        sb.from("payments").select("*").eq("project_id", id),
        sb.from("expenses").select("*").eq("project_id", id),
      ]);

      setProject(proj || null);
      setMembers(mems || []);
      setDocuments(docs || []);
      setSchedules(scheds || []);
      setPayments(pays || []);
      setExpenses(exps || []);
    } catch (err) {
      console.error("Failed to load shared project:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading || isLoadingAuth) {
    return (
      <div className="space-y-4 max-w-7xl mx-auto py-6">
        <div className="h-8 w-40 bg-slate-200/70 rounded-lg animate-pulse" />
        <div className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto mt-10">
        <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Project Not Found</h3>
        <p className="text-slate-500 text-sm mt-1 mb-6">This project link may be private or has been moved.</p>
        <Link to="/projects" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
          Return to Projects
        </Link>
      </div>
    );
  }

  const returnUrl = encodeURIComponent(`/projects/${id}/shared`);
  const f = computeProjectFinancials(project, payments, expenses);
  const activeMembers = (members || []).filter((m) => m.status !== "removed");
  const projectSchedules = [...(schedules || [])].sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""));
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }) : "—");

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Guest Invitation Banner */}
      {!isAuthenticated && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-6 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
                🌟 Shared Project Workspace
              </span>
              <h2 className="text-xl font-bold tracking-tight">You've been invited to collaborate!</h2>
              <p className="text-sm text-slate-300 mt-1 max-w-xl">
                Sign in or register to upload project documents, view team payouts, and stay in sync with the workspace.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to={`/login?returnTo=${returnUrl}${invitedEmail ? `&email=${encodeURIComponent(invitedEmail)}` : ""}`}
                className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-medium transition flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Log In
              </Link>
              <Link
                to={`/register?returnTo=${returnUrl}${invitedEmail ? `&email=${encodeURIComponent(invitedEmail)}` : ""}`}
                className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> Register & Join
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <Link to={`/projects/${id}`} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 mb-4 transition">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Project
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5 font-medium">
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{project.project_number}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-slate-400" /> {project.client_name || "General Project"}</span>
              <span>•</span>
              <span className="text-indigo-600 font-semibold">Shared Workspace</span>
            </div>
          </div>

          <Link
            to={`/projects/${id}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition"
          >
            <Settings2 className="w-4 h-4 text-slate-500" /> Manage Project
          </Link>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Billing Model</span>
            <span className="text-sm font-semibold text-slate-800 capitalize mt-0.5 block">
              {project.project_type === "recurring" ? "Recurring / Monthly" : "Fixed Price"}
            </span>
          </div>
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Timeline</span>
            <span className="text-sm font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5 truncate">
              <Calendar className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
              {fmtDate(project.start_date)}
            </span>
          </div>
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Total Value</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">
              {formatCurrency(f.value)}
            </span>
          </div>
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Received / Pending</span>
            <div className="flex items-center gap-2 mt-0.5 text-sm font-bold">
              <span className="text-emerald-600">{formatCurrency(f.received)}</span>
              <span className="text-slate-300">/</span>
              <span className="text-amber-600">{formatCurrency(f.pending)}</span>
            </div>
          </div>
        </div>

        {project.description && (
          <p className="text-sm text-slate-600 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100 mt-4 leading-relaxed">
            {project.description}
          </p>
        )}
      </div>

      {/* Team & Member Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <TeamSection project={project} members={activeMembers} onChanged={loadData} />
      </div>

      {/* Documents Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <DocumentsSection project={project} documents={documents} onChanged={loadData} />
      </div>
    </div>
  );
}
