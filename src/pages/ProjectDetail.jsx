import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAppData } from "@/hooks/useAppData";
import { computeProjectFinancials, formatCurrency, daysUntil } from "@/lib/finance";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";
import Modal from "@/components/Modal";
import { Input, Select, Textarea } from "@/components/FormFields";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft, Wallet, TrendingUp, TrendingDown, Clock, Percent,
  Plus, Globe, HardDrive, Server, FileText, Receipt, History,
} from "lucide-react";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "financial", label: "Financial" },
  { key: "payments", label: "Payments" },
  { key: "expenses", label: "Expenses" },
  { key: "quotations", label: "Quotations" },
  { key: "invoices", label: "Invoices" },
  { key: "domain", label: "Domain" },
  { key: "hosting", label: "Hosting" },
  { key: "base44", label: "Base44" },
  { key: "activity", label: "Activity" },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const { projects, clients, base44Accounts, payments, expenses, quotations, invoices, domains, hosting, recurringSchedules, auditLogs, loading, refresh } = useAppData();
  const [tab, setTab] = useState("overview");
  const [payModal, setPayModal] = useState(false);
  const [expenseModal, setExpenseModal] = useState(false);
  const { toast } = useToast();

  const project = (projects || []).find((p) => p.id === id);
  if (loading) return <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />;
  if (!project) return <div className="text-center py-16"><p className="text-slate-500">Project not found.</p><Link to="/projects" className="text-indigo-600 text-sm">← Back to Projects</Link></div>;

  const f = computeProjectFinancials(project, payments, expenses);
  const projectPayments = (payments || []).filter((p) => p.project_id === id).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const projectExpenses = (expenses || []).filter((e) => e.project_id === id).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const projectQuotes = (quotations || []).filter((q) => q.project_id === id);
  const projectInvoices = (invoices || []).filter((i) => i.project_id === id);
  const projectDomains = (domains || []).filter((d) => d.project_id === id);
  const projectHosting = (hosting || []).filter((h) => h.project_id === id);
  const projectSchedules = (recurringSchedules || []).filter((s) => s.project_id === id).sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""));
  const projectActivity = (auditLogs || []).filter((a) => a.entity_id === id);
  const base44Account = (base44Accounts || []).find((a) => a.id === project.base44_account_id);

  return (
    <div>
      <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-3">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Link>
      <PageHeader
        title={project.name}
        subtitle={`${project.project_number} • ${project.client_name || "No client"} • ${project.project_type === "recurring" ? "Recurring" : "Fixed"}`}
        actions={<StatusBadge status={project.status} />}
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-5 overflow-x-auto border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === t.key ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Section title="Project Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <Info label="Project Name" value={project.name} />
                <Info label="Client" value={project.client_name} />
                <Info label="Company" value={project.company_name} />
                <Info label="Client Email" value={project.client_email} />
                <Info label="Client Phone" value={project.client_phone} />
                <Info label="Start Date" value={project.start_date} />
                <Info label="Expected Completion" value={project.expected_completion_date} />
                <Info label="Completion Date" value={project.completion_date} />
              </div>
              {project.description && <div className="mt-4"><p className="text-xs text-slate-500 mb-1">Description</p><p className="text-sm text-slate-700">{project.description}</p></div>}
            </Section>
            {project.project_type === "recurring" && projectSchedules.length > 0 && (
              <Section title="Recurring Payment Schedule">
                <div className="overflow-x-auto">
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
              </Section>
            )}
          </div>
          <div className="space-y-4">
            <Section title="Quick Financials">
              <div className="space-y-2 text-sm">
                <Row label="Project Value" value={formatCurrency(f.value)} />
                <Row label="Received" value={formatCurrency(f.received)} tone="green" />
                <Row label="Pending" value={formatCurrency(f.pending)} tone="amber" />
                <Row label="Expenses" value={formatCurrency(f.expenses)} tone="red" />
                <Row label="Profit" value={formatCurrency(f.profit)} tone={f.profit >= 0 ? "green" : "red"} />
                <Row label="Margin" value={`${f.margin.toFixed(1)}%`} />
              </div>
            </Section>
          </div>
        </div>
      )}

      {tab === "financial" && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <StatCard label="Total Value" value={f.value} icon={Wallet} tone="indigo" />
            <StatCard label="Received" value={f.received} icon={TrendingUp} tone="green" />
            <StatCard label="Pending" value={f.pending} icon={Clock} tone="amber" />
            <StatCard label="Expenses" value={f.expenses} icon={TrendingDown} tone="red" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <StatCard label="Profit" value={f.profit} icon={TrendingUp} tone={f.profit >= 0 ? "green" : "red"} />
            <StatCard label="Profit Margin" value={`${f.margin.toFixed(1)}%`} icon={Percent} tone="indigo" isCurrency={false} />
          </div>
          <div className="mt-4 bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Expense Breakdown</h3>
            {projectExpenses.length === 0 ? <p className="text-sm text-slate-400">No expenses recorded.</p> : (
              <div className="space-y-2">
                {projectExpenses.map((e) => (
                  <div key={e.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{e.category} — {e.description || "—"}</span>
                    <span className="text-rose-600 font-medium">{formatCurrency(e.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "payments" && (
        <Section title="Payment History" action={<button onClick={() => setPayModal(true)} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg"><Plus className="w-4 h-4" /> Record Payment</button>}>
          {projectPayments.length === 0 ? <p className="text-sm text-slate-400">No payments recorded yet.</p> : (
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead className="bg-slate-50"><tr>
                <th className="text-left px-3 py-2 font-medium text-slate-600">Date</th>
                <th className="text-left px-3 py-2 font-medium text-slate-600">Number</th>
                <th className="text-left px-3 py-2 font-medium text-slate-600">Method</th>
                <th className="text-left px-3 py-2 font-medium text-slate-600">Reference</th>
                <th className="text-right px-3 py-2 font-medium text-slate-600">Amount</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {projectPayments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2">{p.date}</td>
                    <td className="px-3 py-2 text-slate-500">{p.payment_number}</td>
                    <td className="px-3 py-2 capitalize">{p.payment_method?.replace("_", " ")}</td>
                    <td className="px-3 py-2 text-slate-500">{p.reference || "—"}</td>
                    <td className="px-3 py-2 text-right text-emerald-600 font-medium">{formatCurrency(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </Section>
      )}

      {tab === "expenses" && (
        <Section title="Project Expenses" action={<button onClick={() => setExpenseModal(true)} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg"><Plus className="w-4 h-4" /> Add Expense</button>}>
          {projectExpenses.length === 0 ? <p className="text-sm text-slate-400">No expenses recorded.</p> : (
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead className="bg-slate-50"><tr>
                <th className="text-left px-3 py-2 font-medium text-slate-600">Date</th>
                <th className="text-left px-3 py-2 font-medium text-slate-600">Category</th>
                <th className="text-left px-3 py-2 font-medium text-slate-600">Description</th>
                <th className="text-left px-3 py-2 font-medium text-slate-600">Source</th>
                <th className="text-right px-3 py-2 font-medium text-slate-600">Amount</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {projectExpenses.map((e) => (
                  <tr key={e.id}>
                    <td className="px-3 py-2">{e.date}</td>
                    <td className="px-3 py-2 capitalize">{e.category}</td>
                    <td className="px-3 py-2 text-slate-600">{e.description || "—"}</td>
                    <td className="px-3 py-2"><span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">{e.source}</span></td>
                    <td className="px-3 py-2 text-right text-rose-600 font-medium">{formatCurrency(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </Section>
      )}

      {tab === "quotations" && (
        <Section title="Related Quotations">
          {projectQuotes.length === 0 ? <p className="text-sm text-slate-400">No quotations. <Link to="/quotations" className="text-indigo-600">Create one →</Link></p> : (
            <div className="space-y-2">{projectQuotes.map((q) => (
              <Link key={q.id} to="/quotations" className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                <div><div className="text-sm font-medium text-slate-800">{q.quotation_number}</div><div className="text-xs text-slate-400">{q.date}</div></div>
                <div className="flex items-center gap-3"><span className="text-sm font-medium">{formatCurrency(q.total)}</span><StatusBadge status={q.status} /></div>
              </Link>
            ))}</div>
          )}
        </Section>
      )}

      {tab === "invoices" && (
        <Section title="Related Invoices">
          {projectInvoices.length === 0 ? <p className="text-sm text-slate-400">No invoices.</p> : (
            <div className="space-y-2">{projectInvoices.map((i) => (
              <Link key={i.id} to="/invoices" className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                <div><div className="text-sm font-medium text-slate-800">{i.invoice_number}</div><div className="text-xs text-slate-400">{i.invoice_date}</div></div>
                <div className="flex items-center gap-3"><span className="text-sm font-medium">{formatCurrency(i.total)}</span><StatusBadge status={i.status} /></div>
              </Link>
            ))}</div>
          )}
        </Section>
      )}

      {tab === "domain" && (
        <Section title="Linked Domains">
          {projectDomains.length === 0 ? <p className="text-sm text-slate-400">No domains linked. <Link to="/domains" className="text-indigo-600">Add one →</Link></p> : (
            <div className="space-y-2">{projectDomains.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-slate-400" /><div><div className="text-sm font-medium text-slate-800">{d.domain_name}</div><div className="text-xs text-slate-400">{d.registrar} • Renewal {d.renewal_date}</div></div></div>
                <div className="flex items-center gap-3"><span className="text-sm">{formatCurrency(d.renewal_cost || d.purchase_cost)}</span><StatusBadge status={d.status} /></div>
              </div>
            ))}</div>
          )}
        </Section>
      )}

      {tab === "hosting" && (
        <Section title="Linked Hosting">
          {projectHosting.length === 0 ? <p className="text-sm text-slate-400">No hosting linked. <Link to="/hosting" className="text-indigo-600">Add one →</Link></p> : (
            <div className="space-y-2">{projectHosting.map((h) => (
              <div key={h.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2"><HardDrive className="w-4 h-4 text-slate-400" /><div><div className="text-sm font-medium text-slate-800">{h.provider} — {h.name}</div><div className="text-xs text-slate-400">{h.plan} • Renewal {h.renewal_date}</div></div></div>
                <div className="flex items-center gap-3"><span className="text-sm">{formatCurrency(h.cost)}</span><StatusBadge status={h.status} /></div>
              </div>
            ))}</div>
          )}
        </Section>
      )}

      {tab === "base44" && (
        <Section title="Base44 Account">
          {!base44Account ? <p className="text-sm text-slate-400">No Base44 account linked.</p> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Info label="Account Name" value={base44Account.account_name} />
              <Info label="Email" value={base44Account.account_email} />
              <Info label="Password" value={base44Account.password} />
            </div>
          )}
        </Section>
      )}

      {tab === "activity" && (
        <Section title="Activity / Audit History">
          {projectActivity.length === 0 ? <p className="text-sm text-slate-400">No activity recorded.</p> : (
            <div className="space-y-2">{projectActivity.map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100">
                <History className="w-4 h-4 text-slate-400 mt-0.5" />
                <div><div className="text-sm text-slate-700">{a.description || a.action}</div><div className="text-xs text-slate-400">{a.user_name || "System"} • {new Date(a.created_date).toLocaleString()}</div></div>
              </div>
            ))}</div>
          )}
        </Section>
      )}

      {payModal && <PaymentModal project={project} onClose={() => setPayModal(false)} onSaved={() => { setPayModal(false); refresh(); toast({ title: "Payment recorded" }); }} />}
      {expenseModal && <ExpenseModal project={project} onClose={() => setExpenseModal(false)} onSaved={() => { setExpenseModal(false); refresh(); toast({ title: "Expense added" }); }} />}
    </div>
  );
}

function Section({ title, action, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
function Info({ label, value }) {
  return <div><p className="text-xs text-slate-400">{label}</p><p className="text-sm text-slate-800">{value || "—"}</p></div>;
}
function Row({ label, value, tone }) {
  const tones = { green: "text-emerald-600", red: "text-rose-600", amber: "text-amber-600" };
  return <div className="flex items-center justify-between"><span className="text-slate-500">{label}</span><span className={`font-medium ${tones[tone] || "text-slate-800"}`}>{value}</span></div>;
}

function PaymentModal({ project, onClose, onSaved }) {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), amount: "", payment_method: "bank_transfer", reference: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const year = new Date().getFullYear();
      const existing = await base44.entities.Payment.list();
      const payment_number = `PAY-${year}-${String(existing.length + 1).padStart(4, "0")}`;
      const payment = await base44.entities.Payment.create({
        ...form, amount: Number(form.amount), payment_number,
        client_id: project.client_id, client_name: project.client_name,
        project_id: project.id, project_name: project.name, type: "project",
      });
      await base44.entities.Transaction.create({
        transaction_number: `TXN-${Date.now()}`, date: form.date, type: "income", category: "project_payment",
        amount: Number(form.amount), project_id: project.id, project_name: project.name,
        client_id: project.client_id, client_name: project.client_name, payment_method: form.payment_method,
        reference: form.reference, description: `Payment for ${project.name}`, source_entity: "payment", source_id: payment.id,
      });
      await base44.entities.AuditLog.create({ action: "payment_recorded", entity: "Project", entity_id: project.id, description: `Recorded payment of ${formatCurrency(form.amount)} for ${project.name}` });
      onSaved();
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  };
  return (
    <Modal open onClose={onClose} title="Record Payment">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Date" type="date" required value={form.date} onChange={(e) => set("date", e.target.value)} />
          <Input label="Amount (₹)" type="number" required value={form.amount} onChange={(e) => set("amount", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Payment Method" value={form.payment_method} onChange={(e) => set("payment_method", e.target.value)}>
            <option value="cash">Cash</option><option value="bank_transfer">Bank Transfer</option>
            <option value="upi">UPI</option><option value="card">Card</option><option value="other">Other</option>
          </Select>
          <Input label="Reference" value={form.reference} onChange={(e) => set("reference", e.target.value)} />
        </div>
        <Textarea label="Notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50">{saving ? "Saving…" : "Record"}</button>
        </div>
      </form>
    </Modal>
  );
}

function ExpenseModal({ project, onClose, onSaved }) {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), amount: "", category: "development", description: "", vendor: "", payment_method: "bank_transfer" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const year = new Date().getFullYear();
      const existing = await base44.entities.Expense.list();
      const expense_number = `EXP-${year}-${String(existing.length + 1).padStart(4, "0")}`;
      const expense = await base44.entities.Expense.create({
        ...form, amount: Number(form.amount), expense_number,
        project_id: project.id, project_name: project.name,
        client_id: project.client_id, client_name: project.client_name, source: "manual",
      });
      await base44.entities.Transaction.create({
        transaction_number: `TXN-${Date.now()}`, date: form.date, type: "expense", category: form.category,
        amount: Number(form.amount), project_id: project.id, project_name: project.name,
        client_id: project.client_id, client_name: project.client_name, payment_method: form.payment_method,
        description: form.description, source_entity: "expense", source_id: expense.id,
      });
      await base44.entities.AuditLog.create({ action: "expense_added", entity: "Project", entity_id: project.id, description: `Added expense of ${formatCurrency(form.amount)} (${form.category}) to ${project.name}` });
      onSaved();
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  };
  return (
    <Modal open onClose={onClose} title="Add Expense">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Date" type="date" required value={form.date} onChange={(e) => set("date", e.target.value)} />
          <Input label="Amount (₹)" type="number" required value={form.amount} onChange={(e) => set("amount", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Category" value={form.category} onChange={(e) => set("category", e.target.value)}>
            {["domain","hosting","software","api","base44","server","development","marketing","employee_salary","other"].map((c) => <option key={c} value={c}>{c.replace("_"," ")}</option>)}
          </Select>
          <Input label="Vendor" value={form.vendor} onChange={(e) => set("vendor", e.target.value)} />
        </div>
        <Textarea label="Description" value={form.description} onChange={(e) => set("description", e.target.value)} />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50">{saving ? "Saving…" : "Add"}</button>
        </div>
      </form>
    </Modal>
  );
}