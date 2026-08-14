import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Info, Pause, Play } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { Screen } from "@/components/Screen";
import { AppButton } from "@/components/AppButton";
import { TrimSlider } from "@/components/TrimSlider";
import { colors, radius, spacing } from "@/constants/theme";
import type { ServeMetadata } from "@/types/analysis";

function formatTime(t: number) {
  const m = Math.floor(t / 60);
  const s = (t % 60).toFixed(1).padStart(4, "0");
  return `${m}:${s}`;
}

// Soft trim only: no file is cut or re-encoded here, just a [start, end]
// window in seconds that gets passed to the analyzer (services/analyzer.ts
// -> engine.html's runAnalysis), which samples/plays only inside it. Keeps
// this feature pure JS/Expo-Go-compatible instead of needing a native video
// editing library + dev-client build.
export default function TrimScreen() {
  const params = useLocalSearchParams<{ uri: string; dominantHand: ServeMetadata["dominantHand"]; serveType: ServeMetadata["serveType"] }>();
  const player = useVideoPlayer(params.uri, p => { p.loop = false; });
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [previewing, setPreviewing] = useState(false);
  const trimStartRef = useRef(0);
  const trimEndRef = useRef(0);
  trimStartRef.current = trimStart;
  trimEndRef.current = trimEnd;

  useEffect(() => {
    const sub = player.addListener("statusChange", ({ status }) => {
      if (status === "readyToPlay" && player.duration > 0) {
        setDuration(d => d || player.duration);
        setTrimStart(s => s || 0);
        setTrimEnd(e => e || player.duration);
      }
    });
    return () => sub.remove();
  }, [player]);

  useEffect(() => {
    const sub = player.addListener("timeUpdate", ({ currentTime: t }) => {
      setCurrentTime(t);
      // Loop the preview inside the trimmed window rather than playing past it.
      if (t >= trimEndRef.current) player.currentTime = trimStartRef.current;
    });
    return () => sub.remove();
  }, [player]);

  function togglePreview() {
    if (previewing) { player.pause(); setPreviewing(false); return; }
    player.currentTime = trimStart;
    player.play();
    setPreviewing(true);
  }

  // Seeks the preview to whatever timestamp the handle being dragged is
  // currently over, so the video visibly scrubs along with the finger.
  // Stops any running preview first — otherwise the loop-back check in the
  // timeUpdate listener above fights the drag, snapping playback back to
  // trimStart mid-drag instead of following the handle.
  function scrubTo(t: number) {
    if (previewing) { player.pause(); setPreviewing(false); }
    player.currentTime = t;
    setCurrentTime(t);
  }

  function confirmTrim() {
    player.pause();
    router.push({
      pathname: "/processing",
      params: {
        uri: params.uri, dominantHand: params.dominantHand, serveType: params.serveType,
        trimStart: String(trimStart), trimEnd: String(trimEnd)
      }
    });
  }

  return (
    <Screen contentContainerStyle={styles.screen}>
      <Text style={styles.kicker}>TRIM YOUR CLIP</Text>
      <Text style={styles.title}>Trim to the serve</Text>
      <View style={styles.videoWrap}>
        <VideoView player={player} style={StyleSheet.absoluteFill} nativeControls={false} contentFit="contain" />
      </View>
      <View style={styles.instructions}>
        <Info size={18} color={colors.text} />
        <Text style={styles.instructionsText}>
          Drag the handles so the clip starts right before you begin your motion and ends right after you land.
          Only the footage between the handles gets analyzed — trimming out the dead time before and after your serve keeps
          the checkpoints focused on the motion itself.
        </Text>
      </View>
      {duration > 0 && (
        <>
          <View style={styles.sliderWrap}>
            <TrimSlider duration={duration} trimStart={trimStart} trimEnd={trimEnd} currentTime={currentTime}
              onChange={(s, e) => { setTrimStart(s); setTrimEnd(e); }} onScrub={scrubTo} />
          </View>
          <View style={styles.times}>
            <Text style={styles.timeText}>Start {formatTime(trimStart)}</Text>
            <Text style={styles.timeTextMain}>{formatTime(trimEnd - trimStart)} selected</Text>
            <Text style={styles.timeText}>End {formatTime(trimEnd)}</Text>
          </View>
        </>
      )}
      <Pressable style={styles.previewBtn} onPress={togglePreview} disabled={duration === 0}>
        {previewing ? <Pause size={16} color={colors.text} /> : <Play size={16} color={colors.text} fill={colors.text} />}
        <Text style={styles.previewText}>{previewing ? "Pause preview" : "Preview trimmed clip"}</Text>
      </Pressable>
      <AppButton label="Continue" onPress={confirmTrim} disabled={duration === 0} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: spacing.huge },
  kicker: { fontSize: 11, fontWeight: "900", letterSpacing: 1.7, color: colors.muted },
  title: { fontSize: 32, fontWeight: "900", color: colors.text, letterSpacing: -1, marginTop: 4, marginBottom: spacing.lg },
  videoWrap: { height: 260, borderRadius: radius.lg, overflow: "hidden", backgroundColor: "#172117", marginBottom: spacing.lg },
  instructions: { flexDirection: "row", gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.xl },
  instructionsText: { flex: 1, fontSize: 13, lineHeight: 19, color: colors.text },
  sliderWrap: { paddingHorizontal: 14, marginBottom: spacing.md },
  times: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xl },
  timeText: { fontSize: 12, color: colors.muted, fontWeight: "700" },
  timeTextMain: { fontSize: 12, color: colors.text, fontWeight: "800" },
  previewBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingVertical: spacing.md, marginBottom: spacing.lg },
  previewText: { fontSize: 13, fontWeight: "800", color: colors.text }
});
