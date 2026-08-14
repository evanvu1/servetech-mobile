import { useRef, useState } from "react";
import { PanResponder, StyleSheet, View } from "react-native";
import { colors, radius } from "@/constants/theme";

const HANDLE = 28;
const MIN_GAP_SEC = 0.5;

// Two-handle range slider for picking a [trimStart, trimEnd] window out of a
// clip. Each PanResponder is created exactly once (via useRef) and reused —
// recreating it on every render (which dragging does constantly, since
// onPanResponderMove calls onChange -> setState -> re-render) resets its
// internal gesture-tracking state mid-drag, which is what made the handles
// snap back to the ends instead of following the finger. Everything the
// handlers need that changes over time (bounds, trim values, the onChange
// callback) is read through a ref kept in sync every render instead, so the
// stable PanResponder still always sees fresh values, not stale ones from
// whenever it happened to be constructed.
export function TrimSlider({
  duration, trimStart, trimEnd, currentTime, onChange, onScrub
}: {
  duration: number; trimStart: number; trimEnd: number; currentTime?: number;
  onChange: (start: number, end: number) => void;
  onScrub?: (t: number) => void;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const live = useRef({ duration, trimStart, trimEnd, trackWidth, onChange, onScrub });
  live.current = { duration, trimStart, trimEnd, trackWidth, onChange, onScrub };
  const dragBaseX = useRef(0);

  const toX = (t: number) => (trackWidth ? (t / duration) * trackWidth : 0);

  const responders = useRef({
    start: PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        const { trimStart: s, duration: d, trackWidth: w, onScrub: scrub } = live.current;
        dragBaseX.current = w ? (s / d) * w : 0;
        scrub?.(s);
      },
      onPanResponderMove: (_evt, gesture) => {
        const { duration: d, trackWidth: w, trimEnd: e, onChange: cb, onScrub: scrub } = live.current;
        if (!w) return;
        const t = d * Math.min(1, Math.max(0, (dragBaseX.current + gesture.dx) / w));
        const next = Math.min(t, e - MIN_GAP_SEC);
        cb(next, e);
        scrub?.(next);
      }
    }),
    end: PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        const { trimEnd: e, duration: d, trackWidth: w, onScrub: scrub } = live.current;
        dragBaseX.current = w ? (e / d) * w : 0;
        scrub?.(e);
      },
      onPanResponderMove: (_evt, gesture) => {
        const { duration: d, trackWidth: w, trimStart: s, onChange: cb, onScrub: scrub } = live.current;
        if (!w) return;
        const t = d * Math.min(1, Math.max(0, (dragBaseX.current + gesture.dx) / w));
        const next = Math.max(t, s + MIN_GAP_SEC);
        cb(s, next);
        scrub?.(next);
      }
    })
  }).current;

  return (
    <View style={styles.wrap}>
      <View style={styles.track} onLayout={e => setTrackWidth(e.nativeEvent.layout.width)}>
        <View style={[styles.dim, { left: 0, width: toX(trimStart) }]} />
        <View style={[styles.selected, { left: toX(trimStart), width: Math.max(0, toX(trimEnd) - toX(trimStart)) }]} />
        <View style={[styles.dim, { left: toX(trimEnd), right: 0, width: undefined }]} />
        {currentTime !== undefined && trackWidth > 0 && (
          <View style={[styles.playhead, { left: toX(currentTime) - 1 }]} />
        )}
      </View>
      <View style={[styles.handle, { left: toX(trimStart) - HANDLE / 2 }]} {...responders.start.panHandlers} />
      <View style={[styles.handle, { left: toX(trimEnd) - HANDLE / 2 }]} {...responders.end.panHandlers} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: HANDLE, justifyContent: "center" },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.soft, overflow: "hidden" },
  dim: { position: "absolute", top: 0, bottom: 0, backgroundColor: colors.border },
  selected: { position: "absolute", top: 0, bottom: 0, backgroundColor: colors.primary },
  playhead: { position: "absolute", top: -6, bottom: -6, width: 2, backgroundColor: colors.text },
  handle: {
    position: "absolute", top: 0, width: HANDLE, height: HANDLE, borderRadius: HANDLE / 2,
    backgroundColor: colors.white, borderWidth: 2, borderColor: colors.primary,
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2
  }
});
