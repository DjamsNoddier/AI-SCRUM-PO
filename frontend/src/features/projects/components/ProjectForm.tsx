import { useState } from "react";
import api from "../../../lib/axios";
import type { ProjectCreatePayload } from "../types";
import toast from "react-hot-toast";

interface ProjectFormProps {
  onSuccess: (projectId: string) => void;
  primaryIcon?: React.ReactNode;
}

export default function ProjectForm({ onSuccess, primaryIcon }: ProjectFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload: ProjectCreatePayload = { title, description };

    try {
      // 🍪 COOKIE-BASED — aucun token, aucun header Authorization
      const res = await api.post("/projects", payload);

      if (res.status === 201) {
        const createdId = res.data.id;

        toast.success(`Projet « ${res.data.title} » créé avec succès ✅`);

        setTitle("");
        setDescription("");

        onSuccess(createdId);
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.detail || "Erreur lors de la création du projet.";
      toast.error(`❌ ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Titre */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="title" className="block text-sm font-medium text-gray-200">
            Titre du projet
          </label>
          <p className="text-xs text-gray-500">Visible dans la liste de tes projets.</p>
        </div>

        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={100}
          placeholder="Ex : Refonte CRM Commercial"
          className="w-full rounded-xl border border-gray-800 bg-gray-900/60 px-3 py-2.5 
                     text-sm text-white placeholder-gray-500 shadow-inner shadow-black/30 
                     focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="description" className="block text-sm font-medium text-gray-200">
            Description
          </label>
          <p className="text-xs text-gray-500">
            Explique le contexte, les objectifs et le périmètre.
          </p>
        </div>

        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          placeholder="Ex : Projet visant à restructurer le CRM interne, améliorer la saisie commerciale et intégrer un scoring IA."
          className="w-full rounded-xl border border-gray-800 bg-gray-900/60 px-3 py-2.5 
                     text-sm text-white placeholder-gray-500 shadow-inner shadow-black/30 
                     focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>

      {/* Bouton */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl 
                     bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 px-4 py-3 
                     text-sm font-medium text-white shadow-lg shadow-blue-900/40 
                     transition hover:from-blue-500 hover:via-blue-400 hover:to-indigo-400 
                     hover:shadow-blue-700/40 active:scale-[0.99] 
                     disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 
                     1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Création en cours...</span>
            </>
          ) : (
            <>
              {primaryIcon}
              <span>Créer le projet</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
