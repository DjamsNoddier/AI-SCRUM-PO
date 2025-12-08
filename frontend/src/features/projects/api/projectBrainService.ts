// src/features/projects/api/projectBrainService.ts

import api from "../../../lib/axios";

/* -----------------------------------------------------------
   🎯 Typages "premium" cohérents avec la Brain Tab
----------------------------------------------------------- */

export type BrainMomentum =
  | "ACCELERATING"
  | "STABLE"
  | "SLOWING"
  | "AT_RISK";

export type BrainRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/* ---------- Insights détaillés ---------- */

export interface BrainRisk {
  id?: string;
  title: string;
  description?: string;
  level: BrainRiskLevel;
  source?: string; // "MEETING" | "DOCUMENT" | ...
  detected_at?: string;
}

export interface BrainDecision {
  id?: string;
  title: string;
  description?: string;
  owner?: string;
  decided_at?: string;
  due_date?: string | null;
}

export interface BrainTheme {
  name: string;
  weight: number; // 0 → 100
  description?: string;
}

export interface BrainActivityItem {
  id?: string;
  type: "MEETING" | "DOCUMENT" | "INSIGHT" | "RISK" | "DECISION";
  title: string;
  summary?: string;
  occurred_at: string;
  source_label?: string;
}

export interface BrainRecommendation {
  id?: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  target_area?: string;
}

export interface HealthFactor {
  label: string;
  score: number;
}

/* -----------------------------------------------------------
   🎯 Structure finale attendue par le FRONT (Brain Tab)
----------------------------------------------------------- */

export interface ProjectBrainData {
  projectId: number;
  projectName: string;

  updatedAt: string;

  healthScore: number;

  healthBreakdown: {
    positives: string[];
    negatives: string[];
    factors: HealthFactor[];
  };

  momentum: BrainMomentum;

  executiveSummary: string;

  topRisks: BrainRisk[];
  topDecisions: BrainDecision[];
  themes: BrainTheme[];
  recentActivity: BrainActivityItem[];
  recommendations: BrainRecommendation[];
}

/* -----------------------------------------------------------
   🧠 Normalisation backend → frontend
----------------------------------------------------------- */

function normalizeProjectBrain(raw: any): ProjectBrainData {
  const brain = raw.ai_brain || {};

  return {
    projectId: raw.project_id,
    projectName: raw.project_name ?? "Untitled Project",

    updatedAt: raw.updated_at || brain.updated_at || new Date().toISOString(),

    /* ---------- Health Score ---------- */
    healthScore: brain.health_score ?? 50,

    healthBreakdown: {
      positives: brain.positives ?? [],
      negatives: brain.negatives ?? [],
      factors: brain.health_factors ?? [],
    },

    /* ---------- Momentum ---------- */
    momentum: brain.momentum ?? "STABLE",

    /* ---------- Executive Summary ---------- */
    executiveSummary: brain.global_summary ?? "No summary generated yet.",

    /* ---------- Risks ---------- */
    topRisks: brain.risks ?? [],

    /* ---------- Important decisions ---------- */
    topDecisions: brain.decisions ?? [],

    /* ---------- Themes ---------- */
    themes: (brain.themes || []).map((t: any) =>
      typeof t === "string"
        ? { name: t, weight: 30 }
        : t
    ),

    /* ---------- AI Timeline ---------- */
    recentActivity: brain.timeline ?? [],

    /* ---------- AI Recommendations ---------- */
    recommendations: (brain.recommendations || []).map((r: any) =>
      typeof r === "string"
        ? {
            id: crypto.randomUUID(),
            title: r,
            description: "",
            priority: "MEDIUM",
          }
        : r
    ),
  };
}

/* -----------------------------------------------------------
   🔥 GET — récupérer et normaliser
----------------------------------------------------------- */

export async function getProjectBrain(
  projectId: string | number
): Promise<ProjectBrainData> {
  const response = await api.get(`/projects/${projectId}/brain`);
  return normalizeProjectBrain(response.data);
}

/* -----------------------------------------------------------
   🔥 PUT — mettre à jour le Brain (retour normalisé)
----------------------------------------------------------- */

export async function updateProjectBrain(
  projectId: string | number,
  payload: any
): Promise<ProjectBrainData> {
  const response = await api.put(`/projects/${projectId}/brain`, payload);
  return normalizeProjectBrain(response.data);
}
