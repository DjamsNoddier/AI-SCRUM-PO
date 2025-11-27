import { useEffect, useState } from "react";

const steps = [
  "Cleaning audio…",
  "Transcribing speech…",
  "Understanding meeting context…",
  "Extracting key product insights…",
  "Generating user stories…",
  "Detecting risks & decisions…",
  "Building consulting summary…",
  "Finalizing output…",
];

export default function ProcessingModal({ isOpen }: { isOpen: boolean }) {
  const [stepIndex, setStepIndex] = useState(0);

  // Gère la progression automatique des étapes
  useEffect(() => {
    if (!isOpen) return;

    setStepIndex(0);

    const interval = setInterval(() => {
      setStepIndex((prev) =>
        prev < steps.length - 1 ? prev + 1 : prev
      );
    }, 1300);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="
        fixed inset-0 z-[9999]
        flex items-center justify-center
        bg-black/70 backdrop-blur-2xl
        opacity-0 animate-fadeIn
      "
    >
      {/* Glow global */}
      <div className="
        absolute inset-0 -z-10
        bg-[radial-gradient(circle_at_center,_rgba(236,72,153,0.12),_rgba(56,189,248,0.12),_rgba(52,211,153,0.12))]
      " />

      {/* Card */}
      <div className="
        w-full max-w-md p-8
        rounded-3xl
        bg-white/10 border border-white/10 
        shadow-[0_0_60px_rgba(0,0,0,0.6)]
        text-center
      ">
        
        {/* Loader premium avec glow animé */}
        <div className="relative mx-auto mb-6">
          {/* Glow animé */}
          <div
            className="
              absolute inset-0 
              rounded-full 
              bg-gradient-to-r from-fuchsia-400/30 via-sky-400/30 to-emerald-400/30 
              blur-xl 
              animate-pulseSlow
            "
          />

          {/* Spinner */}
          <div
            className="
              relative
              h-16 w-16 
              rounded-full 
              border-4 border-white/20 border-t-fuchsia-300 
              animate-spin
            "
          />
        </div>

        {/* Texte étape en cours */}
        <p className="text-slate-200 font-medium text-sm mb-4">
          {steps[stepIndex]}
        </p>

        {/* Fake progress bar premium */}
        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-fuchsia-400 via-sky-400 to-emerald-400 transition-all"
            style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Redirect message */}
        {stepIndex === steps.length - 1 && (
          <p className="text-[11px] text-slate-400 mt-6 animate-pulse">
            Redirecting to your summary…
          </p>
        )}

        {/* Small hint */}
        <p className="text-[10px] text-slate-400 mt-4">
          Mindloop AI is processing your meeting…
        </p>
      </div>

      {/* Animations CSS */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(.96); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn {
            animation: fadeIn .45s ease forwards;
          }

          @keyframes pulseSlow {
            0%, 100% { opacity: .5; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.1); }
          }
          .animate-pulseSlow {
            animation: pulseSlow 2.8s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
}
