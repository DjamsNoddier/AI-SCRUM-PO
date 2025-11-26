// src/features/sessions/hooks/useAudioWorkletProbe.ts
import { useEffect, useRef, useState } from "react";

export function useAudioWorkletProbe() {
  const [isRunning, setIsRunning] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); // pour voir si ça bouge

  const audioCtxRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const start = async () => {
    if (isRunning) return;

    try {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
        },
      });
      streamRef.current = stream;

      const source = ctx.createMediaStreamSource(stream);

      // 🔥 Charge notre processeur
      await ctx.audioWorklet.addModule("/audio-worklet/recorder-processor.js");

      const node = new AudioWorkletNode(ctx, "recorder-processor");
      workletNodeRef.current = node;

      // On reçoit les samples depuis le worklet
      node.port.onmessage = (event) => {
        const samples = event.data as Float32Array;

        // On calcule un "niveau" (RMS simplifié) juste pour afficher
        let sum = 0;
        for (let i = 0; i < samples.length; i++) {
          sum += samples[i] * samples[i];
        }
        const rms = Math.sqrt(sum / samples.length);
        setAudioLevel(rms); // entre 0 et ~1
      };

      // Chaînage audio : source -> worklet (-> destination si tu veux entendre)
      source.connect(node);
      // node.connect(ctx.destination); // si tu veux écouter (echo ⚠️)

      setIsRunning(true);
    } catch (e) {
      console.error("❌ useAudioWorkletProbe start error:", e);
    }
  };

  const stop = () => {
    setIsRunning(false);

    // Stop worklet
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }

    // Stop tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return {
    isRunning,
    audioLevel,
    start,
    stop,
  };
}
