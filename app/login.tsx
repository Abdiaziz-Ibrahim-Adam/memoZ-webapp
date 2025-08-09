// app/login.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Link, useRouter } from "expo-router";
import { loginWithUsername, usernameToEmail } from "../lib/auth";

const UI = {
  bg: "#F7F8FD",
  card: "#FFFFFF",
  text: "#0b0f18",
  muted: "#6b7280",
  border: "#E5E7EB",
  primary: "#0EA5E9",
};

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSignIn() {
    if (!username.trim() || !password) {
      return Alert.alert("Sign In", "Enter your username and password.");
    }
    try {
      setBusy(true);
      await loginWithUsername(username.trim(), password);
      router.replace("/(tabs)");
    } catch (e: any) {
      const msg = e?.code === "auth/invalid-credential" || e?.code === "auth/wrong-password"
        ? "Wrong password. Try again."
        : e?.code === "auth/user-not-found"
        ? "No account with that username."
        : e?.message ?? "Could not sign in.";
      Alert.alert("Sign In", msg);
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
        <Text style={{ fontSize: 20, fontWeight: "900", color: UI.text, marginBottom: 12 }}>Sign In</Text>

        <Text style={{ fontSize: 14, color: UI.muted, marginBottom: 6 }}>Username</Text>
        <TextInput
          value={username}
          autoCapitalize="none"
          onChangeText={setUsername}
          placeholder="enter your username"
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
          placeholder="enter your password"
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
          onPress={onSignIn}
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
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "900" }}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={{ alignItems: "center", marginTop: 14 }}>
          <Text style={{ color: UI.muted }}>
            Don’t have an account?{" "}
            <Link href="/register" style={{ color: UI.primary, fontWeight: "800" }}>
              Create Account
            </Link>
          </Text>
        </View>

        <View style={{ marginTop: 14 }}>
          <Text style={{ fontSize: 12, color: UI.muted }}>
            Your private email will be <Text style={{ fontWeight: "700", color: UI.text }}>
              {username ? usernameToEmail(username) : "username@memoz.app"}
            </Text>.
          </Text>
        </View>
      </View>
    </View>
  );
}
