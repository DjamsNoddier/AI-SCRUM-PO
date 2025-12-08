// src/features/projects/brain/hooks/useProjectBrain.ts

import { useEffect, useState } from "react";
import {
  type ProjectBrainData,
} from "../api/projectBrainService";
import { mockBrainData } from "../mock/mockBrainData";


export function useProjectBrain(projectId: number | string) {
  const [data, setData] = useState<ProjectBrainData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const fetchBrain = async () => {
    try {
      setLoading(true);
      setError(null);
      //const brain = await getProjectBrain(projectId);
      // par :
  const brain = mockBrainData;
      setData(brain);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Charger automatiquement
  useEffect(() => {
    if (!projectId) return;
    fetchBrain();
  }, [projectId]);

  return {
    data,
    loading,
    error,
    refetch: fetchBrain,
  };
}
