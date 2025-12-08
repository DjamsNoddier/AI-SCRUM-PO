// src/features/projects/components/tabs/brain/brain/BrainInsightsGrid.tsx

// src/features/projects/components/tabs/brain/brain/BrainInsightsGrid.tsx
import type { BrainRisk, BrainDecision, BrainTheme, BrainMomentum } from "../../api/projectBrainService";
import RisksCard from "./insights/RisksCard";
import DecisionsCard from "./insights/DecisionsCard";
import ThemesCard from "./insights/ThemesCard";
import MomentumCard from "./insights/MomentumCard";

interface Props {
  risks: BrainRisk[];
  decisions: BrainDecision[];
  themes: BrainTheme[];
  momentum: BrainMomentum;
}

export default function BrainInsightsGrid({ risks, decisions, themes, momentum }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <RisksCard risks={risks} />
      <DecisionsCard decisions={decisions} />
      <ThemesCard themes={themes} />
      <MomentumCard momentum={momentum} />
    </div>
  );
}
