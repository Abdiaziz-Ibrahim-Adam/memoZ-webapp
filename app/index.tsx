// app/index.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Platform,
  AccessibilityInfo,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, Unsubscribe } from "firebase/auth";

const BRAND = "#3B82B8";
const TEXT_ON_BRAND = "#FFFFFF";

export default function Gate() {
  const router = useRouter();
  const [booting, setBooting] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;

  // Respect the user's "Reduce Motion" preference for cognitive & vestibular accessibility
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => mounted && setReduceMotion(!!v))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Animate in the splash text gently (or instantly if reduce motion)
  useEffect(() => {
    if (reduceMotion) {
      fade.setValue(1);
      return;
    }
    Animated.timing(fade, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [reduceMotion, fade]);

  /**
   * Boot flow:
   * 1) Wait for Firebase auth to emit the current user (including anonymous).
   * 2) Check onboarding flag.
   * 3) Route:
   *    - No onboarding seen  -> /onboarding
   *    - Onboarded + no user -> /landing
   *    - User present        -> /(tabs)
   */
  useEffect(() => {
    let unsub: Unsubscribe | null = null;
    let routed = false;

    async function decideRoute() {
      try {
        const onboarded = (await AsyncStorage.getItem("memoz:onboarded")) === "1";

        unsub = onAuthStateChanged(auth as any, (user) => {
          if (routed) return;

          // Choose destination based on status
          const dest = !onboarded
            ? "/onboarding"
            : user
            ? "/(tabs)"
            : "/landing";

          routed = true;

          // Give a tiny dwell time so the splash is perceptible & smooth
          const delay = reduceMotion ? 80 : 300;
          setTimeout(() => {
            router.replace(dest as any);
            setBooting(false);
          }, delay);
        });
      } catch {
        // If anything fails (e.g., AsyncStorage), fall back to landing
        router.replace("/landing");
        setBooting(false);
      }
    }

    decideRoute();

    return () => {
      if (unsub) unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion]);

  // Simple accessible splash while we decide where to go
  const Title = useMemo(
    () => (
      <Animated.Text
        accessibilityRole="header"
        accessibilityLabel="memoZ"
        style={{
          opacity: fade,
          fontSize: 48,
          fontWeight: "900",
          color: TEXT_ON_BRAND,
          letterSpacing: Platform.OS === "web" ? 0.5 : 1,
          textAlign: "center",
        }}
      >
        memoZ
      </Animated.Text>
    ),
    [fade]
  );

  return (
    <View
      accessible
      accessibilityLabel="Loading memoZ"
      style={{
        flex: 1,
        backgroundColor: BRAND,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
      }}
    >
      {Title}
      {booting ? (
        <View
          style={{
            marginTop: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <ActivityIndicator color={TEXT_ON_BRAND} />
          <Text
            style={{
              color: TEXT_ON_BRAND,
              fontWeight: "600",
              fontSize: 16,
            }}
          >
            Getting things ready…
          </Text>
        </View>
      ) : null}
    </View>
  );
}
