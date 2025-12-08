// src/features/dashboard/types/dashboard.ts
export interface Project {
    id: number;
    title: string;
    description?: string | null;
    created_at: string;
  }
  
  export interface Meeting {
    id: string;
    title: string;
    project_id: number;
    created_at: string;
    user_stories_count?: number;
    decisions?: number;
    risks?: number;
  }
  
  export interface ProjectAggregate {
    totalUserStories: number;
    totalDecisions: number;
    totalRisks: number;
    meetingsCount: number;
    lastMeetingAt?: string;
    lastMeetingTitle?: string;
  }
  
  /**
   * Action item “brut” = data only (aucun JSX ici).
   * L’UI décidera quel icône utiliser en fonction du type.
   */
  export type ActionItemKind = "decisions" | "risks" | "userStories";
  
  export interface ActionItem {
    kind: ActionItemKind;
    count: number;
  }
  
  export interface DashboardData {
    loading: boolean;
    error: string | null;
    projects: Project[];
    meetings: Meeting[];
    aggregates: Record<number, ProjectAggregate>;
    orderedMeetings: Meeting[];
    recentMeetings: Meeting[];
    topRisks: Meeting[];
    upcomingMeetings: Meeting[];
    actionItems: ActionItem[];
  }
  