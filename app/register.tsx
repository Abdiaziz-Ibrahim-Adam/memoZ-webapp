import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";
import {
  isUsernameAvailable,
  registerWithUsername,
  usernameToEmail,
} from "../lib/auth";

const UI = {
  bg: "#F7F8FD",
  card: "#FFFFFF",
  text: "#0b0f18",
  muted: "#6b7280",
  border: "#E5E7EB",
  primary: "#0EA5E9",
  danger: "#B91C1C",
};

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCreate() {
    const name = fullName.trim();
    const u = username.trim().toLowerCase();
    const p = password;

    setError(null);

    if (!name) return setError("Please enter your name.");
    if (!u || u.length < 3) return setError("Username must be at least 3 characters.");
    if (!p || p.length < 6) return setError("Password must be at least 6 characters.");

    try {
      setBusy(true);

      // quick availability check
      const free = await isUsernameAvailable(u);
      if (!free) {
        setError("That username is taken. Try another one.");
        return;
      }

      await registerWithUsername(u, p, name);
      Alert.alert("Welcome to memoZ", `Signed in as @${u}`);
      router.replace("/(tabs)");
    } catch (e: any) {
      const msg = e?.message ?? "Could not create account. Please try again.";
      setError(msg);
      Alert.alert("Register", msg);
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
      <View
        style={{
          backgroundColor: UI.card,
          borderWidth: 1,
          borderColor: UI.border,
          borderRadius: 16,
          padding: 16,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "900", color: UI.text, marginBottom: 12 }}>
          Create Account
        </Text>

        {/* Inline error */}
        {error ? (
          <View
            style={{
              backgroundColor: "#FEE2E2",
              borderColor: "#FCA5A5",
              borderWidth: 1,
              padding: 10,
              borderRadius: 10,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: UI.danger, fontWeight: "700" }}>{error}</Text>
          </View>
        ) : null}

        <Text style={{ fontSize: 14, color: UI.muted, marginBottom: 6 }}>Full name</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="e.g. Done A"
          placeholderTextColor="#9ca3af"
          autoCapitalize="words"
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

        <Text style={{ fontSize: 14, color: UI.muted, marginBottom: 6 }}>Username</Text>
        <TextInput
          value={username}
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={(t) => setUsername(t.replace(/\s+/g, ""))}
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

        {/* Hint */}
        <View style={{ marginTop: 14 }}>
          <Text style={{ fontSize: 12, color: UI.muted }}>
            We create a private login email like{" "}
            <Text style={{ fontWeight: "700", color: UI.text }}>
              {username ? usernameToEmail(username.trim().toLowerCase()) : "username@memoz.app"}
            </Text>
            .
          </Text>
        </View>
      </View>
    </View>
  );
}
