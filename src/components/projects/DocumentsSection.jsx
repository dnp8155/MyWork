import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Upload, FileText, Download, Trash2 } from "lucide-react";

export default function DocumentsSection({ project, documents, onChanged }) {
  const { toast } = useToast();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

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
        uploaded_by: uploadedBy,
      });
      await base44.entities.AuditLog.create({
        action: "created", entity: "ProjectDocument", entity_id: project.id,
        description: `Uploaded document "${file.name}" to ${project.name}`,
      });
      onChanged?.();
      toast({ title: "Document uploaded" });
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const deleteDoc = async (d) => {
    if (!window.confirm(`Delete document "${d.title}"?`)) return;
    await base44.entities.ProjectDocument.delete(d.id);
    await base44.entities.AuditLog.create({
      action: "deleted", entity: "ProjectDocument", entity_id: d.id,
      description: `Deleted document "${d.title}" from ${project.name}`,
    });
    onChanged?.();
    toast({ title: "Document deleted" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-slate-500">All files and documents related to this project — PDFs, images, contracts, exports.</p>
        <input ref={inputRef} type="file" className="hidden" onChange={handleFile} accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip" />
        <button onClick={() => inputRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          <Upload className="w-4 h-4" /> {uploading ? "Uploading…" : "Upload Document"}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
        {(documents || []).length === 0 && (
          <div className="px-4 py-10 text-center text-slate-400 text-sm">No documents yet. Upload the first file for this project.</div>
        )}
        {(documents || []).map((d) => (
          <div key={d.id} className="flex items-center gap-3 px-4 py-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-slate-800 truncate">{d.title}</div>
              <div className="text-xs text-slate-400">
                {d.uploaded_by ? `Uploaded by ${d.uploaded_by}` : "Uploaded"} • {d.created_date ? new Date(d.created_date).toLocaleDateString() : ""}
              </div>
            </div>
            <a href={d.file_url} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-indigo-600 rounded" title="Download">
              <Download className="w-4 h-4" />
            </a>
            <button onClick={() => deleteDoc(d)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}