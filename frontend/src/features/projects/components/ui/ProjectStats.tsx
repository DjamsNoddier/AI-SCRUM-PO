import { Mic } from "lucide-react";
import type { ProjectStats as Stats } from "../api/projectService";

type Props = {
  stats: Stats;
  onStartMeeting: () => void;
};

export default function ProjectStats({ stats, onStartMeeting }: Props) {
  return (
    <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Stats */}
      <div className="grid flex-1 grid-cols-3 gap-3 text-[11px]">
        <StatPill label="Decisions" value={stats.decisions} color="emerald" />
        <StatPill label="Risks" value={stats.risks} color="amber" />
        <StatPill label="User stories" value={stats.user_stories} color="sky" />
      </div>

      {/* BTN */}
      <div className="flex justify-start md:justify-end">
        <button
          onClick={onStartMeeting}
          className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-5 py-2 text-xs font-semibold text-black
                     shadow-[0_0_45px_rgba(248,250,252,0.35)] transition
                     hover:bg-slate-200 active:scale-[0.97]"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/10">
            <Mic size={14} />
          </span>
          Start a new meeting
        </button>
      </div>
    </section>
  );
}

type StatPillProps = {
  label: string;
  value: number;
  color: "emerald" | "amber" | "sky";
};

function StatPill({ label, value, color }: StatPillProps) {
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
