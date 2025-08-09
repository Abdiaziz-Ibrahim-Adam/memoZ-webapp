// app/settings.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Switch, TextInput, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../lib/firebase";
import { useRouter } from "expo-router";

const UI = { bg: "#F7F8FD", text: "#0B0F18", muted: "#6B7280", border: "#E5E7EB", white: "#fff", brand: "#0EA5E9" };

export default function SettingsScreen() {
  const router = useRouter();
  const user = auth.currentUser;
  const [dark, setDark] = useState(false);
  const [username, setUsername] = useState(user?.displayName || "");
  const [email] = useState(user?.email || "");

  useEffect(() => {
    AsyncStorage.getItem("memoz:dark").then((v) => setDark(v === "1"));
  }, []);
  const toggleDark = async () => {
    const next = !dark;
    setDark(next);
    await AsyncStorage.setItem("memoz:dark", next ? "1" : "0");
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      router.replace("/login");
    } catch (e: any) {
      Alert.alert("Sign out", e?.message ?? "Could not sign out.");
    }
  };

  const Row = ({ icon, title, right, onPress }: any) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#EFF4FB",
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
      }}
    >
      <Text style={{ color: UI.text, fontWeight: "800" }}>{icon}  {title}</Text>
      {right}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: UI.bg }}>
      {/* Header */}
      <View style={{ height: 56, alignItems: "center", justifyContent: "center", borderBottomWidth: 1, borderBottomColor: UI.border, backgroundColor: UI.white }}>
        <Text style={{ fontSize: 18, fontWeight: "800", color: UI.text }}>Settings</Text>
      </View>

      <View style={{ padding: 16 }}>
        {/* Avatar */}
        <View style={{ alignItems: "center", marginBottom: 16 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "#DBEAFE", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#A5B4FC" }}>
            <Text style={{ fontWeight: "900", color: "#1E3A8A", fontSize: 24 }}>
              {(username || email || "M").charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={{ fontSize: 12, color: UI.muted, marginBottom: 6 }}>PROFILE</Text>
        <Row
          icon="👤"
          title="Username"
          right={
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="username"
              placeholderTextColor="#9ca3af"
              style={{ width: 180, backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: UI.border }}
            />
          }
        />
        <Row icon="✉️" title="E-mail" right={<Text style={{ color: UI.muted }}>{email || "—"}</Text>} />
        <Row icon="🔒" title="Password" right={<Text style={{ color: UI.muted }}>•••••••</Text>} onPress={() => Alert.alert("Password", "Change password flow coming next.")} />
        <Row icon="🌙" title="Dark Mode" right={<Switch value={dark} onValueChange={toggleDark} />} />

        <Text style={{ fontSize: 12, color: UI.muted, marginTop: 12, marginBottom: 6 }}>ACCOUNT</Text>
        <Row icon="🌐" title="Language" right={<Text style={{ color: UI.muted }}>English (UK)</Text>} />
        <Row icon="🎂" title="Birthday" right={<Text style={{ color: UI.muted }}>—</Text>} />
        <TouchableOpacity onPress={signOut} style={{ marginTop: 10, alignSelf: "flex-start" }}>
          <Text style={{ color: "#DC2626", fontWeight: "800" }}>Log out</Text>
        </TouchableOpacity>
        <TouchableOpacity
        onPress={async () => {
            await AsyncStorage.removeItem("memoz:onboarded");
            // optional: send them to onboarding immediately
            // router.replace("/onboarding");
        }}
        style={{ marginTop: 16 }}
        >
        <Text style={{ color: "#2563EB", fontWeight: "800" }}>Show onboarding again</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}
