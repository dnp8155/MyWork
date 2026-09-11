import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { buildReminders } from "@/lib/reminders";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { invoices, domains, hosting, projects, recurringSchedules, quotations, payments, loading } = useAppData();
  const reminders = loading ? [] : buildReminders({ invoices, payments, domains, hosting, projects, recurringSchedules, quotations });

  return (
    <div className="relative">
      {open && <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />}
      <button onClick={() => setOpen(!open)} className="relative text-slate-600 hover:text-slate-900">
        <Bell className="w-5 h-5" />
        {reminders.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-semibold flex items-center justify-center">
            {reminders.length > 99 ? "99+" : reminders.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl border border-slate-200 shadow-xl z-40 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
            <span className="text-xs text-slate-400">{reminders.length} reminder{reminders.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="p-4 text-sm text-slate-400">Loading…</p>
            ) : reminders.length === 0 ? (
              <p className="p-4 text-sm text-slate-400">No reminders — you're all caught up!</p>
            ) : (
              reminders.map((r, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 border-b border-slate-100 last:border-b-0 ${r.tone === "red" ? "bg-rose-50" : "bg-amber-50"}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${r.tone === "red" ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"}`}>
                    <r.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800">{r.title}</p>
                    <p className="text-[11px] text-slate-600">{r.message}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 flex-shrink-0">{r.date}</span>
                </div>
              ))
            )}
          </div>
          <Link to="/notifications" onClick={() => setOpen(false)} className="block text-center text-xs font-medium text-indigo-600 hover:bg-slate-50 py-2.5 border-t border-slate-200">
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}