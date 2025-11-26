/**
 * 🗂️ storage.ts
 *
 * Utilitaires simples pour stocker et restaurer des données audio
 * via IndexedDB, en s’appuyant sur la librairie idb-keyval.
 */

import { set, get, del } from "idb-keyval";

const AUDIO_KEY = "ai_scrum_po_audio_chunks";

/** Enregistre un tableau de chunks audio */
export async function saveAudioChunks(chunks: BlobPart[]) {
  try {
    await set(AUDIO_KEY, chunks);
  } catch (err) {
    console.error("💾 Erreur de sauvegarde audio :", err);
  }
}

/** Récupère les chunks sauvegardés */
export async function loadAudioChunks(): Promise<BlobPart[] | null> {
  try {
    return (await get(AUDIO_KEY)) || null;
  } catch (err) {
    console.error("💾 Erreur de lecture audio :", err);
    return null;
  }
}

/** Supprime les données audio locales */
export async function clearAudioChunks() {
  try {
    await del(AUDIO_KEY);
  } catch (err) {
    console.error("💾 Erreur lors du nettoyage audio :", err);
  }
}
