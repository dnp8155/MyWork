import React, { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { computeProjectFinancials, computeClientFinancials, computeInvoiceFinancials, formatCurrency } from "@/lib/finance";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Download } from "lucide-react";

export default function Reports() {
  const { projects, clients, payments, expenses, invoices, quotations, domains, hosting, loading } = useAppData();
  const [tab, setTab] = useState("project");

  if (loading) return <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />;

  const tabs = [
    { key: "project", label: "Project Report" },
    { key: "client", label: "Client Report" },
    { key: "revenue", label: "Revenue" },
    { key: "expense", label: "Expense" },
    { key: "profit", label: "Profit" },
    { key: "domain", label: "Domain" },
    { key: "hosting", label: "Hosting" },
    { key: "invoice", label: "Invoice" },
    { key: "quotation", label: "Quotation" },
    { key: "recurring", label: "Recurring" },
  ];

  const exportCSV = (rows, filename) => {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  };

  return (
    <div>
      <PageHeader title="Reports" subtitle="Generate and export business reports" />
      <div className="flex gap-1 mb-4 overflow-x-auto border-b border-slate-200">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px ${tab === t.key ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500"}`}>{t.label}</button>
        ))}
      </div>

      {tab === "project" && <ProjectReport data={projects || []} payments={payments} expenses={expenses} exportCSV={exportCSV} />}
      {tab === "client" && <ClientReport data={clients || []} projects={projects} payments={payments} expenses={expenses} exportCSV={exportCSV} />}
      {tab === "revenue" && <RevenueReport payments={payments || []} exportCSV={exportCSV} />}
      {tab === "expense" && <ExpenseReport expenses={expenses || []} exportCSV={exportCSV} />}
      {tab === "profit" && <ProfitReport projects={projects || []} payments={payments} expenses={expenses} exportCSV={exportCSV} />}
      {tab === "domain" && <DomainReport domains={domains || []} exportCSV={exportCSV} />}
      {tab === "hosting" && <HostingReport hosting={hosting || []} exportCSV={exportCSV} />}
      {tab === "invoice" && <InvoiceReport invoices={invoices || []} payments={payments} exportCSV={exportCSV} />}
      {tab === "quotation" && <QuotationReport quotations={quotations || []} exportCSV={exportCSV} />}
      {tab === "recurring" && <RecurringReport projects={projects || []} payments={payments} exportCSV={exportCSV} />}
    </div>
  );
}

function TableWrapper({ title, rows, exportCSV, filename, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700">{title} ({rows.length})</h3>
        <button onClick={() => exportCSV(rows, filename)} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"><Download className="w-4 h-4" /> CSV</button>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

function ProjectReport({ data, payments, expenses, exportCSV }) {
  const rows = data.map((p) => { const f = computeProjectFinancials(p, payments, expenses); return { project_number: p.project_number, name: p.name, client: p.client_name, type: p.project_type, value: f.value, received: f.received, pending: f.pending, expenses: f.expenses, profit: f.profit, margin: `${f.margin.toFixed(1)}%`, status: p.status }; });
  return <TableWrapper title="Projects" rows={rows} exportCSV={exportCSV} filename="projects.csv">
    <table className="w-full text-sm"><thead className="bg-slate-50"><tr>{["Project","Client","Type","Value","Received","Pending","Expenses","Profit","Margin","Status"].map((h) => <th key={h} className="text-left px-3 py-2 font-medium text-slate-600">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-slate-100">{rows.map((r) => <tr key={r.project_number}><td className="px-3 py-2 font-medium">{r.name}</td><td className="px-3 py-2">{r.client}</td><td className="px-3 py-2">{r.type}</td><td className="px-3 py-2">{formatCurrency(r.value)}</td><td className="px-3 py-2 text-emerald-600">{formatCurrency(r.received)}</td><td className="px-3 py-2 text-amber-600">{formatCurrency(r.pending)}</td><td className="px-3 py-2 text-rose-600">{formatCurrency(r.expenses)}</td><td className="px-3 py-2 font-medium">{formatCurrency(r.profit)}</td><td className="px-3 py-2">{r.margin}</td><td className="px-3 py-2"><StatusBadge status={r.status} /></td></tr>)}</tbody>
    </table>
  </TableWrapper>;
}

function ClientReport({ data, projects, payments, expenses, exportCSV }) {
  const rows = data.map((c) => { const f = computeClientFinancials(c, projects, payments, expenses); return { client_id: c.client_id, name: c.name, company: c.company_name, projects: f.projectCount, business: f.totalBusiness, received: f.totalReceived, pending: f.totalPending, expenses: f.totalExpenses }; });
  return <TableWrapper title="Clients" rows={rows} exportCSV={exportCSV} filename="clients.csv">
    <table className="w-full text-sm"><thead className="bg-slate-50"><tr>{["Client","Company","Projects","Business","Received","Pending","Expenses"].map((h) => <th key={h} className="text-left px-3 py-2 font-medium text-slate-600">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-slate-100">{rows.map((r) => <tr key={r.client_id}><td className="px-3 py-2 font-medium">{r.name}</td><td className="px-3 py-2">{r.company}</td><td className="px-3 py-2">{r.projects}</td><td className="px-3 py-2">{formatCurrency(r.business)}</td><td className="px-3 py-2 text-emerald-600">{formatCurrency(r.received)}</td><td className="px-3 py-2 text-amber-600">{formatCurrency(r.pending)}</td><td className="px-3 py-2 text-rose-600">{formatCurrency(r.expenses)}</td></tr>)}</tbody>
    </table>
  </TableWrapper>;
}

function RevenueReport({ payments, exportCSV }) {
  const rows = payments.slice().sort((a, b) => (b.date || "").localeCompare(a.date || "")).map((p) => ({ number: p.payment_number, date: p.date, client: p.client_name, project: p.project_name, method: p.payment_method, amount: p.amount }));
  return <TableWrapper title="Revenue" rows={rows} exportCSV={exportCSV} filename="revenue.csv">
    <table className="w-full text-sm"><thead className="bg-slate-50"><tr>{["Number","Date","Client","Project","Method","Amount"].map((h) => <th key={h} className="text-left px-3 py-2 font-medium text-slate-600">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-slate-100">{rows.map((r) => <tr key={r.number + r.date}><td className="px-3 py-2">{r.number}</td><td className="px-3 py-2">{r.date}</td><td className="px-3 py-2">{r.client}</td><td className="px-3 py-2">{r.project}</td><td className="px-3 py-2 capitalize">{r.method?.replace("_"," ")}</td><td className="px-3 py-2 text-emerald-600 font-medium">{formatCurrency(r.amount)}</td></tr>)}</tbody>
    </table>
  </TableWrapper>;
}

function ExpenseReport({ expenses, exportCSV }) {
  const rows = expenses.slice().sort((a, b) => (b.date || "").localeCompare(a.date || "")).map((e) => ({ number: e.expense_number, date: e.date, category: e.category, project: e.project_name, vendor: e.vendor, source: e.source, amount: e.amount }));
  return <TableWrapper title="Expenses" rows={rows} exportCSV={exportCSV} filename="expenses.csv">
    <table className="w-full text-sm"><thead className="bg-slate-50"><tr>{["Number","Date","Category","Project","Vendor","Source","Amount"].map((h) => <th key={h} className="text-left px-3 py-2 font-medium text-slate-600">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-slate-100">{rows.map((r) => <tr key={r.number + r.date}><td className="px-3 py-2">{r.number}</td><td className="px-3 py-2">{r.date}</td><td className="px-3 py-2 capitalize">{r.category}</td><td className="px-3 py-2">{r.project}</td><td className="px-3 py-2">{r.vendor}</td><td className="px-3 py-2">{r.source}</td><td className="px-3 py-2 text-rose-600 font-medium">{formatCurrency(r.amount)}</td></tr>)}</tbody>
    </table>
  </TableWrapper>;
}

function ProfitReport({ projects, payments, expenses, exportCSV }) {
  const rows = projects.map((p) => { const f = computeProjectFinancials(p, payments, expenses); return { name: p.name, client: p.client_name, revenue: f.received, expenses: f.expenses, profit: f.profit, margin: `${f.margin.toFixed(1)}%` }; });
  return <TableWrapper title="Profit by Project" rows={rows} exportCSV={exportCSV} filename="profit.csv">
    <table className="w-full text-sm"><thead className="bg-slate-50"><tr>{["Project","Client","Revenue","Expenses","Profit","Margin"].map((h) => <th key={h} className="text-left px-3 py-2 font-medium text-slate-600">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-slate-100">{rows.map((r) => <tr key={r.name}><td className="px-3 py-2 font-medium">{r.name}</td><td className="px-3 py-2">{r.client}</td><td className="px-3 py-2 text-emerald-600">{formatCurrency(r.revenue)}</td><td className="px-3 py-2 text-rose-600">{formatCurrency(r.expenses)}</td><td className="px-3 py-2 font-medium">{formatCurrency(r.profit)}</td><td className="px-3 py-2">{r.margin}</td></tr>)}</tbody>
    </table>
  </TableWrapper>;
}

function DomainReport({ domains, exportCSV }) {
  const rows = domains.map((d) => ({ domain: d.domain_name, registrar: d.registrar, project: d.project_name, purchased_by: d.purchased_by, renewal: d.renewal_date, cost: d.renewal_cost || d.purchase_cost, status: d.status }));
  return <TableWrapper title="Domains" rows={rows} exportCSV={exportCSV} filename="domains.csv">
    <table className="w-full text-sm"><thead className="bg-slate-50"><tr>{["Domain","Registrar","Project","Purchased By","Renewal","Cost","Status"].map((h) => <th key={h} className="text-left px-3 py-2 font-medium text-slate-600">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-slate-100">{rows.map((r) => <tr key={r.domain}><td className="px-3 py-2 font-medium">{r.domain}</td><td className="px-3 py-2">{r.registrar}</td><td className="px-3 py-2">{r.project}</td><td className="px-3 py-2">{r.purchased_by}</td><td className="px-3 py-2">{r.renewal}</td><td className="px-3 py-2">{formatCurrency(r.cost)}</td><td className="px-3 py-2"><StatusBadge status={r.status} /></td></tr>)}</tbody>
    </table>
  </TableWrapper>;
}

function HostingReport({ hosting, exportCSV }) {
  const rows = hosting.map((h) => ({ provider: h.provider, plan: h.plan, project: h.project_name, purchased_by: h.purchased_by, renewal: h.renewal_date, cost: h.cost, status: h.status }));
  return <TableWrapper title="Hosting" rows={rows} exportCSV={exportCSV} filename="hosting.csv">
    <table className="w-full text-sm"><thead className="bg-slate-50"><tr>{["Provider","Plan","Project","Purchased By","Renewal","Cost","Status"].map((h) => <th key={h} className="text-left px-3 py-2 font-medium text-slate-600">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-slate-100">{rows.map((r) => <tr key={r.provider + r.plan}><td className="px-3 py-2 font-medium">{r.provider}</td><td className="px-3 py-2">{r.plan}</td><td className="px-3 py-2">{r.project}</td><td className="px-3 py-2">{r.purchased_by}</td><td className="px-3 py-2">{r.renewal}</td><td className="px-3 py-2">{formatCurrency(r.cost)}</td><td className="px-3 py-2"><StatusBadge status={r.status} /></td></tr>)}</tbody>
    </table>
  </TableWrapper>;
}

function InvoiceReport({ invoices, payments, exportCSV }) {
  const rows = invoices.map((i) => { const f = computeInvoiceFinancials(i, payments); return { number: i.invoice_number, client: i.client_name, date: i.invoice_date, due: i.due_date, total: f.total, paid: f.paid, pending: f.pending, status: f.status }; });
  return <TableWrapper title="Invoices" rows={rows} exportCSV={exportCSV} filename="invoices.csv">
    <table className="w-full text-sm"><thead className="bg-slate-50"><tr>{["Number","Client","Date","Due","Total","Paid","Pending","Status"].map((h) => <th key={h} className="text-left px-3 py-2 font-medium text-slate-600">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-slate-100">{rows.map((r) => <tr key={r.number}><td className="px-3 py-2 font-medium">{r.number}</td><td className="px-3 py-2">{r.client}</td><td className="px-3 py-2">{r.date}</td><td className="px-3 py-2">{r.due}</td><td className="px-3 py-2">{formatCurrency(r.total)}</td><td className="px-3 py-2 text-emerald-600">{formatCurrency(r.paid)}</td><td className="px-3 py-2 text-amber-600">{formatCurrency(r.pending)}</td><td className="px-3 py-2"><StatusBadge status={r.status} /></td></tr>)}</tbody>
    </table>
  </TableWrapper>;
}

function QuotationReport({ quotations, exportCSV }) {
  const rows = quotations.map((q) => ({ number: q.quotation_number, client: q.client_name, project: q.project_name, date: q.date, total: q.total, status: q.status, converted: q.converted_invoice_id ? "yes" : "no" }));
  return <TableWrapper title="Quotations" rows={rows} exportCSV={exportCSV} filename="quotations.csv">
    <table className="w-full text-sm"><thead className="bg-slate-50"><tr>{["Number","Client","Project","Date","Total","Status","Converted"].map((h) => <th key={h} className="text-left px-3 py-2 font-medium text-slate-600">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-slate-100">{rows.map((r) => <tr key={r.number}><td className="px-3 py-2 font-medium">{r.number}</td><td className="px-3 py-2">{r.client}</td><td className="px-3 py-2">{r.project}</td><td className="px-3 py-2">{r.date}</td><td className="px-3 py-2">{formatCurrency(r.total)}</td><td className="px-3 py-2"><StatusBadge status={r.status} /></td><td className="px-3 py-2">{r.converted}</td></tr>)}</tbody>
    </table>
  </TableWrapper>;
}

function RecurringReport({ projects, payments, exportCSV }) {
  const recurring = projects.filter((p) => p.project_type === "recurring");
  const rows = recurring.map((p) => {
    const received = (payments || []).filter((pm) => pm.project_id === p.id).reduce((s, pm) => s + Number(pm.amount || 0), 0);
    const value = (Number(p.monthly_amount) || 0) * (Number(p.number_of_months) || 0);
    return { name: p.name, client: p.client_name, monthly: p.monthly_amount, months: p.number_of_months, value, received, pending: Math.max(value - received, 0) };
  });
  return <TableWrapper title="Recurring Revenue" rows={rows} exportCSV={exportCSV} filename="recurring.csv">
    <table className="w-full text-sm"><thead className="bg-slate-50"><tr>{["Project","Client","Monthly","Months","Value","Received","Pending"].map((h) => <th key={h} className="text-left px-3 py-2 font-medium text-slate-600">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-slate-100">{rows.map((r) => <tr key={r.name}><td className="px-3 py-2 font-medium">{r.name}</td><td className="px-3 py-2">{r.client}</td><td className="px-3 py-2">{formatCurrency(r.monthly)}</td><td className="px-3 py-2">{r.months}</td><td className="px-3 py-2">{formatCurrency(r.value)}</td><td className="px-3 py-2 text-emerald-600">{formatCurrency(r.received)}</td><td className="px-3 py-2 text-amber-600">{formatCurrency(r.pending)}</td></tr>)}</tbody>
    </table>
  </TableWrapper>;
}