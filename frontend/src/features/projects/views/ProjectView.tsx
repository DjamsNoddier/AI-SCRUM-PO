// src/features/projects/views/ProjectView.tsx

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getProjectById,
  getProjectDocuments,
  getProjectSessions,
  getProjectStats,
  type Project,
  type ProjectDocument,
  type ProjectSession,
  type ProjectStats,
} from "../api/projectService";
import { Mic } from "lucide-react";

export default function ProjectView() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [sessions, setSessions] = useState<ProjectSession[]>([]);
  const [stats, setStats] = useState<ProjectStats>({
    decisions: 0,
    risks: 0,
    user_stories: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!projectId) return;

    async function load() {
      try {
        const [projectRes, docsRes, sessionsRes, statsRes] = await Promise.all([
          getProjectById(projectId!),
          getProjectDocuments(projectId!),
          getProjectSessions(projectId!),
          getProjectStats(projectId!),
        ]);

        setProject(projectRes);
        setDocuments(docsRes ?? []);
        setSessions(sessionsRes ?? []);
        setStats(
          statsRes ?? {
            decisions: 0,
            risks: 0,
            user_stories: 0,
          }
        );
      } catch (error) {
        console.error("Error loading project view:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [projectId]);

  /* --------------------- LOADING --------------------- */
  if (loading) {
    return (
      <PageWrapper>
        <FuturisticBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <p className="text-sm text-slate-300">Loading project…</p>
        </div>
      </PageWrapper>
    );
  }

  /* --------------------- NOT FOUND --------------------- */
  if (!project) {
    return (
      <PageWrapper>
        <FuturisticBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <p className="text-sm text-red-400">Project not found.</p>
        </div>
      </PageWrapper>
    );
  }

  /* --------------------- MAIN VIEW --------------------- */

  return (
    <PageWrapper>
      <FuturisticBackground />

      {/* CONTENT */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 md:px-8 md:py-8 overflow-visible space-y-6">
        {/* HEADER */}
        <header className="flex flex-col gap-4 border-b border-white/5 pb-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 ring-2 ring-white/10">
              <span className="text-lg font-semibold text-fuchsia-300">
                {project.title.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Project
              </span>
              <h1 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">
                <span className="bg-gradient-to-r from-fuchsia-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
                  {project.title}
                </span>
              </h1>
              <p className="max-w-xl text-[13px] text-slate-400">
                {project.description ||
                  "This project is ready to capture your meetings and turn them into structured AI summaries."}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 text-[11px]">
            <Link
              to="/app/projects"
              className="text-slate-400 underline-offset-2 hover:text-slate-100 hover:underline"
            >
              ← Back to projects
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-200">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              AI memory activated
            </span>
          </div>
        </header>

        {/* QUICK STATS + MAIN ACTION */}
        <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Stats */}
          <div className="grid flex-1 grid-cols-3 gap-3 text-[11px]">
            <StatPill label="Decisions" value={stats.decisions} color="emerald" />
            <StatPill label="Risks" value={stats.risks} color="amber" />
            <StatPill
              label="User stories"
              value={stats.user_stories}
              color="sky"
            />
          </div>

          {/* Primary CTA: Start meeting */}
          <div className="flex justify-start md:justify-end">
            <button
              onClick={() => navigate(`/app/new-meeting`, { state: { projectId } })}
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

        {/* MAIN LAYOUT */}
        <main className="grid flex-1 gap-6 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)]">
          {/* CENTER / LEFT: MEETINGS TIMELINE */}
          <section className="space-y-4">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/45 p-5 backdrop-blur-2xl shadow-[0_20px_60px_rgba(15,23,42,0.85)] md:p-6">
              <SectionHeader
                title="Meetings & AI summaries"
                hint={
                  sessions.length === 0
                    ? "No meetings yet"
                    : `${sessions.length} meeting(s)`
                }
              />

              {sessions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-black/40 px-4 py-6 text-center text-[12px] text-slate-400">
                  <p>
                    No meetings recorded for this project yet. Start your first
                    meeting and Mindloop will turn it into a timeline of AI
                    summaries.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Project timeline
                  </p>
                  <div className="space-y-3">
                    {sessions.map((s, index) => (
                      <TimelineItem key={s.id} session={s} index={index} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* RIGHT COLUMN: PROJECT DETAILS + DOCUMENTS */}
          <section className="space-y-4">
            {/* PROJECT DETAILS */}
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.9)] backdrop-blur-2xl md:p-6">
              <SectionHeader title="Project details" hint="Context" />
              <div className="space-y-3 text-[13px] text-slate-300">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Description
                  </p>
                  <p className="mt-1 leading-relaxed">
                    {project.description ||
                      "No description yet. Use this space to explain the scope, KPIs and constraints of the project."}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Objectives
                  </p>
                  <p className="mt-1 leading-relaxed">
                    {project.objectives ||
                      "No objectives defined yet. Mindloop will keep track of them across meetings as you clarify them."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                  <Badge color="sky">Project ID: {project.id}</Badge>
                  <Badge color="fuchsia">
                    {sessions.length} meeting{sessions.length === 1 ? "" : "s"}
                  </Badge>
                  <Badge color="emerald">AI insights enabled</Badge>
                </div>
              </div>
            </section>

            {/* DOCUMENTS */}
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-5 backdrop-blur-2xl md:p-6">
              <SectionHeader
                title="Project documents"
                hint={
                  documents.length === 0
                    ? "No documents"
                    : `${documents.length} file(s)`
                }
              />

              {documents.length === 0 ? (
                <p className="text-[12px] text-slate-500">
                  Attach roadmaps, milestones or specs so Mindloop can link
                  discussions with the right artifacts.
                </p>
              ) : (
                <ul className="space-y-2 text-[12px]">
                  {documents.map((doc) => (
                    <DocumentItem key={doc.id} doc={doc} />
                  ))}
                </ul>
              )}
            </section>
          </section>
        </main>
      </div>
    </PageWrapper>
  );
}

/* ------------------ BASE WRAPPERS ------------------ */

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto bg-black text-slate-50">
      <div className="relative min-h-screen w-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}

/* ------------------ FUTURISTIC BACKGROUND ------------------ */

function FuturisticBackground() {
  return (
    <>
      {/* Gradient global */}
      <div className="pointer-events-none absolute -inset-40 -z-20 bg-[radial-gradient(circle_at_top,_#1f2937_0,_#020617_55%,_#000_100%)]" />

      {/* Orbes */}
      <div className="pointer-events-none absolute -left-48 top-10 -z-10 h-80 w-80 rounded-full bg-fuchsia-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-40 -z-10 h-96 w-96 rounded-full bg-sky-500/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-4rem] left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/20 blur-3xl" />
    </>
  );
}

/* ------------------ SMALL UI COMPONENTS ------------------ */

function Badge({
  color,
  children,
}: {
  color: "sky" | "fuchsia" | "emerald";
  children: React.ReactNode;
}) {
  const colors: Record<"sky" | "fuchsia" | "emerald", string> = {
    sky: "bg-sky-400",
    fuchsia: "bg-fuchsia-400",
    emerald: "bg-emerald-400",
  };

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2.5 py-1">
      <span className={`h-1.5 w-1.5 rounded-full ${colors[color]}`} />
      <span>{children}</span>
    </span>
  );
}

type StatPillProps = {
  label: string;
  value: number;
  color: "emerald" | "amber" | "sky";
};

function StatPill({ label, value, color }: StatPillProps) {
  const colorMap: Record<StatPillProps["color"], string> = {
    emerald: "from-emerald-400/90 to-emerald-300/95",
    amber: "from-amber-300/90 to-amber-200/95",
    sky: "from-sky-300/90 to-sky-200/95",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
      <p
        className={`bg-gradient-to-r ${colorMap[color]} bg-clip-text text-lg font-semibold text-transparent`}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] text-slate-400">{label}</p>
    </div>
  );
}

function SectionHeader({
  title,
  hint,
  hintColor = "slate",
}: {
  title: string;
  hint: string;
  hintColor?: "slate" | "emerald";
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] ${
          hintColor === "emerald"
            ? "bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-400/40"
            : "text-slate-400"
        }`}
      >
        {hint}
      </span>
    </div>
  );
}

/* ------------------ DOCUMENT ITEM ------------------ */

function DocumentItem({ doc }: { doc: ProjectDocument }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium text-slate-100">{doc.name}</span>
        {doc.created_at && (
          <span className="text-[11px] text-slate-500">
            Added on {doc.created_at.slice(0, 10)}
          </span>
        )}
      </div>

      <a
        href={doc.url}
        target="_blank"
        rel="noreferrer"
        className="text-[11px] font-medium text-sky-300 underline-offset-2 hover:text-sky-200 hover:underline"
      >
        Open
      </a>
    </li>
  );
}

/* ------------------ TIMELINE ITEM ------------------ */

type TimelineItemProps = {
  session: ProjectSession;
  index: number;
};

function TimelineItem({ session, index }: TimelineItemProps) {
  const badges = ["K", "D", "R", "M"];
  const colors = [
    "bg-fuchsia-500/25 text-fuchsia-100 ring-fuchsia-400/40",
    "bg-sky-500/25 text-sky-100 ring-sky-400/40",
    "bg-emerald-500/25 text-emerald-100 ring-emerald-400/40",
    "bg-amber-500/25 text-amber-100 ring-amber-400/40",
  ];

  const badgeLetter = badges[index % badges.length];
  const colorClass = colors[index % colors.length];

  const createdLabel = new Date(session.created_at).toLocaleDateString();

  return (
    <div className="flex gap-3 rounded-2xl border border-white/10 bg-black/40 px-3 py-3">
      <div
        className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-[11px] ring-1 ${colorClass}`}
      >
        {badgeLetter}
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold text-slate-100">
            {session.title}
          </p>

          <span className="text-[10px] text-slate-400">{createdLabel}</span>
        </div>

        <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>
            {session.status ? `Status: ${session.status}` : "Status: —"}
          </span>

          <Link
            to={`/app/summary/${session.id}`}
            className="text-[11px] font-medium text-sky-300 underline-offset-2 hover:text-sky-200 hover:underline"
          >
            View AI summary →
          </Link>
        </div>
      </div>
    </div>
  );
}
