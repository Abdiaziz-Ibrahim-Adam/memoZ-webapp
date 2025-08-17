// components/AButton.tsx
import React from "react";
import { Pressable, Text, ActivityIndicator, ViewStyle, TextStyle } from "react-native";

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  busy?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  iconLeft?: React.ReactNode;
  accessibilityLabel?: string;
  role?: "button" | "link";
  testID?: string;
};

export default function AButton({
  label,
  onPress,
  disabled,
  busy,
  style,
  labelStyle,
  iconLeft,
  accessibilityLabel,
  role = "button",
  testID,
}: Props) {
  return (
    <Pressable
      onPress={disabled || busy ? undefined : onPress}
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled || !!busy, busy: !!busy }}
      hitSlop={12}
      android_ripple={{ borderless: false }}
      style={({ pressed }) => [
        {
          minHeight: 52,
          paddingHorizontal: 16,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          backgroundColor: "#0EA5E9", // brand primary
        },
        style,
      ]}
      testID={testID}
    >
      {busy ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          {iconLeft}
          <Text
            style={[
              { color: "#fff", fontSize: 18, fontWeight: "900" },
              labelStyle,
            ]}
            maxFontSizeMultiplier={1.3}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
