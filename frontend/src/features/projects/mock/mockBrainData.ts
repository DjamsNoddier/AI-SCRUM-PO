//frontend/src/features/projects/mock/mockBrainData.ts
import type { ProjectBrainData } from "../api/projectBrainService";

export const mockBrainData: ProjectBrainData = {
  projectId: 42,
  projectName: "Mindloop – AI Cockpit",
  updatedAt: "2025-01-09T10:32:00Z",

  /* -----------------------------------------------------------
     HEALTH SCORE
  ----------------------------------------------------------- */
  healthScore: 78,

  healthBreakdown: {
    positives: [
      "Backlog refinement done consistently last 2 weeks",
      "Risk detection pipeline fully implemented",
      "Meeting transcription accuracy improved by 14%"
    ],
    negatives: [
      "AudioWorklet integration unstable on some browsers",
      "Delay on Document Summaries V2"
    ],
    factors: [
      { label: "Progress Velocity", score: +22 },
      { label: "Risk Exposure", score: -9 },
      { label: "Team Alignment", score: +14 },
      { label: "Technical Debt", score: -6 }
    ]
  },

  /* -----------------------------------------------------------
     MOMENTUM
  ----------------------------------------------------------- */
  momentum: "ACCELERATING",

  /* -----------------------------------------------------------
     EXECUTIVE SUMMARY
  ----------------------------------------------------------- */
  executiveSummary:
    "The project is progressing at a steady and accelerating pace. Recent meetings show strong alignment within the team, while risks related to browser audio constraints and document pipeline delays remain manageable. The next sprint should focus on polishing the Brain Tab UI, stabilizing the AudioWorklet, and integrating time-saved analytics.",

  /* -----------------------------------------------------------
     RISKS
  ----------------------------------------------------------- */
  topRisks: [
    {
      id: "risk-1",
      title: "AudioContext sample-rate mismatch causing recording failures",
      level: "HIGH",
      description:
        "Detected from several meeting logs. Chrome mobile creates contexts with non-standard sample rates.",
      source: "MEETING",
      detected_at: "2025-01-08T09:21:00Z"
    },
    {
      id: "risk-2",
      title: "Delay on document analysis V2 (semantic models)",
      level: "MEDIUM",
      description:
        "New metadata extraction model requires further training time.",
      source: "DOCUMENT",
      detected_at: "2025-01-07T12:17:00Z"
    },
    {
      id: "risk-3",
      title: "Spec coverage inconsistent across 'îlots'",
      level: "LOW",
      description:
        "SMITS and SMSDS have excellent SPEC → US alignment. SMPID remains partially covered.",
      source: "BACKLOG",
      detected_at: "2025-01-08T16:45:00Z"
    }
  ],

  /* -----------------------------------------------------------
     DECISIONS
  ----------------------------------------------------------- */
  topDecisions: [
    {
      id: "decision-1",
      title: "Adopt AudioWorklet for stable meeting recording",
      description:
        "Team validated the transition from MediaRecorder to AudioWorklet for all users.",
      owner: "Djamil",
      decided_at: "2025-01-06T10:00:00Z",
      due_date: "2025-01-12T00:00:00Z"
    },
    {
      id: "decision-2",
      title: "Finalize Brain Tab for Beta release",
      description:
        "All UI components to be polished and integrated before Jan 15.",
      owner: "Frontend Team",
      decided_at: "2025-01-07T11:00:00Z"
    },
    {
      id: "decision-3",
      title: "Centralize document text extraction into unified pipeline",
      description:
        "All documents (PDF, TXT, DOCX) to use one normalized extraction flow.",
      owner: "Backend Team",
      decided_at: "2025-01-08T14:30:00Z"
    }
  ],

  /* -----------------------------------------------------------
     THEMES
  ----------------------------------------------------------- */
  themes: [
    {
      name: "AI Insights Generation",
      weight: 65,
      description: "Most meeting discussions revolve around improving AI output."
    },
    {
      name: "Frontend Polish & UX",
      weight: 45,
      description: "Focus on making ProjectView and Brain Tab ready for beta."
    },
    {
      name: "Technical Stabilization",
      weight: 30,
      description: "AudioWorklet + text extraction pipeline + time-saved tracking."
    }
  ],

  /* -----------------------------------------------------------
     TIMELINE (Recent AI activity)
  ----------------------------------------------------------- */
  recentActivity: [
    {
      id: "act-1",
      type: "MEETING",
      title: "Sprint Planning recorded & analyzed",
      summary: "AI extracted 3 decisions & 1 risk.",
      occurred_at: "2025-01-09T09:10:00Z",
      source_label: "Sprint Planning #12"
    },
    {
      id: "act-2",
      type: "DOCUMENT",
      title: "New document uploaded: BrainTabSpecV2.pdf",
      summary: "AI extracted 6 themes and 2 risks.",
      occurred_at: "2025-01-08T17:25:00Z",
      source_label: "Doc Upload"
    },
    {
      id: "act-3",
      type: "INSIGHT",
      title: "Momentum increased due to 3 active coding days",
      summary: "Detected constant activity on frontend & backend.",
      occurred_at: "2025-01-08T15:10:00Z"
    },
    {
      id: "act-4",
      type: "RISK",
      title: "Instability in AudioWorklet sample-rate",
      occurred_at: "2025-01-08T09:22:00Z"
    },
    {
      id: "act-5",
      type: "DECISION",
      title: "Finalize Brain Tab UI structure",
      occurred_at: "2025-01-07T20:10:00Z"
    }
  ],

  /* -----------------------------------------------------------
     RECOMMENDATIONS
  ----------------------------------------------------------- */
  recommendations: [
    {
      id: "rec-1",
      title: "Stabilize AudioWorklet sample-rate handling",
      description:
        "Implement fallback sample-rate normalizer to avoid browser constraints.",
      priority: "HIGH",
      target_area: "DELIVERY"
    },
    {
      id: "rec-2",
      title: "Document the Project Brain normalization pipeline",
      description:
        "Ensures scalability of V2 semantic models and ML scoring.",
      priority: "MEDIUM",
      target_area: "ALIGNMENT"
    },
    {
      id: "rec-3",
      title: "Expand risk detection to include code diffs",
      description:
        "Once Git integration is active, detect risks in commits.",
      priority: "LOW",
      target_area: "RISK"
    },
    {
      id: "rec-4",
      title: "Prepare beta-launch email sequence",
      description: "Marketing + product should align messaging.",
      priority: "MEDIUM",
      target_area: "COMMUNICATION"
    }
  ]
};
