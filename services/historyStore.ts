import { Directory, File, Paths } from "expo-file-system";
import * as VideoThumbnails from "expo-video-thumbnails";
import type { AnalysisResult, TrimRange } from "@/types/analysis";

// All-local history: no backend, so "recent uploads" is just a JSON index
// (history/index.json) plus copies of the source video + a generated
// thumbnail, all under the document directory (survives app restarts,
// excluded from iCloud/system cache eviction unlike the picker's temp uri).
const historyDir = new Directory(Paths.document, "history");
const indexFile = new File(historyDir, "index.json");

function ensureHistoryDir() {
  if (!historyDir.exists) historyDir.create({ intermediates: true });
}

export async function getHistory(): Promise<AnalysisResult[]> {
  ensureHistoryDir();
  if (!indexFile.exists) return [];
  try {
    return JSON.parse(await indexFile.text()) as AnalysisResult[];
  } catch {
    return [];
  }
}

export async function getHistoryEntry(id: string): Promise<AnalysisResult | null> {
  const history = await getHistory();
  return history.find(item => item.id === id) ?? null;
}

// Copies the analyzed clip + a generated frame thumbnail into permanent
// local storage and appends the result to the history index. Thumbnail
// generation is best-effort: a failure there still leaves a usable history
// entry (just falls back to the placeholder in the UI).
export async function saveToHistory(result: AnalysisResult, sourceUri: string, trim: TrimRange): Promise<AnalysisResult> {
  ensureHistoryDir();

  const sourceVideo = new File(sourceUri);
  const videoFile = new File(historyDir, `${result.id}${sourceVideo.extension || ".mp4"}`);
  sourceVideo.copy(videoFile);

  let thumbnailUri: string | undefined;
  const midpointMs = Math.max(0, ((trim.start + trim.end) / 2) * 1000);
  // A midpoint time can occasionally land right at/after the clip's end
  // (rounding, or a trim.end that's ~= the source duration) and make the
  // native thumbnail generator throw — retry once at 0 before giving up.
  for (const time of [midpointMs, 0]) {
    try {
      const { uri: generatedUri } = await VideoThumbnails.getThumbnailAsync(videoFile.uri, { time });
      const thumbnailFile = new File(historyDir, `${result.id}.jpg`);
      new File(generatedUri).copy(thumbnailFile);
      thumbnailUri = thumbnailFile.uri;
      break;
    } catch (err) {
      // No thumbnail this attempt — UI falls back to its placeholder if both fail.
      console.warn("[historyStore] thumbnail generation failed", { time, err });
    }
  }

  const entry: AnalysisResult = { ...result, videoUri: videoFile.uri, thumbnailUri };
  const history = await getHistory();
  indexFile.write(JSON.stringify([entry, ...history.filter(item => item.id !== entry.id)]));

  return entry;
}
