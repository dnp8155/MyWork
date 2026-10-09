// Central finance calculation engine.
// All derived financial values are computed from source records (payments, expenses)
// to guarantee consistency across Projects, Invoices, and Finance modules.

export const formatCurrency = (amount, symbol = "₹") => {
  const n = Number(amount) || 0;
  return `${symbol}${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

export const formatNumber = (n) => Number(n) || 0;

// ---- Project financials ----
export const projectReceived = (project, payments) => {
  return (payments || [])
    .filter((p) => p.project_id === project.id)
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
};

export const projectExpenses = (project, expenses) => {
  return (expenses || [])
    .filter((e) => e.project_id === project.id)
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
};

export const projectTotalValue = (project) => {
  if (project.project_type === "recurring") {
    return (Number(project.monthly_amount) || 0) * (Number(project.number_of_months) || 0);
  }
  return Number(project.total_amount) || 0;
};

export const computeProjectFinancials = (project, payments, expenses) => {
  const value = projectTotalValue(project);
  const received = projectReceived(project, payments);
  const exp = projectExpenses(project, expenses);
  const pending = Math.max(value - received, 0);
  const profit = received - exp;
  const margin = received > 0 ? (profit / received) * 100 : 0;
  return { value, received, pending, expenses: exp, profit, margin };
};

// ---- Invoice financials ----
export const invoicePaid = (invoice, payments) => {
  return (payments || [])
    .filter((p) => p.invoice_id === invoice.id)
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
};

export const computeInvoiceFinancials = (invoice, payments) => {
  const total = Number(invoice.total) || 0;
  const paid = invoicePaid(invoice, payments);
  const pending = Math.max(total - paid, 0);
  let status = invoice.status;
  if (paid >= total && total > 0) status = "paid";
  else if (paid > 0) status = "partially_paid";
  return { total, paid, pending, status };
};

// ---- Client financials ----
export const computeClientFinancials = (client, projects, payments, expenses) => {
  const clientProjects = (projects || []).filter((p) => p.client_id === client.id);
  const projectIds = clientProjects.map((p) => p.id);
  const totalBusiness = clientProjects.reduce((s, p) => s + projectTotalValue(p), 0);
  const totalReceived = (payments || [])
    .filter((p) => p.client_id === client.id)
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalExpenses = (expenses || [])
    .filter((e) => projectIds.includes(e.project_id))
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalPending = Math.max(totalBusiness - totalReceived, 0);
  return { totalBusiness, totalReceived, totalExpenses, totalPending, projectCount: clientProjects.length };
};

// ---- Quotation totals ----
export const computeQuotationTotals = (items, discount = 0, taxRate = 0) => {
  const subtotal = (items || []).reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0), 0);
  const afterDiscount = Math.max(subtotal - (Number(discount) || 0), 0);
  const tax = afterDiscount * ((Number(taxRate) || 0) / 100);
  const total = afterDiscount + tax;
  return { subtotal, discount: Number(discount) || 0, tax, total };
};

// ---- Dashboard KPIs ----
export const isThisMonth = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

export const computeDashboardKPIs = (projects, payments, expenses, invoices, quotations, domains, hosting) => {
  const totalProjectValue = projects.reduce((s, p) => s + projectTotalValue(p), 0);
  const totalReceived = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalProfit = totalReceived - totalExpenses;

  const domainExpenses = expenses.filter((e) => e.category === "domain").reduce((s, e) => s + Number(e.amount || 0), 0);
  const hostingExpenses = expenses.filter((e) => e.category === "hosting").reduce((s, e) => s + Number(e.amount || 0), 0);
  const recurringRevenue = projects
    .filter((p) => p.project_type === "recurring")
    .reduce((s, p) => s + (Number(p.monthly_amount) || 0), 0);

  const thisMonthRevenue = payments.filter((p) => isThisMonth(p.date)).reduce((s, p) => s + Number(p.amount || 0), 0);
  const thisMonthExpenses = expenses.filter((e) => isThisMonth(e.date)).reduce((s, e) => s + Number(e.amount || 0), 0);
  const thisMonthProfit = thisMonthRevenue - thisMonthExpenses;

  const projectKPIs = {
    total: projects.length,
    active: projects.filter((p) => p.status === "active").length,
    completed: projects.filter((p) => p.status === "completed").length,
    on_hold: projects.filter((p) => p.status === "on_hold").length,
    pending: projects.filter((p) => p.status === "pending").length,
  };

  const invoiceStatus = (st) => invoices.filter((i) => i.status === st).length;
  const invoiceKPIs = {
    draft: invoiceStatus("draft"),
    unpaid: invoices.filter((i) => i.status === "sent").length,
    partially_paid: invoiceStatus("partially_paid"),
    paid: invoiceStatus("paid"),
    overdue: invoiceStatus("overdue"),
  };

  const quoteStatus = (st) => quotations.filter((q) => q.status === st).length;
  const quotationKPIs = {
    draft: quoteStatus("draft"),
    sent: quoteStatus("sent"),
    viewed: quoteStatus("viewed"),
    approved: quoteStatus("approved"),
    rejected: quoteStatus("rejected"),
    expired: quoteStatus("expired"),
  };

  const totalPending = Math.max(totalProjectValue - totalReceived, 0);

  return {
    totalProjectValue,
    totalReceived,
    totalPending,
    totalExpenses,
    totalProfit,
    domainExpenses,
    hostingExpenses,
    recurringRevenue,
    thisMonthRevenue,
    thisMonthExpenses,
    thisMonthProfit,
    projectKPIs,
    invoiceKPIs,
    quotationKPIs,
  };
};

// ---- Monthly series for charts ----
export const monthlySeries = (records, amountKey = "amount", months = 6) => {
  const result = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("en", { month: "short" });
    const year = d.getFullYear();
    const month = d.getMonth();
    const total = (records || [])
      .filter((r) => {
        const rd = new Date(r.date);
        return rd.getFullYear() === year && rd.getMonth() === month;
      })
      .reduce((s, r) => s + (Number(r[amountKey]) || 0), 0);
    result.push({ month: label, amount: total });
  }
  return result;
};

// ---- Project-wise breakdown ----
export const projectWiseBreakdown = (projects, payments, expenses) => {
  return projects.map((p) => {
    const f = computeProjectFinancials(p, payments, expenses);
    return { name: p.name, revenue: f.received, expenses: f.expenses, profit: f.profit };
  });
};

// ---- Expense category breakdown ----
export const expenseCategoryBreakdown = (expenses) => {
  const map = {};
  (expenses || []).forEach((e) => {
    map[e.category] = (map[e.category] || 0) + (Number(e.amount) || 0);
  });
  return Object.entries(map).map(([category, amount]) => ({ category, amount }));
};

// ---- Outstanding ----
export const computeOutstanding = (invoices, payments) => {
  let totalReceivable = 0;
  let overdue = 0;
  let dueSoon = 0;
  const now = new Date();
  invoices.forEach((inv) => {
    const f = computeInvoiceFinancials(inv, payments);
    if (f.pending > 0 && inv.status !== "cancelled" && inv.status !== "draft") {
      totalReceivable += f.pending;
      if (inv.due_date) {
        const dd = new Date(inv.due_date);
        const diff = (dd - now) / (1000 * 60 * 60 * 24);
        if (diff < 0) overdue += f.pending;
        else if (diff <= 7) dueSoon += f.pending;
      }
    }
  });
  return { totalReceivable, overdue, dueSoon };
};

// ---- Number generators ----
export const nextNumber = (prefix, year, existing) => {
  const yearStr = year ? `${year}-` : "";
  const pattern = new RegExp(`^${prefix}-${yearStr}(\\d+)$`);
  let max = 0;
  (existing || []).forEach((r) => {
    const m = (r.invoice_number || r.quotation_number || r.payment_number || r.expense_number || r.project_number || r.client_id || "").match(pattern);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  return `${prefix}-${yearStr}${String(max + 1).padStart(4, "0")}`;
};

export const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - now) / (1000 * 60 * 60 * 24));
};