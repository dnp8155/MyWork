import React from "react";
import { useParams, Link } from "react-router-dom";
import { useAppData } from "@/hooks/useAppData";
import { computeClientFinancials, computeProjectFinancials, formatCurrency } from "@/lib/finance";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { ArrowLeft, Wallet, TrendingUp, Clock, TrendingDown, FolderKanban, FileText, Receipt, Globe, HardDrive } from "lucide-react";

export default function ClientDetail() {
  const { id } = useParams();
  const { clients, projects, payments, expenses, quotations, invoices, domains, hosting, loading } = useAppData();
  const client = (clients || []).find((c) => c.id === id);
  if (loading) return <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />;
  if (!client) return <div className="text-center py-16"><p className="text-slate-500">Client not found.</p><Link to="/clients" className="text-indigo-600 text-sm">← Back</Link></div>;

  const f = computeClientFinancials(client, projects, payments, expenses);
  const clientProjects = (projects || []).filter((p) => p.client_id === id);
  const clientQuotes = (quotations || []).filter((q) => q.client_id === id);
  const clientInvoices = (invoices || []).filter((i) => i.client_id === id);
  const clientDomains = (domains || []).filter((d) => d.client_id === id);
  const clientHosting = (hosting || []).filter((h) => h.client_id === id);
  const clientPayments = (payments || []).filter((p) => p.client_id === id);

  return (
    <div>
      <Link to="/clients" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-3"><ArrowLeft className="w-4 h-4" /> Back to Clients</Link>
      <PageHeader title={client.name} subtitle={client.company_name || client.email} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Business" value={f.totalBusiness} icon={Wallet} tone="blue" />
        <StatCard label="Total Received" value={f.totalReceived} icon={TrendingUp} tone="green" />
        <StatCard label="Total Pending" value={f.totalPending} icon={Clock} tone="amber" />
        <StatCard label="Total Expenses" value={f.totalExpenses} icon={TrendingDown} tone="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card title="Contact Information" icon={FolderKanban}>
          <div className="space-y-1.5 text-sm">
            <Row label="Email" value={client.email} />
            <Row label="Phone" value={client.phone} />
            <Row label="WhatsApp" value={client.whatsapp} />
            <Row label="GST" value={client.gst_number} />
            <Row label="PAN" value={client.pan} />
            <Row label="Address" value={client.address} />
          </div>
        </Card>
        <Card title={`Projects (${clientProjects.length})`} icon={FolderKanban}>
          {clientProjects.length === 0 ? <p className="text-sm text-slate-400">No projects.</p> : (
            <div className="space-y-2">{clientProjects.map((p) => {
              const pf = computeProjectFinancials(p, payments, expenses);
              return <Link key={p.id} to={`/projects/${p.id}`} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50">
                <div><div className="text-sm font-medium text-slate-800">{p.name}</div><div className="text-xs text-slate-400">{p.project_type}</div></div>
                <div className="text-right"><div className="text-sm font-medium">{formatCurrency(pf.received)}</div><StatusBadge status={p.status} /></div>
              </Link>;
            })}</div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card title={`Invoices (${clientInvoices.length})`} icon={Receipt}>
          {clientInvoices.length === 0 ? <p className="text-sm text-slate-400">No invoices.</p> : (
            <div className="space-y-2">{clientInvoices.map((i) => <Link key={i.id} to="/invoices" className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50"><div className="text-sm font-medium">{i.invoice_number}</div><div className="flex items-center gap-2"><span className="text-sm">{formatCurrency(i.total)}</span><StatusBadge status={i.status} /></div></Link>)}</div>
          )}
        </Card>
        <Card title={`Quotations (${clientQuotes.length})`} icon={FileText}>
          {clientQuotes.length === 0 ? <p className="text-sm text-slate-400">No quotations.</p> : (
            <div className="space-y-2">{clientQuotes.map((q) => <Link key={q.id} to="/quotations" className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50"><div className="text-sm font-medium">{q.quotation_number}</div><div className="flex items-center gap-2"><span className="text-sm">{formatCurrency(q.total)}</span><StatusBadge status={q.status} /></div></Link>)}</div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title={`Domains (${clientDomains.length})`} icon={Globe}>
          {clientDomains.length === 0 ? <p className="text-sm text-slate-400">None</p> : clientDomains.map((d) => <div key={d.id} className="text-sm py-1">{d.domain_name} <span className="text-slate-400">({d.purchased_by})</span></div>)}
        </Card>
        <Card title={`Hosting (${clientHosting.length})`} icon={HardDrive}>
          {clientHosting.length === 0 ? <p className="text-sm text-slate-400">None</p> : clientHosting.map((h) => <div key={h.id} className="text-sm py-1">{h.provider} <span className="text-slate-400">({h.purchased_by})</span></div>)}
        </Card>
        <Card title={`Payments (${clientPayments.length})`} icon={Wallet}>
          {clientPayments.length === 0 ? <p className="text-sm text-slate-400">None</p> : clientPayments.slice(0, 6).map((p) => <div key={p.id} className="text-sm py-1 flex justify-between"><span>{p.date}</span><span className="text-emerald-600">{formatCurrency(p.amount)}</span></div>)}
        </Card>
      </div>
    </div>
  );
}

function Card({ title, icon: Icon, children }) {
  return <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-2 mb-3"><Icon className="w-4 h-4 text-slate-500" /><h3 className="text-sm font-semibold text-slate-700">{title}</h3></div>{children}</div>;
}
function Row({ label, value }) { return <div className="flex justify-between"><span className="text-slate-400">{label}</span><span className="text-slate-700">{value || "—"}</span></div>; }