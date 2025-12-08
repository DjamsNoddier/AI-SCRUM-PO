import type { ReactNode } from "react";
import api from "../../../lib/axios";

// --- TYPES ---
export interface CreateProjectPayload {
  title: string;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  objectives?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectDocument {
  name: ReactNode;
  url: string | undefined;
  id: number;
  project_id: number;

  // File handling
  filename: string;        // nom interne généré
  original_name: string;   // nom de l'utilisateur
  content_type: string;    // "application/pdf" etc.
  file_size?: number;
  file_hash?: string;

  // AI analysis
  extracted_text?: string;
  ai_summary?: string;
  ai_risks: string[];
  ai_decisions: string[];

  status: "pending" | "processing" | "done" | "error";
  is_supported: boolean;

  created_at: string; // datetime from backend

}


export interface ProjectSession {
  id: string;
  title: string;
  created_at: string;
  status?: string;
  duration_seconds?: number;
}

export interface ProjectStats {
  decisions: number;
  risks: number;
  user_stories: number;
}

export interface ProjectInsightDecision {
  session_id: string;
  session_title: string;
  decision: string;
  created_at: string;
}

export interface ProjectInsightRisk {
  session_id: string;
  session_title: string;
  risk: string;
  created_at: string;
}

export interface ProjectInsightTheme {
  label: string;
  count: number;
}

export interface ProjectInsights {
  health_score: number;
  health_label: string;

  meetings_count: number;
  decisions_total: number;
  risks_total: number;
  user_stories_total: number;

  recent_decisions: ProjectInsightDecision[];
  key_risks: ProjectInsightRisk[];
  themes: ProjectInsightTheme[];

  last_activity_at: string | null;
  time_saved_minutes: number;

  ai_summary: string;
}

// --- API CALLS (100% COOKIE BASED, no token needed) ---

export async function getProjects() {
  const res = await api.get("/projects");
  return res.data;
}

export async function getAllProjects() {
  const res = await api.get("/projects/");
  return res.data || [];
}

export async function createProject(data: CreateProjectPayload) {
  const res = await api.post("/projects/", data);
  return res.data;
}

export async function getProjectById(id: string): Promise<Project> {
  const res = await api.get(`/projects/${id}`);
  return res.data;
}

export async function getProjectDocuments(id: string): Promise<ProjectDocument[]> {
  const res = await api.get(`/projects/${id}/documents`);
  return res.data ?? [];
}

export async function getProjectSessions(id: string): Promise<ProjectSession[]> {
  const res = await api.get(`/projects/${id}/sessions`);
  return res.data ?? [];
}

export async function getProjectStats(id: string): Promise<ProjectStats> {
  const res = await api.get(`/projects/${id}/stats`);
  return (
    res.data ?? {
      decisions: 0,
      risks: 0,
      user_stories: 0,
    }
  );
}

export async function getProjectInsights(id: string): Promise<ProjectInsights> {
  const res = await api.get(`/projects/${id}/insights`);
  return res.data;
}

export async function deleteProjectDocument(projectId: string, docId: number) {
  const res = await api.delete(`/projects/${projectId}/documents/${docId}`);
  return res.data;
}