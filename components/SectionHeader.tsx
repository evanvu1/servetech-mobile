import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/constants/theme";
export function SectionHeader({title,action,onAction}:{title:string;action?:string;onAction?:()=>void}){return <View style={styles.row}><Text style={styles.title}>{title}</Text>{action&&(onAction?<Pressable onPress={onAction} hitSlop={8}><Text style={styles.action}>{action}</Text></Pressable>:<Text style={styles.action}>{action}</Text>)}</View>}
const styles=StyleSheet.create({row:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:spacing.md},title:{fontSize:20,fontWeight:"800",color:colors.text,letterSpacing:-.4},action:{fontSize:13,fontWeight:"700",color:colors.muted}});

