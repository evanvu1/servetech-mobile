import { useEffect, useRef, useSyncExternalStore } from "react";
import { StyleSheet, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { ENGINE_HTML } from "@/services/engineHtml";

export type EngineCheckpoint = { name: string; weight: number; score: number | null; detail: string };
export type EngineKeyframe = { name: string; desc: string; i: number };
export type EngineResult = {
  arm: "right" | "left";
  keyframes: EngineKeyframe[];
  checkpoints: EngineCheckpoint[];
  final: number | null;
  scoredWeight: number;
  frameCount: number;
  durationSec: number;
};
export type EngineProgress = { stage: "tracking" | "scoring"; percent: number };
export type AnalyzeRequest = { videoSrc: string; arm: "right" | "left" | "auto"; serveType: "flat" | "slice" | "kick"; trimStart: number; trimEnd: number };
export type ReviewStopEvent = { type: "reviewStop"; index: number; total: number; title: string };
export type ReviewDoneEvent = { type: "reviewDone" };
export type ReviewErrorEvent = { type: "error"; message: string };
export type ReviewEvent = ReviewStopEvent | ReviewDoneEvent | ReviewErrorEvent;

// Single hidden WebView instance running the on-device analysis engine
// (assets/engine/engine.html, embedded as a string via engineHtml.ts). It
// does double duty: the headless analysis pass (runEngineAnalysis), and
// afterward the guided-review replay (startEngineReview/sendReviewNext) —
// same page, same already-loaded video, no reload between the two. Mount
// <AnalyzerEngineHost/> once near the app root; useEngineFullscreen() lets
// the review screen make it visible and full-size without unmounting it
// (unmounting would lose the video/analysis state it needs to replay).
let webviewRef: WebView | null = null;
let readyResolve: (() => void) | null = null;
const readyPromise = new Promise<void>(resolve => { readyResolve = resolve; });
let pending: { resolve: (r: EngineResult) => void; reject: (e: Error) => void; onProgress?: (p: EngineProgress) => void } | null = null;
// Set, not a single slot: both app/review.tsx (starts/stops the review and
// navigates on completion) and ReviewOverlay (draws the title/progress/play
// button) need to react to the same event stream independently.
const reviewListeners = new Set<(e: ReviewEvent) => void>();

function handleMessage(event: WebViewMessageEvent) {
  let data: any;
  try { data = JSON.parse(event.nativeEvent.data); } catch { return; }
  if (data.type === "ready") { readyResolve?.(); return; }
  if (data.type === "reviewStop" || data.type === "reviewDone") { reviewListeners.forEach(l => l(data)); return; }
  if (data.type === "error") {
    pending?.reject(new Error(data.message ?? "analysis failed")); pending = null;
    reviewListeners.forEach(l => l(data));
    return;
  }
  if (!pending) return;
  if (data.type === "progress") pending.onProgress?.({ stage: data.stage, percent: data.percent });
  else if (data.type === "result") { pending.resolve(data as EngineResult); pending = null; }
}

// Tiny external store instead of React Context: AnalyzerEngineHost is
// mounted once outside the navigator, so any screen (e.g. app/review.tsx)
// can flip it full-screen without needing to sit inside a Provider tree.
let fullscreen = false;
const fullscreenListeners = new Set<() => void>();
export function setEngineFullscreen(value: boolean) {
  fullscreen = value;
  fullscreenListeners.forEach(l => l());
}
function subscribeFullscreen(listener: () => void) {
  fullscreenListeners.add(listener);
  return () => { fullscreenListeners.delete(listener); };
}
export function useEngineFullscreen() {
  return useSyncExternalStore(subscribeFullscreen, () => fullscreen);
}

export function AnalyzerEngineHost() {
  const ref = useRef<WebView>(null);
  const isFullscreen = useEngineFullscreen();
  useEffect(() => {
    webviewRef = ref.current;
    return () => { webviewRef = null; };
  }, []);
  return (
    <View style={isFullscreen ? styles.fullscreen : styles.hidden} pointerEvents={isFullscreen ? "box-none" : "none"}>
      <WebView
        ref={ref}
        originWhitelist={["*"]}
        source={{ html: ENGINE_HTML }}
        javaScriptEnabled
        domStorageEnabled
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        onMessage={handleMessage}
        style={isFullscreen ? styles.webviewFullscreen : styles.webview}
      />
    </View>
  );
}

export async function runEngineAnalysis(
  req: AnalyzeRequest,
  onProgress?: (p: EngineProgress) => void
): Promise<EngineResult> {
  await readyPromise;
  if (!webviewRef) throw new Error("Analyzer engine isn't mounted");
  if (pending) throw new Error("An analysis is already running");
  const result = await new Promise<EngineResult>((resolve, reject) => {
    pending = { resolve, reject, onProgress };
    webviewRef!.postMessage(JSON.stringify({ type: "analyze", ...req }));
  });
  return result;
}

// Guided review: subscribe before calling start, unsubscribe on the way out.
export function subscribeReviewEvents(handler: (e: ReviewEvent) => void) {
  reviewListeners.add(handler);
  return () => { reviewListeners.delete(handler); };
}
export function startEngineReview() {
  webviewRef?.postMessage(JSON.stringify({ type: "startReview" }));
}
export function sendReviewNext() {
  webviewRef?.postMessage(JSON.stringify({ type: "reviewNext" }));
}

const styles = StyleSheet.create({
  hidden: { position: "absolute", top: -1000, left: 0, width: 2, height: 2, opacity: 0 },
  webview: { width: 2, height: 2 },
  fullscreen: { ...StyleSheet.absoluteFillObject, backgroundColor: "#000" },
  webviewFullscreen: { flex: 1, backgroundColor: "#000" }
});
