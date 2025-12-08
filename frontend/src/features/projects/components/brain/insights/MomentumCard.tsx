// src/features/projects/components/tabs/brain/brain/MomentumCard.tsx

import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { TrendingUp, Activity, Clock, AlertTriangle } from "lucide-react";
import type { BrainMomentum } from "../../../api/projectBrainService";
import type { JSX } from "react";

interface Props {
  momentum: BrainMomentum;
}

export default function MomentumCard({ momentum }: Props) {
  const cfg: Record<
    BrainMomentum,
    { label: string; icon: JSX.Element }
  > = {
    ACCELERATING: {
      label: "Accelerating",
      icon: <TrendingUp className="h-5 w-5 text-emerald-300" />,
    },
    STABLE: {
      label: "Stable",
      icon: <Activity className="h-5 w-5 text-sky-300" />,
    },
    SLOWING: {
      label: "Slowing",
      icon: <Clock className="h-5 w-5 text-amber-300" />,
    },
    AT_RISK: {
      label: "At Risk",
      icon: <AlertTriangle className="h-5 w-5 text-rose-300" />,
    },
  };

  const current = cfg[momentum];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {current.icon}
          Momentum
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-[15px] font-semibold text-slate-200">
          {current.label}
        </p>
        <p className="text-[14px] text-slate-400 mt-1">
          Based on meeting cadence, decisions, risk exposure.
        </p>
      </CardContent>
    </Card>
  );
}
