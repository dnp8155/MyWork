import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "@/hooks/useAppData";
import { base44 } from "@/api/base44Client";
import { nextNumber, formatCurrency } from "@/lib/finance";
import { Input, Select } from "@/components/FormFields";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function CreateInvoice() {
  const { clients, projects, invoices, settings, refresh } = useAppData();
  const navigate = useNavigate();
  const { toast } = useToast();

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
    status: "sent",
    payment_method: "bank_transfer",
    bank_name: "",
    account_holder_name: "",
    account_number: "",
    ifsc_code: "",
    upi_id: "",
    notes: ""
  });

  // Auto pre-fill bank & upi details from Settings on load
  React.useEffect(() => {
    if (settings) {
      setForm((prev) => ({
        ...prev,
        bank_name: prev.bank_name || settings.bank_name || "",
        account_holder_name: prev.account_holder_name || settings.company_name || "",
        account_number: prev.account_number || settings.account_number || "",
        ifsc_code: prev.ifsc_code || settings.ifsc_code || "",
        upi_id: prev.upi_id || settings.upi_id || ""
      }));
    }
  }, [settings]);

  const [items, setItems] = useState([
    { description: "", quantity: 1, unit_price: 0 }
  ]);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const updateItem = (i, k, v) =>
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));
  
  const subtotal = items.reduce(
    (s, it) => s + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
    0
  );
  const afterDiscount = Math.max(subtotal - Number(form.discount || 0), 0);
  const tax = afterDiscount * (Number(form.tax_rate || 0) / 100);
  const total = afterDiscount + tax;

  const availableProjects = form.client_id
    ? (projects || []).filter((p) => p.client_id === form.client_id)
    : (projects || []);

  const handleClientChange = (clientId) => {
    const selectedClient = (clients || []).find((c) => c.id === clientId);
    setForm((prev) => {
      const selectedProj = (projects || []).find((p) => p.id === prev.project_id);
      const keepProj =
        selectedProj && selectedProj.client_id === clientId ? prev.project_id : "";
      return {
        ...prev,
        client_id: clientId,
        project_id: keepProj,
        custom_client_name: selectedClient ? selectedClient.name : prev.custom_client_name,
        custom_client_phone: selectedClient ? (selectedClient.phone || "") : prev.custom_client_phone,
        custom_client_email: selectedClient ? (selectedClient.email || "") : prev.custom_client_email
      };
    });
  };

  const handleProjectChange = (projectId) => {
    const proj = (projects || []).find((p) => p.id === projectId);
    const selectedClient = (clients || []).find((c) => c.id === (proj?.client_id || form.client_id));
    setForm((prev) => ({
      ...prev,
      project_id: projectId,
      client_id: proj?.client_id || prev.client_id,
      custom_client_name: selectedClient ? selectedClient.name : prev.custom_client_name,
      custom_client_phone: selectedClient ? (selectedClient.phone || "") : prev.custom_client_phone,
      custom_client_email: selectedClient ? (selectedClient.email || "") : prev.custom_client_email
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const year = new Date().getFullYear();
      const invoice_number = nextNumber("INV", year, invoices || []);

      const client = (clients || []).find((c) => c.id === form.client_id);
      const project = (projects || []).find((p) => p.id === form.project_id);

      const client_name = isManual
        ? form.custom_client_name
        : client?.name || form.custom_client_name;
      const project_name = isManual
        ? form.custom_project_name
        : project?.name || form.custom_project_name;

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
        payment_method: form.payment_method,
        bank_name: form.bank_name || undefined,
        account_holder_name: form.account_holder_name || undefined,
        account_number: form.account_number || undefined,
        ifsc_code: form.ifsc_code || undefined,
        upi_id: form.upi_id || undefined,
        description: form.notes || undefined
      };

      const newInv = await base44.entities.Invoice.create(payload);

      if (form.status === "paid") {
        const existingPayments = await base44.entities.Payment.list();
        const payment_number = `PAY-${year}-${String(
          existingPayments.length + 1
        ).padStart(4, "0")}`;

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
          type: "invoice"
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
          source_id: payment.id
        });
      }

      await base44.entities.AuditLog.create({
        action: "created",
        entity: "Invoice",
        description: `Created invoice ${invoice_number} (${form.status})`
      });

      refresh();
      toast({ title: `Invoice ${invoice_number} created successfully!` });
      navigate(`/invoices/${newInv.id}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/invoices")}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel & Back
        </button>
        <h1 className="text-xl font-bold text-slate-900">Create New Invoice</h1>
      </div>

      <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
        {/* Entry Mode Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Client & Project Input Mode</h3>
            <p className="text-xs text-slate-500">Choose between picking existing records or entering custom names manually</p>
          </div>
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button
              type="button"
              onClick={() => setIsManual(false)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                !isManual ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Select List
            </button>
            <button
              type="button"
              onClick={() => setIsManual(true)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                isManual ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              + Manual Custom Entry
            </button>
          </div>
        </div>

        {/* Client & Project Selection with Quick Custom Details */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Select label="Client" value={form.client_id} onChange={(e) => handleClientChange(e.target.value)}>
              <option value="">Select Existing Client (Or enter below)</option>
              {(clients || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Select label="Project" value={form.project_id} onChange={(e) => handleProjectChange(e.target.value)}>
              <option value="">None / All Projects</option>
              {(availableProjects.length > 0 ? availableProjects : projects || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>

            <Input label="Invoice Date" type="date" required value={form.invoice_date} onChange={(e) => set("invoice_date", e.target.value)} />
            <Input label="Due Date" type="date" value={form.due_date} onChange={(e) => set("due_date", e.target.value)} />
          </div>

          {/* Quick Custom Client Details Box (Shown directly below Client) */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Client Details / Custom Contact (If not selecting from list)
              </label>
              {form.client_id && (
                <span className="text-[11px] text-indigo-600 font-semibold">
                  ✓ Pre-filled from selected client (override below if needed)
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Client Name"
                placeholder="e.g. Anil Patel / Acme Corp"
                required={!form.client_id}
                value={form.custom_client_name}
                onChange={(e) => set("custom_client_name", e.target.value)}
              />
              <Input
                label="Contact Number / Phone"
                placeholder="e.g. +91 9876543210"
                value={form.custom_client_phone}
                onChange={(e) => set("custom_client_phone", e.target.value)}
              />
              <Input
                label="Client Email / GSTIN (Optional)"
                placeholder="e.g. client@email.com"
                value={form.custom_client_email}
                onChange={(e) => set("custom_client_email", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Payment Status & Preferred Acceptance Method */}
        <div className="space-y-4 bg-indigo-50/50 p-4 sm:p-5 rounded-xl border border-indigo-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Select label="Payment Status" value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="sent">⏳ Unpaid / Pending (Send Bill to Client)</option>
              <option value="paid">✓ Already Paid (Generate Paid Receipt)</option>
            </Select>

            <Select label="Payment Acceptance Method" value={form.payment_method} onChange={(e) => set("payment_method", e.target.value)}>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="upi">UPI / GPay / PhonePe</option>
              <option value="all">All Methods (Bank + UPI)</option>
              <option value="cash">Cash / Cheque</option>
              <option value="card">Credit / Debit Card</option>
            </Select>
          </div>

          {/* Dynamic Payment Details Inputs Based on Selection */}
          {(form.payment_method === "bank_transfer" || form.payment_method === "all") && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 pt-3">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block border-b border-slate-100 pb-2">
                🏦 Bank Transfer Details (Printed on Invoice)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input label="Bank Name" placeholder="e.g. HDFC Bank" value={form.bank_name} onChange={(e) => set("bank_name", e.target.value)} />
                <Input label="Account Holder Name" placeholder="e.g. Brightloop Tech" value={form.account_holder_name} onChange={(e) => set("account_holder_name", e.target.value)} />
                <Input label="Account Number" placeholder="e.g. 50100012345678" value={form.account_number} onChange={(e) => set("account_number", e.target.value)} />
                <Input label="IFSC Code" placeholder="e.g. HDFC0001234" value={form.ifsc_code} onChange={(e) => set("ifsc_code", e.target.value)} />
              </div>
            </div>
          )}

          {(form.payment_method === "upi" || form.payment_method === "all") && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 pt-3">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block border-b border-slate-100 pb-2">
                📱 UPI Payment Details (Printed on Invoice)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="UPI ID / GPay / PhonePe" placeholder="e.g. brightloop@okhdfcbank" value={form.upi_id} onChange={(e) => set("upi_id", e.target.value)} />
              </div>
            </div>
          )}
        </div>

        {/* Line Items Section */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-800">Line Items</label>
          <div className="space-y-2.5">
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 items-center bg-slate-50/50 p-2.5 rounded-xl border border-slate-200">
                <input
                  className="col-span-12 sm:col-span-6 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="Item Description (e.g. Website Design & Branding)"
                  required
                  value={it.description}
                  onChange={(e) => updateItem(i, "description", e.target.value)}
                />
                <input
                  className="col-span-4 sm:col-span-2 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  type="number"
                  placeholder="Qty"
                  required
                  min="1"
                  value={it.quantity}
                  onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                />
                <input
                  className="col-span-6 sm:col-span-3 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  type="number"
                  placeholder="Rate (₹)"
                  required
                  min="0"
                  value={it.unit_price}
                  onChange={(e) => updateItem(i, "unit_price", Number(e.target.value))}
                />
                <button
                  type="button"
                  onClick={() => setItems((arr) => arr.filter((_, idx) => idx !== i))}
                  className="col-span-2 sm:col-span-1 p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors flex items-center justify-center"
                  title="Remove Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setItems((a) => [...a, { description: "", quantity: 1, unit_price: 0 }])}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors mt-2"
          >
            <Plus className="w-4 h-4" /> Add Item Line
          </button>
        </div>

        {/* Calculations: Discounts & Tax */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 pt-4 border-t border-slate-200">
          <Input label="Discount (₹)" type="number" min="0" value={form.discount} onChange={(e) => set("discount", Number(e.target.value))} />
          <Input label="Tax Rate (%)" type="number" min="0" value={form.tax_rate} onChange={(e) => set("tax_rate", Number(e.target.value))} />

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <p className="text-xs font-medium text-slate-500 mb-0.5">Subtotal</p>
            <p className="text-base font-bold text-slate-900">{formatCurrency(subtotal)}</p>
          </div>
          <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100">
            <p className="text-xs font-bold text-indigo-700 mb-0.5">Total Amount</p>
            <p className="text-lg font-black text-indigo-700">{formatCurrency(total)}</p>
          </div>
        </div>

        {/* Notes & Terms */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Terms & Notes (Shown at bottom of invoice)</label>
          <textarea
            rows="3"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            placeholder="e.g. Standard T&C applied. Payment due within 30 days."
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate("/invoices")}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "Generating Invoice..." : "Create & View Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
}
