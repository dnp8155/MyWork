import React, { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import PageHeader from "@/components/PageHeader";
import { Input, Textarea } from "@/components/FormFields";
import { useToast } from "@/components/ui/use-toast";
import { Save, Building2, DollarSign } from "lucide-react";

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [tab, setTab] = useState("company");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from('company_settings').select('*').then((s) => setSettings(s[0] || null));
  }, []);

  const set = (k, v) => setSettings((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      if (settings.id) await supabase.from('company_settings').update(settings.id, settings);
      else { const created = await supabase.from('company_settings').insert(settings); setSettings(created); }
      await supabase.from('audit_logs').insert({ action: "updated", entity: "CompanySettings", description: "Updated company settings" });
      toast({ title: "Settings saved" });
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  };

  if (!settings) {
    return (
      <div>
        <PageHeader title="Settings" />
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
          <p className="text-sm text-slate-500 mb-3">No settings configured yet.</p>
          <button onClick={() => setSettings({ company_name: "My Agency", currency: "INR", currency_symbol: "₹", tax_rate: 18, invoice_prefix: "INV", quotation_prefix: "QT", payment_prefix: "PAY", expense_prefix: "EXP", project_prefix: "PRJ", client_prefix: "CL" })} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg">Initialize Settings</button>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "company", label: "Company", icon: Building2 },
    { key: "financial", label: "Financial", icon: DollarSign },
    { key: "numbering", label: "Numbering", icon: DollarSign },
  ];

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure company and financial preferences"
        actions={<button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"><Save className="w-4 h-4" /> {saving ? "Saving…" : "Save"}</button>} />
      <div className="flex gap-1 mb-4 border-b border-slate-200">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t.key ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500"}`}>{t.label}</button>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5 max-w-2xl">
        {tab === "company" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Company Name" value={settings.company_name} onChange={(e) => set("company_name", e.target.value)} />
              <Input label="Email" value={settings.email} onChange={(e) => set("email", e.target.value)} />
              <Input label="Phone" value={settings.phone} onChange={(e) => set("phone", e.target.value)} />
              <Input label="Website" value={settings.website} onChange={(e) => set("website", e.target.value)} />
              <Input label="GST Number" value={settings.gst_number} onChange={(e) => set("gst_number", e.target.value)} />
              <Input label="PAN" value={settings.pan} onChange={(e) => set("pan", e.target.value)} />
            </div>
            <Textarea label="Address" value={settings.address} onChange={(e) => set("address", e.target.value)} />
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Company Logo (invoice header)</label>
              <div className="flex items-center gap-3">
                {settings.logo ? (
                  <img src={settings.logo} alt="logo" className="h-14 w-14 rounded-lg border border-slate-200 object-contain bg-white" />
                ) : (
                  <div className="h-14 w-14 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-300"><Building2 className="w-6 h-6" /></div>
                )}
                <label className="px-3 py-2 text-sm border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                  {uploading ? "Uploading…" : "Upload Logo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploading(true);
                      try {
                        const fileName = Math.random().toString(36).substring(2) + '_' + file.name;
      const { data: uploadData, error } = await supabase.storage.from('public').upload(fileName, file);
      if (error) throw error;
      const file_url = supabase.storage.from('public').getPublicUrl(fileName).data.publicUrl;
                        set("logo", file_url);
                      } catch (err) { alert(err.message); } finally { setUploading(false); }
                    }}
                  />
                </label>
                {settings.logo && <button onClick={() => set("logo", "")} className="text-sm text-rose-500 hover:underline">Remove</button>}
              </div>
            </div>
          </div>
        )}
        {tab === "financial" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Currency" value={settings.currency} onChange={(e) => set("currency", e.target.value)} />
              <Input label="Currency Symbol" value={settings.currency_symbol} onChange={(e) => set("currency_symbol", e.target.value)} />
              <Input label="Default Tax / GST Rate (%)" type="number" value={settings.tax_rate} onChange={(e) => set("tax_rate", Number(e.target.value))} />
              <Input label="Financial Year" value={settings.financial_year} onChange={(e) => set("financial_year", e.target.value)} />
            </div>
          </div>
        )}
        {tab === "numbering" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Input label="Invoice Prefix" value={settings.invoice_prefix} onChange={(e) => set("invoice_prefix", e.target.value)} />
              <Input label="Quotation Prefix" value={settings.quotation_prefix} onChange={(e) => set("quotation_prefix", e.target.value)} />
              <Input label="Payment Prefix" value={settings.payment_prefix} onChange={(e) => set("payment_prefix", e.target.value)} />
              <Input label="Expense Prefix" value={settings.expense_prefix} onChange={(e) => set("expense_prefix", e.target.value)} />
              <Input label="Project Prefix" value={settings.project_prefix} onChange={(e) => set("project_prefix", e.target.value)} />
              <Input label="Client Prefix" value={settings.client_prefix} onChange={(e) => set("client_prefix", e.target.value)} />
            </div>
            <p className="text-xs text-slate-400">Numbers are auto-generated as PREFIX-YEAR-XXXX (e.g. {settings.invoice_prefix}-2026-0001).</p>
          </div>
        )}
      </div>
    </div>
  );
}