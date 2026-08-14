import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Camera, ChevronLeft, ChevronRight } from "lucide-react-native";
import { RowThumbnail } from "@/components/Thumbnail";
import { colors, radius, spacing } from "@/constants/theme";
import { getHistory } from "@/services/historyStore";
import type { AnalysisResult } from "@/types/analysis";

const PAGE_SIZE = 12;

export default function HistoryScreen(){
  const [history,setHistory]=useState<AnalysisResult[]>([]);
  const [visibleCount,setVisibleCount]=useState(PAGE_SIZE);
  useFocusEffect(useCallback(()=>{getHistory().then(setHistory);setVisibleCount(PAGE_SIZE)},[]));
  const visible=history.slice(0,visibleCount);
  return <SafeAreaView edges={["top"]} style={styles.safe}>
    <View style={styles.top}><Pressable onPress={()=>router.back()} accessibilityLabel="Back" style={styles.back}><ChevronLeft size={22} color={colors.text}/></Pressable><Text style={styles.topTitle}>All serves</Text><View style={{width:44}}/></View>
    <FlatList
      data={visible}
      keyExtractor={item=>item.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      onEndReachedThreshold={0.4}
      onEndReached={()=>setVisibleCount(count=>Math.min(count+PAGE_SIZE,history.length))}
      ListEmptyComponent={<View style={styles.empty}><Camera size={26} color={colors.muted}/><Text style={styles.emptyTitle}>No serves yet</Text></View>}
      renderItem={({item})=><Pressable onPress={()=>router.push({pathname:"/results",params:{id:item.id}})} style={styles.recent}><RowThumbnail uri={item.thumbnailUri}/><View style={{flex:1}}><Text style={styles.recentTitle}>{item.serveType??"Serve"}</Text><Text style={styles.meta}>{item.date}</Text></View><Text style={styles.recentScore}>{item.overallScore}</Text><ChevronRight size={18} color={colors.muted}/></Pressable>}
    />
  </SafeAreaView>;
}

const styles=StyleSheet.create({
  safe:{flex:1,backgroundColor:colors.background},
  top:{height:46,flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingHorizontal:spacing.xl},
  back:{width:44,height:44,borderRadius:22,borderWidth:1,borderColor:colors.border,alignItems:"center",justifyContent:"center"},
  topTitle:{fontSize:15,fontWeight:"800",color:colors.text},
  list:{paddingHorizontal:spacing.xl,paddingBottom:spacing.huge},
  recent:{minHeight:72,flexDirection:"row",alignItems:"center",gap:spacing.md,borderBottomWidth:1,borderBottomColor:colors.border},
  recentTitle:{fontSize:15,fontWeight:"800",color:colors.text},
  meta:{fontSize:12,color:colors.muted,marginTop:3},
  recentScore:{fontSize:18,fontWeight:"900",color:colors.text},
  empty:{alignItems:"center",padding:spacing.xxl,borderWidth:1,borderStyle:"dashed",borderColor:colors.border,borderRadius:radius.lg,marginTop:spacing.xl},
  emptyTitle:{fontSize:16,fontWeight:"800",color:colors.text,marginTop:spacing.md},
});
