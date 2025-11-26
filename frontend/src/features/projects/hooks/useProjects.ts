import { useEffect, useState } from "react";
import { getProjects } from "../api/projectService";
import type { ProjectResponse } from "../types";

export function useProjects() {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Erreur lors du chargement des projets.");
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  return { projects, loading, error };
}

