import { useEffect, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { router } from "expo-router";
import { AppButton } from "@/components/AppButton";
import { colors, radius, spacing } from "@/constants/theme";
import { getProfile, saveProfile } from "@/services/userStore";
export default function AccountScreen(){const [firstName,setFirstName]=useState("");const [lastName,setLastName]=useState("");const lastNameRef=useRef<TextInput>(null);
  useEffect(()=>{getProfile().then(profile=>{if(profile){setFirstName(profile.firstName);setLastName(profile.lastName)}})},[]);
  function save(){saveProfile({firstName:firstName.trim(),lastName:lastName.trim()});router.back()}
  return <SafeAreaView edges={["top"]} style={styles.safe}><KeyboardAvoidingView style={styles.safe} behavior={Platform.OS==="ios"?"padding":undefined}><Pressable style={styles.fill} onPress={Keyboard.dismiss} accessible={false}>
    <View style={styles.top}><Pressable onPress={()=>router.back()} accessibilityLabel="Back to settings" style={styles.back}><ChevronLeft size={22} color={colors.text}/></Pressable><Text style={styles.topTitle}>Account</Text><View style={{width:44}}/></View>
    <View style={styles.body}><Text style={styles.title}>Edit your name</Text><Text style={styles.subtitle}>This is how you show up across Serve Goat.</Text>
      <View style={styles.field}><Text style={styles.label}>First name</Text><TextInput value={firstName} onChangeText={setFirstName} placeholder="Jane" placeholderTextColor={colors.muted} autoCapitalize="words" autoCorrect={false} returnKeyType="next" onSubmitEditing={()=>lastNameRef.current?.focus()} style={styles.input}/></View>
      <View style={styles.field}><Text style={styles.label}>Last name</Text><TextInput ref={lastNameRef} value={lastName} onChangeText={setLastName} placeholder="Doe" placeholderTextColor={colors.muted} autoCapitalize="words" autoCorrect={false} returnKeyType="done" onSubmitEditing={()=>Keyboard.dismiss()} style={styles.input}/></View>
    </View>
    <AppButton label="Save changes" onPress={save} disabled={!firstName.trim()||!lastName.trim()}/>
  </Pressable></KeyboardAvoidingView></SafeAreaView>}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:colors.background},fill:{flex:1,paddingHorizontal:spacing.xl,paddingTop:spacing.lg,paddingBottom:spacing.xxl,justifyContent:"space-between"},top:{height:46,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},back:{width:44,height:44,borderRadius:22,borderWidth:1,borderColor:colors.border,alignItems:"center",justifyContent:"center"},topTitle:{fontSize:15,fontWeight:"800",color:colors.text},body:{flex:1,marginTop:spacing.xxl},title:{fontSize:32,fontWeight:"900",color:colors.text,letterSpacing:-1},subtitle:{fontSize:15,lineHeight:23,color:colors.muted,marginTop:spacing.sm,marginBottom:spacing.xxl},field:{marginBottom:spacing.lg},label:{fontSize:13,fontWeight:"800",color:colors.text,marginBottom:spacing.sm},input:{minHeight:54,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,paddingHorizontal:spacing.lg,fontSize:16,color:colors.text,backgroundColor:colors.white}});
