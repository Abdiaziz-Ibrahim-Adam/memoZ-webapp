// app/landing.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { signInAnonymously } from "firebase/auth";
import { auth } from "../lib/firebase";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { createStarterFolders } from "lib/starterSetup";

const UI = {
  blue: "#3B82B8", // hero background
  text: "#0B0F18",
  muted: "#6B7280",
  border: "#E5E7EB",
  white: "#FFFFFF",
  blackBtn: "#0B0F18",
  brand: "#2563EB",
};

export default function Landing() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const current = auth?.currentUser ?? null;
  const [busyGuest, setBusyGuest] = useState(false);

  const firstLetter = useMemo(
    () => (current?.displayName || current?.email || "M").charAt(0).toUpperCase(),
    [current]
  );

  const alreadySignedIn = !!current;

  async function continueAsGuest() {
    try {
      // If already any user (anon or real) just go in.
      if (auth.currentUser) {
        return router.replace("/(tabs)");
      }
      setBusyGuest(true);
      await signInAnonymously(auth);
      await createStarterFolders();
      router.replace("/(tabs)");
    } catch (e: any) {
      const msg =
        e?.code === "auth/operation-not-allowed"
          ? "Anonymous sign-in is disabled for this project. Enable it in Firebase Console > Authentication > Sign-in method."
          : e?.message ?? "Guest sign-in failed. Please try again.";
      Alert.alert("Continue as Guest", msg);
    } finally {
      setBusyGuest(false);
    }
  }

  function continueSignedIn() {
    router.replace("/(tabs)");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: UI.white }}>
      {/* Top blue hero */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 12),
          height: 320,
          backgroundColor: UI.blue,
          alignItems: "center",
          justifyContent: "center",
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
        accessible
        accessibilityRole="header"
        accessibilityLabel="memoZ"
      >
        <Text
          style={{
            fontSize: 56,
            fontWeight: "900",
            color: "#fff",
            letterSpacing: 1,
          }}
        >
          memoZ
        </Text>
      </View>

      {/* Buttons area */}
      <View style={{ padding: 20, gap: 14 }}>
        {/* If signed in already, show a continue button on top */}
        {alreadySignedIn && (
          <TouchableOpacity
            onPress={continueSignedIn}
            style={{
              backgroundColor: UI.brand,
              height: 52,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
            }}
            accessibilityRole="button"
            accessibilityLabel="Continue to app"
            testID="continue-signed-in"
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>
              Continue as{" "}
              {current?.displayName ? current.displayName : `User ${firstLetter}`}
            </Text>
          </TouchableOpacity>
        )}

        {/* Primary: Create Account */}
        <Link href="/register" asChild>
          <TouchableOpacity
            style={{
              backgroundColor: UI.blackBtn,
              height: 52,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
            }}
            accessibilityRole="button"
            accessibilityLabel="Create Account"
            testID="create-account"
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>
              Create Account
            </Text>
          </TouchableOpacity>
        </Link>

        {/* Secondary: Sign In */}
        <Link href="/login" asChild>
          <TouchableOpacity
            style={{
              backgroundColor: "#fff",
              height: 52,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: UI.border,
            }}
            accessibilityRole="button"
            accessibilityLabel="Sign In"
            testID="sign-in"
          >
            <Text style={{ color: UI.text, fontSize: 16, fontWeight: "800" }}>
              Sign In
            </Text>
          </TouchableOpacity>
        </Link>

        {/* Ghost: Continue as Guest (always shown) */}
        <TouchableOpacity
          onPress={continueAsGuest}
          disabled={busyGuest}
          style={{
            backgroundColor: "#fff",
            height: 52,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: UI.border,
            opacity: busyGuest ? 0.6 : 0.96,
          }}
          accessibilityRole="button"
          accessibilityLabel={
            busyGuest ? "Continuing as guest, please wait" : "Continue as Guest"
          }
          testID="continue-guest"
        >
          <Text style={{ color: UI.text, fontSize: 16, fontWeight: "800" }}>
            {busyGuest ? "Please wait…" : "Continue as Guest"}
          </Text>
        </TouchableOpacity>

        {/* Tiny footer links */}
        <View style={{ marginTop: 6, alignItems: "center" }}>
          <Text
            style={{
              color: UI.muted,
              fontSize: 12,
              textAlign: "center",
              lineHeight: Platform.OS === "ios" ? 16 : 18,
            }}
            accessibilityRole="text"
          >
            By continuing you agree to our Terms & Privacy.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
