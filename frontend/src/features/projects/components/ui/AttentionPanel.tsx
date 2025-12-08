import type { Project, ProjectStats } from "../../api/projectService";

type Props = {
  project: Project;
  stats: ProjectStats;
};

export default function AttentionPanel({ project: _project, stats }: Props) {
  const { risks, decisions, user_stories } = stats;

  return (
    <section className="
      rounded-3xl border border-white/10 
      bg-black/40 p-6 
      backdrop-blur-2xl 
      shadow-[0_20px_60px_rgba(15,23,42,0.85)]
    ">
      {/* HEADER */}
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
        What needs your attention
      </p>

      <div className="mt-4 space-y-3 text-[12px]">

        {/* RISKS */}
        {risks > 0 ? (
          <div className="text-amber-300">
            ⚠️ {risks} active risk{risks > 1 ? "s" : ""} detected  
            <span className="text-slate-400"> — review blockers soon.</span>
          </div>
        ) : (
          <div className="text-emerald-300">
            ✓ No risks detected  
            <span className="text-slate-400"> — project is stable.</span>
          </div>
        )}

        {/* DECISIONS */}
        {decisions === 0 ? (
          <p className="text-slate-400">
            No decisions captured recently — ensure decisions are clearly documented.
          </p>
        ) : (
          <p className="text-sky-300">
            📌 {decisions} decision{decisions > 1 ? "s" : ""} recorded.
          </p>
        )}

        {/* USER STORIES */}
        {user_stories === 0 ? (
          <p className="text-slate-400">
            No user stories generated yet — try a more structured meeting.
          </p>
        ) : (
          <p className="text-slate-300">
            🧩 {user_stories} user stor{user_stories > 1 ? "ies" : "y"} identified.
          </p>
        )}
      </div>
    </section>
  );
}
