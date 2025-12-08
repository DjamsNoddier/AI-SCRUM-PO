import type { Project, ProjectAggregate } from "../types/dashboard";
import { FolderOpen, ArrowRight, AlertTriangle } from "lucide-react";
import { timeAgo, generateInsight } from "../utils/dashboardHelpers";

type Props = {
  project: Project;
  aggregate?: ProjectAggregate;
  onClick: () => void;
};

function getHealthChip(score: number | undefined) {
  if (score == null) return "bg-slate-700/40 text-slate-300 border-slate-600/50";
  if (score >= 70) return "bg-emerald-500/15 text-emerald-300 border-emerald-400/30";
  if (score >= 40) return "bg-amber-500/15 text-amber-300 border-amber-400/30";
  return "bg-rose-500/15 text-rose-300 border-rose-400/30";
}

export default function ProjectSummaryCard({ project, aggregate, onClick }: Props) {
  const risks = aggregate?.totalRisks ?? 0;

  const healthScore =
    aggregate != null ? 100 - Math.min(100, aggregate.totalRisks * 10) : undefined;

  const healthClasses = getHealthChip(healthScore);

  const lastTitle = aggregate?.lastMeetingTitle || "No meeting";
  const lastDate = aggregate?.lastMeetingAt ? timeAgo(aggregate.lastMeetingAt) : "No activity";
  const insight = generateInsight(aggregate);

  return (
    <button
      onClick={onClick}
      className="
        group relative w-full rounded-3xl border border-white/10 bg-white/5 p-6 text-left 
        shadow-[0_0_32px_rgba(15,23,42,0.5)] backdrop-blur-xl 
        transition hover:border-sky-400/40 hover:shadow-sky-500/30
      "
    >
      {/* Hover Glow */}
      <div
        className="
          pointer-events-none absolute -inset-4 rounded-3xl opacity-0 blur-2xl
          bg-gradient-to-br from-fuchsia-500/10 via-sky-500/10 to-emerald-500/10
          transition group-hover:opacity-100
        "
      />

      {/* Row: Icon + Title + Open CTA */}
      <div className="relative z-10 flex items-start justify-between gap-4">

        {/* ICON + TEXT */}
        <div className="flex items-start gap-4 flex-1">

          {/* ICON */}
          <div
            className="
              flex items-center justify-center 
              h-9 w-9 rounded-full 
              bg-gradient-to-br from-sky-500/15 to-cyan-400/15
              ring-1 ring-sky-400/20 
              shadow-[0_0_8px_rgba(56,189,248,0.10)]
              transition-all duration-200
              group-hover:ring-sky-400/40 
              group-hover:shadow-[0_0_12px_rgba(56,189,248,0.20)]
              mt-1
            "
          >
            <FolderOpen size={15} strokeWidth={1.5} className="text-sky-200/80" />
          </div>

          {/* TITLE + DESCRIPTION */}
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-50 line-clamp-1">
              {project.title}
            </h3>

            <p className="mt-0.5 text-sm text-slate-400 line-clamp-2">
              {project.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* CTA — now in TOP RIGHT */}
        <div
          className="
            inline-flex items-center gap-1.5 text-sky-300 text-xs font-medium 
            group-hover:text-sky-100 leading-none
            mt-1
          "
        >
          Open
          <ArrowRight size={13} className="relative top-[0.5px]" />
        </div>
      </div>

      {/* HEALTH + RISKS */}
      <div className="mt-5 flex items-center gap-4">
        <span
          className={`
            inline-flex items-center justify-center rounded-lg px-3 py-1 
            text-[11px] border leading-none ${healthClasses}
          `}
        >
          Health • {healthScore ?? "—"}/100
        </span>

        <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 leading-none">
          <AlertTriangle size={12} className="relative top-[0.5px]" />
          {risks} risks
        </span>
      </div>

      {/* LAST ACTIVITY */}
      <p className="mt-3 text-[11px] text-slate-400 leading-tight">
        Last meeting:
        <span className="text-slate-300 ml-1">{lastTitle}</span>
        <span className="text-sky-300 ml-2">{lastDate}</span>
      </p>

      {/* INSIGHT */}
      <div
        className="
          mt-4 rounded-lg bg-slate-900/40 px-3 py-2 text-[11px] text-slate-200 
          border border-white/5 leading-tight
        "
      >
        {insight}
      </div>

    </button>
  );
}
