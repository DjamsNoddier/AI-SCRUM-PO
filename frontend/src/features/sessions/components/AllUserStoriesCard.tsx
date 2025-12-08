export function AllUserStoriesCard({ userStories }: any) {
    const hasStories = userStories && userStories.length > 0;
  
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl shadow-[0_24px_80px_rgba(15,23,42,0.95)]">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-slate-50">📚 All User Stories</h2>
  
          {hasStories && (
            <span className="rounded-full border border-sky-400/50 bg-sky-500/10 px-3 py-1 text-[11px] font-medium text-sky-200">
              {userStories.length} générées
            </span>
          )}
        </div>
  
        {!hasStories && (
          <p className="mt-4 text-sm text-slate-500">Aucune User Story détectée.</p>
        )}
  
        {hasStories && (
          <div className="mt-5 space-y-4">
            {userStories.map((us: any, idx: number) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-3"
              >
                {/* Title */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-50">
                    {us.title}
                  </h3>
                  {us.theme && (
                    <span className="mt-1 inline-block rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-0.5 text-[10px] text-fuchsia-200">
                      {us.theme}
                    </span>
                  )}
                </div>
  
                {/* User story */}
                {us.user_story && (
                  <div className="text-[13px] text-slate-300 whitespace-pre-wrap">
                    {us.user_story}
                  </div>
                )}
  
                {/* Summary */}
                {us.summary && (
                  <p className="text-[12px] text-slate-400">
                    {us.summary}
                  </p>
                )}
  
                {/* Why */}
                {us.why && (
                  <p className="text-[12px] text-slate-300">
                    <span className="text-slate-400">Why:</span> {us.why}
                  </p>
                )}
  
                {/* Acceptance criteria */}
                {us.acceptance_criteria?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 mb-1">
                      Acceptance Criteria
                    </p>
                    <ul className="space-y-1 text-[12px] text-slate-300 list-disc list-inside">
                      {us.acceptance_criteria.map((c: string, i: number) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
  
                {/* Meta */}
                <div className="flex items-center gap-3 text-[11px] mt-2">
                  {us.priority && (
                    <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-emerald-200">
                      Priority {us.priority}
                    </span>
                  )}
  
                  {typeof us.confidence === "number" && (
                    <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-2 py-0.5 text-blue-200">
                      Confidence {Math.round(us.confidence * 100)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  