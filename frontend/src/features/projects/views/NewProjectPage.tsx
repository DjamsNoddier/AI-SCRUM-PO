import { ArrowLeft, FolderPlus, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProjectForm from "../components/ProjectForm";

export default function NewProjectPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/70 px-3 py-2 text-sm text-gray-300 hover:border-gray-600 hover:bg-gray-800/80"
          >
            <ArrowLeft size={16} />
            Retour
          </button>

          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-400/80">
              Projet
            </p>
            <h1 className="text-2xl font-semibold text-white">
              Créer un nouveau projet
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Définis un espace dédié pour regrouper tes réunions et ton
              contexte produit.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-950 via-gray-900/90 to-gray-950 shadow-xl shadow-black/40">
          <div className="flex items-center gap-3 border-b border-gray-800 px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <FolderPlus size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Paramètres du projet
              </h2>
              <p className="text-xs text-gray-400">
                Un titre clair et une description solide aident l’IA à mieux
                comprendre ton contexte.
              </p>
            </div>
          </div>

          <div className="px-6 py-6">
            <ProjectForm
              onSuccess={() => {
                // Pour l'instant : simple retour ou redirection où tu veux
                navigate("/app/projects");
              }}
              primaryIcon={<Save size={18} />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
