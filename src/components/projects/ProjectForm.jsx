import React, { useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { nextNumber, formatCurrency } from "@/lib/finance";
import Modal from "@/components/Modal";
import { Input, Textarea, Select } from "@/components/FormFields";
import { Image } from "@/components/ui/image";
import { Globe, HardDrive, Upload } from "lucide-react";

const today = () => new Date().toISOString().slice(0, 10);

function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="w-4 h-4 text-slate-500" />}
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      </div>
      {children}
    </div>
  );
}

const defaultForm = () => ({
  logo: "", name: "", client_id: "", contact_name: "", contact_number: "",
  client_email: "", client_address: "", company_name: "",
  base44_account_id: "", base44_project_url: "", github_account_id: "",
  supabase_account_id: "", vercel_account_id: "", status: "pending",
  project_type: "fixed", total_amount: 0, monthly_amount: 0,
  number_of_months: 1, payment_due_day: 1, recurring_start_date: "",
  start_date: "", expected_completion_date: "", description: "",
});

export default function ProjectForm({ clients, base44Accounts, existing, expenses = [], payments = [], project, onClose, onSaved }) {
  const editing = !!project;
  const [form, setForm] = useState(() => editing ? {
    ...defaultForm(),
    logo: project.logo || "",
    name: project.name || "",
    client_id: project.client_id || "",
    contact_name: project.client_name || "",
    contact_number: project.client_phone || "",
    client_email: project.client_email || "",
    client_address: project.client_address || "",
    company_name: project.company_name || "",
    base44_account_id: project.base44_account_id || "",
    base44_project_url: project.base44_project_url || "",
    github_account_id: project.github_account_id || "",
    supabase_account_id: project.supabase_account_id || "",
    vercel_account_id: project.vercel_account_id || "",
    status: project.status || "pending",
    project_type: project.project_type || "fixed",
    total_amount: Number(project.total_amount) || 0,
    monthly_amount: Number(project.monthly_amount) || 0,
    number_of_months: Number(project.number_of_months) || 1,
    payment_due_day: Number(project.payment_due_day) || 1,
    recurring_start_date: project.recurring_start_date || "",
    start_date: project.start_date || "",
    expected_completion_date: project.expected_completion_date || "",
    description: project.description || "",
  } : defaultForm());
  const [domain, setDomain] = useState({ enabled: false, domain_name: "", registrar: "", purchase_date: "", renewal_date: "", renewal_cost: 0, purchased_by: "us", include_in_cost: true });
  const [hosting, setHosting] = useState({ enabled: false, provider: "", plan: "", name: "", renewal_date: "", cost: 0, purchased_by: "us", include_in_cost: true });
  const [advance, setAdvance] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setD = (k, v) => setDomain((d) => ({ ...d, [k]: v }));
  const setH = (k, v) => setHosting((h) => ({ ...h, [k]: v }));

  const fixedTotal = Number(form.total_amount) || 0;
  const accBy = (cat) => base44Accounts.filter((a) => (a.category || "base44") === cat);

  const uploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileName = Math.random().toString(36).substring(2) + '_' + file.name;
      const { data: uploadData, error } = await supabase.storage.from('public').upload(fileName, file);
      if (error) throw error;
      const file_url = supabase.storage.from('public').getPublicUrl(fileName).data.publicUrl;
      set("logo", file_url);
    } catch (err) {
      alert("Logo upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const year = new Date().getFullYear();
      const salaried = form.project_type === "recurring";
      const contactName = form.contact_name || "";
      const total = salaried
        ? (Number(form.monthly_amount) || 0) * (Number(form.number_of_months) || 0)
        : fixedTotal;
      let recurring_end_date = "";
      if (salaried && form.recurring_start_date) {
        const sd = new Date(form.recurring_start_date);
        sd.setMonth(sd.getMonth() + (Number(form.number_of_months) || 1) - 1);
        recurring_end_date = sd.toISOString().slice(0, 10);
      }

      const payload = {
        name: form.name,
        logo: form.logo,
        client_id: form.client_id,
        client_name: contactName,
        company_name: form.company_name || "",
        client_email: form.client_email || "",
        client_phone: form.contact_number || "",
        client_address: form.client_address || "",
        description: form.description,
        status: form.status,
        start_date: form.start_date,
        expected_completion_date: form.expected_completion_date,
        base44_account_id: form.base44_account_id,
        base44_project_url: form.base44_project_url,
        github_account_id: form.github_account_id,
        supabase_account_id: form.supabase_account_id,
        vercel_account_id: form.vercel_account_id,
        project_type: form.project_type,
        total_amount: total,
        monthly_amount: Number(form.monthly_amount) || 0,
        recurring_start_date: form.recurring_start_date,
        recurring_end_date,
        number_of_months: Number(form.number_of_months) || 0,
        payment_due_day: Number(form.payment_due_day) || 1,
        billing_frequency: "monthly",
      };

      // ---- Edit mode: just update the project ----
      if (editing) {
        await supabase.from('projects').update(project.id, payload);
        await supabase.from('audit_logs').insert({ action: "updated", entity: "Project", entity_id: project.id, description: `Updated project ${form.name}` });
        onSaved();
        return;
      }

      // ---- Create mode ----
      const { data: created, error: createdError } = await supabase.from('projects').insert({
        ...payload,
        project_number: nextNumber("PRJ", year, existing),
      }).select().single();
      if (createdError) throw createdError;

      // Fixed: record advance payment (auto-subtracted from pending amount)
      if (!salaried && Number(advance) > 0) {
        const { data: payment, error: paymentError } = await supabase.from('payments').insert({
          payment_number: nextNumber("PAY", year, payments),
          date: today(),
          amount: Number(advance),
          client_id: form.client_id,
          client_name: contactName,
          project_id: created.id,
          project_name: created.name,
          payment_method: "bank_transfer",
          reference: "Advance",
          notes: "Advance paid at project creation",
          type: "project",
        }).select().single();
        if (paymentError) throw paymentError;
        await supabase.from('transactions').insert({
          transaction_number: `TXN-${Date.now()}`, date: today(), type: "income", category: "project_payment",
          amount: Number(advance), project_id: created.id, project_name: created.name,
          client_id: form.client_id, client_name: contactName, payment_method: "bank_transfer",
          description: `Advance payment for ${form.name}`, source_entity: "payment", source_id: payment.id,
        });
      }

      // Salaried: generate monthly payment schedule
      if (salaried && form.recurring_start_date) {
        const schedules = [];
        const start = new Date(form.recurring_start_date);
        for (let i = 0; i < (Number(form.number_of_months) || 0); i++) {
          const d = new Date(start.getFullYear(), start.getMonth() + i, form.payment_due_day || 1);
          schedules.push({
            project_id: created.id,
            project_name: created.name,
            client_id: form.client_id,
            client_name: contactName,
            due_date: d.toISOString().slice(0, 10),
            amount: Number(form.monthly_amount) || 0,
            paid_amount: 0,
            status: "upcoming",
            installment_number: i + 1,
          });
        }
        if (schedules.length) await supabase.from('recurring_payment_schedules').insert(schedules);
      }

      // Domain module
      if (domain.enabled && domain.domain_name) {
        const expense = (domain.purchased_by === "us" && domain.include_in_cost)
          ? await supabase.from('expenses').insert({
              expense_number: nextNumber("EXP", year, expenses),
              date: domain.purchase_date || today(),
              amount: Number(domain.renewal_cost) || 0,
              category: "domain",
              vendor: domain.registrar,
              project_id: created.id,
              project_name: created.name,
              client_id: form.client_id,
              client_name: contactName,
              description: `Domain: ${domain.domain_name}`,
              source: "domain",
            })
          : null;
        await supabase.from('domains').insert({
          domain_name: domain.domain_name,
          registrar: domain.registrar,
          purchase_date: domain.purchase_date,
          renewal_date: domain.renewal_date,
          purchase_cost: Number(domain.renewal_cost) || 0,
          renewal_cost: Number(domain.renewal_cost) || 0,
          purchased_by: domain.purchased_by,
          project_id: created.id,
          project_name: created.name,
          client_id: form.client_id,
          client_name: contactName,
          status: "active",
          expense_id: expense?.id || "",
        });
      }

      // Hosting module
      if (hosting.enabled && hosting.provider) {
        const expense = (hosting.purchased_by === "us" && hosting.include_in_cost)
          ? await supabase.from('expenses').insert({
              expense_number: nextNumber("EXP", year, expenses),
              date: today(),
              amount: Number(hosting.cost) || 0,
              category: "hosting",
              vendor: hosting.provider,
              project_id: created.id,
              project_name: created.name,
              client_id: form.client_id,
              client_name: contactName,
              description: `Hosting: ${hosting.provider} ${hosting.plan}`,
              source: "hosting",
            })
          : null;
        await supabase.from('hosting_accounts').insert({
          provider: hosting.provider,
          plan: hosting.plan,
          name: hosting.name || hosting.provider,
          renewal_date: hosting.renewal_date,
          cost: Number(hosting.cost) || 0,
          purchased_by: hosting.purchased_by,
          project_id: created.id,
          project_name: created.name,
          client_id: form.client_id,
          client_name: contactName,
          status: "active",
          expense_id: expense?.id || "",
        });
      }

      await supabase.from('audit_logs').insert({ action: "created", entity: "Project", entity_id: created.id, description: `Created project ${form.name}` });
      onSaved();
    } catch (err) {
      alert("Error saving project: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={editing ? "Edit Project" : "New Project"} size="xl">
      <form onSubmit={submit} className="space-y-6">
        <Section title="Basic Info">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              {form.logo ? (
                <Image src={form.logo} className="w-14 h-14 rounded-lg border border-slate-200" fittingType="fill" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                  <Upload className="w-5 h-5" />
                </div>
              )}
              <label className="px-3 py-2 text-xs bg-slate-100 text-slate-600 rounded-lg cursor-pointer hover:bg-slate-200">
                {uploading ? "Uploading…" : "Upload Logo"}
                <input type="file" accept="image/*" className="hidden" onChange={uploadLogo} disabled={uploading} />
              </label>
            </div>
            <Input label="Project Name" required value={form.name} onChange={(e) => set("name", e.target.value)} />
            <Input label="Client Name" required value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Contact Number" value={form.contact_number} onChange={(e) => set("contact_number", e.target.value)} />
              <Input label="Company Name" value={form.company_name} onChange={(e) => set("company_name", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Client Email" type="email" value={form.client_email} onChange={(e) => set("client_email", e.target.value)} />
              <Input label="Client Address" value={form.client_address} onChange={(e) => set("client_address", e.target.value)} />
            </div>
            <Select label="Base44 Account" value={form.base44_account_id} onChange={(e) => set("base44_account_id", e.target.value)}>
              <option value="">None</option>
              {accBy("base44").map((a) => <option key={a.id} value={a.id}>{a.account_name}</option>)}
            </Select>
            <Input label="Base44 Project URL" value={form.base44_project_url} onChange={(e) => set("base44_project_url", e.target.value)} />
            <Select label="GitHub Account" value={form.github_account_id} onChange={(e) => set("github_account_id", e.target.value)}>
              <option value="">None</option>
              {accBy("github").map((a) => <option key={a.id} value={a.id}>{a.account_name}</option>)}
            </Select>
            <Select label="Supabase Account" value={form.supabase_account_id} onChange={(e) => set("supabase_account_id", e.target.value)}>
              <option value="">None</option>
              {accBy("supabase").map((a) => <option key={a.id} value={a.id}>{a.account_name}</option>)}
            </Select>
            <Select label="Vercel Account" value={form.vercel_account_id} onChange={(e) => set("vercel_account_id", e.target.value)}>
              <option value="">None</option>
              {accBy("vercel").map((a) => <option key={a.id} value={a.id}>{a.account_name}</option>)}
            </Select>
          </div>
        </Section>

        <Section title="Payment">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Select label="Type" value={form.project_type} onChange={(e) => set("project_type", e.target.value)}>
              <option value="fixed">Fixed</option>
              <option value="recurring">Salaried</option>
            </Select>
            <Select label="Status" value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </Select>
            {form.project_type === "recurring" && (
              <>
                <Input label="Start Date" type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
                <Input label="End / Completion Date" type="date" value={form.expected_completion_date} onChange={(e) => set("expected_completion_date", e.target.value)} />
              </>
            )}
          </div>
          {form.project_type === "fixed" ? (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <Input label="Project Price (₹)" type="number" value={form.total_amount} onChange={(e) => set("total_amount", Number(e.target.value))} />
              {!editing && (
                <>
                  <Input label="Advance Paid (₹)" type="number" value={advance} onChange={(e) => setAdvance(Number(e.target.value))} />
                  <div className="flex flex-col justify-center">
                    <p className="text-xs text-slate-400">Remaining Amount</p>
                    <p className="text-sm font-semibold text-slate-800">{formatCurrency(Math.max(fixedTotal - (Number(advance) || 0), 0))}</p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <Input label="Monthly Salary (₹)" type="number" value={form.monthly_amount} onChange={(e) => set("monthly_amount", Number(e.target.value))} />
              <Input label="No. of Months" type="number" value={form.number_of_months} onChange={(e) => set("number_of_months", Number(e.target.value))} />
              <Input label="Start Date" type="date" value={form.recurring_start_date} onChange={(e) => set("recurring_start_date", e.target.value)} />
              <Input label="Payment Due Day" type="number" value={form.payment_due_day} onChange={(e) => set("payment_due_day", Number(e.target.value))} />
              <div className="col-span-2 sm:col-span-4 text-xs text-slate-500">
                Contract Value: {formatCurrency((Number(form.monthly_amount) || 0) * (Number(form.number_of_months) || 0))}
              </div>
            </div>
          )}
        </Section>

        {!editing && (
          <>
            <Section title="Domain (optional)" icon={Globe}>
              <label className="flex items-center gap-2 text-sm text-slate-700 mb-3">
                <input type="checkbox" checked={domain.enabled} onChange={(e) => setD("enabled", e.target.checked)} className="rounded border-slate-300" />
                Add a domain for this project
              </label>
              {domain.enabled && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <Input label="Domain Name" value={domain.domain_name} onChange={(e) => setD("domain_name", e.target.value)} placeholder="example.com" />
                  <Input label="Registrar" value={domain.registrar} onChange={(e) => setD("registrar", e.target.value)} />
                  <Input label="Cost (₹)" type="number" value={domain.renewal_cost} onChange={(e) => setD("renewal_cost", Number(e.target.value))} />
                  <Input label="Purchase Date" type="date" value={domain.purchase_date} onChange={(e) => setD("purchase_date", e.target.value)} />
                  <Input label="Renewal Date" type="date" value={domain.renewal_date} onChange={(e) => setD("renewal_date", e.target.value)} />
                  <Select label="Purchased By" value={domain.purchased_by} onChange={(e) => setD("purchased_by", e.target.value)}>
                    <option value="us">We purchased</option>
                    <option value="client">Client provided</option>
                  </Select>
                  {domain.purchased_by === "us" && (
                    <label className="col-span-2 sm:col-span-3 flex items-center gap-2 text-xs text-slate-600">
                      <input type="checkbox" checked={domain.include_in_cost} onChange={(e) => setD("include_in_cost", e.target.checked)} className="rounded border-slate-300" />
                      Include in project cost (this amount will be subtracted from profit)
                    </label>
                  )}
                </div>
              )}
            </Section>

            <Section title="Hosting (optional)" icon={HardDrive}>
              <label className="flex items-center gap-2 text-sm text-slate-700 mb-3">
                <input type="checkbox" checked={hosting.enabled} onChange={(e) => setH("enabled", e.target.checked)} className="rounded border-slate-300" />
                Add hosting for this project
              </label>
              {hosting.enabled && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <Input label="Provider" value={hosting.provider} onChange={(e) => setH("provider", e.target.value)} placeholder="Hostinger, AWS…" />
                  <Input label="Plan" value={hosting.plan} onChange={(e) => setH("plan", e.target.value)} />
                  <Input label="Cost (₹)" type="number" value={hosting.cost} onChange={(e) => setH("cost", Number(e.target.value))} />
                  <Input label="Renewal Date" type="date" value={hosting.renewal_date} onChange={(e) => setH("renewal_date", e.target.value)} />
                  <Select label="Purchased By" value={hosting.purchased_by} onChange={(e) => setH("purchased_by", e.target.value)}>
                    <option value="us">We purchased</option>
                    <option value="client">Client provided</option>
                  </Select>
                  {hosting.purchased_by === "us" && (
                    <label className="col-span-2 sm:col-span-3 flex items-center gap-2 text-xs text-slate-600">
                      <input type="checkbox" checked={hosting.include_in_cost} onChange={(e) => setH("include_in_cost", e.target.checked)} className="rounded border-slate-300" />
                      Include in project cost (this amount will be subtracted from profit)
                    </label>
                  )}
                </div>
              )}
            </Section>
          </>
        )}

        <Textarea label="Description" value={form.description} onChange={(e) => set("description", e.target.value)} />

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{saving ? "Saving…" : editing ? "Save Changes" : "Create Project"}</button>
        </div>
      </form>
    </Modal>
  );
}