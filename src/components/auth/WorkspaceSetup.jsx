import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image } from "@/components/ui/image";
import { Loader2, Upload } from "lucide-react";

const CURRENCIES = [
  ["INR", "₹"],
  ["USD", "$"],
  ["EUR", "€"],
  ["GBP", "£"],
];

export default function WorkspaceSetupForm({ defaultName, onComplete, onSkip }) {
  const [companyName, setCompanyName] = useState(defaultName || "");
  const [logo, setLogo] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [country, setCountry] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setLogo(file_url);
    } catch {
      setError("Logo upload failed. You can add it later in Settings.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError("Please enter your business or company name.");
      return;
    }
    setError("");
    setSaving(true);
    const symbol = (CURRENCIES.find(([c]) => c === currency) || ["", ""])[1];
    try {
      await onComplete({
        company_name: companyName.trim(),
        logo,
        currency,
        currency_symbol: symbol,
        country: country.trim(),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p role="alert" className="text-sm text-rose-600">{error}</p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="companyName">Business / Company Name</Label>
        <Input
          id="companyName"
          autoFocus
          placeholder="e.g. Acme Studio"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="h-12 bg-white"
          disabled={saving}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="logo">Company Logo</Label>
        <div className="flex items-center gap-3">
          <label className={`flex items-center gap-2 h-12 px-4 rounded-md border border-slate-300 bg-white text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors ${uploading || saving ? "pointer-events-none opacity-60" : ""}`}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Uploading..." : logo ? "Replace logo" : "Upload logo"}
            <input id="logo" type="file" accept="image/*" className="sr-only" onChange={handleLogo} disabled={uploading || saving} />
          </label>
          {logo && <Image src={logo} fittingType="fit" className="h-12 w-12 rounded-xl border border-slate-200" alt="Company logo preview" />}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="currency">Currency</Label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="flex h-12 w-full rounded-md border border-input bg-white px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
            disabled={saving}
          >
            {CURRENCIES.map(([code, symbol]) => (
              <option key={code} value={code}>{symbol} {code}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            placeholder="e.g. India"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="h-12 bg-white"
            disabled={saving}
          />
        </div>
      </div>

      <Button type="submit" className="w-full h-12 font-semibold bg-indigo-600 hover:bg-indigo-700" disabled={saving || uploading}>
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Save & Continue"
        )}
      </Button>

      <button
        type="button"
        onClick={onSkip}
        className="w-full text-sm text-slate-500 hover:text-slate-800 transition-colors py-1"
        disabled={saving}
      >
        Skip for now
      </button>
    </form>
  );
}