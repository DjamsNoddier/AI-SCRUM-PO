import { useState, useRef, useEffect } from "react";
import { createSession, uploadChunk, finalizeMeeting, startMeeting } from "../api/meetingService";
import { Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";


export type RecorderButtonProps = {
  meetingTitle: string;
  triggerStart?: boolean;
};

export default function RecorderButton({ meetingTitle, triggerStart }: RecorderButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [meetingId, setMeetingId] = useState("");
  const [status, setStatus] = useState("🔴 En attente");
  const [seconds, setSeconds] = useState(0);
  const [sessionId, setSessionId] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const chunkIndex = useRef(1);

  const navigate = useNavigate();   

  // TIMER
  const startTimer = () => {
    timerRef.current = window.setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setSeconds(0);
  };

  // START RECORDING
  const startRecording = async () => {
    if (!meetingTitle.trim()) {
      setStatus("⚠️ Titre requis avant de démarrer");
      return;
    }

    // 1️⃣ Créer la session en DB
    const created = await createSession({ title: meetingTitle });
    setSessionId(created.session_id);

    const meeting_id = await startMeeting();
    setMeetingId(meeting_id);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

    setIsRecording(true);
    setStatus("🎙️ Enregistrement en cours...");
    startTimer();

    recorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        const blob = new Blob([event.data], { type: "audio/webm" });
        await uploadChunk(meeting_id, chunkIndex.current++, blob);
      }
    };

    recorder.start(20000);
    mediaRecorderRef.current = recorder;
  };

  

  // STOP RECORDING + FINALIZE
  const stopRecording = async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    setIsRecording(false);
    setIsFinalizing(true);
    setStatus("🧩 Fusion et analyse du meeting...");
    stopTimer();

    if (recorder.state !== "inactive") {
      const stopPromise = new Promise<void>((resolve) => {
        recorder.onstop = () => {
          recorder.stream.getTracks().forEach((track) => track.stop());
          resolve();
        };
      });
      recorder.stop();
      await stopPromise;
    }

    [20, 45, 70, 90, 100].forEach((value, i) =>
      setTimeout(() => setProgress(value), 500 * i)
    );

    try {
      const summary = await finalizeMeeting(meetingId, sessionId);
      console.log("Résumé meeting :", summary);
      setStatus(`✅ Meeting analysé (${summary.user_stories_count} User Stories)`);

      // --------------------------------------------------
      // 🚀 AJOUT : REDIRECTION AUTOMATIQUE APRÈS STOP
      // --------------------------------------------------

      navigate(`/summary/${sessionId}`);
      // --------------------------------------------------

    } catch (error) {
      console.error("Erreur finalisation :", error);
      setStatus("❌ Erreur lors de la finalisation");
    } finally {
      setIsFinalizing(false);
      setProgress(0);
    }
  };

  // AUTO START
  useEffect(() => {
    if (triggerStart && !isRecording && !isFinalizing) {
      startRecording();
    }
  }, [triggerStart]);

  // UI
  return (
    <div className="flex flex-col items-center gap-6">

      <div
        className={`p-8 rounded-full shadow-xl border transition-all ${
          isRecording ? "bg-red-500 border-red-700 scale-110" : "bg-gray-200"
        }`}
      >
        <Mic size={48} color={isRecording ? "white" : "black"} />
      </div>

      {isRecording && (
        <div className="text-xl font-semibold tracking-wide text-lightgray-800">
          {String(Math.floor(seconds / 60)).padStart(2, "0")}:
          {String(seconds % 60).padStart(2, "0")}
        </div>
      )}

      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isFinalizing}
        className={`px-8 py-4 rounded-xl text-white text-lg font-semibold shadow-lg transition-all ${
          isRecording
            ? "bg-red-600 hover:bg-red-700"
            : "bg-blue-600 hover:bg-blue-700"
        } ${isFinalizing ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        {isRecording ? " Stop" : " Start"}
      </button>

      <div className="text-sm text-gray-600">{status}</div>

      {isFinalizing && (
        <div className="w-full max-w-xs">
          <div className="text-xs text-center mb-1 text-gray-500">
            {progress}%
          </div>
          <div className="bg-gray-300 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
