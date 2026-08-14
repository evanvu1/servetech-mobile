import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { AppButton } from "@/components/AppButton";
import { colors, radius, spacing, typography } from "@/constants/theme";
export default function WelcomeScreen(){return <SafeAreaView style={styles.safe}><View style={styles.body}><Image source={require("@/assets/images/goat-welcome.jpg")} style={styles.image} resizeMode="contain"/><Text style={styles.title}>Welcome to Serve Goat</Text><Text style={styles.subtitle}>Serve Goat helps you track and rate your tennis serves, so you can see exactly where your motion is improving over time.</Text></View><AppButton label="Get Started" onPress={()=>router.push("/onboarding/name")}/></SafeAreaView>}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:colors.background,paddingHorizontal:spacing.xl,paddingBottom:spacing.lg,justifyContent:"space-between"},body:{flex:1,alignItems:"center",justifyContent:"center"},image:{width:220,height:220,marginBottom:spacing.xxl,borderRadius:radius.lg},title:{fontSize:typography.title,fontWeight:"900",color:colors.text,letterSpacing:-1,textAlign:"center"},subtitle:{fontSize:typography.body,lineHeight:23,color:colors.muted,textAlign:"center",marginTop:spacing.md,paddingHorizontal:spacing.sm}});
