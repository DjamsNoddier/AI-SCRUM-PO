// frontend/src/features/sessions/api/sessionsApi.ts //

import api from "../../../lib/axios"

/**
 * 📤 uploadAudio
 *
 * Envoie le Blob audio au backend pour transcription et génération d'une session.
 * Retourne la réponse JSON contenant les métadonnées de la session.
 */

export interface SessionResponse {
  session_id: string;
  audio_path: string;
  score_global: number;
  user_stories_count: number;
  themes: string[];
  duration_sec: number;
}

export async function uploadAudio(
  blob: Blob,
  onProgress?: (progress: number) => void
): Promise<SessionResponse> {
  try {
    const formData = new FormData();
    formData.append("file", blob, "session.wav");

    const response = await api.post<SessionResponse>(
      "/sessions/transcribe",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (event) => {
          if (event.total) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress?.(percent);
          }
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("❌ Upload failed:", error);
    throw new Error("Audio upload failed. Please try again.");
  }
}
