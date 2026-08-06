import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/constants/theme";
export function SectionHeader({title,action}:{title:string;action?:string}){return <View style={styles.row}><Text style={styles.title}>{title}</Text>{action&&<Text style={styles.action}>{action}</Text>}</View>}
const styles=StyleSheet.create({row:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:spacing.md},title:{fontSize:20,fontWeight:"800",color:colors.text,letterSpacing:-.4},action:{fontSize:13,fontWeight:"700",color:colors.muted}});

