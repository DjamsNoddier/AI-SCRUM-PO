// src/features/projects/components/tabs/brain/brain/RecommendationsCard.tsx

import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Brain, FileText } from "lucide-react";
import { Button } from "../ui/button";
import type { BrainRecommendation } from "../../api/projectBrainService";

interface Props {
  recommendations: BrainRecommendation[];
}

export default function RecommendationsCard({ recommendations }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="h-5 w-5 text-fuchsia-300" />
          AI Recommendations
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {recommendations.map((rec: BrainRecommendation, i: number) => (
          <div key={i} className="rounded-xl bg-slate-900/70 p-4 flex gap-3">
            <div
              className={`h-3 w-3 rounded-full mt-1 ${
                rec.priority === "HIGH"
                  ? "bg-rose-400"
                  : rec.priority === "MEDIUM"
                  ? "bg-amber-400"
                  : "bg-slate-500"
              }`}
            />

            <div>
              <p className="text-[15px] font-semibold text-slate-100">
                {rec.title}
              </p>
              <p className="text-[14px] text-slate-400">{rec.description}</p>
            </div>
          </div>
        ))}

        <Button className="w-full flex items-center justify-center gap-2">
          <FileText className="h-4 w-4" />
          Generate full AI report (PDF)
        </Button>
      </CardContent>
    </Card>
  );
}
