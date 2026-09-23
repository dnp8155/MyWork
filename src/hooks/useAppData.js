import { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

// Central data fetcher: loads all entities once, caches them at module level,
// and reuses the cache across page navigations (TTL) to avoid API rate limits.
// Components compute derived financials locally via src/lib/finance.
const CACHE_TTL = 60000; // 60 seconds
const cache = { data: null, lastFetched: 0, inflight: null };

const isFresh = () => cache.data && Date.now() - cache.lastFetched < CACHE_TTL;
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

async function fetchAll() {
  try {
    const [
      clients, base44Accounts, projects, payments, recurringSchedules,
      quotations, invoices, domains, hosting, expenses, transactions,
      notifications, auditLogs, settings, credentials,
      projectMembers, projectDocuments,
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
      base44.entities.Credential.list(),
      base44.entities.ProjectMember.list(),
      base44.entities.ProjectDocument.list(),
    ]);
    cache.data = {
      clients, base44Accounts, projects, payments, recurringSchedules,
      quotations, invoices, domains, hosting, expenses, transactions,
      notifications, auditLogs, credentials, projectMembers, projectDocuments,
      settings: settings[0] || null,
    };
    cache.lastFetched = Date.now();
  } catch (err) {
    console.error("Failed to load app data:", err);
  } finally {
    cache.inflight = null;
  }
  return cache.data;
}

function loadAll(force = false) {
  if (cache.inflight) return cache.inflight;
  if (!force && isFresh()) return Promise.resolve(cache.data);
  cache.inflight = fetchAll();
  return cache.inflight;
}

export function useAppData() {
  const [data, setData] = useState(cache.data || {});
  const [loading, setLoading] = useState(!cache.data);

  useEffect(() => {
    const listener = () => { setData(cache.data || {}); setLoading(false); };
    listeners.add(listener);
    let mounted = true;
    if (isFresh()) {
      setData(cache.data);
      setLoading(false);
    } else {
      setLoading(true);
      loadAll(false).then((d) => {
        if (mounted && d) { setData(d); setLoading(false); notify(); }
      });
    }
    return () => { mounted = false; listeners.delete(listener); };
  }, []);

  // refresh always forces a fresh fetch (used after mutations).
  // Notifies every subscriber so all open views update immediately.
  const refresh = useCallback(async () => {
    setLoading(true);
    const d = await loadAll(true);
    if (d) { setData(d); setLoading(false); notify(); }
  }, []);

  return { ...data, loading, refresh };
}