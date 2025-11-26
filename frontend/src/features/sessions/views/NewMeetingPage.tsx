// src/features/sessions/views/NewMeetingPage.tsx

import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NewMeetingContextModal from "../components/NewMeetingContextModal";
import { useProjects } from "../../projects/hooks/useProjects";
import { createSession } from "../api/meetingService";

type MeetingContext = {
  projectId?: string;
  title: string;
  objective?: string;
  agenda?: string;
};

type LocationState = {
  projectId?: string | number;
};

export default function NewMeetingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projects, loading } = useProjects();

  const locationState = location.state as LocationState | undefined;
  const projectIdFromState = locationState?.projectId
    ? String(locationState.projectId)
    : undefined;

  const hasProjectFromState = !!projectIdFromState;

  // Projet sélectionné à partir du state, pour afficher le nom
  const projectFromState = useMemo(() => {
    if (!projectIdFromState) return null;
    return projects.find((p) => String(p.id) === String(projectIdFromState)) || null;
  }, [projects, projectIdFromState]);

  // Modal uniquement si on n’a PAS de projectId venant du state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [inlineTitle, setInlineTitle] = useState("");
  const [inlineObjective, setInlineObjective] = useState("");
  const [inlineAgenda, setInlineAgenda] = useState("");
  const [submittingInline, setSubmittingInline] = useState(false);

  const handleOpenModal = () => {
    if (!hasProjectFromState) {
      setIsModalOpen(true);
    }
  };
  const handleCloseModal = () => setIsModalOpen(false);

  // ------------- CONFIRM VIA MODAL (cas sans projectId initial) -------------
  const handleConfirmFromModal = async (data: any) => {
    const ctx: MeetingContext = {
      projectId: data.project_id ? String(data.project_id) : undefined,
      title: data.title.trim(),
      objective: (data.objective || "").trim() || "",
      agenda: (data.agenda || "").trim() || "",
    };

    setIsModalOpen(false);

    // Créer la session
    const created = await createSession({
      title: ctx.title,
      project_id: ctx.projectId ? Number(ctx.projectId) : undefined,
      // objective / agenda pourront être envoyés plus tard si le backend les supporte
    });

    // Naviguer vers l’enregistreur
    navigate(`/app/recording/${created.session_id}`, {
      state: {
        meetingTitle: ctx.title,
        projectId: ctx.projectId,
      },
    });
  };

  // ------------- CONFIRM INLINE (cas avec projectId initial) -------------
  const handleStartInline = async () => {
    if (!projectIdFromState) return;

    const title = inlineTitle.trim();
    if (!title) return; // safety guard
    

    try {
      setSubmittingInline(true);

      const created = await createSession({
        title,
        project_id: Number(projectIdFromState),
      });

      navigate(`/app/recording/${created.session_id}`, {
        state: {
          meetingTitle: title,
          projectId: projectIdFromState,
        },
      });
    } catch (error) {
      console.error("❌ Error starting meeting:", error);
    } finally {
      setSubmittingInline(false);
    }
  };

  const isInlineFormDisabled = 
    submittingInline || !projectIdFromState || inlineTitle.trim().length === 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      {/* Background */}
      <div className="pointer-events-none absolute -inset-40 -z-20 bg-[radial-gradient(circle_at_top,_#1f2937_0,_#020617_55%,_#000_100%)]" />
      <div className="pointer-events-none absolute -left-40 top-10 -z-10 h-80 w-80 rounded-full bg-fuchsia-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-40 -z-10 h-96 w-96 rounded-full bg-sky-500/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/20 blur-3xl" />

      <main className="relative z-10">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 md:px-6 md:py-16">
          {/* Header */}
          <header className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-slate-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Step 1 · Set the context for your meeting</span>
            </div>

            <h1 className="text-balance text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl md:text-4xl">
              Start a new meeting with
              <span className="block bg-gradient-to-r from-fuchsia-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
                project-aware AI.
              </span>
            </h1>

            <p className="max-w-2xl text-sm text-slate-300 sm:text-[15px]">
              Link your meeting to a project, set a clear objective and an optional
              agenda. Mindloop will use this context to generate sharper, more
              actionable summaries.
            </p>

            {loading && (
              <p className="text-xs text-slate-400">Loading your projects…</p>
            )}
          </header>

          {/* Back button */}
          <div className="mt-2">
            <button
              onClick={() =>
                navigate(
                  projectIdFromState
                    ? `/app/projects/${projectIdFromState}`
                    : "/app/projects"
                )
              }
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
            >
              ← Back
            </button>
          </div>


          {/* CARD PRINCIPALE */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.85)] backdrop-blur-2xl">
            {/* Top */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                  New meeting
                </p>
                <p className="text-sm text-slate-200">
                  Configure the project context before recording.
                </p>
              </div>

              {!hasProjectFromState && (
                <button
                  onClick={handleOpenModal}
                  className="inline-flex items-center justify-center rounded-full bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-900 shadow-[0_0_35px_rgba(248,250,252,0.45)] transition hover:bg-slate-200 active:scale-[0.97]"
                >
                  <span className="mr-2 text-base">✨</span>
                  Configure & start meeting
                </button>
              )}
            </div>

            {/* Infos 3 colonnes (toujours affichées) */}
            <div className="mt-4 grid gap-3 text-[11px] text-slate-300 md:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <p className="font-semibold text-slate-100">Project</p>
                <p className="mt-1 text-slate-400">
                  {hasProjectFromState
                    ? projectFromState
                      ? `Meeting for: ${projectFromState.title}`
                      : "Meeting linked to a project."
                    : "Choose or create a project in the next step."}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <p className="font-semibold text-slate-100">Objective</p>
                <p className="mt-1 text-slate-400">
                  Define what you want to achieve during this session.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <p className="font-semibold text-slate-100">Agenda</p>
                <p className="mt-1 text-slate-400">
                  Optional: outline key points or decisions to cover.
                </p>
              </div>
            </div>

            {/* INLINE FORM (uniquement si on connaît déjà le projet) */}
            {hasProjectFromState && (
              <div className="mt-6 space-y-4 border-t border-white/10 pt-4">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Meeting for
                  </p>
                  <p className="text-sm font-semibold text-slate-50">
                    {projectFromState
                      ? projectFromState.title
                      : `Project #${projectIdFromState}`}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Title */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-200">
                      Meeting title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sprint 14 refinement with Checkout squad"
                      value={inlineTitle}
                      onChange={(e) => setInlineTitle(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-slate-100 
                                 placeholder-slate-400 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                    />
                  </div>

                  {/* Objective */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-200">
                      Objective
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Clarify MVP scope & unblock dev for Sprint 15"
                      value={inlineObjective}
                      onChange={(e) => setInlineObjective(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-slate-100 
                                 placeholder-slate-400 focus:ring-2 focus:ring-sky-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Agenda */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-200">
                    Agenda (optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. 1) Context & metrics, 2) Decisions on scope, 3) Risks & next steps"
                    value={inlineAgenda}
                    onChange={(e) => setInlineAgenda(e.target.value)}
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-slate-100 
                               placeholder-slate-400 focus:ring-2 focus:ring-fuchsia-400 focus:outline-none"
                  />
                </div>

                {/* CTA */}
                <div className="pt-2">
                  <button
                    onClick={handleStartInline}
                    disabled={isInlineFormDisabled}
                    className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition
                      ${
                        !isInlineFormDisabled
                          ? "bg-gradient-to-r from-fuchsia-400 via-sky-400 to-emerald-400 text-black shadow-lg shadow-fuchsia-400/30 active:scale-[0.97]"
                          : "bg-white/10 text-slate-500 cursor-not-allowed"
                      }`}
                  >
                    {submittingInline ? "⏳ Starting..." : "🚀 Start meeting & open recorder"}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* MODAL : uniquement si aucun projectId n’est fourni */}
      {!hasProjectFromState && (
        <NewMeetingContextModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          projects={projects}
          onConfirm={handleConfirmFromModal}
        />
      )}
    </div>
  );
}
