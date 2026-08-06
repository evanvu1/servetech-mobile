import type { AnalysisResult } from "@/types/analysis";
export const mockAnalysis: AnalysisResult = {
  id: "ST-0826", date: "Aug 6, 2026", overallScore: 82,
  metrics: [
    { id: "toss", label: "Toss", score: 88 }, { id: "legs", label: "Knee bend & leg drive", score: 74 },
    { id: "shoulder", label: "Shoulder rotation", score: 84 }, { id: "drop", label: "Racket drop", score: 71 },
    { id: "contact", label: "Contact point", score: 89 }, { id: "finish", label: "Follow-through", score: 79 },
  ],
  correction: { title: "Create a deeper racket drop", detail: "Keep your hitting elbow high and let the racket fall loosely behind your back before accelerating upward." },
  strengths: ["Stable toss placement", "High, extended contact", "Strong shoulder-over-shoulder action"],
  improvements: ["Load earlier through both legs", "Relax the hitting arm during the drop", "Finish farther across the body"],
  drills: ["Sock-serve shadow swings · 3 × 8", "Platform-to-jump serves · 3 × 6", "Finish-and-freeze serves · 2 × 10"],
};
export const recentServes = [
  { id: "1", type: "Flat serve", date: "Today", score: 82, change: 4 },
  { id: "2", type: "Kick serve", date: "Jul 29", score: 78, change: 2 },
  { id: "3", type: "Slice serve", date: "Jul 18", score: 76, change: -1 },
];

