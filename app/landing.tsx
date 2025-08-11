// app/landing.tsx
import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter, Link } from "expo-router";
import { signInAnonymously } from "firebase/auth";
import { auth } from "../lib/firebase";

const UI = {
  blue: "#3B82B8", // hero background
  text: "#0B0F18",
  muted: "#6B7280",
  border: "#E5E7EB",
  white: "#FFFFFF",
  blackBtn: "#0B0F18",
};

export default function Landing() {
  const router = useRouter();
  const current = auth?.currentUser ?? null;

  const firstLetter = useMemo(
    () => (current?.displayName || current?.email || "M").charAt(0).toUpperCase(),
    [current]
  );

  async function continueAsGuest() {
    try {
      // If already a user (anon or real) just go in.
      if (auth.currentUser) {
        return router.replace("/(tabs)");
      }
      await signInAnonymously(auth);
      router.replace("/(tabs)");
    } catch (e: any) {
      console.warn("Guest sign-in failed:", e?.message);
      // We keep UX simple here; you can add Alert if you like.
    }
  }

  function continueSignedIn() {
    router.replace("/(tabs)");
  }

  return (
    <View style={{ flex: 1, backgroundColor: UI.white }}>
      {/* Top blue hero like the mock */}
      <View style={{ height: 320, backgroundColor: UI.blue, alignItems: "center", justifyContent: "center", borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        <Text style={{ fontSize: 56, fontWeight: "900", color: "#fff", letterSpacing: 1 }}>memoZ</Text>
      </View>

      {/* Buttons card area */}
      <View style={{ padding: 20, gap: 14 }}>
        {/* Primary: Create Account */}
        <Link href="/register" asChild>
          <TouchableOpacity
            style={{ backgroundColor: UI.blackBtn, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" }}
            accessibilityRole="button"
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>Create Account</Text>
          </TouchableOpacity>
        </Link>

        {/* Secondary: Sign In */}
        <Link href="/login" asChild>
          <TouchableOpacity
            style={{ backgroundColor: "#fff", height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: UI.border }}
            accessibilityRole="button"
          >
            <Text style={{ color: UI.text, fontSize: 16, fontWeight: "800" }}>Sign In</Text>
          </TouchableOpacity>
        </Link>

        {/* Ghost: Continue as Guest (always shown) */}
        <TouchableOpacity
          onPress={continueAsGuest}
          style={{ backgroundColor: "#fff", height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: UI.border, opacity: 0.96 }}
          accessibilityRole="button"
        >
          <Text style={{ color: UI.text, fontSize: 16, fontWeight: "800" }}>Continue as Guest</Text>
        </TouchableOpacity>

        {/* If already signed in, show a Continue button at top of list */}
        {current && (
          <TouchableOpacity
            onPress={continueSignedIn}
            style={{ marginTop: 6, backgroundColor: "#2563EB", height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ color: "#fff", fontWeight: "800" }}>
              Continue as {current.displayName ? current.displayName : `User ${firstLetter}`}
            </Text>
          </TouchableOpacity>
        )}

        {/* Tiny footer links */}
        <View style={{ marginTop: 6, alignItems: "center" }}>
          <Text style={{ color: UI.muted, fontSize: 12 }}>By continuing you agree to our Terms & Privacy.</Text>
        </View>
      </View>
    </View>
  );
}
