// app/onboarding.tsx
import React, { useRef, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ListRenderItemInfo,
  Platform,
} from "react-native";
import { useWindowDimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

type Slide = { bg: string; title: string; body: string; emoji: string };
const slides: Slide[] = [
  { bg: "#60A5FA", title: "Welcome to memoZ", body: "The simplest way to plan your day.", emoji: "📝" },
  { bg: "#86EFAC", title: "Stay on track", body: "Set dates, times, and priorities that are easy to see.", emoji: "📅" },
  { bg: "#FCA5A5", title: "Ready to start?", body: "Click the get started button below 👇", emoji: "🚀" },
];

export default function Onboarding() {
  const router = useRouter();
  const listRef = useRef<FlatList<Slide>>(null);
  const [page, setPage] = useState(0);

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const pageHeight = useMemo(
    () => Math.max(0, height - (Platform.OS === "android" ? 0 : insets.top + insets.bottom)),
    [height, insets.top, insets.bottom]
  );

  const markSeen = async () => {
    await AsyncStorage.setItem("memoz:onboarded", "1");
  };

  const goLanding = async () => {
    await markSeen();
    router.replace("/landing");
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems?.length) {
      const idx = viewableItems[0].index ?? 0;
      setPage(idx);
    }
  }, []);
  const viewabilityConfig = { itemVisiblePercentThreshold: 60 };

  const next = () => {
    const p = Math.min(page + 1, slides.length - 1);
    listRef.current?.scrollToIndex({ index: p, animated: true });
    setPage(p);
  };

  const renderItem = ({ item, index }: ListRenderItemInfo<Slide>) => (
    <View
      style={{
        width,
        height: pageHeight,
        backgroundColor: item.bg,
        paddingTop: Platform.OS === "ios" ? insets.top + 16 : 16,
        paddingBottom: Platform.OS === "ios" ? insets.bottom + 16 : 16,
        paddingHorizontal: 20,
      }}
    >
      {/* Brand */}
      <View style={{ alignItems: "center", marginBottom: 16 }}>
        <Text style={{ fontSize: 40, fontWeight: "900", color: "#fff", letterSpacing: 0.5 }}>memoZ</Text>
      </View>

      {/* Center content */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 80, marginBottom: 16 }}>{item.emoji}</Text>
        <Text style={{ fontSize: 24, fontWeight: "900", color: "#0b0f18", textAlign: "center" }}>{item.title}</Text>
        <Text
          style={{
            fontSize: 16,
            color: "#0b0f18",
            marginTop: 8,
            textAlign: "center",
            maxWidth: 360,
          }}
        >
          {item.body}
        </Text>
      </View>

      {/* Skip + Next controls */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TouchableOpacity onPress={goLanding} accessibilityRole="button">
          <Text style={{ color: "#0b0f18", fontWeight: "800" }}>
            {index < slides.length - 1 ? "Skip" : " "}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {slides.map((_, j) => (
            <View
              key={j}
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: j === page ? "#0b0f18" : "rgba(0,0,0,0.25)",
                marginHorizontal: 5,
              }}
            />
          ))}
        </View>

        {index < slides.length - 1 ? (
          <TouchableOpacity
            onPress={next}
            style={{
              backgroundColor: "#0b0f18",
              paddingVertical: 12,
              paddingHorizontal: 18,
              borderRadius: 12,
            }}
            accessibilityRole="button"
          >
            <Text style={{ color: "#fff", fontWeight: "900" }}>Next</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 1 }} />
        )}
      </View>

      {/* Last page: Get started button */}
      {index === slides.length - 1 && (
        <View style={{ marginTop: 16 }}>
          <TouchableOpacity
            onPress={goLanding}
            style={{
              backgroundColor: "#0b0f18",
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: "center",
            }}
            accessibilityRole="button"
          >
            <Text style={{ color: "#fff", fontWeight: "900" }}>Get Started</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: slides[0].bg }}>
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={3}
        alwaysBounceHorizontal={false}
        bounces={false}
      />
    </SafeAreaView>
  );
}
