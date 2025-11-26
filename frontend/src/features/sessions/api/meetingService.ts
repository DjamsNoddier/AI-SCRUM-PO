// src/services/meetingService.ts
import api from "../../../lib/axios";


const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export async function startMeeting() {
  const response = await api.post(`${API_BASE}/meetings/start`);
  return response.data.meeting_id;
}

export async function uploadChunk(meetingId: string, index: number, blob: Blob) {
  const formData = new FormData();
  formData.append("meeting_id", meetingId);
  formData.append("index", index.toString());
  formData.append("file", blob, `chunk_${index}.webm`);

  try {
    await api.post(`${API_BASE}/meetings/upload-chunk`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    });
    console.log(`✅ Chunk ${index} envoyé avec succès`);
  } catch (error) {
    console.error(`⚠️ Erreur lors de l’envoi du chunk ${index}`, error);
    // retry automatique
    setTimeout(() => uploadChunk(meetingId, index, blob), 5000);
  }
}

// finalize meeting (meetingId + sessionId)
export async function finalizeMeeting(meetingId: string, sessionId: string) {
  const formData = new FormData();
  formData.append("meeting_id", meetingId);
  formData.append("session_id", sessionId);

  const response = await api.post("/meetings/finalize", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
}

export async function createSession({ title, project_id }: { title: string, project_id?: number }) {
  const response = await api.post("/meetings/create", {
    title,
    project_id,
  });
  return response.data;
}

// features/meetings/api/meetingService.ts
export async function getFakeMeeting() {
  const res = await fetch("/api/v1/meetings/get-fake");
  return res.json();
}
