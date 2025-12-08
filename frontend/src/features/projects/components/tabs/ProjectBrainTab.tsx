// src/features/projects/components/tabs/brain/ProjectBrainTab.tsx

import { mockBrainData } from "../../mock/mockBrainData";

import BrainHeader from "../brain/BrainHeader";
import HealthScoreCard from "../brain/HealthScoreCard";
import ExecutiveSummaryCard from "../brain/ExecutiveSummaryCard";
import BrainInsightsGrid from "../brain/BrainInsightsGrid";
import ActivityTimelineCard from "../brain/ActivityTimelineCard";
import RecommendationsCard from "../brain/RecommendationsCard";

/**
 * 🧠 Brain Tab – Version Aérée Pro + Flow Guidé Vertical
 * - Colonne gauche entièrement verticale (Health → Summary → Insights)
 * - Colonne droite reste en 2 blocs (Activity + Recommendations)
 */

export default function ProjectBrainTab() {
  const data = mockBrainData;

  return (
    <div className="relative flex h-full flex-col gap-10 overflow-hidden px-2 sm:px-4 lg:px-6">
      {/* Background futuriste */}
      <div className="pointer-events-none absolute -inset-40 -z-20 bg-[radial-gradient(circle,#1f2937_0,_#020617_50%,_#000_100%)]" />
      <div className="pointer-events-none absolute -left-32 top-10 -z-10 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 -z-10 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Header */}
      <div className="relative">
        <BrainHeader data={data} />
      </div>

      {/* MAIN GRID */}
      <div className="grid gap-12 xl:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)] items-start">

        {/* LEFT COLUMN — FULL GUIDED FLOW */}
        <div className="flex flex-col gap-10">

          {/* 1️⃣ Health */}
          <div className="rounded-3xl p-1">
            <HealthScoreCard data={data} />
          </div>

          {/* 2️⃣ Executive Summary */}
          <div className="rounded-3xl p-1">
            <ExecutiveSummaryCard summary={data.executiveSummary} />
          </div>

          {/* 3️⃣ Insights Grid (Risks / Decisions / Themes / Momentum) */}
          <div className="rounded-3xl p-1">
            <BrainInsightsGrid
              risks={data.topRisks}
              decisions={data.topDecisions}
              themes={data.themes}
              momentum={data.momentum}
            />
          </div>

        </div>

        {/* RIGHT COLUMN — Activity + Recommendations */}
        <div className="flex flex-col gap-10">

          {/* 4️⃣ Recent AI Activity */}
          <div className="rounded-3xl p-1">
            <ActivityTimelineCard activity={data.recentActivity} />
          </div>

          {/* 5️⃣ AI Recommendations */}
          <div className="rounded-3xl p-1">
            <RecommendationsCard recommendations={data.recommendations} />
          </div>

        </div>
      </div>
    </div>
  );
}
