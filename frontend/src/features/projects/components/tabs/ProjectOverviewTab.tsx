import AttentionPanel from "../ui/AttentionPanel";
import DocumentsPanel from "../ui/DocumentsPanel";
import TimelineItem from "../ui/TimelineItem";

import type {
  Project,
  ProjectSession,
  ProjectDocument,
  ProjectStats,
} from "../../api/projectService";

type Props = {
  project: Project;
  sessions: ProjectSession[];
  documents: ProjectDocument[];
  stats: ProjectStats;
};

export default function ProjectOverviewTab({
  project,
  sessions,
  documents,
  stats,
}: Props) {
  const totalMeetings = sessions.length;
  const totalDecisions = stats.decisions || 0;
  const totalRisks = stats.risks || 0;
  const totalUS = stats.user_stories || 0;

  const healthScore = (() => {
    if (totalMeetings === 0) return 45;

    let score = 82;
    if (totalRisks > totalMeetings * 2) score -= 15;
    if (totalUS < totalMeetings) score -= 8;
    if (totalDecisions >= totalMeetings * 2) score += 6;

    return Math.max(20, Math.min(95, score));
  })();

  const healthLabel =
    healthScore >= 85
      ? "Healthy"
      : healthScore >= 70
      ? "Under control"
      : healthScore >= 55
      ? "Needs attention"
      : "At risk";

  const miniInsights = (() => {
    const list: string[] = [];

    if (totalMeetings === 0) {
      return [
        "No meetings analysed yet.",
        "Start your first meeting to activate the AI brain.",
      ];
    }

    if (totalRisks > 0)
      list.push(`${totalRisks} risk${totalRisks > 1 ? "s" : ""} detected.`);
    if (totalDecisions > 0)
      list.push(`${totalDecisions} decisions captured.`);
    if (totalUS > 0)
      list.push(`${totalUS} user stories generated.`);

    return list.slice(0, 2);
  })();

  return (
    <div className="space-y-8">

      {/* HEALTH PANEL */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-[0_24px_80px_rgba(15,23,42,0.95)]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">

          {/* HEALTH CIRCLE */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative h-32 w-32 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-fuchsia-400/20 via-sky-400/20 to-emerald-400/20 blur-xl" />
              <div className="absolute inset-0 rounded-full border border-white/10" />

              <div className="absolute inset-[12px] flex flex-col items-center justify-center rounded-full bg-black/70 backdrop-blur-xl shadow-inner shadow-black/60">
                <span className="text-[10px] uppercase text-slate-500">Health</span>
                <span className="text-2xl font-semibold text-slate-50">{healthScore}</span>
                <span className="text-[10px] text-slate-400">{healthLabel}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              {totalMeetings === 0
                ? "No meeting yet"
                : `${totalMeetings} meeting${totalMeetings > 1 ? "s" : ""}`}
            </p>
          </div>

          {/* INLINE STATS */}
          <div className="grid grid-cols-3 gap-4 w-full md:w-auto text-[11px]">
            <StatPill label="Decisions" value={totalDecisions} color="emerald" />
            <StatPill label="Risks" value={totalRisks} color="amber" />
            <StatPill label="User stories" value={totalUS} color="sky" />
          </div>
        </div>
      </section>

      {/* ATTENTION */}
      <AttentionPanel project={project} stats={stats} />

      {/* RECENT MEETINGS */}
      <section className="rounded-3xl border border-white/10 bg-black/40 p-5 backdrop-blur-2xl">
        <h2 className="text-sm font-semibold text-slate-100">Recent meetings</h2>

        {sessions.length === 0 ? (
          <p className="mt-3 text-[12px] text-slate-500">No meetings yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {sessions.slice(0, 3).map((s, i) => (
              <TimelineItem key={s.id} session={s} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* DOCUMENTS */}
      <DocumentsPanel documents={documents} />

      {/* MINI AI BRAIN */}
      <section className="rounded-3xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl">
        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">AI Brain</p>

        <ul className="mt-3 space-y-2 text-[12px] text-slate-200">
          {miniInsights.map((ins, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-[5px] h-1 w-1 rounded-full bg-gradient-to-r from-fuchsia-300 via-sky-300 to-emerald-300" />
              {ins}
            </li>
          ))}
        </ul>
      </section>

    </div>
  );
}

/* ---------------------- */
/* STAT PILL */
/* ---------------------- */
function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "emerald" | "amber" | "sky";
}) {
  const colors = {
    emerald: "from-emerald-400/90 to-emerald-300/95",
    amber: "from-amber-300/90 to-amber-200/95",
    sky: "from-sky-300/90 to-sky-200/95",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
      <p
        className={`bg-gradient-to-r ${colors[color]} bg-clip-text text-lg font-semibold text-transparent`}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] text-slate-400">{label}</p>
    </div>
  );
}
