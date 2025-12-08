// src/features/projects/components/tabs/brain/brain/DecisionsCard.tsx

import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { FileText } from "lucide-react";
import type { BrainDecision } from "../../../api/projectBrainService";

interface Props {
  decisions: BrainDecision[];
}

export default function DecisionsCard({ decisions }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-5 w-5 text-sky-300" />
          Key Decisions
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {decisions.map((d: BrainDecision, i: number) => (
          <div key={i} className="rounded-xl bg-slate-900/70 p-4">
            <p className="text-[15px] font-semibold text-slate-100">{d.title}</p>
            {d.description && (
              <p className="text-[14px] text-slate-400 mt-1">{d.description}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
