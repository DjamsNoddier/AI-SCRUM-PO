// src/features/projects/components/tabs/brain/brain/HealthScoreCard.tsx

import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import type { ProjectBrainData } from "../../api/projectBrainService";
import { motion } from "framer-motion";

export default function HealthScoreCard({ data }: { data: ProjectBrainData }) {
  const score = Math.min(100, Math.max(0, data.healthScore));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-base text-slate-100">
          Project Health
          <Badge className="border border-fuchsia-400/60 text-fuchsia-200 text-[13px]">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex gap-6">
        <HealthScoreRing score={score} />

        {/* Points positifs / négatifs */}
        <div className="flex flex-col justify-between gap-4 text-[13px]">
          <div>
            <p className="text-emerald-300 font-medium mb-2 uppercase tracking-wide">
              Strengths
            </p>
            {data.healthBreakdown.positives?.map((p, i) => (
              <p key={i} className="text-emerald-200/90">• {p}</p>
            ))}
          </div>

          <div>
            <p className="text-amber-300 font-medium mb-2 uppercase tracking-wide">
              Weak Signals
            </p>
            {data.healthBreakdown.negatives?.map((n, i) => (
              <p key={i} className="text-amber-200/90">• {n}</p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HealthScoreRing({ score }: { score: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;

  const color =
    score >= 80 ? "text-emerald-400" :
    score >= 60 ? "text-sky-400" :
    score >= 40 ? "text-amber-400" :
    "text-rose-400";

  const stroke =
    score >= 80 ? "stroke-emerald-400" :
    score >= 60 ? "stroke-sky-400" :
    score >= 40 ? "stroke-amber-400" :
    "stroke-rose-400";

  return (
    <div className="relative h-32 w-32">
      <div className="absolute inset-0 rounded-full bg-fuchsia-500/10 blur-2xl" />

      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle
          className="stroke-slate-700"
          strokeWidth="6"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
        <motion.circle
          className={stroke}
          strokeWidth="6"
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: progress }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-semibold ${color}`}>{score}</span>
        <span className="text-[12px] uppercase text-slate-400">Health</span>
      </div>
    </div>
  );
}
