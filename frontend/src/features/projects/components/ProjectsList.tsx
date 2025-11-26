import { FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";

export default function ProjectsList() {
  const { projects, loading, error } = useProjects();

  if (loading) {
    return <p className="text-slate-400 text-sm">Chargement des projets…</p>;
  }

  if (error) {
    return <p className="text-red-400 text-sm">❌ {error}</p>;
  }

  if (!projects || projects.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        Aucun projet pour le moment. Créez votre premier projet !
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Link
          key={project.id}
          to={`/app/projects/${project.id}`}
          className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5
                     backdrop-blur-xl shadow-[0_0_38px_rgba(15,23,42,0.4)]
                     transition hover:shadow-[0_0_55px_rgba(99,102,241,0.45)]
                     hover:border-sky-400/40 hover:scale-[1.02] active:scale-[0.99]"
        >
          {/* Glow */}
          <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-fuchsia-500/10 via-sky-500/10 to-emerald-500/10 opacity-0 blur-xl transition group-hover:opacity-100" />

          <div className="relative">
            {/* ICON */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-200 ring-1 ring-sky-500/30 mb-4">
              <FolderOpen size={18} />
            </div>

            {/* TITLE */}
            <h3 className="text-base font-semibold text-slate-50 line-clamp-1">
              {project.title}
            </h3>

            {/* DESCRIPTION */}
            <p className="mt-2 text-[13px] text-slate-400 line-clamp-2">
              {project.description}
            </p>

            {/* FOOTER */}
            <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
              <span>
                Créé le{" "}
                {new Date(project.created_at).toLocaleDateString("fr-FR")}
              </span>

              <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-300 ring-1 ring-emerald-400/20">
                0 réunion
              </span>

            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
