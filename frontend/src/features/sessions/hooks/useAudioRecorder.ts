// src/features/sessions/hooks/useAudioRecorder.ts

// --- Résilience IndexedDB ---
import { useAudioStorage } from "./useAudioStorage";

// --- WAV utils ---
import { floatTo16BitPCM, buildWavFileFromPCM } from "./wav";

import { useEffect, useRef, useState } from "react";
import { uploadChunk, finalizeMeeting, startMeeting } from "../api/meetingService";

export function useAudioRecorder(sessionId: string) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState("Idle");

  // ID meeting côté backend
  const meetingId = useRef<string>("");

  // AudioContext + Worklet
  const audioCtxRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // Buffer PCM accumulé
  const pcmBufferRef = useRef<Float32Array[]>([]);
  const sampleRateRef = useRef<number | null>(null);

  // Intervalles
  const flushIntervalRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  // IndexedDB (résilience)
  const { saveChunks, restoreChunks, clearStorage } = useAudioStorage();

  // ------------------------------
  // TIMER
  // ------------------------------
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      if (!isPaused) {
        setSeconds((s) => s + 1);
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // ------------------------------
  // 🔥 PCM → WAV → upload chunk
  // ------------------------------
  const flushPCM = async () => {
    if (
      pcmBufferRef.current.length === 0 ||
      !sampleRateRef.current ||
      !meetingId.current
    ) {
      return;
    }

    // Fusionner toutes les frames PCM en un seul tableau
    const total = pcmBufferRef.current.reduce((acc, frame) => acc + frame.length, 0);
    const merged = new Float32Array(total);

    let offset = 0;
    pcmBufferRef.current.forEach((frame) => {
      merged.set(frame, offset);
      offset += frame.length;
    });

    // On vide le buffer en RAM
    pcmBufferRef.current = [];

    // Float32 → PCM 16 bits
    const pcm16 = floatTo16BitPCM(merged);

    // Construction du WAV (header + data)
    const wavBlob = buildWavFileFromPCM(pcm16, sampleRateRef.current);

    // Filtre anti-bruit / chunks trop petits
    if (wavBlob.size > 2000) {
      await uploadChunk(meetingId.current, chunkIndex.current++, wavBlob);
      // Sauvegarde en local (résilience)
      await saveChunks([wavBlob]);
    }
  };

  const chunkIndex = useRef(1);

  // ------------------------------
  // START
  // ------------------------------
  const startRecording = async () => {
    if (isRecording) return;

    try {
      setStatus("Starting...");
      setSeconds(0);

      // 1) Créer l'ID de meeting côté backend
      meetingId.current = await startMeeting();

      // 2) Optionnel : restaurer ce qu'il y avait en local
      const restored = await restoreChunks();
      if (restored && restored.length > 0) {
        console.log("🔄 Chunks restaurés dans IndexedDB :", restored.length);
        // On ne les renvoie pas au backend ici, on les garde comme backup
      }

      // 3) Demande du micro
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
        },
      });
      micStreamRef.current = stream;

      // 4) Création AudioContext (48 kHz – standard conf call)
      const ctx = new AudioContext();
      sampleRateRef.current = ctx.sampleRate;
      audioCtxRef.current = ctx;

      // 5) Charger le worklet
      await ctx.audioWorklet.addModule("/audio-worklet/recorder-processor.js");

      const source = ctx.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(ctx, "recorder-processor");
      workletNodeRef.current = workletNode;

      // Quand le worklet envoie un buffer PCM
      workletNode.port.onmessage = (event) => {
        const frame = event.data as Float32Array;
        if (!isPaused) {
          pcmBufferRef.current.push(frame);
        }
      };

      // On doit connecter pour que le graph soit actif
      source.connect(workletNode);
      workletNode.connect(ctx.destination);

      // 6) Flush toutes les 5 secondes
      flushIntervalRef.current = window.setInterval(() => {
        flushPCM();
      }, 5000);

      // 7) UI state
      setIsRecording(true);
      setIsPaused(false);
      setStatus("Recording...");
      startTimer();
    } catch (e) {
      console.error("❌ startRecording error", e);
      setStatus("Error starting recorder");
      setIsRecording(false);
    }
  };

  // ------------------------------
  // PAUSE / RESUME logiques
  // ------------------------------
  const pauseRecording = () => {
    if (!isRecording) return;
    setIsPaused(true);
    setStatus("Paused");
  };

  const resumeRecording = () => {
    if (!isRecording) return;
    setIsPaused(false);
    setStatus("Recording...");
  };

  // ------------------------------
  // STOP
  // ------------------------------
  const stopRecording = async () => {
    if (!isRecording && !meetingId.current) return;

    try {
      setStatus("Finalizing...");
      setIsRecording(false);
      setIsPaused(false);
      stopTimer();

      // 1) Arrêter le flush périodique
      if (flushIntervalRef.current) {
        clearInterval(flushIntervalRef.current);
        flushIntervalRef.current = null;
      }

      // 2) Flush final du PCM restant
      await flushPCM();

      // 3) Nettoyage IndexedDB
      await clearStorage();

      // 4) Fermer le graph audio
      if (workletNodeRef.current) {
        try {
          workletNodeRef.current.disconnect();
        } catch {
          // ignore
        }
        workletNodeRef.current = null;
      }

      if (audioCtxRef.current) {
        try {
          await audioCtxRef.current.close();
        } catch {
          // ignore
        }
        audioCtxRef.current = null;
      }

      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }

      // 5) Finalisation côté backend (concat + IA)
      const result = await finalizeMeeting(meetingId.current, sessionId);
      return result;
    } catch (e) {
      console.error("❌ stopRecording error", e);
      setStatus("Error during finalize");
    }
  };

  // Nettoyage si le composant est démonté pendant un record
  useEffect(() => {
    return () => {
      stopTimer();

      if (flushIntervalRef.current) {
        clearInterval(flushIntervalRef.current);
        flushIntervalRef.current = null;
      }

      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }

      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
    };
  }, []);

  return {
    isRecording,
    isPaused,
    seconds,
    status,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  };
}
