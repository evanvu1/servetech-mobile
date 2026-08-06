import type { ComponentType } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from "react-native";
import type { LucideProps } from "lucide-react-native";
import { colors, radius, spacing } from "@/constants/theme";
type Props = PressableProps & { label: string; variant?: "primary" | "secondary" | "danger"; icon?: ComponentType<LucideProps>; loading?: boolean };
export function AppButton({ label, variant="primary", icon:Icon, loading, disabled, style, ...props }: Props) {
  return <Pressable accessibilityRole="button" disabled={disabled||loading} style={state=>[styles.base,styles[variant],state.pressed&&styles.pressed,(disabled||loading)&&styles.disabled,typeof style==="function"?style(state):style]} {...props}>{loading?<ActivityIndicator color={colors.text}/>:<>{Icon&&<Icon size={20} color={variant==="primary"?colors.text:variant==="danger"?colors.error:colors.text}/>}<Text style={[styles.label,variant==="danger"&&{color:colors.error}]}>{label}</Text></>}</Pressable>;
}
const styles=StyleSheet.create({base:{minHeight:54,borderRadius:radius.pill,alignItems:"center",justifyContent:"center",flexDirection:"row",gap:spacing.sm,paddingHorizontal:spacing.xl},primary:{backgroundColor:colors.primary},secondary:{backgroundColor:colors.white,borderWidth:1,borderColor:colors.border},danger:{backgroundColor:colors.white,borderWidth:1,borderColor:"#F2CACA"},label:{fontSize:15,fontWeight:"800",color:colors.text},pressed:{transform:[{scale:.98}],opacity:.86},disabled:{opacity:.55}});
