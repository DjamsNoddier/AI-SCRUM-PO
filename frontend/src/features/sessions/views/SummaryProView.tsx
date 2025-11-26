import {
    Search,
    ArrowRight,
    FileText,
    AlertTriangle,
    CheckCircle,
    Command,
    Keyboard,
    Settings2,
    FolderOpen
  } from "lucide-react";
  import { useSummaries } from "../hooks/useSummaries";
  import { useNavigate } from "react-router-dom";
  import { useEffect, useMemo, useRef, useState } from "react";
  import type { SummaryItem } from "../api/summaryService";
  
  export default function SummaryProView() {
    const { summaries, loading } = useSummaries();
    const navigate = useNavigate();
  
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [denseMode, setDenseMode] = useState(false);
  
    const searchRef = useRef<HTMLInputElement | null>(null);
  
    // 🔍 Filtrage simple par titre + excerpt
    const filtered = useMemo(() => {
      if (!query.trim()) return summaries;
      const q = query.toLowerCase();
      return summaries.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.excerpt || "").toLowerCase().includes(q)
      );
    }, [summaries, query]);
  
    // 🔁 Sélection par défaut
    useEffect(() => {
      if (filtered.length === 0) {
        setSelectedId(null);
        return;
      }
      // si rien sélectionné ou l'élément n'existe plus, prendre le premier
      if (!selectedId || !filtered.find((s) => s.session_id === selectedId)) {
        setSelectedId(filtered[0].session_id);
      }
    }, [filtered, selectedId]);
  
    const selected = useMemo(
      () => filtered.find((s) => s.session_id === selectedId) || null,
      [filtered, selectedId]
    );
  
    // 🎹 Navigation clavier: ↑ / ↓ / Enter / '/'
    useEffect(() => {
      function handleKey(e: KeyboardEvent) {
        if (filtered.length === 0) return;
  
        // '/' pour focus search comme dans Notion / Linear
        if (e.key === "/" && document.activeElement !== searchRef.current) {
          e.preventDefault();
          searchRef.current?.focus();
          return;
        }
  
        // ne pas interférer quand on tape dans un input/textarea
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
        ) {
          return;
        }
  
        const currentIndex = filtered.findIndex(
          (s) => s.session_id === selectedId
        );
        if (e.key === "ArrowDown") {
          e.preventDefault();
          const nextIndex =
            currentIndex < 0
              ? 0
              : Math.min(currentIndex + 1, filtered.length - 1);
          setSelectedId(filtered[nextIndex].session_id);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const prevIndex =
            currentIndex < 0
              ? 0
              : Math.max(currentIndex - 1, 0);
          setSelectedId(filtered[prevIndex].session_id);
        } else if (e.key === "Enter" && selectedId) {
          e.preventDefault();
          navigate(`/summary/${selectedId}`);
        }
      }
  
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }, [filtered, selectedId, navigate]);
  
    return (
      <div className="h-full flex flex-col gap-6">
  
        {/* HEADER + HINTS */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Mes meetings (mode Pro)
            </h1>
            <p className="text-gray-500 mt-1">
              Naviguez au clavier, prévisualisez à droite, ouvrez au besoin.
            </p>
          </div>
  
          <div className="flex flex-col items-end gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Keyboard size={14} />
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-300 bg-white">
                ↑↓
              </span>
              <span>pour naviguer</span>
            </div>
            <div className="flex items-center gap-2">
              <Command size={14} />
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-300 bg-white">
                Enter
              </span>
              <span>ouvrir le résumé complet</span>
            </div>
            <div className="flex items-center gap-2">
              <Search size={14} />
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-300 bg-white">
                /
              </span>
              <span>focaliser la recherche</span>
            </div>
          </div>
        </div>
  
        {/* TOOLBAR */}
        <div className="flex items-center gap-4">
          {/* SEARCH */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un meeting, une décision, un mot-clé…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
  
          {/* DENSE MODE TOGGLE */}
          <button
            onClick={() => setDenseMode((d) => !d)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium ${
              denseMode
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            <Settings2 size={14} />
            {denseMode ? "Mode dense" : "Mode confortable"}
          </button>
        </div>
  
        {/* MAIN SPLIT VIEW */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)] gap-6 min-h-[400px]">
  
          {/* LEFT: LIST */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-2 border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
              {loading
                ? "Chargement…"
                : `${filtered.length} meeting${filtered.length > 1 ? "s" : ""}`}
            </div>
  
            {filtered.length === 0 && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
                <FolderOpen size={32} className="text-gray-300" />
                Aucun meeting trouvé.
              </div>
            )}
  
            <div className="flex-1 overflow-y-auto">
              {filtered.map((s) => (
                <RowItem
                  key={s.session_id}
                  meeting={s}
                  active={s.session_id === selectedId}
                  dense={denseMode}
                  onClick={() => setSelectedId(s.session_id)}
                  onOpen={() => navigate(`/summary/${s.session_id}`)}
                />
              ))}
            </div>
          </div>
  
          {/* RIGHT: PREVIEW */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col">
            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
                <FileText size={32} className="text-gray-300" />
                Sélectionnez un meeting à gauche pour prévisualiser le résumé.
              </div>
            ) : (
              <PreviewPane meeting={selected} />
            )}
          </div>
        </div>
      </div>
    );
  }
  
  /* ─────────────── LEFT ROW ITEM ─────────────── */
  
  function RowItem({
    meeting,
    active,
    dense,
    onClick,
    onOpen,
  }: {
    meeting: SummaryItem;
    active: boolean;
    dense: boolean;
    onClick: () => void;
    onOpen: () => void;
  }) {
    const formattedDate = meeting.date
      ? new Date(meeting.date).toLocaleString("fr-FR", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";
  
    return (
      <div
        onClick={onClick}
        className={[
          "flex flex-col border-b border-gray-100 cursor-pointer group",
          active ? "bg-blue-50/70" : "bg-white hover:bg-gray-50",
        ].join(" ")}
      >
        <div className={`px-4 ${dense ? "py-2" : "py-3"} flex items-start justify-between gap-3`}>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p
                className={`truncate font-semibold ${
                  active ? "text-blue-800" : "text-gray-900"
                }`}
              >
                {meeting.title}
              </p>
            </div>
            {!dense && (
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {formattedDate}
              </p>
            )}
            {!dense && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                {meeting.excerpt || "Résumé généré automatiquement."}
              </p>
            )}
          </div>
  
          <div className="flex flex-col items-end gap-1 text-[10px] text-gray-600">
            <div className="flex items-center gap-1">
              <CheckCircle size={12} className="text-emerald-600" />
              <span>{meeting.decisions}</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle size={12} className="text-red-500" />
              <span>{meeting.risks}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText size={12} className="text-blue-500" />
              <span>{meeting.user_stories_count}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
              className="mt-1 inline-flex items-center gap-1 text-[10px] text-blue-600 opacity-0 group-hover:opacity-100 transition"
            >
              Ouvrir <ArrowRight size={10} />
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  /* ─────────────── RIGHT PREVIEW PANE ─────────────── */
  
  function PreviewPane({ meeting }: { meeting: SummaryItem }) {
    const formattedDate = meeting.date
      ? new Date(meeting.date).toLocaleString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";
  
    return (
      <div className="flex-1 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {meeting.title}
            </h2>
            <p className="text-xs text-gray-500 mt-1">{formattedDate}</p>
          </div>
        </div>
  
        {/* Metrics pills */}
        <div className="flex flex-wrap gap-2 text-xs">
          <Pill icon={<CheckCircle size={13} className="text-emerald-600" />}>
            {meeting.decisions} décisions
          </Pill>
          <Pill icon={<AlertTriangle size={13} className="text-red-500" />}>
            {meeting.risks} risques
          </Pill>
          <Pill icon={<FileText size={13} className="text-blue-500" />}>
            {meeting.user_stories_count} User Stories
          </Pill>
        </div>
  
        {/* Excerpt / intro */}
        <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 leading-relaxed">
          {meeting.excerpt || "Résumé généré automatiquement à partir de votre meeting."}
        </div>
  
        {/* Placeholder pour sections détaillées (futur : context, decisions, risks, etc.) */}
        <div className="mt-2 text-xs text-gray-400">
          Aperçu rapide. Les détails complets (sections, décisions, risques, next steps…)
          sont visibles dans la page du résumé.
        </div>
      </div>
    );
  }
  
  function Pill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-700">
        {icon}
        {children}
      </span>
    );
  }
  