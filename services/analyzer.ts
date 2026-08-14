import { File } from "expo-file-system";
import { runEngineAnalysis, type EngineResult } from "@/services/analyzerBridge";
import { CHECKPOINT_COPY } from "@/services/checkpointCopy";
import type { AnalysisResult, Metric, ServeMetadata, TrimRange } from "@/types/analysis";

export type ProcessingStage = "uploading" | "detecting" | "tracking" | "scoring" | "feedback" | "complete";
export type ProgressUpdate = { stage: ProcessingStage; percent: number };

function mimeForUri(uri: string): string {
  const ext = uri.split(".").pop()?.toLowerCase();
  if (ext === "mov") return "video/quicktime";
  if (ext === "m4v") return "video/x-m4v";
  return "video/mp4";
}

// Runs the analysis entirely on-device: reads the local video as base64,
// hands it to the hidden analyzer WebView (assets/engine/engine.html), and
// maps the raw checkpoint scores onto the app's AnalysisResult shape. No
// network/backend involved — see services/analyzerBridge.tsx for the engine
// host and services/checkpointCopy.ts for the coaching text lookup.
export async function analyzeServe(
  videoUri: string,
  metadata: ServeMetadata,
  trim: TrimRange,
  onProgress?: (update: ProgressUpdate) => void
): Promise<AnalysisResult> {
  onProgress?.({ stage: "uploading", percent: 8 });
  const base64 = await new File(videoUri).base64();
  const videoSrc = `data:${mimeForUri(videoUri)};base64,${base64}`;
  onProgress?.({ stage: "uploading", percent: 20 });

  const engineResult = await runEngineAnalysis(
    {
      videoSrc,
      arm: metadata.dominantHand === "Right" ? "right" : "left",
      serveType: metadata.serveType.toLowerCase() as "flat" | "slice" | "kick",
      trimStart: trim.start,
      trimEnd: trim.end
    },
    update => {
      // Engine reports one combined "tracking" stage (0-90%, pose + racquet
      // detection run together per frame) then "scoring" (90-100%) — split
      // "tracking" across the app's detecting/tracking stages for a closer
      // match to the original 6-stage UI.
      if (update.stage === "tracking") {
        onProgress?.({ stage: update.percent < 45 ? "detecting" : "tracking", percent: update.percent });
      } else {
        onProgress?.({ stage: "scoring", percent: update.percent });
      }
    }
  );

  onProgress?.({ stage: "feedback", percent: 99 });
  const result = mapEngineResult(engineResult);
  onProgress?.({ stage: "complete", percent: 100 });
  return result;
}

function mapEngineResult(engine: EngineResult): AnalysisResult {
  const scored = engine.checkpoints.filter(cp => cp.score !== null) as (typeof engine.checkpoints[number] & { score: number })[];
  const metrics: Metric[] = scored.map(cp => ({
    id: cp.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    label: CHECKPOINT_COPY[cp.name]?.label ?? cp.name,
    score: Math.round(cp.score * 10),
    detail: cp.detail
  }));

  const byScoreAsc = [...scored].sort((a, b) => a.score - b.score);
  const weakest = byScoreAsc[0];
  const copy = weakest ? CHECKPOINT_COPY[weakest.name] : undefined;
  const correction = copy
    ? { title: copy.correctionTitle, detail: copy.rec }
    : { title: "Strong serve overall", detail: "Nothing stood out as a clear weak point — keep grooving this motion." };

  const strengths = scored
    .filter(cp => cp.score >= 7 && cp.name !== weakest?.name)
    .map(cp => CHECKPOINT_COPY[cp.name]?.good ?? cp.name);

  const improvements = scored
    .filter(cp => cp.score < 7 && cp.name !== weakest?.name)
    .sort((a, b) => a.score - b.score)
    .map(cp => CHECKPOINT_COPY[cp.name]?.rec ?? cp.detail);

  const drills = scored
    .filter(cp => cp.score < 7)
    .sort((a, b) => a.score - b.score)
    .map(cp => CHECKPOINT_COPY[cp.name]?.drill)
    .filter((d): d is string => !!d);

  return {
    id: `ST-${Date.now().toString(36).toUpperCase()}`,
    date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
    overallScore: engine.final === null ? 0 : Math.round(engine.final * 10),
    metrics,
    correction,
    strengths,
    improvements,
    drills
  };
}
