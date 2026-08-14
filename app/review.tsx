import { useEffect, useRef } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { setEngineFullscreen, startEngineReview, subscribeReviewEvents, type ReviewEvent } from "@/services/analyzerBridge";

// No visual UI of its own — services/reviewOverlay.tsx (mounted at the app
// root, stacked above the fullscreen analyzer WebView) draws the actual
// title/progress/play-button chrome. This screen just starts the replay and
// advances to /results once the engine reports it's finished.
export default function ReviewScreen() {
  const { uri } = useLocalSearchParams<{ uri?: string }>();
  const started = useRef(false);
  useEffect(() => {
    setEngineFullscreen(true);
    const unsubscribe = subscribeReviewEvents((e: ReviewEvent) => {
      if (e.type === "reviewDone") router.replace({ pathname: "/results", params: { uri } });
    });
    if (!started.current) { started.current = true; startEngineReview(); }
    return () => { unsubscribe(); setEngineFullscreen(false); };
  }, [uri]);
  return null;
}
