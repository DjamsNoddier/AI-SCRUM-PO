import api from "../../../lib/axios";
import type { ProjectResponse } from "../types";

export async function getProjects(): Promise<ProjectResponse[]> {
    const token = localStorage.getItem("access_token");

    const response = await api.get("/projects", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
}


// Typage correct de la création de projet
export interface CreateProjectPayload {
  title: string;
  description: string;
}

export async function getAllProjects() {
  const response = await api.get("/projects/");
  return response.data || [];
}

export async function createProject(data: CreateProjectPayload) {
  const response = await api.post("/projects/", data);
  return response.data;
}

// 🧩 Types partagés

export interface Project {
  id: string;
  title: string;
  description?: string;
  objectives?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  url: string;
  created_at?: string;
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

// 🌐 API calls

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
