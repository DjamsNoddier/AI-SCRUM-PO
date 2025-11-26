import api from "../../../lib/axios";

export async function getAllSummaries(): Promise<SummaryItem[]> {
  const response = await api.get("/meetings/");

  const items = response.data || [];

  // Assure un VRAI tableau vide
  if (!Array.isArray(items)) {
    return [];
  }

  // Mapping du backend vers SummaryItem
  return items.map((m: any) => ({
    session_id: m.id,
    title: m.title,
    date: m.created_at,
    decisions: m.decisions || 0,
    risks: m.risks || 0,
    user_stories_count: m.user_stories_count || 0,
    excerpt: m.summary?.excerpt ?? "",
  }));
}

export type SummaryItem = {
  session_id: string;
  title: string;
  date: string;
  decisions: number;
  risks: number;
  user_stories_count: number;
  excerpt?: string;
};
