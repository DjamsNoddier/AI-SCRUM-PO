import { useState } from "react";
import type { ProjectDocument } from "../../api/projectService";
import { Upload } from "lucide-react";
import api from "../../../../lib/axios";

type Props = {
  documents: ProjectDocument[];
  projectId: string;
  refreshDocuments: () => void;
};

export default function ProjectDocumentsTab({
  documents,
  projectId,
  refreshDocuments,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [selectedDoc, setSelectedDoc] = useState<ProjectDocument | null>(null);

  function openModal(doc: ProjectDocument) {
    setSelectedDoc(doc);
  }

  function closeModal() {
    setSelectedDoc(null);
  }

  /* ------------------------------------------------------ */
  /* 🔥 DELETE DOCUMENT                                     */
  /* ------------------------------------------------------ */
  async function handleDelete(docId: number) {
    if (!confirm("Delete this document?")) return;

    try {
      await api.delete(`/projects/${projectId}/documents/${docId}`);
      await refreshDocuments();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  /* ------------------------------------------------------ */
  /* 🔼 Upload Handler                                      */
  /* ------------------------------------------------------ */
  async function handleUpload(files: FileList) {
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        await api.post(`/projects/${projectId}/documents/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      refreshDocuments();
    } catch (err) {
      console.error("Upload error:", err);
    }

    setUploading(false);
  }

  /* ------------------------------------------------------ */
  /* 🟣 Drag & Drop events                                   */
  /* ------------------------------------------------------ */
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleUpload(e.dataTransfer.files);
  };

  /* ------------------------------------------------------ */
  /* MODAL — Document AI Analysis                           */
  /* ------------------------------------------------------ */
  const AnalysisModal = () =>
    selectedDoc && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-lg rounded-3xl bg-slate-900 p-6 shadow-xl border border-white/10">
          <h2 className="text-lg font-semibold text-slate-100">
            Document analysis
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {selectedDoc.original_name}
          </p>

          <div className="mt-4 space-y-4 text-sm text-slate-300">
            {selectedDoc.ai_summary && (
              <div>
                <p className="text-xs text-slate-400 uppercase">Summary</p>
                <p className="mt-1">{selectedDoc.ai_summary}</p>
              </div>
            )}

            {selectedDoc.ai_decisions?.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 uppercase">Decisions</p>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  {selectedDoc.ai_decisions.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedDoc.ai_risks?.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 uppercase">Risks</p>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  {selectedDoc.ai_risks.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={closeModal}
            className="mt-6 w-full rounded-xl bg-white/10 py-2 text-sm text-slate-200 hover:bg-white/20"
          >
            Close
          </button>
        </div>
      </div>
    );

  /* ------------------------------------------------------ */
  /* RENDER                                                 */
  /* ------------------------------------------------------ */
  return (
    <div className="space-y-10">
      <AnalysisModal />

      {/* -------------------------------------------------- */}
      {/* UPLOAD BOX – UX PREMIUM                            */}
      {/* -------------------------------------------------- */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`
          relative flex h-48 cursor-pointer flex-col items-center justify-center 
          rounded-3xl border transition-all duration-300 backdrop-blur-xl p-6

          ${isDragging
            ? "border-fuchsia-400 bg-fuchsia-600/10 shadow-[0_0_40px_rgba(236,72,153,0.45)] scale-[1.03]"
            : "border-white/10 bg-white/5 shadow-[0_0_20px_rgba(15,23,42,0.25)] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:border-white/20 hover:bg-white/10"
          }
        `}
      >
        <div
          className={`
            mb-3 transition-all duration-300
            ${isDragging
              ? "text-fuchsia-300 scale-125 rotate-6"
              : "text-slate-300"
            }
          `}
        >
          {isDragging ? (
            <svg
              className="h-10 w-10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 4v16m8-8H4" />
            </svg>
          ) : (
            <Upload className="h-8 w-8" />
          )}
        </div>

        {!isDragging ? (
          <>
            <p className="text-sm font-medium text-slate-100">
              Drag & drop your documents here
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              or click to upload (PDF, DOCX, TXT)
            </p>
          </>
        ) : (
          <p className="text-sm font-semibold text-fuchsia-300 animate-pulse">
            Drop to upload →
          </p>
        )}

        <input
          type="file"
          multiple
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => handleUpload(e.target.files!)}
        />

        {uploading && (
          <div className="absolute bottom-3 left-3 right-3 h-1 overflow-hidden rounded-full bg-slate-800/40">
            <div className="h-full w-1/2 animate-[loader_1.2s_linear_infinite] bg-fuchsia-400" />
          </div>
        )}
      </div>

      {/* -------------------------------------------------- */}
      {/* DOCUMENT STATS                                      */}
      {/* -------------------------------------------------- */}
      <section className="rounded-3xl border border-white/10 bg-black/40 p-5 backdrop-blur-2xl shadow-[0_20px_60px_rgba(15,23,42,0.65)]">
        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
          AI Document Intelligence
        </p>

        {documents.length === 0 ? (
          <p className="mt-2 text-[12px] text-slate-500">
            No documents uploaded yet.
          </p>
        ) : (
          <p className="mt-2 text-[12px] text-slate-300">
            {documents.length} document{documents.length > 1 ? "s" : ""} uploaded
          </p>
        )}
      </section>

      {/* -------------------------------------------------- */}
      {/* DOCUMENTS LIST                                      */}
      {/* -------------------------------------------------- */}
      <section className="rounded-3xl border border-white/10 bg-black/40 p-5 backdrop-blur-2xl">
        <h2 className="text-sm font-semibold text-slate-100">Project documents</h2>

        {documents.length === 0 ? (
          <p className="mt-3 text-[12px] text-slate-500">
            Upload documents to enrich your Project AI Brain.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {documents.map((doc) => (
              <DocumentItem
                key={doc.id}
                doc={doc}
                projectId={projectId}
                onDelete={handleDelete}
                onOpen={openModal}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* -------------------------------------------------- */
/* DOCUMENT ITEM — Clean + Actions alignés à droite   */
/* -------------------------------------------------- */
function DocumentItem({
  doc,
  projectId,
  onOpen,
  onDelete,
}: {
  doc: ProjectDocument;
  projectId: string;
  onOpen: (doc: ProjectDocument) => void;
  onDelete: (id: number) => void;
}) {
  const statusColor = {
    pending: "text-slate-300 bg-slate-600/20",
    processing: "text-sky-300 bg-sky-600/20",
    done: "text-emerald-300 bg-emerald-600/20",
    error: "text-fuchsia-300 bg-fuchsia-600/20",
  }[doc.status];

  const isPdf = doc.content_type === "application/pdf";
  const downloadMode = isPdf ? "inline" : "attachment";
//  const opendocUrl = `${api.defaults.baseURL}/projects/${projectId}/documents/${doc.id}/download?mode=inline`;
//  const downloadUrl = `${api.defaults.baseURL}/projects/${projectId}/documents/${doc.id}/download?mode=attachment`;
  const docUrl = `${api.defaults.baseURL}/projects/${projectId}/documents/${doc.id}/download?mode=${downloadMode}`;
// 🔥 Fonction pour gérer le clic
  const handleFileAction = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isPdf) {
        // Pour les PDF, on laisse l'action par défaut se faire
        // (l'URL est en mode 'inline' et le lien s'ouvrira dans target="_blank")
        return; 
    }
    // 🔥 Pour les non-PDF (mode='attachment')
    e.preventDefault(); // Empêche l'action par défaut du lien (la navigation)

    // Ouvre le lien de téléchargement directement dans la fenêtre actuelle.
    // L'en-tête 'attachment' interrompra la navigation et lancera la boîte de dialogue native.
    // Cela empêche l'ouverture de l'onglet éphémère.
    window.location.href = docUrl;
};
  
return (
    <li className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
      <div className="flex items-start justify-between gap-4">
        
        {/* LEFT SIDE: DOC INFO */}
        <div className="flex-1">
          <p className="text-[13px] font-medium text-slate-100 truncate">
            {doc.original_name}
          </p>

          <p className="mt-1 text-[11px] text-slate-500">
            {doc.created_at
              ? `Uploaded ${new Date(doc.created_at).toLocaleDateString()}`
              : "Uploaded • unknown date"}
          </p>

          {doc.ai_summary && (
            <p className="mt-2 line-clamp-2 text-[12px] text-slate-300">
              {doc.ai_summary}
            </p>
          )}

          {/* Badges */}
          <div className="mt-2 flex flex-wrap gap-2">
            {doc.ai_risks?.length > 0 && (
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-300">
                {doc.ai_risks.length} risk{doc.ai_risks.length > 1 ? "s" : ""}
              </span>
            )}

            {doc.ai_decisions?.length > 0 && (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">
                {doc.ai_decisions.length} decision
                {doc.ai_decisions.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: BADGE + ACTIONS */}
        <div className="flex flex-col items-end gap-2">

          {/* Status badge */}
          <span
            className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-wide ${statusColor}`}
          >
            {doc.status}
          </span>

          {/* ACTIONS ROW */}
          <div className="flex items-center gap-3 text-[12px]">
            
            {/* Open document */}
            <a
              href={docUrl} 
              target={isPdf ? "_blank" : "_self"} // 💡 Conditionnel: _blank UNIQUEMENT pour les PDF
              rel="noopener noreferrer"
              onClick={handleFileAction} // 🔥 Gestion du clic pour bloquer l'ouverture d'onglet
              className="text-sky-300 underline-offset-2 hover:underline"
              >
              {isPdf ? "Open →" : "Download / Open →"}
            </a>
            
            {/* View analysis */}
            <button
              onClick={() => onOpen(doc)}
              className="text-fuchsia-300 hover:text-fuchsia-200 underline-offset-2 hover:underline"
            >
              Analyse →
            </button>

            {/* Delete */}
            <button
              onClick={() => onDelete(doc.id)}
              className="text-red-300 hover:text-red-200 underline-offset-2 hover:underline"
            >
              Delete
            </button>

          </div>
        </div>
      </div>
    </li>
  );
}
