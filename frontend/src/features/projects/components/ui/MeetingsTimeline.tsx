// src/features/projects/components/MeetingsTimeline.tsx

import type { ProjectSession } from "../../api/projectService";
import TimelineItem from "./TimelineItem";

type Props = { sessions: ProjectSession[] };

export default function MeetingsTimeline({ sessions }: Props) {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-black/45 p-5 backdrop-blur-2xl shadow-[0_20px_60px_rgba(15,23,42,0.85)]">
      <h2 className="text-sm font-semibold text-slate-100">Meetings & AI summaries</h2>

      {sessions.length === 0 ? (
        <p className="mt-4 text-[12px] text-slate-400">
          No meetings yet. Start your first meeting.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {sessions.map((session, index) => (
            <TimelineItem key={session.id} session={session} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
