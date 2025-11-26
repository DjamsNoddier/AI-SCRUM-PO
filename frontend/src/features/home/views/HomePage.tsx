// src/features/home/views/HomePage.tsx

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-slate-50">
      {/* Background gradient + orbes futuristes */}
      <div className="pointer-events-none absolute -inset-40 -z-20 bg-[radial-gradient(circle_at_top,_#1f2937_0,_#020617_55%,_#000_100%)]" />
      <div className="pointer-events-none absolute -left-40 top-10 -z-10 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-40 -z-10 h-96 w-96 rounded-full bg-sky-500/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/15 blur-3xl" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/5 ring-2 ring-white/10">
              <span className="text-lg font-semibold text-fuchsia-300">M</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight">
                Mindloop
              </span>
              <span className="text-[11px] text-slate-400">
                AI Project Meeting Engine
              </span>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-xs font-medium text-slate-300 md:flex">
            <a href="#how-it-works" className="hover:text-slate-50">
              How it works
            </a>
            <a href="#for-whom" className="hover:text-slate-50">
              For PM & PO
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="hidden text-xs font-medium text-slate-300 hover:text-slate-50 md:inline"
            >
              Sign in
            </a>
            <a
              href="/login"
              className="rounded-full bg-slate-50 px-4 py-1.5 text-xs font-semibold text-black shadow-[0_0_40px_rgba(248,250,252,0.35)] transition hover:bg-slate-200 active:scale-95"
            >
              Open Mindloop
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <main className="relative z-10">
        <section className="mx-auto flex max-w-6xl flex-col items-center px-4 pt-10 md:flex-row md:items-stretch md:px-8 md:pt-16">
          {/* Colonne texte */}
          <div className="flex-1">
            {/* Badge top */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-200 shadow-[0_0_32px_rgba(15,23,42,0.7)]">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Built for PM, PO, tech leads & founders</span>
            </div>

            <h1 className="mt-5 max-w-xl text-balance text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
              Your{" "}
              <span className="bg-gradient-to-r from-fuchsia-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
                AI memory for project meetings
              </span>
              .
            </h1>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300 sm:text-[15px]">
              Mindloop listens to your meetings, understands your projects and
              turns every call into structured summaries, user stories and
              project timelines — without you typing a single line of notes.
            </p>

            {/* CTA zone */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="/login"
                className="rounded-full bg-slate-50 px-5 py-2 text-xs font-semibold text-black shadow-[0_0_45px_rgba(248,250,252,0.35)] transition hover:bg-slate-200 active:scale-[0.97]"
              >
                Start with one project
              </a>
              <a
                href="#how-it-works"
                className="flex items-center gap-2 text-xs font-medium text-slate-200 hover:text-slate-50"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/5 text-[11px]">
                  ▶
                </span>
                Watch a 90s walkthrough
              </a>
            </div>

            {/* Bullets */}
            <div className="mt-5 grid max-w-md gap-2 text-[11px] text-slate-400 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                <span>No setup. Start directly in your browser.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
                <span>Built around projects, not isolated calls.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Decisions, risks & user stories in one place.</span>
              </div>
            </div>
          </div>

          {/* Colonne preview / timeline */}
          <div className="mt-10 flex flex-1 items-center justify-center md:mt-0 md:justify-end">
            <div className="relative max-w-sm w-full">
              {/* Glow derrière la carte */}
              <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[2rem] bg-gradient-to-br from-fuchsia-500/25 via-sky-400/20 to-emerald-400/25 blur-3xl" />

              {/* Carte principale */}
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_24px_80px_rgba(15,23,42,0.95)]">
                {/* header type app */}
                <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-400/80" />
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Project · Checkout V2
                  </span>
                </div>

                <div className="space-y-4 p-4">
                  {/* Ligne de contexte projet */}
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-50">
                        Sprint 14 – Checkout V2
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Discovery · 52 min · 4 participants
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-medium text-emerald-200 ring-1 ring-emerald-400/40">
                      AI summary ready
                    </span>
                  </div>

                  {/* Timeline meetings */}
                  <div className="space-y-3 rounded-2xl border border-white/10 bg-black/40 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Project timeline
                    </p>
                    <div className="space-y-3">
                      {/* Item 1 */}
                      <div className="flex gap-3">
                        <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-fuchsia-500/20 text-[11px] text-fuchsia-100 ring-1 ring-fuchsia-400/40">
                          K
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] font-semibold text-slate-100">
                              Kick-off & scope
                            </p>
                            <span className="text-[10px] text-slate-400">
                              3 weeks ago
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-300">
                            Defined success metrics, MVP scope and constraints
                            with stakeholders.
                          </p>
                        </div>
                      </div>
                      {/* Item 2 */}
                      <div className="flex gap-3">
                        <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20 text-[11px] text-sky-100 ring-1 ring-sky-400/40">
                          D
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] font-semibold text-slate-100">
                              Design review
                            </p>
                            <span className="text-[10px] text-slate-400">
                              Last week
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-300">
                            Validated new one-click flow for logged-in users.
                          </p>
                        </div>
                      </div>
                      {/* Item 3 */}
                      <div className="flex gap-3">
                        <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-[11px] text-emerald-100 ring-1 ring-emerald-400/40">
                          R
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] font-semibold text-slate-100">
                              Refinement · Sprint 14
                            </p>
                            <span className="text-[10px] text-emerald-300">
                              Now
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-300">
                            7 user stories generated, 3 ready for dev. 2 risks
                            flagged for legal & performance.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bloc decisions / risks */}
                  <div className="grid gap-3 text-[11px] md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Decisions
                      </p>
                      <ul className="mt-1 space-y-1 text-slate-200">
                        <li>• One-click checkout for logged-in users.</li>
                        <li>• A/B test pricing banner on step 2.</li>
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Risks
                      </p>
                      <ul className="mt-1 space-y-1 text-amber-200">
                        <li>• Legal validation on data usage.</li>
                        <li>• Mobile performance under heavy load.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Mini badge US */}
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-[11px]">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-100">
                        7 user stories generated
                      </span>
                      <span className="text-slate-400">
                        Ready to push into your backlog.
                      </span>
                    </div>
                    <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-medium text-emerald-200">
                      3 ready for dev
                    </span>
                  </div>
                </div>
              </div>

              {/* Petit hint scroll */}
              <div className="mt-4 flex items-center justify-center text-[11px] text-slate-400">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[10px]">
                  ↓
                </span>
                Scroll to see how Mindloop fits into your projects.
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
