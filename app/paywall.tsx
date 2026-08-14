import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check, X } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AppButton } from "@/components/AppButton";
import { colors, radius, spacing } from "@/constants/theme";
import { FREE_SERVE_LIMIT, getPurchaseState } from "@/services/purchaseStore";
import { getCurrentOffering, isUnlocked, purchaseUnlock, restorePurchases } from "@/services/purchases";
import type { PurchasesOffering } from "react-native-purchases";

const FEATURES = ["Unlimited serve analyses", "Full history & progress tracking", "One-time payment, yours forever"];

export default function PaywallScreen(){
  const { from } = useLocalSearchParams<{ from?: string }>();
  const [loading,setLoading]=useState(true);
  const [unlocked,setUnlocked]=useState(false);
  const [freeServesUsed,setFreeServesUsed]=useState(0);
  const [offering,setOffering]=useState<PurchasesOffering|null>(null);
  const [offeringError,setOfferingError]=useState(false);
  const [purchasing,setPurchasing]=useState(false);
  const [restoring,setRestoring]=useState(false);
  const [error,setError]=useState("");
  const [restoreMessage,setRestoreMessage]=useState("");

  useEffect(()=>{
    let cancelled=false;
    (async()=>{
      const [state,unlockedNow]=await Promise.all([getPurchaseState(),isUnlocked()]);
      if(cancelled)return;
      setFreeServesUsed(state.freeServesUsed);
      setUnlocked(unlockedNow);
      if(!unlockedNow)await loadOffering();
      if(!cancelled)setLoading(false);
    })();
    return ()=>{cancelled=true};
  },[]);

  async function loadOffering(){
    setOfferingError(false);
    const off=await getCurrentOffering();
    setOffering(off);
    if(!off)setOfferingError(true);
  }

  async function handlePurchase(){
    const pkg=offering?.availablePackages[0];
    if(!pkg)return;
    setError("");
    setPurchasing(true);
    try{
      const result=await purchaseUnlock(pkg);
      setPurchasing(false);
      if(result.userCancelled)return;
      if(result.unlocked){router.back();return}
      setError("Something went wrong completing your purchase. Please try again.");
    }catch(err){
      setPurchasing(false);
      setError("Something went wrong completing your purchase. Please try again.");
      console.warn("[paywall] purchase failed",err);
    }
  }

  async function handleRestore(){
    setError("");
    setRestoreMessage("");
    setRestoring(true);
    try{
      const nowUnlocked=await restorePurchases();
      setRestoring(false);
      if(nowUnlocked){router.back();return}
      setRestoreMessage("No previous purchase found for this account.");
    }catch(err){
      setRestoring(false);
      setError("Couldn't restore purchases. Please try again.");
      console.warn("[paywall] restore failed",err);
    }
  }

  const pkg=offering?.availablePackages[0];
  const freeRemaining=Math.max(0,FREE_SERVE_LIMIT-freeServesUsed);

  return <SafeAreaView edges={["top"]} style={styles.safe}>
    <View style={styles.top}>{from==="add"?<View style={{width:44}}/>:<Pressable onPress={()=>router.back()} accessibilityLabel="Close" style={styles.close}><X size={20} color={colors.text}/></Pressable>}<Text style={styles.topTitle}>Upgrade</Text><View style={{width:44}}/></View>
    {loading?<View style={styles.loading}><ActivityIndicator color={colors.text}/></View>:unlocked?<View style={styles.body}>
      <Text style={styles.kicker}>YOU'RE ALL SET</Text>
      <Text style={styles.title}>Unlimited unlocked</Text>
      <Text style={styles.intro}>You have full access to unlimited serve analyses on this account. Thanks for supporting Serve Goat.</Text>
      <Pressable onPress={handleRestore} disabled={restoring} style={styles.restore}><Text style={styles.restoreText}>{restoring?"Restoring…":"Restore Purchases"}</Text></Pressable>
      {!!restoreMessage&&<Text style={styles.restoreMessage}>{restoreMessage}</Text>}
      {!!error&&<Text style={styles.error}>{error}</Text>}
    </View>:<View style={styles.body}>
      <Text style={styles.kicker}>UNLOCK SERVE GOAT</Text>
      <Text style={styles.title}>{freeRemaining<=0?"You've used all 5 free analyses":"Unlock unlimited serve analysis"}</Text>
      <Text style={styles.intro}>{freeRemaining<=0?"Upgrade with a one-time purchase to keep analyzing your serve — no subscription, ever.":`You have ${freeRemaining} free analysis${freeRemaining===1?"":"es"} left. Upgrade any time with a one-time purchase for unlimited access.`}</Text>
      <View style={styles.features}>{FEATURES.map(feature=><View key={feature} style={styles.feature}><View style={styles.featureIcon}><Check size={14} color={colors.text}/></View><Text style={styles.featureText}>{feature}</Text></View>)}</View>
      {offeringError?<View style={styles.errorBlock}><Text style={styles.error}>Couldn't load pricing. Check your connection and try again.</Text><AppButton label="Try again" variant="secondary" onPress={loadOffering}/></View>:<>
        {!!error&&<Text style={styles.error}>{error}</Text>}
        <AppButton label={pkg?`Unlock unlimited — ${pkg.product.priceString}`:"Loading…"} onPress={handlePurchase} loading={purchasing} disabled={!pkg||purchasing}/>
      </>}
      <Pressable onPress={handleRestore} disabled={restoring} style={styles.restore}><Text style={styles.restoreText}>{restoring?"Restoring…":"Restore Purchases"}</Text></Pressable>
      {!!restoreMessage&&<Text style={styles.restoreMessage}>{restoreMessage}</Text>}
      {from==="add"&&<Pressable onPress={()=>router.back()} style={styles.later}><Text style={styles.laterText}>Maybe later</Text></Pressable>}
    </View>}
  </SafeAreaView>;
}

const styles=StyleSheet.create({
  safe:{flex:1,backgroundColor:colors.background},
  top:{height:46,flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingHorizontal:spacing.xl},
  close:{width:44,height:44,borderRadius:22,borderWidth:1,borderColor:colors.border,alignItems:"center",justifyContent:"center"},
  topTitle:{fontSize:15,fontWeight:"800",color:colors.text},
  loading:{flex:1,alignItems:"center",justifyContent:"center"},
  body:{flex:1,paddingHorizontal:spacing.xl,paddingTop:spacing.xl,paddingBottom:spacing.xxl},
  kicker:{fontSize:11,fontWeight:"900",letterSpacing:1.7,color:colors.muted},
  title:{fontSize:30,fontWeight:"900",color:colors.text,letterSpacing:-1,marginTop:4},
  intro:{fontSize:15,lineHeight:23,color:colors.muted,marginTop:spacing.sm,marginBottom:spacing.xl},
  features:{borderWidth:1,borderColor:colors.border,borderRadius:radius.lg,padding:spacing.lg,gap:spacing.lg,marginBottom:spacing.xxl},
  feature:{flexDirection:"row",alignItems:"center",gap:spacing.md},
  featureIcon:{width:26,height:26,borderRadius:13,backgroundColor:colors.primary,alignItems:"center",justifyContent:"center"},
  featureText:{fontSize:14,fontWeight:"700",color:colors.text},
  errorBlock:{gap:spacing.md},
  restore:{minHeight:44,alignItems:"center",justifyContent:"center",marginTop:spacing.lg},
  restoreText:{fontSize:13,fontWeight:"800",color:colors.muted},
  restoreMessage:{fontSize:12,color:colors.muted,textAlign:"center",marginTop:-spacing.sm,marginBottom:spacing.sm},
  later:{minHeight:44,alignItems:"center",justifyContent:"center",marginTop:spacing.sm},
  laterText:{fontSize:13,fontWeight:"700",color:colors.muted},
  error:{fontSize:13,lineHeight:19,color:colors.error,backgroundColor:"#FFF2F2",padding:spacing.md,borderRadius:radius.md,marginBottom:spacing.md}
});
