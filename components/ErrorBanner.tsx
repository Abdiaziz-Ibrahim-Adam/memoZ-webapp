// components/ErrorBanner.tsx
import React from "react";
import { View, Text } from "react-native";

export default function ErrorBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <View
      accessibilityRole="alert"
      style={{
        borderRadius: 12,
        padding: 12,
        backgroundColor: "#FEE2E2",
        borderWidth: 1,
        borderColor: "#FCA5A5",
        marginBottom: 12,
      }}
    >
      <Text style={{ color: "#991B1B", fontWeight: "800", marginBottom: 4 }}>Something went wrong</Text>
      <Text style={{ color: "#991B1B" }}>{message}</Text>
    </View>
  );
}
