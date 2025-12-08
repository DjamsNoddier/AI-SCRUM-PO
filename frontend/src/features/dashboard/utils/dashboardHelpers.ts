import type { ProjectAggregate } from "../types/dashboard";

export function timeAgo(dateString?: string): string {
    if (!dateString) return "No activity";
    const date = new Date(dateString);
    const diff = (Date.now() - date.getTime()) / 1000;
  
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 172800) return "Yesterday";
    return `${Math.floor(diff / 86400)} days ago`;
  }
  
  export function generateInsight(agg?: ProjectAggregate): string {
    if (!agg) return "No data yet.";
  
    const { totalRisks, totalDecisions, totalUserStories, meetingsCount } = agg;
  
    if (meetingsCount === 0) return "📄 No meetings analyzed yet.";
    if (totalRisks > 5) return "⚠️ High number of risks.";
    if (totalDecisions > totalUserStories * 2)
      return "💡 High decision load compared to user stories.";
    return "✓ Project appears stable.";
  }
  