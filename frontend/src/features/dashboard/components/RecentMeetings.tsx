import type { Meeting } from "../types/dashboard";
import { useNavigate } from "react-router-dom";

interface Props {
  meetings: Meeting[];
}

export default function RecentMeetings({ meetings }: Props) {
  const navigate = useNavigate();

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-xl">
      <h2 className="text-sm font-semibold text-slate-50">Recent meetings</h2>

      {meetings.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">No meetings yet.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {meetings.map((m) => (
            <button
              key={m.id}
              onClick={() => navigate(`/app/meetings/${m.id}`)}
              className="w-full rounded-xl bg-black/40 border border-white/10 p-4 text-left text-sm hover:bg-black/50 transition"
            >
              <p className="font-semibold text-slate-50">{m.title}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                {new Date(m.created_at).toLocaleString("fr-FR")}
              </p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
