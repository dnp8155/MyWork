import React from "react";
import { useAppData } from "@/hooks/useAppData";
import { buildReminders } from "@/lib/reminders";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { Bell, AlertTriangle, CalendarClock } from "lucide-react";

export default function Notifications() {
  const { invoices, domains, hosting, projects, recurringSchedules, quotations, payments, loading } = useAppData();

  if (loading) return <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />;

  const reminders = buildReminders({ invoices, payments, domains, hosting, projects, recurringSchedules, quotations });

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