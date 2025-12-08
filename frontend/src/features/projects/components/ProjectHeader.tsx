// frontend/src/features/projects/components/ProjectHeader.tsx
import type { Project } from "../api/projectService";
import type { NavigateFunction } from "react-router-dom";

type Props = {
  project: Project;
  navigate: NavigateFunction;
};

export default function ProjectHeader({ project, navigate }: Props) {
  return (
    <header className="flex flex-col gap-4 border-b border-white/5 pb-5 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 ring-2 ring-white/10">
          <span className="text-lg font-semibold text-fuchsia-300">
            {project.title.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Project
          </span>

          <h1 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">
            <span className="bg-gradient-to-r from-fuchsia-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
              {project.title}
            </span>
          </h1>

          <p className="max-w-xl text-[13px] text-slate-400">
            {project.description}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-3 text-[11px]">
        <button
          onClick={() => navigate("/app/projects")}
          className="text-slate-400 underline-offset-2 hover:text-slate-100 hover:underline"
        >
          ← Back to projects
        </button>

        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-200">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          AI memory activated
        </span>
      </div>
    </header>
  );
}
