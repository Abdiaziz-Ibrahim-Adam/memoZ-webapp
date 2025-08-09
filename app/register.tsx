// app/register.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, ActivityIndicator } from "react-native";
import { Link, useRouter } from "expo-router";
import { isUsernameAvailable, registerWithUsername, usernameToEmail } from "../lib/auth";

const UI = {
  bg: "#F7F8FD",
  card: "#FFFFFF",
  text: "#0b0f18",
  muted: "#6b7280",
  border: "#E5E7EB",
  primary: "#0EA5E9", // memoZ blue
  black: "#111827",
};

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onCreate() {
    const u = username.trim();
    if (!u || u.length < 3) return Alert.alert("Username", "Pick a username with at least 3 characters.");
    if (!password || password.length < 6) return Alert.alert("Password", "Use at least 6 characters.");

    try {
      setBusy(true);
      const free = await isUsernameAvailable(u);
      if (!free) return Alert.alert("Username", "That username is taken. Try another one.");

      await registerWithUsername(u, password);
      Alert.alert("Welcome to memoZ", `Signed in as @${u}`);
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Couldn’t create account", e?.message ?? "Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: UI.bg, paddingHorizontal: 16, paddingTop: 48 }}>
      {/* Brand */}
      <View style={{ alignItems: "center", marginBottom: 32 }}>
        <Text style={{ fontSize: 36, fontWeight: "900", color: UI.primary }}>memoZ</Text>
      </View>

      {/* Card */}
      <View style={{ backgroundColor: UI.card, borderWidth: 1, borderColor: UI.border, borderRadius: 16, padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "900", color: UI.text, marginBottom: 12 }}>Create Account</Text>

        <Text style={{ fontSize: 14, color: UI.muted, marginBottom: 6 }}>Username</Text>
        <TextInput
          value={username}
          autoCapitalize="none"
          onChangeText={setUsername}
          placeholder="choose a username"
          placeholderTextColor="#9ca3af"
          style={{
            borderWidth: 1,
            borderColor: UI.border,
            borderRadius: 12,
            padding: 12,
            fontSize: 16,
            marginBottom: 14,
            backgroundColor: "#fff",
            color: UI.text,
          }}
        />

        <Text style={{ fontSize: 14, color: UI.muted, marginBottom: 6 }}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="enter a password"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          style={{
            borderWidth: 1,
            borderColor: UI.border,
            borderRadius: 12,
            padding: 12,
            fontSize: 16,
            marginBottom: 16,
            backgroundColor: "#fff",
            color: UI.text,
          }}
        />

        <TouchableOpacity
          onPress={onCreate}
          disabled={busy}
          style={{
            backgroundColor: busy ? "#93c5fd" : UI.primary,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "900" }}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={{ alignItems: "center", marginTop: 14 }}>
          <Text style={{ color: UI.muted }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: UI.primary, fontWeight: "800" }}>
              Sign In
            </Link>
          </Text>
        </View>

        {/* Helpful hint */}
        <View style={{ marginTop: 14 }}>
          <Text style={{ fontSize: 12, color: UI.muted }}>
            We use a private email like <Text style={{ fontWeight: "700", color: UI.black }}>{username ? usernameToEmail(username) : "username@memoz.app"}</Text> internally so your login works securely.
          </Text>
        </View>
      </View>
    </View>
  );
}
