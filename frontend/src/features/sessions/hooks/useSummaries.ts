// src/features/summaries/hooks/useSummaries.ts

import { useEffect, useState } from "react";
import { getAllSummaries } from "../api/summaryService";
import type { SummaryItem } from "../api/summaryService";


export function useSummaries() {
  const [summaries, setSummaries] = useState<SummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllSummaries();
        setSummaries(data);
      } catch (err) {
        setError("Impossible de charger les résumés.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { summaries, loading, error };
}
