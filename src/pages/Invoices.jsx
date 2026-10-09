import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "@/hooks/useAppData";
import { base44 } from "@/api/base44Client";
import { computeInvoiceFinancials, nextNumber, formatCurrency } from "@/lib/finance";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import { Input, Select } from "@/components/FormFields";
import { Plus, Receipt, Wallet, Clock, AlertTriangle, Eye, Edit3, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Invoices() {
  const { invoices, clients, projects, payments, loading, refresh } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [payModal, setPayModal] = useState(null);
  const [editInvoice, setEditInvoice] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const filtered = (invoices || []).filter((i) => filter === "all" || i.status === filter).sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  const totalInvoiced = (invoices || []).reduce((s, i) => s + (Number(i.total) || 0), 0);
  const totalPaid = (invoices || []).reduce((s, i) => s + computeInvoiceFinancials(i, payments).paid, 0);
  const totalPending = (invoices || []).reduce((s, i) => s + computeInvoiceFinancials(i, payments).pending, 0);

  const deleteInvoice = async (inv) => {
    if (!window.confirm(`Are you sure you want to delete invoice ${inv.invoice_number}?`)) return;
    try {
      await base44.entities.Invoice.delete(inv.id);
      await base44.entities.AuditLog.create({ action: "deleted", entity: "Invoice", entity_id: inv.id, description: `Deleted invoice ${inv.invoice_number}` });
      toast({ title: `Invoice ${inv.invoice_number} deleted` });
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const recordPayment = async (inv, amount, method, reference) => {
    const year = new Date().getFullYear();
    const existing = await base44.entities.Payment.list();
    const payment_number = `PAY-${year}-${String(existing.length + 1).padStart(4, "0")}`;
    const payment = await base44.entities.Payment.create({
      payment_number, date: new Date().toISOString().slice(0, 10), amount: Number(amount), payment_method: method, reference,
      client_id: inv.client_id, client_name: inv.client_name, project_id: inv.project_id, project_name: inv.project_name,
      invoice_id: inv.id, invoice_number: inv.invoice_number, type: "invoice",
    });
    const newPaid = computeInvoiceFinancials(inv, [...(payments || []), { invoice_id: inv.id, amount: Number(amount) }]).paid;
    let status = inv.status;
    if (newPaid >= inv.total) status = "paid"; else if (newPaid > 0) status = "partially_paid";
    await base44.entities.Invoice.update(inv.id, { status });
    await base44.entities.Transaction.create({
      transaction_number: `TXN-${Date.now()}`, date: new Date().toISOString().slice(0, 10), type: "income", category: "invoice_payment",
      amount: Number(amount), project_id: inv.project_id, project_name: inv.project_name, client_id: inv.client_id, client_name: inv.client_name,
      invoice_id: inv.id, payment_method: method, reference, description: `Payment for invoice ${inv.invoice_number}`, source_entity: "payment", source_id: payment.id,
    });
    await base44.entities.AuditLog.create({ action: "payment_recorded", entity: "Invoice", entity_id: inv.id, description: `Recorded ${formatCurrency(amount)} against ${inv.invoice_number}` });
    refresh(); toast({ title: "Payment recorded" }); setPayModal(null);
  };

  return (
    <div>
      <PageHeader title="Invoices" subtitle="Track invoices and payments"
        actions={<button onClick={() => navigate("/invoices/new")} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-100"><Plus className="w-4 h-4" /> New Invoice</button>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Invoiced" value={totalInvoiced} icon={Receipt} tone="indigo" />
        <StatCard label="Total Paid" value={totalPaid} icon={Wallet} tone="green" />
        <StatCard label="Total Pending" value={totalPending} icon={Clock} tone="amber" />
        <StatCard label="Overdue" value={(invoices || []).filter((i) => i.status === "overdue").length} icon={AlertTriangle} tone="red" isCurrency={false} />
      </div>
      <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-slate-300 mb-4 focus:outline-none">
        <option value="all">All Status</option>
        {["draft","sent","partially_paid","paid","overdue","cancelled"].map((s) => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
      </select>
      {loading ? <div className="h-64 bg-slate-100 rounded-xl animate-pulse" /> : filtered.length === 0 ? (
        <EmptyState title="No invoices" message="Create an invoice or convert from an approved quotation." />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200"><tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Number</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Client</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Due</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Total</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Paid</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Pending</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((inv) => {
                const f = computeInvoiceFinancials(inv, payments);
                return (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-indigo-600 cursor-pointer" onClick={() => navigate(`/invoices/${inv.id}`)}>{inv.invoice_number}</td>
                    <td className="px-4 py-3 text-slate-600">{inv.client_name}</td>
                    <td className="px-4 py-3 text-slate-500">{inv.invoice_date}</td>
                    <td className="px-4 py-3 text-slate-500">{inv.due_date}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(f.total)}</td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-medium">{formatCurrency(f.paid)}</td>
                    <td className="px-4 py-3 text-right text-amber-600 font-medium">{formatCurrency(f.pending)}</td>
                    <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/invoices/${inv.id}`)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditInvoice(inv)}
                          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit Status / Details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteInvoice(inv)}
                          className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {f.pending > 0 && inv.status !== "cancelled" && inv.status !== "draft" && (
                          <button onClick={() => setPayModal(inv)} className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 ml-1">+ Pay</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        </div>
      )}
      {modalOpen && <InvoiceForm clients={clients || []} projects={projects || []} existing={invoices || []} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); refresh(); toast({ title: "Invoice created" }); }} />}
      {editInvoice && <EditInvoiceModal invoice={editInvoice} onClose={() => setEditInvoice(null)} onSaved={() => { setEditInvoice(null); refresh(); toast({ title: "Invoice updated" }); }} />}
      {payModal && <PayModal invoice={payModal} onClose={() => setPayModal(null)} onSave={recordPayment} />}
    </div>
  );
}

function InvoiceForm({ clients, projects, existing, onClose, onSaved }) {
  const [isManual, setIsManual] = useState(false);
  const [form, setForm] = useState({
    client_id: "",
    project_id: "",
    custom_client_name: "",
    custom_project_name: "",
    invoice_date: new Date().toISOString().slice(0, 10),
    due_date: "",
    discount: 0,
    tax_rate: 18,
    status: "paid", // default or selectable
    payment_method: "bank_transfer",
    notes: ""
  });
  const [items, setItems] = useState([{ description: "", quantity: 1, unit_price: 0 }]);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const updateItem = (i, k, v) => setItems((arr) => arr.map((it, idx) => idx === i ? { ...it, [k]: v } : it));
  const subtotal = items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0), 0);
  const afterDiscount = Math.max(subtotal - Number(form.discount || 0), 0);
  const tax = afterDiscount * (Number(form.tax_rate || 0) / 100);
  const total = afterDiscount + tax;

  const availableProjects = form.client_id
    ? projects.filter((p) => p.client_id === form.client_id)
    : projects;

  const handleClientChange = (clientId) => {
    setForm((prev) => {
      const selectedProj = projects.find((p) => p.id === prev.project_id);
      const keepProj = selectedProj && selectedProj.client_id === clientId ? prev.project_id : "";
      return { ...prev, client_id: clientId, project_id: keepProj };
    });
  };

  const handleProjectChange = (projectId) => {
    const proj = projects.find((p) => p.id === projectId);
    setForm((prev) => ({
      ...prev,
      project_id: projectId,
      client_id: proj?.client_id || prev.client_id
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const year = new Date().getFullYear();
      const invoice_number = nextNumber("INV", year, existing);

      const client = clients.find((c) => c.id === form.client_id);
      const project = projects.find((p) => p.id === form.project_id);

      const client_name = isManual ? form.custom_client_name : (client?.name || form.custom_client_name);
      const project_name = isManual ? form.custom_project_name : (project?.name || form.custom_project_name);

      const payload = {
        invoice_number,
        client_id: form.client_id || (isManual ? "manual" : undefined),
        project_id: form.project_id || undefined,
        client_name,
        project_name,
        invoice_date: form.invoice_date,
        due_date: form.due_date,
        discount: Number(form.discount || 0),
        tax_rate: Number(form.tax_rate || 0),
        items,
        subtotal,
        tax,
        total,
        status: form.status,
        notes: form.notes
      };

      const newInv = await base44.entities.Invoice.create(payload);

      // If user selected status as 'paid', auto record payment entry so Payment History & Financials update automatically!
      if (form.status === "paid") {
        const existingPayments = await base44.entities.Payment.list();
        const payment_number = `PAY-${year}-${String(existingPayments.length + 1).padStart(4, "0")}`;
        const payment = await base44.entities.Payment.create({
          payment_number,
          date: form.invoice_date,
          amount: total,
          payment_method: form.payment_method,
          reference: "Pre-paid upon Invoice creation",
          client_id: form.client_id,
          client_name,
          project_id: form.project_id,
          project_name,
          invoice_id: newInv.id,
          invoice_number,
          type: "invoice",
        });

        await base44.entities.Transaction.create({
          transaction_number: `TXN-${Date.now()}`,
          date: form.invoice_date,
          type: "income",
          category: "invoice_payment",
          amount: total,
          project_id: form.project_id,
          project_name,
          client_id: form.client_id,
          client_name,
          invoice_id: newInv.id,
          payment_method: form.payment_method,
          reference: "Pre-paid Invoice",
          description: `Payment for pre-paid invoice ${invoice_number}`,
          source_entity: "payment",
          source_id: payment.id,
        });
      }

      await base44.entities.AuditLog.create({
        action: "created",
        entity: "Invoice",
        description: `Created invoice ${invoice_number} (${form.status})`
      });
      onSaved();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="New Invoice" size="xl">
      <form onSubmit={submit} className="space-y-4">
        {/* Toggle Mode Option */}
        <div className="flex items-center justify-between bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 mb-2">
          <div>
            <p className="text-xs font-bold text-slate-800">Entry Mode</p>
            <p className="text-[11px] text-slate-500">Choose between selecting existing records or typing custom names</p>
          </div>
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setIsManual(false)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${!isManual ? "bg-indigo-600 text-white font-semibold" : "text-slate-600 hover:text-slate-900"}`}
            >
              Select List
            </button>
            <button
              type="button"
              onClick={() => setIsManual(true)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${isManual ? "bg-indigo-600 text-white font-semibold" : "text-slate-600 hover:text-slate-900"}`}
            >
              + Manual Custom Entry
            </button>
          </div>
        </div>

        {/* Client & Project Selection or Custom Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {!isManual ? (
            <>
              <Select label="Client" value={form.client_id} onChange={(e) => handleClientChange(e.target.value)}>
                <option value="">Select Client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>

              <Select label="Project (All Available)" value={form.project_id} onChange={(e) => handleProjectChange(e.target.value)}>
                <option value="">None / All Projects</option>
                {(availableProjects.length > 0 ? availableProjects : projects).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </>
          ) : (
            <>
              <Input
                label="Custom Client Name"
                placeholder="e.g. Acme Corporation"
                required
                value={form.custom_client_name}
                onChange={(e) => set("custom_client_name", e.target.value)}
              />
              <Input
                label="Custom Project Name"
                placeholder="e.g. Website Redesign"
                value={form.custom_project_name}
                onChange={(e) => set("custom_project_name", e.target.value)}
              />
            </>
          )}

          <Input label="Invoice Date" type="date" required value={form.invoice_date} onChange={(e) => set("invoice_date", e.target.value)} />
          <Input label="Due Date" type="date" value={form.due_date} onChange={(e) => set("due_date", e.target.value)} />
        </div>

        {/* Status Selection & Payment Method (Pre-paid vs Pending) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
          <Select label="Invoice Payment Status" value={form.status} onChange={(e) => set("status", e.target.value)}>
            <option value="paid">✓ Already Paid (Generate Paid Receipt)</option>
            <option value="sent font-medium">⏳ Unpaid / Pending (Send Bill to Client)</option>
          </Select>

          {form.status === "paid" ? (
            <Select label="Payment Method Received" value={form.payment_method} onChange={(e) => set("payment_method", e.target.value)}>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="upi">UPI / GPay / PhonePe</option>
              <option value="cash">Cash</option>
              <option value="card">Credit / Debit Card</option>
              <option value="other">Other</option>
            </Select>
          ) : (
            <div className="flex items-center text-xs text-slate-500 pt-5 font-medium">
              💡 Payment due date will apply and invoice will show "Pending" status badge.
            </div>
          )}
        </div>

        {/* Line Items */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Line Items</label>
          <div className="space-y-2">
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input
                  className="col-span-6 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="Description (e.g. Web Development)"
                  value={it.description}
                  onChange={(e) => updateItem(i, "description", e.target.value)}
                />
                <input
                  className="col-span-2 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  type="number"
                  placeholder="Qty"
                  value={it.quantity}
                  onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                />
                <input
                  className="col-span-3 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  type="number"
                  placeholder="Rate"
                  value={it.unit_price}
                  onChange={(e) => updateItem(i, "unit_price", Number(e.target.value))}
                />
                <button
                  type="button"
                  onClick={() => setItems((arr) => arr.filter((_, idx) => idx !== i))}
                  className="col-span-1 text-rose-500 hover:text-rose-700 font-bold text-center"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setItems((a) => [...a, { description: "", quantity: 1, unit_price: 0 }])}
            className="mt-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            + Add item
          </button>
        </div>

        {/* Discounts & Taxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Input label="Discount (₹)" type="number" value={form.discount} onChange={(e) => set("discount", Number(e.target.value))} />
          <Input label="Tax Rate (%)" type="number" value={form.tax_rate} onChange={(e) => set("tax_rate", Number(e.target.value))} />
          <div>
            <p className="text-xs text-slate-600 mb-1">Subtotal</p>
            <p className="text-sm font-medium py-2">{formatCurrency(subtotal)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Total</p>
            <p className="text-sm font-bold py-2 text-indigo-600">{formatCurrency(total)}</p>
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Notes / Terms (Optional)</label>
          <textarea
            rows="2"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            placeholder="Payment due within 30 days..."
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {saving ? "Saving…" : "Create Invoice"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function PayModal({ invoice, onClose, onSave }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank_transfer");
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    await onSave(invoice, amount, method, reference);
    setSaving(false);
  };
  return (
    <Modal open onClose={onClose} title={`Payment — ${invoice.invoice_number}`}>
      <form onSubmit={submit} className="space-y-4">
        <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-1">
          <div className="flex justify-between"><span>Total</span><span>{formatCurrency(invoice.total)}</span></div>
          <div className="flex justify-between"><span>Pending</span><span className="text-amber-600 font-medium">{formatCurrency(invoice.total - (invoice.paid || 0))}</span></div>
        </div>
        <Input label="Amount (₹)" type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Select label="Payment Method" value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="cash">Cash</option><option value="bank_transfer">Bank Transfer</option><option value="upi">UPI</option><option value="card">Card</option><option value="other">Other</option>
        </Select>
        <Input label="Reference" value={reference} onChange={(e) => setReference(e.target.value)} />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50">{saving ? "Saving…" : "Record"}</button>
        </div>
      </form>
    </Modal>
  );
}

function EditInvoiceModal({ invoice, onClose, onSaved }) {
  const [status, setStatus] = useState(invoice.status || "sent");
  const [dueDate, setDueDate] = useState(invoice.due_date || "");
  const [description, setDescription] = useState(invoice.description || invoice.notes || "");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.entities.Invoice.update(invoice.id, {
        status,
        due_date: dueDate,
        description
      });
      await base44.entities.AuditLog.create({
        action: "updated",
        entity: "Invoice",
        entity_id: invoice.id,
        description: `Updated invoice ${invoice.invoice_number}`
      });
      onSaved();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={`Edit Invoice — ${invoice.invoice_number}`}>
      <form onSubmit={submit} className="space-y-4">
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="draft">Draft</option>
          <option value="sent">Sent / Pending</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        <Input label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Notes / Description</label>
          <textarea
            rows="3"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}