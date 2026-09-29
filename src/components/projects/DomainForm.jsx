import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { nextNumber } from "@/lib/finance";
import Modal from "@/components/Modal";
import { Input, Select } from "@/components/FormFields";
import { useToast } from "@/components/ui/use-toast";

const today = () => new Date().toISOString().slice(0, 10);

export default function DomainForm({ project, expenses = [], onSaved, onClose }) {
  const [mode, setMode] = useState("existing"); // existing | new
  const [allDomains, setAllDomains] = useState([]);
  const [loadingDomains, setLoadingDomains] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState({
    domain_name: "", registrar: "", purchase_date: today(), renewal_date: "",
    renewal_cost: 0, purchased_by: "us", include_in_cost: true,
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.entities.Domain.filter({}, { sort: "-created_date", limit: 200 });
        // domains not yet linked to any project are linkable; also keep current project's for re-edit
        const linkable = (res.items || res || []).filter(
          (d) => !d.project_id || d.project_id === project.id
        );
        setAllDomains(linkable);
      } catch (e) {
        setAllDomains([]);
      } finally {
        setLoadingDomains(false);
      }
    })();
  }, [project.id]);

  const pickDomain = (id) => {
    setSelectedId(id);
    const d = allDomains.find((x) => x.id === id);
    if (!d) return;
    setForm({
      domain_name: d.domain_name || "",
      registrar: d.registrar || "",
      purchase_date: d.purchase_date || today(),
      renewal_date: d.renewal_date || "",
      renewal_cost: d.renewal_cost || d.purchase_cost || 0,
      purchased_by: d.purchased_by || "us",
      include_in_cost: true,
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const year = new Date().getFullYear();
      let expense = null;
      if (form.purchased_by === "us" && form.include_in_cost) {
        expense = await base44.entities.Expense.create({
          expense_number: nextNumber("EXP", year, expenses),
          date: form.purchase_date || today(),
          amount: Number(form.renewal_cost) || 0,
          category: "domain",
          vendor: form.registrar,
          project_id: project.id,
          project_name: project.name,
          client_id: project.client_id,
          client_name: project.client_name,
          description: `Domain: ${form.domain_name}`,
          source: "domain",
        });
      }
      const payload = {
        registrar: form.registrar,
        purchase_date: form.purchase_date,
        renewal_date: form.renewal_date,
        purchase_cost: Number(form.renewal_cost) || 0,
        renewal_cost: Number(form.renewal_cost) || 0,
        purchased_by: form.purchased_by,
        project_id: project.id,
        project_name: project.name,
        client_id: project.client_id,
        client_name: project.client_name,
        status: "active",
        expense_id: expense?.id || null,
      };
      if (mode === "existing" && selectedId) {
        await base44.entities.Domain.update(selectedId, payload);
      } else {
        await base44.entities.Domain.create({ domain_name: form.domain_name, ...payload });
      }
      await base44.entities.AuditLog.create({
        action: "domain_added", entity: "Project", entity_id: project.id,
        description: `Linked domain ${form.domain_name} to ${project.name}`,
      });
      toast({ title: "Domain linked" });
      onSaved();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const linkable = allDomains.filter((d) => !d.project_id || d.project_id === project.id);

  return (
    <Modal open onClose={onClose} title="Add Domain">
      <form onSubmit={submit} className="space-y-4">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
          <button type="button" onClick={() => setMode("existing")} className={`flex-1 px-3 py-1.5 text-xs rounded-md ${mode === "existing" ? "bg-white shadow text-slate-900" : "text-slate-500"}`}>Select Existing</button>
          <button type="button" onClick={() => setMode("new")} className={`flex-1 px-3 py-1.5 text-xs rounded-md ${mode === "new" ? "bg-white shadow text-slate-900" : "text-slate-500"}`}>Add New</button>
        </div>

        {mode === "existing" && (
          <Select label="Select Domain" value={selectedId} onChange={(e) => pickDomain(e.target.value)} disabled={loadingDomains}>
            <option value="">{loadingDomains ? "Loading…" : linkable.length ? "— Choose a domain —" : "No unlinked domains available"}</option>
            {linkable.map((d) => (
              <option key={d.id} value={d.id}>{d.domain_name}{d.registrar ? ` (${d.registrar})` : ""}</option>
            ))}
          </Select>
        )}

        <Input label="Domain Name" required value={form.domain_name} onChange={(e) => set("domain_name", e.target.value)} placeholder="example.com" disabled={mode === "existing" && !!selectedId} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Registrar" value={form.registrar} onChange={(e) => set("registrar", e.target.value)} />
          <Input label="Cost (₹)" type="number" value={form.renewal_cost} onChange={(e) => set("renewal_cost", Number(e.target.value))} />
          <Input label="Purchase Date" type="date" value={form.purchase_date} onChange={(e) => set("purchase_date", e.target.value)} />
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
          <button type="submit" disabled={saving || (mode === "existing" && !selectedId)} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50">{saving ? "Saving…" : mode === "existing" ? "Link Domain" : "Add Domain"}</button>
        </div>
      </form>
    </Modal>
  );
}