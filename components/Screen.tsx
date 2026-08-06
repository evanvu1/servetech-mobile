import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View, type ScrollViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@/constants/theme";
export function Screen({children,scroll=true,contentContainerStyle,...props}:{children:ReactNode;scroll?:boolean}&ScrollViewProps){return <SafeAreaView edges={["top"]} style={styles.safe}>{scroll?<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content,contentContainerStyle]} {...props}>{children}</ScrollView>:<View style={styles.content}>{children}</View>}</SafeAreaView>}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:colors.background},content:{paddingHorizontal:spacing.xl,paddingTop:spacing.lg,paddingBottom:spacing.huge}});

