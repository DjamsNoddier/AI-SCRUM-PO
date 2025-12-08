// src/features/sessions/views/SummaryView.tsx

import { useEffect, useState, type ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import api from "../../../lib/axios";
import { AllUserStoriesCard } from "../components/AllUserStoriesCard"

export default function SummaryView() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/meetings/${sessionId}`);
        const payload = Array.isArray(res.data) ? res.data[0] : res.data;
        setData(payload);
       
      } catch (e) {
        console.error("❌ Erreur résumé", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId]);

  if (loading)
    return (
      <div className="relative min-h-screen overflow-hidden bg-black text-slate-50">
        <div className="relative z-10 flex min-h-screen items-center justify-center text-sm text-slate-300">
          Chargement du résumé…
        </div>
      </div>
    );

  if (!data)
    return (
      <div className="relative min-h-screen overflow-hidden bg-black text-slate-50">
        <div className="relative z-10 flex min-h-screen items-center justify-center text-sm text-red-400">
          Résumé introuvable
        </div>
      </div>
    );

  const summary = data.summary || {};
  const projectId = data.project_id;
  const sections = summary.sections || {};
  const consulting = summary.consulting_summary || {};
  const quality = summary.quality || {};

  const createdAt = data.created_at
    ? new Date(data.created_at).toLocaleString("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Date inconnue";

  const decisionsCount = sections.decisions?.length || 0;
  const risksCount = sections.risks?.length || 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-slate-50">
      {/* HEADER PREMIUM (Option 2) */}
      <header className="relative z-20 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          {/* Brand */}
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

          {/* Nav in-app */}
          <nav className="hidden items-center gap-6 text-[11px] font-medium text-slate-300 md:flex">
            <button
              onClick={() => navigate(`/app/projects/${projectId}`)}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-100 shadow-[0_0_24px_rgba(15,23,42,0.9)] transition hover:bg-white/10 active:scale-95"
            >
              <ArrowLeft size={12} />
              <span>Back to projects</span>
            </button>
            <button
              onClick={() => navigate("/app/meetings")}
              className="hover:text-slate-50"
            >
              Meetings
            </button>
            <button
              onClick={() => navigate("/app/projects")}
              className="hover:text-slate-50"
            >
              Documents
            </button>
            <button
              onClick={() => navigate("/app/settings")}
              className="hover:text-slate-50"
            >
              Settings
            </button>
          </nav>

          {/* CTA côté droit */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => console.log("TODO: Export PDF")}
              className="hidden items-center gap-2 rounded-full bg-slate-50 px-4 py-1.5 text-[11px] font-semibold text-black shadow-[0_0_40px_rgba(248,250,252,0.35)] transition hover:bg-slate-200 active:scale-95 md:inline-flex"
            >
              <Download size={14} />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10 space-y-8">
          {/* HEADER MEETING + ACTIONS */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Meeting summary
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-50">
                {data.title}
              </h1>
              <p className="text-[12px] text-slate-400">
                🗓 {createdAt} ·{" "}
                <span className="text-slate-300">
                  {summary.user_stories_count || 0} User Stories détectées
                </span>
              </p>
              {summary.meeting_id && (
                <p className="text-[11px] text-slate-500">
                  Meeting ID : {summary.meeting_id}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/app/projects/${projectId}`)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-100 shadow-[0_0_28px_rgba(15,23,42,0.9)] transition hover:bg-white/10 active:scale-95 md:hidden"
              >
                <ArrowLeft size={14} />
                Back to projects
              </button>
              <button
                onClick={() => console.log("TODO: Export PDF")}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/60 bg-emerald-400 text-xs font-semibold text-black px-3.5 py-1.5 shadow-[0_0_30px_rgba(16,185,129,0.45)] transition hover:bg-emerald-300 active:scale-95"
              >
                <Download size={14} />
                Export PDF
              </button>
            </div>
          </div>

          {/* RUBAN STATS */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <StatCard
              title="User Stories"
              value={summary.user_stories_count ?? "—"}
              subtitle="Generated from the conversation"
              icon={<BookOpen size={16} />}
            />
            <StatCard
              title="Décisions"
              value={decisionsCount}
              subtitle="Impactful choices captured"
              icon={<CheckCircle2 size={16} />}
            />
            <StatCard
              title="Risques"
              value={risksCount}
              subtitle="Potential threats tracked"
              icon={<AlertTriangle size={16} />}
            />
            <StatCard
              title="Qualité"
              value={quality.global_score ?? "—"}
              subtitle="Global AI confidence score"
              icon={
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/20 text-[13px]">
                  ⭐
                </span>
              }
            />
          </section>

          {/* APERÇU IA */}
          <InsightCard
            userStoriesCount={summary.user_stories_count || 0}
            decisionsCount={decisionsCount}
            risksCount={risksCount}
          />

          {/* BLOC CONSULTANT PREMIUM */}
          {consulting &&
            (consulting.context ||
              consulting.key_points?.length ||
              consulting.decisions?.length ||
              consulting.risks?.length ||
              consulting.next_steps?.length) && (
              <ConsultingCard consulting={consulting} />
            )}

          {/* GRILLE PRINCIPALE */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Colonne gauche */}
            <div className="space-y-6 lg:col-span-2">
              <SectionCard title="🧩 Contexte" content={sections.context} />

              <ListCard title="📌 Points clés" list={sections.key_points} />

              <TopUSCard stories={summary.top_user_stories || []} />
              <AllUserStoriesCard userStories={summary.user_stories || []} />
            </div>

            {/* Colonne droite */}
            <div className="space-y-6">
              <ListCard title="✅ Décisions" list={sections.decisions} />
              <ListCard title="⚠️ Risques" list={sections.risks} />
              <ListCard title="🚀 Next Steps" list={sections.next_steps} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ------------------ UI COMPONENTS ------------------ */

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
};

function StatCard({ title, value, subtitle, icon }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.95)] backdrop-blur-2xl">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
          {title}
        </div>
        {icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-slate-100">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2 text-2xl font-semibold text-slate-50">{value}</div>
      {subtitle && (
        <p className="mt-1 text-[11px] text-slate-400">{subtitle}</p>
      )}
    </div>
  );
}

type InsightCardProps = {
  userStoriesCount: number;
  decisionsCount: number;
  risksCount: number;
};

function InsightCard({
  userStoriesCount,
  decisionsCount,
  risksCount,
}: InsightCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl shadow-[0_24px_80px_rgba(15,23,42,0.95)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
            AI overview
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-50">
            🔍 Global meeting insight
          </h2>
          <p className="mt-1 text-[12px] text-slate-300">
            Mindloop analysed this conversation and extracted structure,
            decisions and risks so you can update your backlog in minutes.
          </p>
        </div>

        <div className="grid w-full max-w-xs grid-cols-3 gap-2 text-[11px] sm:text-[10px]">
          <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-2 text-fuchsia-100">
            <p className="text-[10px] uppercase tracking-wide text-fuchsia-200/80">
              User Stories
            </p>
            <p className="mt-1 text-sm font-semibold">{userStoriesCount}</p>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-100">
            <p className="text-[10px] uppercase tracking-wide text-emerald-200/80">
              Décisions
            </p>
            <p className="mt-1 text-sm font-semibold">{decisionsCount}</p>
          </div>
          <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-amber-100">
            <p className="text-[10px] uppercase tracking-wide text-amber-200/80">
              Risques
            </p>
            <p className="mt-1 text-sm font-semibold">{risksCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

type SectionCardProps = {
  title: string;
  content?: string;
};

function SectionCard({ title, content }: SectionCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.95)] backdrop-blur-2xl">
      <h2 className="mb-2 text-[15px] font-semibold text-slate-50">{title}</h2>
      <p className="text-sm text-slate-300 whitespace-pre-wrap">
        {content || "—"}
      </p>
    </div>
  );
}

type ListCardProps = {
  title: string;
  list?: string[];
};

function ListCard({ title, list }: ListCardProps) {
  const hasItems = list && list.length > 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.95)] backdrop-blur-2xl">
      <h2 className="mb-3 text-[15px] font-semibold text-slate-50">{title}</h2>

      {hasItems ? (
        <ul className="space-y-2 text-sm text-slate-300">
          {list!.map((item, i) => (
            <li
              key={i}
              className="flex gap-2 rounded-xl bg-black/30 px-3 py-2 text-[13px]"
            >
              <span className="mt-[6px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">—</p>
      )}
    </div>
  );
}

type TopUSCardProps = {
  stories: any[];
};

function TopUSCard({ stories }: TopUSCardProps) {
  const hasStories = stories && stories.length > 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.95)] backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-slate-50">
          📋 Top User Stories
        </h2>
        {hasStories && (
          <span className="rounded-full border border-emerald-400/50 bg-emerald-400/10 px-3 py-1 text-[11px] font-medium text-emerald-200">
            {stories.length} proposées
          </span>
        )}
      </div>

      {hasStories ? (
        <div className="mt-4 space-y-3">
          {stories.map((us: any, i: number) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-black/30 p-3"
            >
              <div className="text-sm font-medium text-slate-50">
                {us.title || `User Story #${i + 1}`}
              </div>
              {us.description && (
                <p className="mt-1 text-[13px] text-slate-300">
                  {us.description}
                </p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                {us.priority && (
                  <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-emerald-200">
                    Priority {us.priority}
                  </span>
                )}
                {us.theme && (
                  <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 text-sky-200">
                    {us.theme}
                  </span>
                )}
                {us.status && (
                  <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-slate-200">
                    {us.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          Aucune User Story disponible pour ce meeting.
        </p>
      )}
    </div>
  );
}

type ConsultingSummary = {
  context?: string;
  key_points?: string[];
  decisions?: string[];
  risks?: string[];
  next_steps?: string[];
};

type ConsultingCardProps = {
  consulting: ConsultingSummary;
};

function ConsultingCard({ consulting }: ConsultingCardProps) {
  return (
    <div className="rounded-2xl border border-fuchsia-500/40 bg-white/5 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.95)] backdrop-blur-2xl space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-50">
            🧠 Résumé Consultant (Premium)
          </h2>
          <p className="text-[12px] text-slate-200/80">
            Vue “consulting” générée par l’IA pour faciliter tes décisions de
            produit.
          </p>
        </div>
        <span className="rounded-full border border-fuchsia-400/60 bg-fuchsia-500/20 px-3 py-1 text-[11px] font-medium text-fuchsia-50">
          Advisor mode
        </span>
      </div>

      {/* Contexte */}
      <div className="space-y-1">
        <h3 className="text-[13px] font-semibold text-slate-50">Contexte</h3>
        <p className="text-[13px] text-slate-200 whitespace-pre-wrap">
          {consulting.context || "Non détecté"}
        </p>
      </div>

      {/* Insights */}
      <ConsultingListBlock
        title="Insights clés"
        items={consulting.key_points}
        emptyLabel="Aucun insight identifié."
      />

      {/* Décisions */}
      <ConsultingListBlock
        title="Décisions"
        items={consulting.decisions}
        emptyLabel="Aucune décision détectée."
      />

      {/* Risques */}
      <ConsultingListBlock
        title="Risques"
        items={consulting.risks}
        emptyLabel="Aucun risque identifié."
      />

      {/* Recommandations */}
      <ConsultingListBlock
        title="Recommandations"
        items={consulting.next_steps}
        emptyLabel="Aucune recommandation."
      />
    </div>
  );
}

type ConsultingListBlockProps = {
  title: string;
  items?: string[];
  emptyLabel: string;
};

function ConsultingListBlock({
  title,
  items,
  emptyLabel,
}: ConsultingListBlockProps) {
  const hasItems = items && items.length > 0;
  return (
    <div className="space-y-1">
      <h3 className="text-[13px] font-semibold text-slate-50">{title}</h3>
      {hasItems ? (
        <ul className="space-y-1 text-[13px] text-slate-100">
          {items!.map((i, idx) => (
            <li
              key={idx}
              className="flex gap-2 rounded-xl bg-black/30 px-3 py-2"
            >
              <span className="mt-[7px] h-1 w-1 flex-shrink-0 rounded-full bg-fuchsia-300" />
              <span>{i}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13px] text-slate-300/70">{emptyLabel}</p>
      )}
    </div>
  );
}
