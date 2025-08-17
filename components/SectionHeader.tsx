// components/SectionHeader.tsx
import React from "react";
import { View, Text } from "react-native";

export default function SectionHeader({ title }: { title: string }) {
  return (
    <View style={{ marginTop: 8, marginBottom: 8 }}>
      <Text
        accessibilityRole="header"
        style={{ fontSize: 16, fontWeight: "900", color: "#0B0F18" }}
      >
        {title.toUpperCase()}
      </Text>
    </View>
  );
}
