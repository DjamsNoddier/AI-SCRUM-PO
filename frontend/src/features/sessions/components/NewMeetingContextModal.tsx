// src/features/sessions/components/NewMeetingContextModal.tsx
import { useState } from "react";
import { createProject } from "../../projects/api/projectService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  projects: Array<{ id: number; title: string }>;
}

export default function NewMeetingContextModal({
  isOpen,
  onClose,
  onConfirm,
  projects,
}: Props) {
  const [selectedProject, setSelectedProject] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [agenda, setAgenda] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canStart =
  (selectedProject !== "" || newProjectName.trim() !== "") &&
  title.trim().length > 0;


  const handleConfirm = async () => {
    try {
      setSubmitting(true);

      let finalProjectId = selectedProject;

      // Création d’un nouveau projet si besoin
      if (!selectedProject && newProjectName.trim() !== "") {
        const newProject = await createProject({
          title: newProjectName.trim(),
          description: "Project created during meeting setup", // 👈 obligatoire backend
        });

        finalProjectId = newProject.id;
      }

      onConfirm({
        project_id: finalProjectId,
        title,
        objective,
        agenda,
      });
    } catch (error) {
      console.error("❌ Error creating project:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xl px-4">

      {/* ORBS */}
      <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-fuchsia-500/25 blur-[140px]" />
      <div className="pointer-events-none absolute -right-40 top-40 h-[30rem] w-[30rem] rounded-full bg-sky-500/25 blur-[150px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/15 blur-[130px]" />

      {/* CARD */}
      <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 shadow-[0_24px_80px_rgba(15,23,42,0.85)] backdrop-blur-2xl overflow-hidden text-slate-100">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-5">
          <h2 className="text-lg font-semibold tracking-tight">
            Configure your meeting
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-slate-300 hover:bg-white/10 active:scale-95"
          >
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-6 py-6 space-y-6">

          {/* PROJECT BLOCK */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-200">
              Project
            </label>

            <select
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e.target.value);
                if (e.target.value) setNewProjectName("");
              }}
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-slate-100
                         focus:ring-2 focus:ring-fuchsia-400 focus:outline-none"
            >
              <option value="">Select a project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="text-slate-900">
                  {p.title}
                </option>
              ))}
            </select>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[11px] text-slate-400">or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Create new */}
            <input
              type="text"
              placeholder="Create a new project..."
              value={newProjectName}
              onChange={(e) => {
                setNewProjectName(e.target.value);
                if (e.target.value) setSelectedProject("");
              }}
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-slate-100 
                         placeholder-slate-400 focus:ring-2 focus:ring-sky-400 focus:outline-none"
            />
          </div>

          {/* TITLE */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">
              Meeting Title
            </label>
            <input
              type="text"
              placeholder="e.g. Sprint 14 refinement"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-slate-100 
                         placeholder-slate-400 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
            />
          </div>

          {/* OBJECTIVE */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">
              Objective
            </label>
            <input
              type="text"
              placeholder="What is the goal of this meeting?"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-slate-100 
                         placeholder-slate-400 focus:ring-2 focus:ring-sky-400 focus:outline-none"
            />
          </div>

          {/* AGENDA */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">
              Agenda (optional)
            </label>
            <textarea
              rows={3}
              placeholder="Short agenda to guide the discussion..."
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-slate-100 
                         placeholder-slate-400 focus:ring-2 focus:ring-fuchsia-400 focus:outline-none"
            />
          </div>

          {/* CTA */}
          <button
            onClick={handleConfirm}
            disabled={!canStart || submitting}
            className={`w-full mt-2 rounded-xl px-4 py-3 text-sm font-semibold transition
              ${
                canStart && !submitting
                  ? "bg-gradient-to-r from-fuchsia-400 via-sky-400 to-emerald-400 text-black shadow-lg shadow-fuchsia-400/30 active:scale-[0.97]"
                  : "bg-white/10 text-slate-500 cursor-not-allowed"
              }`}
          >
            {submitting ? "⏳ Starting..." : "🚀 Start Meeting"}
          </button>
        </div>
      </div>
    </div>
  );
}
