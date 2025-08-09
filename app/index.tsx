// app/index.tsx
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { auth } from "../lib/firebase";

export default function Gate() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const seen = await AsyncStorage.getItem("memoz:onboarded");
        if (!seen) {
          router.replace("/onboarding");
          return;
        }
        // after onboarding, decide by auth state
        const user = auth.currentUser;
        router.replace(user ? "/(tabs)" : "/login");
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0EA5E9", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 40, fontWeight: "900", color: "#fff" }}>memoZ</Text>
      </View>
    );
  }
  return null;
}
