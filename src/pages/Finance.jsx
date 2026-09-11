import React, { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { monthlySeries, projectWiseBreakdown, expenseCategoryBreakdown, computeOutstanding, computeProjectFinancials, formatCurrency, isThisMonth } from "@/lib/finance";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import { Wallet, TrendingUp, TrendingDown, Clock, AlertTriangle, CalendarClock } from "lucide-react";

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#0ea5e9", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#64748b"];

export default function Finance() {
  const { payments, expenses, projects, invoices, loading } = useAppData();
  const [range, setRange] = useState("month");

  if (loading) return <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />;

  const now = new Date();
  const inRange = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (range === "today") return d.toDateString() === now.toDateString();
    if (range === "week") { const diff = (now - d) / (1000 * 60 * 60 * 24); return diff <= 7; }
    if (range === "month") return isThisMonth(dateStr);
    if (range === "year") return d.getFullYear() === now.getFullYear();
    return true;
  };

  const rangePayments = (payments || []).filter((p) => inRange(p.date));
  const rangeExpenses = (expenses || []).filter((e) => inRange(e.date));
  const revenue = rangePayments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const exp = rangeExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const profit = revenue - exp;
  const outstanding = computeOutstanding(invoices || [], payments || []);

  const revSeries = monthlySeries(payments || [], "amount", 6);
  const expSeries = monthlySeries(expenses || [], "amount", 6);
  const combined = revSeries.map((r, i) => ({ month: r.month, Revenue: r.amount, Expenses: expSeries[i]?.amount || 0, Profit: r.amount - (expSeries[i]?.amount || 0) }));
  const pwBreakdown = projectWiseBreakdown(projects || [], payments, expenses);
  const catBreakdown = expenseCategoryBreakdown(expenses || []);

  return (
    <div>
      <PageHeader title="Finance" subtitle="Centralized financial overview"
        actions={
          <select value={range} onChange={(e) => setRange(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-slate-300">
            <option value="today">Today</option><option value="week">This Week</option><option value="month">This Month</option><option value="year">This Year</option><option value="all">All Time</option>
          </select>
        } />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Revenue" value={revenue} icon={Wallet} tone="green" />
        <StatCard label="Expenses" value={exp} icon={TrendingDown} tone="red" />
        <StatCard label="Profit" value={profit} icon={TrendingUp} tone={profit >= 0 ? "green" : "red"} />
        <StatCard label="Margin" value={revenue > 0 ? `${((profit / revenue) * 100).toFixed(1)}%` : "0%"} icon={TrendingUp} tone="indigo" isCurrency={false} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Receivable" value={outstanding.totalReceivable} icon={Clock} tone="amber" />
        <StatCard label="Overdue" value={outstanding.overdue} icon={AlertTriangle} tone="red" />
        <StatCard label="Due Soon" value={outstanding.dueSoon} icon={CalendarClock} tone="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Revenue vs Expenses vs Profit (6 months)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={combined}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} /><Tooltip formatter={(v) => formatCurrency(v)} /><Legend /><Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} /><Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} /><Bar dataKey="Profit" fill="#6366f1" radius={[4, 4, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Monthly Cash Flow">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={combined}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} /><Tooltip formatter={(v) => formatCurrency(v)} /><Legend /><Area type="monotone" dataKey="Revenue" stroke="#10b981" fill="#10b98133" /><Area type="monotone" dataKey="Expenses" stroke="#ef4444" fill="#ef444433" /></AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Profit Trend">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={combined}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} /><Tooltip formatter={(v) => formatCurrency(v)} /><Line type="monotone" dataKey="Profit" stroke="#6366f1" strokeWidth={2.5} /></LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Expense Category Breakdown">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart><Pie data={catBreakdown} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={90} label={(e) => e.category}>{catBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip formatter={(v) => formatCurrency(v)} /></PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <ChartCard title="Project-wise Revenue & Expenses">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={pwBreakdown} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} /><YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} /><Tooltip formatter={(v) => formatCurrency(v)} /><Legend /><Bar dataKey="revenue" name="Revenue" fill="#10b981" stackId="a" /><Bar dataKey="expenses" name="Expenses" fill="#ef4444" stackId="a" /></BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }) {
  return <div className="bg-white rounded-xl border border-slate-200 p-4"><h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>{children}</div>;
}