// src/features/sessions/views/SummaryView.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import api from "../../../lib/axios";

export default function SummaryView() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/meetings/${sessionId}`);
        setData(res.data);
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
      <div className="min-h-screen flex items-center justify-center text-slate-300">
        Chargement du résumé…
      </div>
    );

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Résumé introuvable
      </div>
    );

  const summary = data.summary || {};
  const sections = summary.sections || {};

  const consulting = data.summary?.consulting_summary || {};
  const quality = summary.quality || {};


  const createdAt = new Date(data.created_at).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="relative min-h-screen w-full bg-black text-slate-50">
      <FuturisticBackground />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-10 space-y-10">

        {/* HEADER */}
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-50 tracking-tight">
              {data.title}
            </h1>

            <p className="text-slate-400 mt-1 text-sm">
              🗓 {createdAt} — {summary.user_stories_count} User Stories détectées
            </p>

            <p className="text-[11px] text-slate-500 mt-1">
              Meeting ID : {summary.meeting_id}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/app/projects")}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition active:scale-95"
            >
              <ArrowLeft size={16} className="inline mr-2" />
              Back
            </button>

            <button
              onClick={() => console.log("TODO: Export PDF")}
              className="px-4 py-2 rounded-xl bg-emerald-400 text-black font-semibold text-sm hover:bg-emerald-300 transition active:scale-95 shadow-[0_0_25px_rgba(16,185,129,0.35)]"
            >
              <Download size={16} className="inline mr-2" />
              Export PDF
            </button>
          </div>
        </header>

        {/* STATS RIBBON */}
        <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCard title="User Stories" value={summary.user_stories_count} icon={<BookOpen />} />
          <StatCard title="Décisions" value={sections.decisions?.length || 0} icon={<CheckCircle2 />} />
          <StatCard title="Risques" value={sections.risks?.length || 0} icon={<AlertTriangle />} />
          <StatCard title="Qualité" value={quality.global_score ?? "—"} icon="⭐" />
        </section>

        {/* INSIGHT CARD */}
        <InsightCard summary={summary} />

        {consulting && (
          <div className="bg-white p-6 rounded-2xl border shadow space-y-6">

            <h2 className="text-xl font-semibold text-gray-900">
              🧠 Résumé Consultant (Premium)
            </h2>

            {/* CONTEXTE */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Contexte</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {consulting.context || "Non détecté"}
              </p>
            </div>

            {/* INSIGHTS */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Insights clés</h3>
              {consulting.key_points?.length ? (
                <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
                  {consulting.key_points.map((i: string, idx: number) => (
                    <li key={idx}>{i}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Aucun insight identifié.</p>
              )}
            </div>


            {/* DECISIONS */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Décisions</h3>
              {consulting.decisions?.length ? (
                <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
                  {consulting.decisions.map((i: string, idx: number) => (
                    <li key={idx}>{i}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Aucune décision détectée.</p>
              )}
            </div>

            {/* RISKS */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Risques</h3>
              {consulting.risks?.length ? (
                <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
                  {consulting.risks.map((i: string, idx: number) => (
                    <li key={idx}>{i}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Aucun risque identifié.</p>
              )}
            </div>

            {/* RECOMMANDATIONS */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Recommandations</h3>
              {consulting.next_steps?.length ? (
                <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
                  {consulting.next_steps.map((i: string, idx: number) => (
                    <li key={idx}>{i}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Aucune recommandation.</p>
              )}
            </div>
          </div>
        )}

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">
            <SectionCard title="🧩 Contexte" content={sections.context} />

            <ListCard title="📌 Points clés" list={sections.key_points} />

            <TopUSCard stories={summary.top_user_stories || []} />
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">
            <ListCard title="✅ Décisions" list={sections.decisions} />
            <ListCard title="⚠️ Risques" list={sections.risks} />
            <ListCard title="🚀 Next Steps" list={sections.next_steps} />
          </div>

        </div>
      </div>
    </div>
  );
}

/* ------------------ UI COMPONENTS ------------------ */

function FuturisticBackground() {
  return (
    <>
      <div className="pointer-events-none absolute -inset-40 -z-20 bg-[radial-gradient(circle_at_top,_#1f2937_0,_#020617_55%,_#000_100%)]" />
      <div className="pointer-events-none absolute -left-40 top-10 -z-10 h-96 w-96 rounded-full bg-fuchsia-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-40 -z-10 h-[28rem] w-[28rem] rounded-full bg-sky-500/25 blur-[150px]" />
    </>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl">
      <div className="text-[11px] uppercase tracking-wide text-slate-400">{title}</div>
      <div className="flex items-center gap-2 text-2xl font-bold text-slate-50 mt-1">
        {icon}
        {value}
      </div>
    </div>
  );
}

function InsightCard({ summary }: any) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
      <h2 className="text-lg font-semibold text-slate-100 mb-3">
        🔍 Aperçu général par l’IA
      </h2>

      <ul className="space-y-2 text-[13px] text-slate-300">
        <li>• {summary.user_stories_count} user stories détectées.</li>
        <li>• {summary.sections?.decisions?.length || 0} décisions identifiées.</li>
        <li>• {summary.sections?.risks?.length || 0} risques détectés.</li>
      </ul>
    </div>
  );
}

function SectionCard({ title, content }: any) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-6 shadow-lg backdrop-blur-xl">
      <h2 className="text-xl font-semibold text-slate-100 mb-3">{title}</h2>
      <p className="text-sm text-slate-300 whitespace-pre-wrap">
        {content || "—"}
      </p>
    </div>
  );
}

function ListCard({ title, list }: any) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-6 shadow-lg backdrop-blur-xl">
      <h2 className="text-xl font-semibold text-slate-100 mb-3">{title}</h2>

      {list && list.length > 0 ? (
        <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
          {list.map((item: any, i: number) => <li key={i}>{item}</li>)}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">—</p>
      )}
    </div>
  );
}

function TopUSCard({ stories }: any) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-6 shadow-lg backdrop-blur-xl">
      <h2 className="text-xl font-semibold text-slate-100">📋 Top User Stories</h2>

      {stories.length > 0 ? (
        <div className="mt-4 space-y-3">
          {stories.map((us: any, i: number) => (
            <div key={i} className="p-3 border border-white/10 rounded-xl bg-white/5">
              <div className="font-medium text-slate-100">{us.title}</div>
              <div className="text-xs text-slate-400 mt-1 flex gap-2">
                {us.priority && (
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 rounded-full border border-emerald-500/20">
                    Priority {us.priority}
                  </span>
                )}

                {us.theme && (
                  <span className="px-2 py-0.5 bg-sky-500/10 text-sky-300 rounded-full border border-sky-500/20">
                    {us.theme}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 mt-3">Aucune User Story disponible.</p>
      )}
    </div>
  );
}
