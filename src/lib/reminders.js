import { daysUntil, formatCurrency, computeInvoiceFinancials } from "@/lib/finance";
import { Globe, HardDrive, Receipt, Repeat, FileText, FolderKanban } from "lucide-react";

export function buildReminders({ invoices = [], payments = [], domains = [], hosting = [], projects = [], recurringSchedules = [], quotations = [] }) {
  const reminders = [];

  // Invoice due / overdue
  invoices.forEach((inv) => {
    const f = computeInvoiceFinancials(inv, payments);
    if (f.pending > 0 && inv.status !== "cancelled" && inv.status !== "draft" && inv.due_date) {
      const days = daysUntil(inv.due_date);
      if (days !== null && days < 0) reminders.push({ icon: Receipt, tone: "red", title: `Invoice ${inv.invoice_number} overdue`, message: `${inv.client_name} — ${formatCurrency(f.pending)} pending, ${Math.abs(days)} days overdue`, date: inv.due_date });
      else if (days !== null && days <= 7) reminders.push({ icon: Receipt, tone: "amber", title: `Invoice ${inv.invoice_number} due soon`, message: `${inv.client_name} — ${formatCurrency(f.pending)} due in ${days} days`, date: inv.due_date });
    }
  });

  // Domain renewals
  domains.forEach((d) => {
    const days = daysUntil(d.renewal_date);
    if (days !== null && days <= 30) reminders.push({ icon: Globe, tone: days < 0 ? "red" : "amber", title: `Domain ${d.domain_name} ${days < 0 ? "expired" : "renewal"}`, message: `${d.registrar} — ${days < 0 ? `${Math.abs(days)} days ago` : `in ${days} days`}`, date: d.renewal_date });
  });

  // Hosting renewals
  hosting.forEach((h) => {
    const days = daysUntil(h.renewal_date);
    if (days !== null && days <= 30) reminders.push({ icon: HardDrive, tone: days < 0 ? "red" : "amber", title: `Hosting ${h.provider} ${days < 0 ? "expired" : "renewal"}`, message: `${h.plan} — ${days < 0 ? `${Math.abs(days)} days ago` : `in ${days} days`}`, date: h.renewal_date });
  });

  // Recurring salary due
  recurringSchedules.forEach((s) => {
    if (s.status === "upcoming" || s.status === "due" || s.status === "overdue") {
      const days = daysUntil(s.due_date);
      if (days !== null && days <= 7) reminders.push({ icon: Repeat, tone: days < 0 ? "red" : "amber", title: `Recurring payment due — ${s.project_name}`, message: `${formatCurrency(s.amount)} — ${days < 0 ? `${Math.abs(days)} days overdue` : `in ${days} days`}`, date: s.due_date });
    }
  });

  // Quotation expiry
  quotations.forEach((q) => {
    if (q.status === "sent" || q.status === "viewed") {
      const days = daysUntil(q.valid_until);
      if (days !== null && days <= 7) reminders.push({ icon: FileText, tone: days < 0 ? "red" : "amber", title: `Quotation ${q.quotation_number} ${days < 0 ? "expired" : "expiring"}`, message: `${q.client_name} — ${days < 0 ? `${Math.abs(days)} days ago` : `in ${days} days`}`, date: q.valid_until });
    }
  });

  // Project deadlines
  projects.forEach((p) => {
    if (p.status === "active" && p.expected_completion_date) {
      const days = daysUntil(p.expected_completion_date);
      if (days !== null && days <= 7) reminders.push({ icon: FolderKanban, tone: days < 0 ? "red" : "amber", title: `Project ${p.name} deadline`, message: days < 0 ? `${Math.abs(days)} days overdue` : `due in ${days} days`, date: p.expected_completion_date });
    }
  });

  reminders.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  return reminders;
}