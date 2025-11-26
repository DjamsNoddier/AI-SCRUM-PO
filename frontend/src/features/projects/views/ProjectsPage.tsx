import { Link } from "react-router-dom";
import { FolderPlus, Folders } from "lucide-react";
import ProjectsList from "../components/ProjectsList";
import { useProjects } from "../hooks/useProjects";

export default function ProjectsPage() {
  const { projects, loading, error } = useProjects();

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-black text-slate-50">
      {/* Background */}
      <FuturisticBackground />

      {/* CONTENT */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 md:px-8">
        {/* HEADER */}
        <header className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-tight text-slate-50">
              <Folders className="text-sky-300" size={28} />
              Your{" "}
              <span className="bg-gradient-to-r from-fuchsia-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
                projects
              </span>
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Organisez vos initiatives, vos réunions, vos décisions et votre contexte projet.
            </p>
          </div>

          {/* Create project button */}
          <Link
            to="/app/projects/new"
            className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-5 py-2 text-xs font-semibold text-black
                       shadow-[0_0_40px_rgba(248,250,252,0.35)] transition hover:bg-slate-200 active:scale-[0.97]"
          >
            <FolderPlus size={14} />
            Create project
          </Link>
        </header>

        {/* LOADING */}
        {loading && (
          <p className="text-slate-400 text-sm">Loading your projects…</p>
        )}

        {/* ERROR */}
        {error && (
          <p className="text-red-400 text-sm">❌ {error}</p>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && projects.length === 0 && (
          <div className="mt-28 flex flex-col items-center text-center">
            <img
              src="/empty-projects-d.svg"
              alt="No projects"
              className="w-40 opacity-80"
            />

            <h2 className="mt-6 text-xl font-semibold text-slate-100">
              No projects yet
            </h2>

            <p className="mt-2 max-w-sm text-sm text-slate-400">
              Create your first project to start recording meetings and activating Mindloop’s AI memory.
            </p>

            <Link
              to="/app/projects/new"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-50 px-5 py-2 text-xs font-semibold text-black
                         shadow-[0_0_40px_rgba(248,250,252,0.35)] transition hover:bg-slate-200 active:scale-[0.97]"
            >
              <FolderPlus size={14} />
              Create project
            </Link>
          </div>
        )}

        {/* PROJECTS LIST */}
        {!loading && !error && projects.length > 0 && (
          <div className="mt-6">
            <ProjectsList />
          </div>
        )}
      </div>
    </div>
  );
}

/* FUTURISTIC BACKGROUND REUSED FROM HOMEPAGE */
function FuturisticBackground() {
  return (
    <>
      <div className="pointer-events-none absolute -inset-40 -z-20 bg-[radial-gradient(circle_at_top,_#1f2937_0,_#020617_60%,_#000_100%)]" />
      <div className="pointer-events-none absolute -left-40 top-10 -z-10 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-40 -z-10 h-96 w-96 rounded-full bg-sky-500/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/15 blur-3xl" />
    </>
  );
}
