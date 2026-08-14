import { Image, StyleSheet, View } from "react-native";
import { Camera, Play } from "lucide-react-native";
import { colors, radius } from "@/constants/theme";

// Static preview image for list/card contexts (home "latest analysis" card,
// "recent uploads" rows) — deliberately not VideoCard/expo-video, which
// would mean mounting a real video player per row just to show a still.
export function Thumbnail({ uri, compact = false }: { uri?: string; compact?: boolean }) {
  return (
    <View style={[styles.card, compact && styles.compact]}>
      {uri
        ? <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        : <View style={styles.courtLine} />}
      <View style={styles.play}><Play size={compact ? 20 : 24} fill={colors.text} color={colors.text} /></View>
    </View>
  );
}

export function RowThumbnail({ uri }: { uri?: string }) {
  return (
    <View style={styles.row}>
      {uri ? <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : <Camera size={18} color={colors.muted} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { height: 240, borderRadius: radius.lg, overflow: "hidden", backgroundColor: "#263326", alignItems: "center", justifyContent: "center" },
  compact: { height: 190 },
  courtLine: { position: "absolute", width: 1, height: "120%", backgroundColor: "rgba(255,255,255,.24)", transform: [{ rotate: "-8deg" }] },
  play: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  row: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center", overflow: "hidden" },
});
