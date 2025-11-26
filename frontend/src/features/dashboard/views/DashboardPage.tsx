import { Link, useNavigate } from "react-router-dom";
import { Mic, Folder, ArrowRight } from "lucide-react";
import { useProjects } from "../../projects/hooks/useProjects";

const mockStats = {
  meetings: 12,
  summaries: 8,
  userStories: 42,
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { projects, loading: loadingProjects } = useProjects();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-slate-50">
      <LightBackground />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 md:px-8 space-y-10">
        {/* ---------------- HEADER ---------------- */}
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Your projects & AI-generated summaries at a glance.
          </p>
        </header>

        {/* ---------------- STATS ---------------- */}
        <section className="grid gap-4 md:grid-cols-3">
          <Stat label="Meetings" value={mockStats.meetings} />
          <Stat label="Summaries" value={mockStats.summaries} />
          <Stat label="User Stories" value={mockStats.userStories} />
        </section>

        {/* ---------------- MAIN GRID ---------------- */}
        <main className="grid gap-6 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          {/* LEFT */}
          <div className="space-y-6">
            {/* Active projects */}
            <section className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-5 md:p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-100">
                  Active projects
                </h2>
                <Link
                  to="/app/projects"
                  className="text-[11px] text-sky-300 hover:text-sky-200"
                >
                  View all →
                </Link>
              </div>

              {loadingProjects ? (
                <p className="text-[12px] text-slate-500">
                  Loading your projects…
                </p>
              ) : projects.length === 0 ? (
                <p className="text-[12px] text-slate-500">
                  No projects yet.{" "}
                  <button
                    onClick={() => navigate("/app/projects/new")}
                    className="text-sky-300 hover:text-sky-200 underline-offset-2 hover:underline"
                  >
                    Create one
                  </button>
                  .
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {projects.slice(0, 4).map((project) => (
                    <button
                      key={project.id}
                      onClick={() => navigate(`/app/projects/${project.id}`)}
                      className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-black/50 p-4 transition hover:border-sky-400/60"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-50 line-clamp-1">
                          {project.title}
                        </p>
                        <p className="text-[12px] text-slate-400 line-clamp-2">
                          {project.description || "No description."}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Open project</span>
                        <ArrowRight
                          size={14}
                          className="transition group-hover:translate-x-1"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Last meeting snapshot */}
            <section className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-5 md:p-6">
              <h2 className="text-sm font-semibold text-slate-100 mb-3">
                Last meeting
              </h2>

              <p className="text-[12px] text-slate-500">
                Recent meeting insights will appear here.
              </p>
            </section>
          </div>

          {/* RIGHT — Quick actions */}
          <div className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 md:p-6 shadow-[0_18px_50px_rgba(15,23,42,0.9)]">
              <h2 className="mb-4 text-sm font-semibold text-slate-100">
                Quick actions
              </h2>

              <div className="space-y-3">
                {/* Primary CTA */}
                <button
                  onClick={() => navigate("/app/new-meeting")}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-gradient-to-r from-fuchsia-400/90 via-sky-400/90 to-emerald-400/90 px-4 py-3 text-xs font-semibold text-black shadow-lg shadow-sky-400/20 transition active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2">
                    <Mic size={16} />
                    Start meeting
                  </span>
                  <ArrowRight size={16} />
                </button>

                {/* Secondary CTA */}
                <button
                  onClick={() => navigate("/app/projects/new")}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-xs font-medium text-slate-100 transition hover:bg-black/60"
                >
                  <span className="flex items-center gap-2">
                    <Folder size={16} />
                    New project
                  </span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </section>

            {/* Placeholder Recent meetings */}
            <section className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-5 md:p-6">
              <h2 className="text-sm font-semibold text-slate-100 mb-3">
                Recent meetings
              </h2>
              <p className="text-[12px] text-slate-500">
                Soon connected to your real session data.
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function LightBackground() {
  return (
    <>
      <div className="pointer-events-none absolute -inset-40 -z-20 bg-[radial-gradient(circle_at_top,_#020617_0,_#020617_55%,_#000_100%)]" />
      <div className="pointer-events-none absolute -left-40 top-10 -z-10 h-72 w-72 rounded-full bg-fuchsia-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-40 -z-10 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-4 shadow-sm">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="mt-1 bg-gradient-to-br from-white via-slate-300 to-white bg-clip-text text-2xl font-semibold text-transparent">
        {value}
      </p>
    </div>
  );
}
