// src/features/projects/components/TimelineItem.tsx

import { Link } from "react-router-dom";
import type { ProjectSession } from "../../api/projectService";

type Props = { session: ProjectSession; index: number };

export default function TimelineItem({ session, index }: Props) {
  const colors = [
    "bg-fuchsia-500/25 text-fuchsia-100",
    "bg-sky-500/25 text-sky-100",
    "bg-emerald-500/25 text-emerald-100",
    "bg-amber-500/25 text-amber-100",
  ];

  const colorClass = colors[index % colors.length];

  return (
    <div className="flex gap-3 rounded-2xl border border-white/10 bg-black/40 px-3 py-3">
      <div className={`h-7 w-7 flex items-center justify-center rounded-full ${colorClass}`}>
        {index + 1}
      </div>

      <div className="flex-1">
        <p className="text-[11px] font-semibold text-slate-100">{session.title}</p>
        <Link
          to={`/app/summary/${session.id}`}
          className="text-[11px] text-sky-300 underline-offset-2 hover:underline"
        >
          View summary →
        </Link>
      </div>
    </div>
  );
}
