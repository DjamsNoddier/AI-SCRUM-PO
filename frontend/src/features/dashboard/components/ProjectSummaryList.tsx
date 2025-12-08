import type { Project, ProjectAggregate } from "../types/dashboard";
import ProjectSummaryCard from "./ProjectSummaryCard";

type Props = {
  projects: Project[];
  aggregates: Record<number, ProjectAggregate>;
  onSelect: (id: number) => void;
};

export default function ProjectSummaryList({ projects, aggregates, onSelect }: Props) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-slate-100 mb-3">Your projects</h2>

      <div className="flex flex-col gap-4">
        {projects.map((p) => (
          <ProjectSummaryCard
            key={p.id}
            project={p}
            aggregate={aggregates[p.id]}
            onClick={() => onSelect(p.id)}
          />
        ))}
      </div>
    </section>
  );
}
