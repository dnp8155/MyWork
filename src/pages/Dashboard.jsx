import React from "react";
import { useAppData } from "@/hooks/useAppData";
import { computeDashboardKPIs, monthlySeries, projectWiseBreakdown, expenseCategoryBreakdown, computeOutstanding, formatCurrency } from "@/lib/finance";
import StatCard from "@/components/StatCard";
import PageHeader from "@/components/PageHeader";
import {
  Wallet, TrendingUp, TrendingDown, Clock, Globe, HardDrive, Repeat,
  FolderKanban, FileText, Receipt, AlertTriangle,
  CalendarClock,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";

const PIE_COLORS = ["#003f7e", "#0054ab", "#007bff", "#4fa3ff", "#8ec2ff", "#bcd9ff", "#64748b", "#94a3b8", "#cbd5e1", "#013057"];

export default function Dashboard() {
  const { projects, payments, expenses, invoices, quotations, domains, hosting, loading } = useAppData();

  if (loading) return <DashboardSkeleton />;

  const k = computeDashboardKPIs(projects || [], payments || [], expenses || [], invoices || [], quotations || [], domains || [], hosting || []);
  const revSeries = monthlySeries(payments || [], "amount", 6);
  const expSeries = monthlySeries(expenses || [], "amount", 6);
  const combined = revSeries.map((r, i) => ({ month: r.month, Revenue: r.amount, Expenses: expSeries[i]?.amount || 0, Profit: r.amount - (expSeries[i]?.amount || 0) }));
  const pwBreakdown = projectWiseBreakdown(projects || [], payments || [], expenses || []).filter((p) => p.revenue > 0 || p.expenses > 0);
  const catBreakdown = expenseCategoryBreakdown(expenses || []);
  const outstanding = computeOutstanding(invoices || [], payments || []);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Real-time financial overview across all projects" />

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Project Value" value={k.totalProjectValue} icon={FolderKanban} tone="indigo" />
        <StatCard label="Total Received" value={k.totalReceived} icon={Wallet} tone="green" />
        <StatCard label="Total Pending" value={k.totalPending} icon={Clock} tone="amber" />
        <StatCard label="Total Profit" value={k.totalProfit} icon={TrendingUp} tone={k.totalProfit >= 0 ? "green" : "red"} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Expenses" value={k.totalExpenses} icon={TrendingDown} tone="red" />
        <StatCard label="Domain Expenses" value={k.domainExpenses} icon={Globe} tone="blue" />
        <StatCard label="Hosting Expenses" value={k.hostingExpenses} icon={HardDrive} tone="blue" />
        <StatCard label="Recurring Revenue / mo" value={k.recurringRevenue} icon={Repeat} tone="indigo" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="This Month Revenue" value={k.thisMonthRevenue} icon={Wallet} tone="green" />
        <StatCard label="This Month Expenses" value={k.thisMonthExpenses} icon={TrendingDown} tone="red" />
        <StatCard label="This Month Profit" value={k.thisMonthProfit} icon={TrendingUp} tone={k.thisMonthProfit >= 0 ? "green" : "red"} />
      </div>

      {/* Project & Invoice KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <KpiGroup title="Projects" icon={FolderKanban} items={[
          { label: "Total", value: k.projectKPIs.total },
          { label: "Active", value: k.projectKPIs.active },
          { label: "Completed", value: k.projectKPIs.completed },
          { label: "On Hold", value: k.projectKPIs.on_hold },
          { label: "Pending", value: k.projectKPIs.pending },
        ]} />
        <KpiGroup title="Invoices" icon={Receipt} items={[
          { label: "Draft", value: k.invoiceKPIs.draft },
          { label: "Unpaid", value: k.invoiceKPIs.unpaid },
          { label: "Partially Paid", value: k.invoiceKPIs.partially_paid },
          { label: "Paid", value: k.invoiceKPIs.paid },
          { label: "Overdue", value: k.invoiceKPIs.overdue },
        ]} />
        <KpiGroup title="Quotations" icon={FileText} items={[
          { label: "Draft", value: k.quotationKPIs.draft },
          { label: "Sent", value: k.quotationKPIs.sent },
          { label: "Viewed", value: k.quotationKPIs.viewed },
          { label: "Approved", value: k.quotationKPIs.approved },
          { label: "Rejected", value: k.quotationKPIs.rejected },
        ]} />
      </div>

      {/* Outstanding */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Receivable" value={outstanding.totalReceivable} icon={Clock} tone="amber" />
        <StatCard label="Overdue" value={outstanding.overdue} icon={AlertTriangle} tone="red" />
        <StatCard label="Due Soon (7d)" value={outstanding.dueSoon} icon={CalendarClock} tone="amber" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Revenue vs Expenses vs Profit (6 months)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={combined}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Legend />
              <Bar dataKey="Revenue" fill="#007bff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Profit" fill="#003f7e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Expense Category Breakdown">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={catBreakdown} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={90} label={(e) => e.category}>
                {catBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Project-wise Revenue & Expenses">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pwBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#007bff" stackId="a" />
              <Bar dataKey="expenses" name="Expenses" fill="#cbd5e1" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Monthly Profit Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={combined}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Line type="monotone" dataKey="Profit" stroke="#0054ab" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function KpiGroup({ title, icon: Icon, items }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {items.map((it) => (
          <div key={it.label} className="text-center">
            <div className="text-lg font-bold text-slate-900">{it.value}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">{it.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 bg-slate-200 rounded mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-xl" />)}
      </div>
      <div className="h-80 bg-slate-100 rounded-xl" />
    </div>
  );
}