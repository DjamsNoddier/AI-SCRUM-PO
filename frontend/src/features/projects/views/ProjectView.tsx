// src/features/projects/views/ProjectView.tsx

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getProjectById,
  getProjectDocuments,
  getProjectSessions,
  getProjectStats,
  type Project,
  type ProjectDocument,
  type ProjectSession,
  type ProjectStats as ProjectStatsData,
} from "../api/projectService";

import ProjectHeader from "../components/ProjectHeader";
import ProjectTabs from "../components/ProjectTabs";

import ProjectOverviewTab from "../components/tabs/ProjectOverviewTab";
import ProjectMeetingsTab from "../components/tabs/ProjectMeetingsTab";
import ProjectDocumentsTab from "../components/tabs/ProjectDocumentsTab";
import ProjectBrainTab from "../components/tabs/ProjectBrainTab";

import { Plus, UploadCloud } from "lucide-react";

export default function ProjectView() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [sessions, setSessions] = useState<ProjectSession[]>([]);
  const [stats, setStats] = useState<ProjectStatsData>({
    decisions: 0,
    risks: 0,
    user_stories: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const id = projectId ?? "";
    if (!id) {
      setError("Missing project id.");
      setLoading(false);
      return;
    }

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [projectRes, docsRes, sessionsRes, statsRes] =
          await Promise.all([
            getProjectById(id),
            getProjectDocuments(id),
            getProjectSessions(id),
            getProjectStats(id),
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
      } catch (err) {
        console.error("Load project failed :", err);
        setError("Unable to load this project.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [projectId]);

  // Rafraîchir documents après upload
  async function refreshDocuments() {
    if (!projectId) return;
    try {
      const docs = await getProjectDocuments(projectId);
      setDocuments(docs ?? []);
    } catch (err) {
      console.error("Error refreshing documents:", err);
    }
  }

  const handleStartMeeting = () => {
    if (!project) return;
    navigate("/app/new-meeting", {
      state: { projectId: project.id },
    });
  };

  const handleUploadDocuments = () => {
    setActiveTab("documents");
  };

  const [activeTab, setActiveTab] = useState<
    "overview" | "meetings" | "documents" | "brain"
  >("overview");

  /* --------------------- LOADING --------------------- */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-slate-200" />
          <p className="text-sm text-slate-400">
            Loading project intelligence…
          </p>
        </div>
      </div>
    );
  }

  /* --------------------- ERROR --------------------- */
  if (error || !project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
        <p className="text-red-400 text-sm">{error}</p>
        <Link
          to="/app/projects"
          className="text-xs text-slate-300 underline underline-offset-4"
        >
          ← Back to Projects
        </Link>
      </div>
    );
  }

  /* --------------------- MAIN VIEW --------------------- */
  return (
    <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
      
      {/* HEADER */}
      <ProjectHeader project={project} navigate={navigate} />

      {/* PROJECT TABS */}
      <ProjectTabs active={activeTab} onChange={setActiveTab} />

      {/* ACTION BAR */}
      <ActionBar
        onStartMeeting={handleStartMeeting}
        onUploadDocuments={handleUploadDocuments}
      />

      {/* TAB CONTENT */}
      <div className="mt-6">
        {activeTab === "overview" && (
          <ProjectOverviewTab
            project={project}
            sessions={sessions}
            documents={documents}
            stats={stats}
          />
        )}

        {activeTab === "meetings" && (
          <ProjectMeetingsTab
            sessions={sessions}
            stats={stats}
            onStartMeeting={handleStartMeeting}
          />
        )}

        {activeTab === "documents" && (
          <ProjectDocumentsTab
            documents={documents}
            projectId={projectId!}
            refreshDocuments={refreshDocuments}
          />
        )}

        {activeTab === "brain" && (
          <ProjectBrainTab />
        )}
      </div>
    </div>
  );
}

/* --------------------- ACTION BAR --------------------- */

type ActionBarProps = {
  onStartMeeting: () => void;
  onUploadDocuments: () => void;
};

function ActionBar({
  onStartMeeting,
  onUploadDocuments,
}: ActionBarProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-[0_24px_80px_rgba(15,23,42,0.7)] backdrop-blur-2xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        
        {/* LEFT */}
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
            Project cockpit
          </p>
          <p className="text-[12px] text-slate-300">
            Start a new meeting, upload documents, and let Mindloop build the project brain.
          </p>
        </div>

        {/* RIGHT BUTTONS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onStartMeeting}
            className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-xs font-semibold text-black shadow hover:bg-slate-200 active:scale-95"
          >
            <Plus size={14} />
            Start meeting
          </button>

          <button
            onClick={onUploadDocuments}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs font-medium text-slate-100 shadow hover:bg-white/5 active:scale-95"
          >
            <UploadCloud size={14} />
            Upload docs
          </button>
        </div>
      </div>
    </section>
  );
}
