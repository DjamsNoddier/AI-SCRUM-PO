// src/features/meetings/views/MeetingsPage.tsx

import { Link } from "react-router-dom";
import { useSummaries } from "../hooks/useSummaries";
import { useNavigate } from "react-router-dom";
import SummaryListView from "./SummaryListView";
import { Mic, NotepadText } from 'lucide-react';

export default function MeetingsPage() {
  const { summaries, loading, error } = useSummaries();
  const navigate = useNavigate();

  const isEmpty = !loading && summaries.length === 0;

  return (
    <div className="px-8 py-10 w-full">

      {/* HEADER – même style que Projets */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Mic className="text-blue-400" size={28} />
            Mes meetings</h1>
          <p className="text-gray-400 mt-1">
            Organise tes interviews, tes comptes-rendus et ton contexte meeting.
          </p>
        </div>

        {/* Bouton en haut à droite UNIQUEMENT si la liste n’est pas vide */}
        {!isEmpty && (
          <button
            className="px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow hover:bg-blue-700 transition"
            onClick={() => navigate("/app/new-meeting")}
          >
            + Nouveau meeting
          </button>
        )}
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-gray-500 italic">
          Chargement en cours...
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="text-red-500 bg-red-50/10 border border-red-400/40 px-4 py-2 rounded-xl text-sm">
          ❌ Erreur chargement : {error}
        </div>
      )}

      {/* EMPTY STATE – même logique que Mes Projets */}
      {isEmpty && !loading && !error && (
        <div className="mt-20 flex flex-col items-center text-center">
          {/* ton SVG existant */}
          <img
            src="/empty-meetings.svg"
            alt="Aucun meeting"
            className="w-48 opacity-80"
          />

          <h2 className="text-xl font-semibold text-white mt-6">
            Aucun meeting pour le moment
          </h2>

          <p className="text-gray-400 max-w-sm mt-2">
            Crée ton premier meeting pour commencer à analyser automatiquement
            tes discussions produit et centraliser les décisions de l’équipe.
          </p>

          {/* UN SEUL bouton, centré, comme pour les projets */}
          <Link
            to="/app/new-meeting"
            className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-3 rounded-xl transition shadow-lg shadow-blue-900/30 active:scale-[0.98]"
          >
            <NotepadText size={18} />
            Créer mon premier meeting
          </Link>
        </div>
      )}

      {/* LISTE DES MEETINGS – stats + search + cards, seulement si non vide */}
      {!isEmpty && !loading && !error && <SummaryListView />}
    </div>
  );
}
