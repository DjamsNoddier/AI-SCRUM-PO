import { useState } from "react";
import { useNavigate } from "react-router-dom";

import SearchBar from "../components/SearchBar";
import TodayActionItems from "../components/TodayActionItems";
import RecentMeetings from "../components/RecentMeetings";
import ProjectSummaryList from "../components/ProjectSummaryList";
import TopRisksSection from "../components/TopRisksSection";

import { useDashboardData } from "../hooks/useDashboardData";

export default function DashboardPage() {
  const navigate = useNavigate();

  // ⬇️ AUCUN SHADOWING !! useState vient bien de React
  const [search, setSearch] = useState("");

  const {
    loading,
    error,
    projects,
    aggregates,
    recentMeetings,
    topRisks,
    actionItems,
  } = useDashboardData();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-300 bg-black">
        Loading…
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 bg-black">
        {error}
      </div>
    );

  return (
    <div className="relative min-h-screen bg-black text-slate-50">
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-10 space-y-10">

        {/* 🔍 SEARCH BAR */}
        <SearchBar value={search} onChange={setSearch} />

        {/* GRID LAYOUT */}
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">

          {/* LEFT COLUMN */}
          <div className="space-y-6">
            <TodayActionItems items={actionItems} />

            <RecentMeetings meetings={recentMeetings} />

            <ProjectSummaryList
              projects={projects}
              aggregates={aggregates}
              onSelect={(id) => navigate(`/app/projects/${id}`)}
            />
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <TopRisksSection risks={topRisks} />
            {/* Upcoming meetings futur */}
          </div>
        </div>
      </main>
    </div>
  );
}
