// app/onboarding.tsx
import React, { useRef, useState } from "react";
import { View, Text, ScrollView, Dimensions, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { auth } from "../lib/firebase";
import { signInAnonymously } from "firebase/auth";

const { width } = Dimensions.get("window");

type Slide = { bg: string; title: string; body: string; emoji: string };
const slides: Slide[] = [
  { bg: "#60A5FA", title: "Welcome to memoZ", body: "The simplest way to plan your day.", emoji: "📝" },
  { bg: "#86EFAC", title: "Stay on track", body: "Set dates, times, and priorities that are easy to see.", emoji: "📅" },
  { bg: "#FCA5A5", title: "Ready to start?", body: "Create an account, sign in, or use memoZ as a guest.", emoji: "🚀" },
];

export default function Onboarding() {
  const router = useRouter();
  const ref = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const onDots = (x: number) => setPage(Math.round(x / width));

  const markSeen = async () => {
    await AsyncStorage.setItem("memoz:onboarded", "1");
  };

  const goTabs = async () => {
    await markSeen();
    router.replace("/(tabs)");
  };

  const goLogin = async () => {
    await markSeen();
    router.replace("/login");
  };

  const goRegister = async () => {
    await markSeen();
    router.replace("/register");
  };

  const continueGuest = async () => {
    try {
      await markSeen();
      await signInAnonymously(auth);
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Guest sign-in failed", e?.message ?? "Try again.");
    }
  };

  const next = () => {
    const p = Math.min(page + 1, slides.length - 1);
    ref.current?.scrollTo({ x: width * p, animated: true });
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => onDots(e.nativeEvent.contentOffset.x)}
      >
        {slides.map((s, i) => (
          <View key={i} style={{ width, flex: 1, backgroundColor: s.bg, padding: 24, paddingTop: 64 }}>
            <Text style={{ fontSize: 36, fontWeight: "900", color: "#fff", textAlign: "center", marginBottom: 24 }}>
              memoZ
            </Text>

            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 80, marginBottom: 16 }}>{s.emoji}</Text>
              <Text style={{ fontSize: 24, fontWeight: "900", color: "#0b0f18" }}>{s.title}</Text>
              <Text style={{ fontSize: 16, color: "#0b0f18", marginTop: 8, textAlign: "center", maxWidth: 320 }}>
                {s.body}
              </Text>
            </View>

            {/* footer */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <TouchableOpacity onPress={goTabs}>
                <Text style={{ color: "#0b0f18", fontWeight: "800" }}>{i < slides.length - 1 ? "Skip" : " "}</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                {slides.map((_, j) => (
                  <View
                    key={j}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: j === page ? "#0b0f18" : "rgba(0,0,0,0.25)",
                    }}
                  />
                ))}
              </View>

              {i < slides.length - 1 ? (
                <TouchableOpacity
                  onPress={next}
                  style={{ backgroundColor: "#0b0f18", paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 }}
                >
                  <Text style={{ color: "#fff", fontWeight: "900" }}>Next</Text>
                </TouchableOpacity>
              ) : (
                // Final slide actions
                <View style={{ width: 1 }} />
              )}
            </View>

            {i === slides.length - 1 && (
              <View style={{ marginTop: 16, gap: 10 }}>
                <TouchableOpacity
                  onPress={goRegister}
                  style={{ backgroundColor: "#0b0f18", paddingVertical: 14, borderRadius: 12, alignItems: "center" }}
                >
                  <Text style={{ color: "#fff", fontWeight: "900" }}>Create Account</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={goLogin}
                  style={{
                    backgroundColor: "#ffffff",
                    borderWidth: 1,
                    borderColor: "#0b0f18",
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#0b0f18", fontWeight: "900" }}>Sign In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={continueGuest}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.6)",
                    borderWidth: 1,
                    borderColor: "#ffffff",
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#0b0f18", fontWeight: "900" }}>Continue as Guest</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
