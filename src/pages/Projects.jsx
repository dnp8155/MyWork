import React, { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { base44 } from "@/api/base44Client";
import { computeProjectFinancials, nextNumber, formatCurrency } from "@/lib/finance";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Image } from "@/components/ui/image";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import { Input, Textarea, Select } from "@/components/FormFields";
import { Link, useNavigate } from "react-router-dom";
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
              <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)} className="aspect-square bg-white rounded-xl border border-slate-200 p-4 flex flex-col hover:border-slate-300 hover:shadow-sm transition cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  {p.logo ? (
                    <Image src={p.logo} className="w-10 h-10 rounded-lg" fittingType="fill" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500">
                      {(p.name || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <StatusBadge status={p.status} />
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
            );
          })}
        </div>
      )}

      {modalOpen && (
        <ProjectForm
          clients={clients || []}
          base44Accounts={base44Accounts || []}
          existing={projects || []}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); refresh(); toast({ title: "Project created" }); }}
        />
      )}
    </div>
  );
}

function ProjectForm({ clients, base44Accounts, existing, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: "", client_id: "", description: "", status: "pending", start_date: "",
    expected_completion_date: "", base44_account_id: "", base44_project_url: "", notes: "",
    project_type: "fixed", total_amount: 0, monthly_amount: 0, recurring_start_date: "",
    number_of_months: 1, payment_due_day: 1, billing_frequency: "monthly",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const client = clients.find((c) => c.id === form.client_id);
      const acct = base44Accounts.find((a) => a.id === form.base44_account_id);
      const year = new Date().getFullYear();
      const project_number = nextNumber("PRJ", year, existing);
      const total = form.project_type === "recurring"
        ? (Number(form.monthly_amount) || 0) * (Number(form.number_of_months) || 0)
        : Number(form.total_amount) || 0;
      let recurring_end_date = "";
      if (form.project_type === "recurring" && form.recurring_start_date) {
        const sd = new Date(form.recurring_start_date);
        sd.setMonth(sd.getMonth() + (Number(form.number_of_months) || 1) - 1);
        recurring_end_date = sd.toISOString().slice(0, 10);
      }
      const project = await base44.entities.Project.create({
        ...form,
        project_number,
        client_name: client?.name || "",
        company_name: client?.company_name || "",
        client_email: client?.email || "",
        client_phone: client?.phone || "",
        client_address: client?.address || "",
        total_amount: total,
        recurring_end_date,
      });

      // Generate recurring payment schedule
      if (form.project_type === "recurring" && form.recurring_start_date) {
        const schedules = [];
        const start = new Date(form.recurring_start_date);
        for (let i = 0; i < (Number(form.number_of_months) || 0); i++) {
          const d = new Date(start.getFullYear(), start.getMonth() + i, form.payment_due_day || 1);
          schedules.push({
            project_id: project.id,
            project_name: project.name,
            client_id: form.client_id,
            client_name: client?.name || "",
            due_date: d.toISOString().slice(0, 10),
            amount: Number(form.monthly_amount) || 0,
            paid_amount: 0,
            status: "upcoming",
            installment_number: i + 1,
          });
        }
        if (schedules.length) await base44.entities.RecurringPaymentSchedule.bulkCreate(schedules);
      }

      await base44.entities.AuditLog.create({ action: "created", entity: "Project", entity_id: project.id, description: `Created project ${project.name}` });
      onSaved();
    } catch (err) {
      alert("Error creating project: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="New Project" size="lg">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Project Name" required value={form.name} onChange={(e) => set("name", e.target.value)} />
          <Select label="Client" required value={form.client_id} onChange={(e) => set("client_id", e.target.value)}>
            <option value="">Select client</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name} {c.company_name ? `(${c.company_name})` : ""}</option>)}
          </Select>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Select label="Type" value={form.project_type} onChange={(e) => set("project_type", e.target.value)}>
            <option value="fixed">Fixed</option>
            <option value="recurring">Recurring / Salary</option>
          </Select>
          <Select label="Status" value={form.status} onChange={(e) => set("status", e.target.value)}>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </Select>
          <Input label="Start Date" type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
          <Input label="Expected Completion" type="date" value={form.expected_completion_date} onChange={(e) => set("expected_completion_date", e.target.value)} />
        </div>

        {form.project_type === "fixed" ? (
          <Input label="Total Project Amount (₹)" type="number" value={form.total_amount} onChange={(e) => set("total_amount", Number(e.target.value))} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-purple-50 rounded-lg">
            <Input label="Monthly Amount (₹)" type="number" value={form.monthly_amount} onChange={(e) => set("monthly_amount", Number(e.target.value))} />
            <Input label="No. of Months" type="number" value={form.number_of_months} onChange={(e) => set("number_of_months", Number(e.target.value))} />
            <Input label="Start Date" type="date" value={form.recurring_start_date} onChange={(e) => set("recurring_start_date", e.target.value)} />
            <Input label="Payment Due Day" type="number" value={form.payment_due_day} onChange={(e) => set("payment_due_day", Number(e.target.value))} />
            <div className="col-span-2 sm:col-span-4 text-xs text-purple-700">
              Contract Value: {formatCurrency((Number(form.monthly_amount) || 0) * (Number(form.number_of_months) || 0))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Base44 Account" value={form.base44_account_id} onChange={(e) => set("base44_account_id", e.target.value)}>
            <option value="">None</option>
            {base44Accounts.map((a) => <option key={a.id} value={a.id}>{a.account_name}</option>)}
          </Select>
          <Input label="Base44 Project URL" value={form.base44_project_url} onChange={(e) => set("base44_project_url", e.target.value)} />
        </div>
        <Textarea label="Description" value={form.description} onChange={(e) => set("description", e.target.value)} />

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{saving ? "Saving…" : "Create Project"}</button>
        </div>
      </form>
    </Modal>
  );
}