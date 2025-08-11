// app/index.tsx
import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";

export default function Gate() {
  const router = useRouter();

  useEffect(() => {
    // Small delay so you see the blue splash briefly, then go to landing.
    const t = setTimeout(() => router.replace("/landing"), 400);
    return () => clearTimeout(t);
  }, []);

  // Simple blue splash while we redirect
  return (
    <View style={{ flex: 1, backgroundColor: "#3B82B8", alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 48, fontWeight: "900", color: "#fff", letterSpacing: 1 }}>memoZ</Text>
    </View>
  );
}
