import { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

// Central data fetcher: loads all entities once and exposes a refresh function.
// Components compute derived financials locally via src/lib/finance.
export function useAppData() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [
      clients, base44Accounts, projects, payments, recurringSchedules,
      quotations, invoices, domains, hosting, expenses, transactions,
      notifications, auditLogs, settings,
    ] = await Promise.all([
      base44.entities.Client.list(),
      base44.entities.Base44Account.list(),
      base44.entities.Project.list(),
      base44.entities.Payment.list(),
      base44.entities.RecurringPaymentSchedule.list(),
      base44.entities.Quotation.list(),
      base44.entities.Invoice.list(),
      base44.entities.Domain.list(),
      base44.entities.HostingAccount.list(),
      base44.entities.Expense.list(),
      base44.entities.Transaction.list(),
      base44.entities.Notification.list(),
      base44.entities.AuditLog.list(),
      base44.entities.CompanySettings.list(),
    ]);
    setData({
      clients, base44Accounts, projects, payments, recurringSchedules,
      quotations, invoices, domains, hosting, expenses, transactions,
      notifications, auditLogs,
      settings: settings[0] || null,
    });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  return { ...data, loading, refresh: load };
}