import React from "react";
import { useAppData } from "@/hooks/useAppData";
import { base44 } from "@/api/base44Client";
import { daysUntil, formatCurrency, computeInvoiceFinancials } from "@/lib/finance";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { Bell, AlertTriangle, CalendarClock, Globe, HardDrive, Receipt, Repeat, FileText, FolderKanban } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Notifications() {
  const { invoices, domains, hosting, projects, recurringSchedules, quotations, payments, loading, refresh } = useAppData();
  const { toast } = useToast();

  if (loading) return <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />;

  const reminders = [];

  // Invoice due / overdue
  (invoices || []).forEach((inv) => {
    const f = computeInvoiceFinancials(inv, payments);
    if (f.pending > 0 && inv.status !== "cancelled" && inv.status !== "draft" && inv.due_date) {
      const days = daysUntil(inv.due_date);
      if (days !== null && days < 0) reminders.push({ icon: Receipt, tone: "red", title: `Invoice ${inv.invoice_number} overdue`, message: `${inv.client_name} — ${formatCurrency(f.pending)} pending, ${Math.abs(days)} days overdue`, date: inv.due_date });
      else if (days !== null && days <= 7) reminders.push({ icon: Receipt, tone: "amber", title: `Invoice ${inv.invoice_number} due soon`, message: `${inv.client_name} — ${formatCurrency(f.pending)} due in ${days} days`, date: inv.due_date });
    }
  });

  // Domain renewals
  (domains || []).forEach((d) => {
    const days = daysUntil(d.renewal_date);
    if (days !== null && days <= 30) reminders.push({ icon: Globe, tone: days < 0 ? "red" : "amber", title: `Domain ${d.domain_name} ${days < 0 ? "expired" : "renewal"}`, message: `${d.registrar} — ${days < 0 ? `${Math.abs(days)} days ago` : `in ${days} days`}`, date: d.renewal_date });
  });

  // Hosting renewals
  (hosting || []).forEach((h) => {
    const days = daysUntil(h.renewal_date);
    if (days !== null && days <= 30) reminders.push({ icon: HardDrive, tone: days < 0 ? "red" : "amber", title: `Hosting ${h.provider} ${days < 0 ? "expired" : "renewal"}`, message: `${h.plan} — ${days < 0 ? `${Math.abs(days)} days ago` : `in ${days} days`}`, date: h.renewal_date });
  });

  // Recurring salary due
  (recurringSchedules || []).forEach((s) => {
    if (s.status === "upcoming" || s.status === "due" || s.status === "overdue") {
      const days = daysUntil(s.due_date);
      if (days !== null && days <= 7) reminders.push({ icon: Repeat, tone: days < 0 ? "red" : "amber", title: `Recurring payment due — ${s.project_name}`, message: `${formatCurrency(s.amount)} — ${days < 0 ? `${Math.abs(days)} days overdue` : `in ${days} days`}`, date: s.due_date });
    }
  });

  // Quotation expiry
  (quotations || []).forEach((q) => {
    if (q.status === "sent" || q.status === "viewed") {
      const days = daysUntil(q.valid_until);
      if (days !== null && days <= 7) reminders.push({ icon: FileText, tone: days < 0 ? "red" : "amber", title: `Quotation ${q.quotation_number} ${days < 0 ? "expired" : "expiring"}`, message: `${q.client_name} — ${days < 0 ? `${Math.abs(days)} days ago` : `in ${days} days`}`, date: q.valid_until });
    }
  });

  // Project deadlines
  (projects || []).forEach((p) => {
    if (p.status === "active" && p.expected_completion_date) {
      const days = daysUntil(p.expected_completion_date);
      if (days !== null && days <= 7) reminders.push({ icon: FolderKanban, tone: days < 0 ? "red" : "amber", title: `Project ${p.name} deadline`, message: days < 0 ? `${Math.abs(days)} days overdue` : `due in ${days} days`, date: p.expected_completion_date });
    }
  });

  reminders.sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  return (
    <div>
      <PageHeader title="Notifications & Reminders" subtitle="Upcoming actions and alerts" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Reminders" value={reminders.length} icon={Bell} tone="indigo" isCurrency={false} />
        <StatCard label="Overdue" value={reminders.filter((r) => r.tone === "red").length} icon={AlertTriangle} tone="red" isCurrency={false} />
        <StatCard label="Due Soon" value={reminders.filter((r) => r.tone === "amber").length} icon={CalendarClock} tone="amber" isCurrency={false} />
      </div>
      {reminders.length === 0 ? <EmptyState title="No reminders" message="Nothing due in the next 30 days. You're all caught up!" /> : (
        <div className="space-y-2">
          {reminders.map((r, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${r.tone === "red" ? "bg-rose-50 border-rose-200" : "bg-amber-50 border-amber-200"}`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${r.tone === "red" ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"}`}>
                <r.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">{r.title}</p>
                <p className="text-xs text-slate-600">{r.message}</p>
              </div>
              <span className="text-xs text-slate-400">{r.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}