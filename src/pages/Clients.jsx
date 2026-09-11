import React, { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { base44 } from "@/api/base44Client";
import { computeClientFinancials, nextNumber, formatCurrency } from "@/lib/finance";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import { Input, Textarea } from "@/components/FormFields";
import { useNavigate } from "react-router-dom";
import { Plus, Users, Wallet, Clock, TrendingUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Clients() {
  const { clients, projects, payments, expenses, loading, refresh } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const filtered = (clients || []).filter((c) => !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.company_name?.toLowerCase().includes(search.toLowerCase()));

  const totalBusiness = (clients || []).reduce((s, c) => s + computeClientFinancials(c, projects, payments, expenses).totalBusiness, 0);
  const totalReceived = (clients || []).reduce((s, c) => s + computeClientFinancials(c, projects, payments, expenses).totalReceived, 0);
  const totalPending = (clients || []).reduce((s, c) => s + computeClientFinancials(c, projects, payments, expenses).totalPending, 0);

  return (
    <div>
      <PageHeader title="Clients" subtitle="Manage client relationships and financials"
        actions={<button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"><Plus className="w-4 h-4" /> New Client</button>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Clients" value={clients?.length || 0} icon={Users} tone="indigo" isCurrency={false} />
        <StatCard label="Total Business" value={totalBusiness} icon={Wallet} tone="blue" />
        <StatCard label="Total Received" value={totalReceived} icon={TrendingUp} tone="green" />
        <StatCard label="Total Pending" value={totalPending} icon={Clock} tone="amber" />
      </div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients…" className="w-full sm:w-80 px-3 py-2 text-sm rounded-lg border border-slate-300 mb-4 focus:outline-none focus:border-indigo-400" />
      {loading ? <div className="h-64 bg-slate-100 rounded-xl animate-pulse" /> : filtered.length === 0 ? (
        <EmptyState title="No clients" message="Add a client to start linking projects." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const f = computeClientFinancials(c, projects, payments, expenses);
            return (
              <div key={c.id} onClick={() => navigate(`/clients/${c.id}`)} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">{c.name?.charAt(0)}</div>
                  <span className="text-xs text-slate-400">{c.client_id}</span>
                </div>
                <h3 className="font-semibold text-slate-900">{c.name}</h3>
                <p className="text-sm text-slate-500">{c.company_name || "—"}</p>
                <p className="text-xs text-slate-400 mt-1">{c.email}</p>
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100">
                  <div><p className="text-[10px] text-slate-400 uppercase">Business</p><p className="text-sm font-medium text-slate-800">{formatCurrency(f.totalBusiness)}</p></div>
                  <div><p className="text-[10px] text-slate-400 uppercase">Received</p><p className="text-sm font-medium text-emerald-600">{formatCurrency(f.totalReceived)}</p></div>
                  <div><p className="text-[10px] text-slate-400 uppercase">Pending</p><p className="text-sm font-medium text-amber-600">{formatCurrency(f.totalPending)}</p></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {modalOpen && <ClientForm existing={clients || []} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); refresh(); toast({ title: "Client created" }); }} />}
    </div>
  );
}

function ClientForm({ existing, onClose, onSaved }) {
  const [form, setForm] = useState({ name: "", company_name: "", email: "", phone: "", whatsapp: "", address: "", gst_number: "", pan: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const client_id = nextNumber("CL", null, existing.map((c) => ({ client_id: c.client_id })));
      await base44.entities.Client.create({ ...form, client_id });
      await base44.entities.AuditLog.create({ action: "created", entity: "Client", description: `Created client ${form.name}` });
      onSaved();
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  };
  return (
    <Modal open onClose={onClose} title="New Client" size="lg">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Name" required value={form.name} onChange={(e) => set("name", e.target.value)} />
          <Input label="Company Name" value={form.company_name} onChange={(e) => set("company_name", e.target.value)} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          <Input label="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          <Input label="WhatsApp" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
          <Input label="GST Number" value={form.gst_number} onChange={(e) => set("gst_number", e.target.value)} />
          <Input label="PAN" value={form.pan} onChange={(e) => set("pan", e.target.value)} />
        </div>
        <Textarea label="Address" value={form.address} onChange={(e) => set("address", e.target.value)} />
        <Textarea label="Notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50">{saving ? "Saving…" : "Create"}</button>
        </div>
      </form>
    </Modal>
  );
}