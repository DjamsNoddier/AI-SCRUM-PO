import { useCallback } from "react";
import { saveAudioChunks, loadAudioChunks, clearAudioChunks } from "../../../lib/storage";

/**
 * 💾 useAudioStorage
 *
 * Hook pour sauvegarder et restaurer les chunks audio dans IndexedDB.
 * Utilisé conjointement avec useAudioRecorder pour la résilience du pipeline.
 */
export function useAudioStorage() {
  /**
   * Sauvegarde périodique des chunks (appelée toutes les 30s)
   */
  const saveChunks = useCallback(async (chunks: BlobPart[]) => {
    await saveAudioChunks(chunks);
  }, []);

  /**
   * Restaure les chunks d'une session interrompue
   */
  const restoreChunks = useCallback(async (): Promise<BlobPart[] | null> => {
    return await loadAudioChunks();
  }, []);

  /**
   * Nettoie la sauvegarde locale
   */
  const clearStorage = useCallback(async () => {
    await clearAudioChunks();
  }, []);

  return { saveChunks, restoreChunks, clearStorage };
}
