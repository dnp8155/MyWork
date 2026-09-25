import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Upload, FileText, FileArchive, FileSpreadsheet, Download, Trash2, Link2, Copy, Check, Pencil } from "lucide-react";

const TYPE_META = {
  document: { label: "Document", icon: FileText, color: "bg-slate-100 text-slate-600" },
  zip: { label: "Static / Zip", icon: FileArchive, color: "bg-amber-50 text-amber-600" },
  prd: { label: "PRD", icon: FileSpreadsheet, color: "bg-violet-50 text-violet-600" },
};

export default function DocumentsSection({ project, documents, onChanged }) {
  const { toast } = useToast();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState("document");
  const [editingLink, setEditingLink] = useState(null);
  const [linkValue, setLinkValue] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      let uploadedBy = "";
      try {
        const me = await base44.auth.me();
        uploadedBy = me?.full_name || "";
      } catch (err) { /* ignore */ }
      await base44.entities.ProjectDocument.create({
        project_id: project.id,
        project_name: project.name,
        title: file.name,
        file_name: file.name,
        file_url,
        file_type: uploadType,
        uploaded_by: uploadedBy,
      });
      await base44.entities.AuditLog.create({
        action: "created", entity: "ProjectDocument", entity_id: project.id,
        description: `Uploaded ${TYPE_META[uploadType].label} "${file.name}" to ${project.name}`,
      });
      onChanged?.();
      toast({ title: `${TYPE_META[uploadType].label} uploaded` });
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const deleteDoc = async (d) => {
    if (!window.confirm(`Delete "${d.title}"?`)) return;
    await base44.entities.ProjectDocument.delete(d.id);
    await base44.entities.AuditLog.create({
      action: "deleted", entity: "ProjectDocument", entity_id: d.id,
      description: `Deleted document "${d.title}" from ${project.name}`,
    });
    onChanged?.();
    toast({ title: "Deleted" });
  };

  const savePublicLink = async (d) => {
    await base44.entities.ProjectDocument.update(d.id, { public_link: linkValue.trim() });
    setEditingLink(null);
    onChanged?.();
    toast({ title: "Public link saved" });
  };

  const startEditLink = (d) => {
    setEditingLink(d.id);
    setLinkValue(d.public_link || d.file_url || "");
  };

  const copyLink = (url) => {
    navigator.clipboard?.writeText(url);
    toast({ title: "Link copied" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-slate-500">Upload project files — static data/zip archives, PRD documents, and general files. Set a public download link to share with anyone.</p>
      </div>

      {/* Upload row */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 self-start">
          {Object.entries(TYPE_META).map(([key, meta]) => {
            const Icon = meta.icon;
            return (
              <button
                key={key}
                onClick={() => setUploadType(key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition whitespace-nowrap ${
                  uploadType === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {meta.label}
              </button>
            );
          })}
        </div>
        <input ref={inputRef} type="file" className="hidden" onChange={handleFile} accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,.rar,.7z,.md" />
        <button onClick={() => inputRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 sm:ml-auto">
          <Upload className="w-4 h-4" /> {uploading ? "Uploading…" : `Upload ${TYPE_META[uploadType].label}`}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
        {(documents || []).length === 0 && (
          <div className="px-4 py-10 text-center text-slate-400 text-sm">No files yet. Upload a static zip, PRD, or document for this project.</div>
        )}
        {(documents || []).map((d) => {
          const meta = TYPE_META[d.file_type] || TYPE_META.document;
          const Icon = meta.icon;
          const shareLink = d.public_link || d.file_url;
          return (
            <div key={d.id} className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-800 truncate">{d.title}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${meta.color}`}>{meta.label}</span>
                    {d.uploaded_by ? `Uploaded by ${d.uploaded_by}` : "Uploaded"}
                    {d.created_date ? ` • ${new Date(d.created_date).toLocaleDateString()}` : ""}
                  </div>
                </div>
                {editingLink === d.id ? (
                  <button onClick={() => savePublicLink(d)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" title="Save link">
                    <Check className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={() => copyLink(shareLink)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded" title="Copy link">
                    <Copy className="w-4 h-4" />
                  </button>
                )}
                <a href={shareLink} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-indigo-600 rounded" title="Download">
                  <Download className="w-4 h-4" />
                </a>
                <button onClick={() => deleteDoc(d)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {/* Public link row */}
              {editingLink === d.id ? (
                <div className="mt-2 flex items-center gap-2">
                  <Link2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <input
                    value={linkValue}
                    onChange={(e) => setLinkValue(e.target.value)}
                    placeholder="https://public-download-link.com/file.zip"
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-indigo-400 focus:outline-none"
                  />
                  <button onClick={() => setEditingLink(null)} className="text-xs text-slate-400 hover:text-slate-600 px-2">Cancel</button>
                </div>
              ) : (
                <div className="mt-1.5 flex items-center gap-2 pl-12">
                  <Link2 className="w-3 h-3 text-slate-300 flex-shrink-0" />
                  <span className="text-[11px] text-slate-400 truncate flex-1">{shareLink || "No public link set"}</span>
                  <button onClick={() => startEditLink(d)} className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-700">
                    <Pencil className="w-3 h-3" /> {d.public_link ? "Edit" : "Set link"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}