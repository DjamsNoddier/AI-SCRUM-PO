import MeetingsTimeline from "../ui/MeetingsTimeline";
import type { ProjectSession, ProjectStats as Stats } from "../../api/projectService";

type Props = {
  sessions: ProjectSession[];
  stats: Stats;
};

export default function ProjectMeetingsTab({ sessions }: Props) {
  return (
    <div className="space-y-8">
      {/* TIMELINE FULL */}
      <MeetingsTimeline sessions={sessions} />
    </div>
  );
}
