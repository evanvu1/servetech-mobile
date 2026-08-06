import { mockAnalysis } from "@/data/mockAnalysis";
import type { AnalysisResult, ServeMetadata } from "@/types/analysis";
export type ProcessingStage = "uploading" | "detecting" | "tracking" | "scoring" | "feedback" | "complete";
export type ProgressUpdate = { stage: ProcessingStage; percent: number };
export async function analyzeServe(videoUri: string, metadata: ServeMetadata, onProgress?: (update: ProgressUpdate) => void): Promise<AnalysisResult> {
  // TODO: Replace this simulation with the real analyzer API upload and job polling.
  // The public signature can remain stable when the Python endpoint is connected.
  void videoUri; void metadata;
  const updates: ProgressUpdate[] = [
    { stage: "uploading", percent: 12 }, { stage: "uploading", percent: 28 }, { stage: "detecting", percent: 45 },
    { stage: "tracking", percent: 62 }, { stage: "tracking", percent: 74 }, { stage: "scoring", percent: 86 },
    { stage: "feedback", percent: 95 }, { stage: "complete", percent: 100 },
  ];
  for (const update of updates) { await new Promise(resolve => setTimeout(resolve, 500)); onProgress?.(update); }
  return mockAnalysis;
}
