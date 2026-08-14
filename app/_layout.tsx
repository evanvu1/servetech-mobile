import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/constants/theme";
import { AnalyzerEngineHost } from "@/services/analyzerBridge";
import { ReviewOverlay } from "@/services/reviewOverlay";
// A flex:1 View (not a bare Fragment) so the fullscreen overlays below have
// an actual full-screen box to position:absolute against. Render order
// matters here: Stack first, then AnalyzerEngineHost, then ReviewOverlay —
// later siblings paint on top, so when the analyzer goes fullscreen for the
// guided review it covers whichever Stack screen is focused (no reliance on
// that screen's own background being transparent), and ReviewOverlay's
// title/play-button chrome then paints on top of that WebView in turn.
export default function RootLayout(){return <View style={{flex:1}}><StatusBar style="dark"/><Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:colors.background},animation:"slide_from_right"}}><Stack.Screen name="(tabs)"/><Stack.Screen name="trim"/><Stack.Screen name="processing" options={{gestureEnabled:false}}/><Stack.Screen name="review" options={{gestureEnabled:false}}/><Stack.Screen name="results"/></Stack><AnalyzerEngineHost/><ReviewOverlay/></View>}

