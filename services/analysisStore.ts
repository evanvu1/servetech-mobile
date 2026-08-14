import type { AnalysisResult } from "@/types/analysis";

// Same-process handoff from processing.tsx to results.tsx. Navigation
// between Expo Router screens doesn't reload the JS runtime, so a plain
// module-level value is enough — no need for AsyncStorage/context for data
// that only needs to survive one screen transition.
let lastAnalysis: AnalysisResult | null = null;

export function setLastAnalysis(result: AnalysisResult) {
  lastAnalysis = result;
}

export function getLastAnalysis(): AnalysisResult | null {
  return lastAnalysis;
}
