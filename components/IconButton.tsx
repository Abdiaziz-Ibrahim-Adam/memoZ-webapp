// components/IconButton.tsx
import React from "react";
import { Pressable } from "react-native";

export default function IconButton({
  children,
  onPress,
  label,
  hit = 10,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  label: string;
  hit?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={hit}
      style={({ pressed }) => ({
        padding: 8,
        borderRadius: 12,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      {children}
    </Pressable>
  );
}
