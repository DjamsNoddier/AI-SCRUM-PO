// src/features/dashboard/hooks/useDashboardData.ts
import { useEffect, useMemo, useState } from "react";
import api from "../../../lib/axios";
import type {
  DashboardData,
  Project,
  Meeting,
  ProjectAggregate,
  ActionItem,
} from "../types/dashboard";

export function useDashboardData(): DashboardData {
  const [projects, setProjects] = useState<Project[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ---------------------- LOAD DATA ----------------------
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [pRes, mRes] = await Promise.all([
          api.get("/projects/"),
          api.get("/meetings/"),
        ]);

        setProjects(Array.isArray(pRes.data) ? pRes.data : []);
        setMeetings(Array.isArray(mRes.data) ? mRes.data : []);
      } catch (e) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // ---------------------- ORDERED MEETINGS ----------------------
  const orderedMeetings = useMemo(
    () =>
      [...meetings].sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      ),
    [meetings]
  );

  const recentMeetings = orderedMeetings.slice(0, 3);

  // ---------------------- AGGREGATES ----------------------
  const aggregates = useMemo(() => {
    const agg: Record<number, ProjectAggregate> = {};

    for (const m of meetings) {
      const id = m.project_id;

      if (!agg[id]) {
        agg[id] = {
          totalDecisions: 0,
          totalRisks: 0,
          totalUserStories: 0,
          meetingsCount: 0,
        };
      }

      agg[id].totalDecisions += m.decisions ?? 0;
      agg[id].totalRisks += m.risks ?? 0;
      agg[id].totalUserStories += m.user_stories_count ?? 0;
      agg[id].meetingsCount++;

      const newDate = new Date(m.created_at).getTime();
      const oldDate = agg[id].lastMeetingAt
        ? new Date(agg[id].lastMeetingAt!).getTime()
        : 0;

      if (newDate > oldDate) {
        agg[id].lastMeetingAt = m.created_at;
        agg[id].lastMeetingTitle = m.title;
      }
    }

    return agg;
  }, [meetings]);

  // ---------------------- RISKS ----------------------
  const topRisks = orderedMeetings
    .filter((m) => (m.risks ?? 0) > 0)
    .slice(0, 3);

  // ---------------------- UPCOMING (placeholder) ----------------------
  const upcomingMeetings: Meeting[] = [];

  // ---------------------- ACTION ITEMS (DATA ONLY) ----------------------
  const actionItems: ActionItem[] = useMemo(() => {
    const totalDecisions = meetings.reduce(
      (sum, m) => sum + (m.decisions ?? 0),
      0
    );
    const totalRisks = meetings.reduce(
      (sum, m) => sum + (m.risks ?? 0),
      0
    );
    const totalUS = meetings.reduce(
      (sum, m) => sum + (m.user_stories_count ?? 0),
      0
    );

    const items: ActionItem[] = [];

    if (totalDecisions > 0) {
      items.push({
        kind: "decisions",
        count: totalDecisions,
      });
    }

    if (totalRisks > 0) {
      items.push({
        kind: "risks",
        count: totalRisks,
      });
    }

    if (totalUS > 0) {
      items.push({
        kind: "userStories",
        count: totalUS,
      });
    }

    return items;
  }, [meetings]);

  // ---------------------- FINAL RETURN ----------------------
  return {
    loading,
    error,
    projects,
    meetings,
    aggregates,
    orderedMeetings,
    recentMeetings,
    topRisks,
    upcomingMeetings,
    actionItems,
  };
}
