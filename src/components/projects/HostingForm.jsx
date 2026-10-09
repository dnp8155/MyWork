import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { nextNumber } from "@/lib/finance";
import Modal from "@/components/Modal";
import { Input, Select } from "@/components/FormFields";
import { useToast } from "@/components/ui/use-toast";

const today = () => new Date().toISOString().slice(0, 10);

export default function HostingForm({ project, expenses = [], onSaved, onClose }) {
  const [form, setForm] = useState({
    provider: "", plan: "", name: "", renewal_date: "",
    cost: 0, purchased_by: "us", include_in_cost: true,
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const year = new Date().getFullYear();
      let expense = null;
      if (form.purchased_by === "us" && form.include_in_cost) {
        expense = await base44.entities.Expense.create({
          expense_number: nextNumber("EXP", year, expenses),
          date: today(),
          amount: Number(form.cost) || 0,
          category: "hosting",
          vendor: form.provider,
          project_id: project.id,
          project_name: project.name,
          client_id: project.client_id,
          client_name: project.client_name,
          description: `Hosting: ${form.provider} ${form.plan}`,
          source: "hosting",
        });
      }
      await base44.entities.HostingAccount.create({
        provider: form.provider,
        plan: form.plan,
        name: form.name || form.provider,
        renewal_date: form.renewal_date,
        cost: Number(form.cost) || 0,
        purchased_by: form.purchased_by,
        project_id: project.id,
        project_name: project.name,
        client_id: project.client_id,
        client_name: project.client_name,
        status: "active",
        expense_id: expense?.id || null,
      });
      await base44.entities.AuditLog.create({
        action: "hosting_added", entity: "Project", entity_id: project.id,
        description: `Added hosting ${form.provider} to ${project.name}`,
      });
      toast({ title: "Hosting added" });
      onSaved();
    } catch (err) {
      alert("Error adding hosting: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Add Hosting">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Provider" required value={form.provider} onChange={(e) => set("provider", e.target.value)} placeholder="Hostinger, AWS…" />
          <Input label="Plan" value={form.plan} onChange={(e) => set("plan", e.target.value)} />
          <Input label="Cost (₹)" type="number" value={form.cost} onChange={(e) => set("cost", Number(e.target.value))} />
          <Input label="Renewal Date" type="date" value={form.renewal_date} onChange={(e) => set("renewal_date", e.target.value)} />
          <Select label="Purchased By" value={form.purchased_by} onChange={(e) => set("purchased_by", e.target.value)}>
            <option value="us">We purchased</option>
            <option value="client">Client provided</option>
          </Select>
        </div>
        {form.purchased_by === "us" && (
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input type="checkbox" checked={form.include_in_cost} onChange={(e) => set("include_in_cost", e.target.checked)} className="rounded border-slate-300" />
            Include in project cost (subtracted from profit)
          </label>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50">{saving ? "Saving…" : "Add Hosting"}</button>
        </div>
      </form>
    </Modal>
  );
}