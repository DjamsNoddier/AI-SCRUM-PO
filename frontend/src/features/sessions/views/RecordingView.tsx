// src/features/sessions/views/RecordingView.tsx
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Mic, Pause, Play, Square } from "lucide-react";
import { useAudioRecorder } from "../hooks/useAudioRecorder";

type LocationState = { meetingTitle?: string };

export default function RecordingView() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;

  const meetingTitle = state?.meetingTitle || "New meeting";

  const {
    isRecording,
    isPaused,
    seconds,
    status,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  } = useAudioRecorder(sessionId!);  // ✅ plus de projectId ici

  const [isStopping, setIsStopping] = useState(false);
  const bars = Array.from({ length: 26 }).map(() => 12 + Math.random() * 30);

  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  return (
    <div
      className="
        relative
        grid place-items-center
        min-h-[calc(100dvh-var(--mobile-header-h,0px))] lg:min-h-[100dvh]
        bg-slate-950 text-slate-50
      "
    >
      {/* PAGE CONTENT */}
      <div className="px-8 py-10 w-full">
        {/* HEADER */}
        <header className="text-center mb-3">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] text-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Step 2 · Record your meeting
          </p>
        </header>

        <h1 className="text-xl font-semibold text-center">{meetingTitle}</h1>
        <p className="text-[12px] text-slate-400 text-center">Mindloop is listening with AI.</p>

        {/* MICRO */}
        <div className="relative mt-3 flex items-center justify-center">
          <div
            className={`absolute inset-0 rounded-full blur-xl transition-all ${
              isRecording && !isPaused ? "bg-red-500/40 scale-110" : "bg-slate-500/20 scale-95"
            }`}
          />
          <div
            className={`h-28 w-28 rounded-full flex items-center justify-center shadow-xl border transition-all ${
              isRecording && !isPaused
                ? "bg-red-600 border-red-900 scale-105"
                : "bg-slate-200 border-slate-400"
            }`}
          >
            <Mic size={40} className={isRecording ? "text-white" : "text-slate-800"} />
          </div>
        </div>

        {/* TIMER */}
        <div className="font-mono text-xl tracking-widest text-slate-100 mt-3 text-center">
          {minutes}:{secs}
        </div>
        <p className="text-[11px] text-slate-400 text-center">
          {status}{isRecording && !isPaused ? "..." : ""}
        </p>

        {/* WAVEFORM */}
        <div className="h-12 w-full flex items-center justify-center mt-3 mb-4">
          <div className="flex items-end gap-[2px]">
            {bars.map((h, i) => (
              <div
                key={i}
                className={`w-[3px] rounded-full bg-gradient-to-b from-fuchsia-400 via-sky-400 to-emerald-400 ${
                  isRecording && !isPaused ? "opacity-100" : "opacity-40"
                }`}
                style={{
                  height: `${h * 0.75}px`,
                  animationName: isRecording ? "pulseWave" : "none",
                  animationDuration: "1.2s",
                  animationTimingFunction: "ease-in-out",
                  animationIterationCount: "infinite",
                  animationDelay: `${i * 0.02}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex w-full justify-center gap-3 mb-8 flex-wrap">
          {!isRecording && !isStopping && (
            <button
              onClick={startRecording}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg hover:bg-slate-200 active:scale-[0.97] min-w-[160px]"
            >
              <Play size={14} />
              Start recording
            </button>
          )}

          {isRecording && !isStopping && (
            <>
              <button
                onClick={() => (isPaused ? resumeRecording() : pauseRecording())}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-semibold text-slate-100 hover:bg-white/10 active:scale-[0.97] min-w-[120px]"
              >
                {isPaused ? (
                  <>
                    <Play size={14} /> Resume
                  </>
                ) : (
                  <>
                    <Pause size={14} /> Pause
                  </>
                )}
              </button>

              <button
                onClick={async () => {
                  setIsStopping(true);
                  await stopRecording();
                  navigate(`/app/summary/${sessionId}`);
                }}
                
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-xs font-semibold text-white shadow-lg hover:bg-red-700 active:scale-[0.97] min-w-[120px]"
              >
                <Square size={14} />
                Stop
              </button>
            </>
          )}

          {isStopping && (
            <button
              disabled
              className="inline-flex items-center justify-center rounded-xl bg-white/10 px-5 py-3 text-xs font-semibold text-slate-400 cursor-not-allowed min-w-[160px]"
            >
              ⏳ Finalizing…
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulseWave {
          0%, 100% { transform: scaleY(0.8); }
          50% { transform: scaleY(1.4); }
        }
      `}</style>
    </div>
  );
}
