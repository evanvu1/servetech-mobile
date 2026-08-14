import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check, Play } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { sendReviewNext, subscribeReviewEvents, useEngineFullscreen, type ReviewEvent } from "@/services/analyzerBridge";
import { colors, radius, spacing } from "@/constants/theme";

type Stop = { index: number; total: number; title: string };

// Chrome for the guided-review replay: a title/progress readout and a
// single play button, stacked on top of AnalyzerEngineHost's fullscreen
// WebView (see app/_layout.tsx render order) so it works regardless of
// which Stack screen is technically focused underneath — avoids relying on
// any one screen's background being transparent, which native-stack
// navigators don't reliably support across platforms.
// app/review.tsx is the (invisible) controller that starts/stops the
// review and navigates on completion; this component only draws.
export function ReviewOverlay() {
  const isFullscreen = useEngineFullscreen();
  const [stop, setStop] = useState<Stop | null>(null);
  const [error, setError] = useState("");

  useEffect(() => subscribeReviewEvents((e: ReviewEvent) => {
    if (e.type === "reviewStop") setStop({ index: e.index, total: e.total, title: e.title });
    else if (e.type === "reviewDone") { setStop(null); setError(""); }
    else if (e.type === "error") setError(e.message);
  }), []);

  useEffect(() => { if (!isFullscreen) { setStop(null); setError(""); } }, [isFullscreen]);

  if (!isFullscreen) return null;
  const last = !!stop && stop.index + 1 >= stop.total;

  return (
    <SafeAreaView style={styles.safe} pointerEvents="box-none">
      <View style={styles.top} pointerEvents="none">
        <Text style={styles.kicker}>SERVE BREAKDOWN</Text>
        <Text style={styles.title}>{stop ? stop.title : "Loading your walkthrough…"}</Text>
        {stop && <Text style={styles.progress}>{stop.index + 1} / {stop.total}</Text>}
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>
      {stop && (
        <View style={styles.bottom}>
          <Pressable style={styles.playBtn} onPress={sendReviewNext}>
            {last ? <Check size={26} color={colors.text} /> : <Play size={26} color={colors.text} fill={colors.text} />}
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { ...StyleSheet.absoluteFillObject, justifyContent: "space-between" },
  top: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, alignItems: "center" },
  kicker: { fontSize: 11, fontWeight: "900", letterSpacing: 1.6, color: colors.white, backgroundColor: "rgba(0,0,0,0.45)", paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill, overflow: "hidden" },
  title: { fontSize: 22, fontWeight: "900", color: colors.white, marginTop: spacing.md, textAlign: "center", textShadowColor: "rgba(0,0,0,0.7)", textShadowRadius: 8, textShadowOffset: { width: 0, height: 1 } },
  progress: { fontSize: 13, fontWeight: "700", color: colors.white, marginTop: 4, opacity: 0.85, textShadowColor: "rgba(0,0,0,0.7)", textShadowRadius: 6 },
  error: { fontSize: 13, color: colors.white, backgroundColor: "rgba(0,0,0,0.55)", padding: spacing.md, borderRadius: radius.md, marginTop: spacing.lg, textAlign: "center" },
  bottom: { alignItems: "center", paddingBottom: spacing.xl },
  playBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 }
});
