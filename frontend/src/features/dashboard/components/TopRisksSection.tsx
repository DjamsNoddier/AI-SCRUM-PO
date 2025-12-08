import type { Meeting } from "../types/dashboard";

interface Props {
  risks: Meeting[];
}

export default function TopRisksSection({ risks }: Props) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-xl">
      <h2 className="text-sm font-semibold text-slate-50">
        Top risks
      </h2>

      {risks.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">
          No risks detected yet.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {risks.map((r) => (
            <div
              key={r.id}
              className="rounded-xl bg-black/40 border border-white/10 p-4 text-sm"
            >
              <p className="font-semibold text-amber-200">
                {r.risks} risks
              </p>
              <p className="text-slate-200">{r.title}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
