import {
  Search,
  ArrowRight,
  FileText,
  AlertTriangle,
  CheckCircle,
  Filter,
  SortAsc,
} from "lucide-react";
import { useSummaries } from "../hooks/useSummaries";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import type { SummaryItem } from "../api/summaryService";

type SortBy = "date_desc" | "date_asc" | "decisions" | "risks" | "us";
type FilterMode = "all" | "with_decisions" | "with_risks";

export default function SummaryListView() {
  const { summaries, loading, error } = useSummaries();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("date_desc");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  // 🧮 Stats globales
  const stats = useMemo(() => {
    const total = summaries.length;
    const totalUS = summaries.reduce((acc, s) => acc + (s.user_stories_count || 0), 0);
    const totalDecisions = summaries.reduce((acc, s) => acc + (s.decisions || 0), 0);
    const totalRisks = summaries.reduce((acc, s) => acc + (s.risks || 0), 0);
    return { total, totalUS, totalDecisions, totalRisks };
  }, [summaries]);

  // 🧠 Filtre + tri + recherche
  const filtered = useMemo(() => {
    let res: SummaryItem[] = [...summaries];

    // filtre texte
    if (query.trim()) {
      const q = query.toLowerCase();
      res = res.filter((s) =>
        s.title.toLowerCase().includes(q) ||
        (s.excerpt || "").toLowerCase().includes(q)
      );
    }

    // filtre décisions / risques
    if (filterMode === "with_decisions") {
      res = res.filter((s) => (s.decisions || 0) > 0);
    } else if (filterMode === "with_risks") {
      res = res.filter((s) => (s.risks || 0) > 0);
    }

    // tri
    res.sort((a, b) => {
      if (sortBy === "date_desc" || sortBy === "date_asc") {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return sortBy === "date_desc" ? db - da : da - db;
      }
      if (sortBy === "decisions") return (b.decisions || 0) - (a.decisions || 0);
      if (sortBy === "risks") return (b.risks || 0) - (a.risks || 0);
      if (sortBy === "us") return (b.user_stories_count || 0) - (a.user_stories_count || 0);
      return 0;
    });

    return res;
  }, [summaries, query, sortBy, filterMode]);

  return (
    <div className="space-y-10">

      {/* STATS STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Meetings" value={stats.total} subtitle="Sessions enregistrées" />
        <StatCard label="User Stories" value={stats.totalUS} subtitle="Générées par l’IA" />
        <StatCard label="Décisions" value={stats.totalDecisions} subtitle="À suivre" />
        <StatCard label="Risques" value={stats.totalRisks} subtitle="À surveiller" />
      </div>

      {/* TOOLBAR (search + filters + sort) */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">

        {/* SEARCH */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-3 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par titre, résumé..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* FILTERS & SORT */}
        <div className="flex flex-wrap gap-3 justify-end">

          {/* FILTER BUTTONS */}
          <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1">
            <Filter size={16} className="text-gray-500" />
            <FilterChip active={filterMode === "all"} label="Tous" onClick={() => setFilterMode("all")} />
            <FilterChip active={filterMode === "with_decisions"} label="Avec décisions" onClick={() => setFilterMode("with_decisions")} />
            <FilterChip active={filterMode === "with_risks"} label="Avec risques" onClick={() => setFilterMode("with_risks")} />
          </div>

          {/* SORT SELECT */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
            <SortAsc size={16} className="text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="bg-transparent text-sm text-gray-700 focus:outline-none"
            >
              <option value="date_desc">Plus récents</option>
              <option value="date_asc">Plus anciens</option>
              <option value="decisions">Plus de décisions</option>
              <option value="risks">Plus de risques</option>
              <option value="us">Plus de User Stories</option>
            </select>
          </div>
        </div>
      </div>

      {/* LISTE DES MEETINGS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filtered.map((s) => (
          <MeetingCard
            key={s.session_id}
            meeting={s}
            onClick={() => navigate(`/summary/${s.session_id}`)}
          />
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────── COMPONENTS ───────────────────────────── */

function StatCard({ label, value, subtitle }: { label: string; value: number; subtitle: string }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow border border-gray-100 flex flex-col justify-between">
      <div className="text-xs uppercase text-gray-400">{label}</div>
      <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
    </div>
  );
}

function FilterChip({ active, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
        active ? "bg-blue-600 text-white" : "bg-transparent text-gray-600 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}

function MeetingCard({ meeting, onClick }: any) {
  const formattedDate = meeting.date
    ? new Date(meeting.date).toLocaleString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div
      onClick={onClick}
      className="rounded-2xl bg-white p-5 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">{meeting.title}</h2>
          <p className="text-xs text-gray-400 mt-1">{formattedDate}</p>
        </div>
        <ArrowRight size={18} className="text-gray-400 mt-1" />
      </div>

      <p className="text-sm text-gray-600 line-clamp-2">
        {meeting.excerpt || "Résumé généré automatiquement à partir de votre enregistrement."}
      </p>

      <div className="flex items-center justify-between mt-2 text-xs text-gray-700">
        <div className="flex items-center gap-1.5">
          <CheckCircle size={15} className="text-emerald-600" />
          <span>{meeting.decisions} décisions</span>
        </div>

        <div className="flex items-center gap-1.5">
          <AlertTriangle size={15} className="text-red-600" />
          <span>{meeting.risks} risques</span>
        </div>

        <div className="flex items-center gap-1.5">
          <FileText size={15} className="text-blue-600" />
          <span>{meeting.user_stories_count} US</span>
        </div>
      </div>
    </div>
  );
}
