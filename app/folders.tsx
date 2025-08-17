// app/folders.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  Timestamp,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";

type Folder = { id: string; name: string; color?: string; userId: string };
type List = { id: string; name: string; folderId: string; userId: string };

const UI = {
  bg: "#F7F8FD",
  text: "#0B0F18",
  muted: "#6B7280",
  border: "#E5E7EB",
  soft: "#F3F4F6",
  white: "#fff",
  brand: "#0EA5E9",
};

const COLORS = ["#DB2777", "#16A34A", "#2563EB", "#F59E0B", "#7C3AED", "#059669"];

export default function FoldersScreen() {
  const uid = auth?.currentUser?.uid ?? "guest";

  const [folders, setFolders] = useState<Folder[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // realtime folders
  useEffect(() => {
    setLoading(true);
    const qF = query(collection(db, "folders"), where("userId", "==", uid));
    const unsubF = onSnapshot(
      qF,
      (snap) => {
        setFolders(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        setLoading(false);
      },
      (e) => {
        console.warn("folders subscribe error", e);
        setLoading(false);
      }
    );

    // one-off lists (counts don’t need to be realtime, but you can switch to onSnapshot similarly)
    (async () => {
      const qL = query(collection(db, "lists"), where("userId", "==", uid));
      const sL = await getDocs(qL);
      setLists(sL.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    })().catch(console.warn);

    return () => unsubF();
  }, [uid]);

  const countByFolder = useMemo(() => {
    const m: Record<string, number> = {};
    for (const l of lists) m[l.folderId] = (m[l.folderId] ?? 0) + 1;
    return m;
  }, [lists]);

  const create = async () => {
    const t = name.trim();
    if (!t) return Alert.alert("Folder", "Please enter a name.");
    try {
      setSaving(true);
      await addDoc(collection(db, "folders"), {
        name: t,
        color,
        userId: uid,
        createdAt: Timestamp.now(),
      });
      setName("");
      // leave color as-is so the user can add multiple in a row
      inputRef.current?.blur();
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Could not create folder.");
    } finally {
      setSaving(false);
    }
  };

  const onNewTilePress = () => {
    // Scroll to the inline form and focus the text input
    scrollRef.current?.scrollToEnd({ animated: true });
    setTimeout(() => inputRef.current?.focus(), 220);
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const qL = query(collection(db, "lists"), where("userId", "==", uid));
      const sL = await getDocs(qL);
      setLists(sL.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    } finally {
      setRefreshing(false);
    }
  };

  const Card = ({ f }: { f: Folder }) => (
    <Link href={`/folders/${f.id}`} asChild>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Open folder ${f.name}`}
        style={{
          width: "48%",
          borderRadius: 18,
          backgroundColor: UI.white,
          borderWidth: 1,
          borderColor: UI.border,
          padding: 14,
          marginBottom: 12,
          shadowOpacity: Platform.OS === "ios" ? 0.06 : 0,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: Platform.OS === "android" ? 1 : 0,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "900", color: f.color || UI.text }}>
          {f.name}
        </Text>
        <Text style={{ color: UI.muted, marginTop: 6 }}>
          {countByFolder[f.id] ?? 0} {countByFolder[f.id] === 1 ? "List" : "Lists"}
        </Text>
        <Text style={{ marginTop: 8, color: UI.brand, fontWeight: "800" }}>See →</Text>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={{ flex: 1, backgroundColor: UI.bg }}>
      {/* Header */}
      <View
        style={{
          height: 56,
          alignItems: "center",
          justifyContent: "center",
          borderBottomWidth: 1,
          borderBottomColor: UI.border,
          backgroundColor: UI.white,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "800", color: UI.text }}>Folders</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
          <Text style={{ color: UI.muted, marginTop: 8 }}>Loading folders…</Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={UI.brand} />
          }
        >
          {/* New Folder tile + grid */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            {/* New Folder tile opens inline form below */}
            <TouchableOpacity
              onPress={onNewTilePress}
              accessibilityRole="button"
              accessibilityLabel="Create a new folder"
              style={{
                width: "48%",
                height: 110,
                borderRadius: 18,
                backgroundColor: UI.soft,
                borderWidth: 1,
                borderColor: UI.border,
                marginBottom: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 28, color: UI.brand }}>＋</Text>
              <Text style={{ color: UI.muted, marginTop: 6 }}>New Folder</Text>
            </TouchableOpacity>

            {folders.map((f) => (
              <Card key={f.id} f={f} />
            ))}
          </View>

          {/* Empty state when no folders */}
          {folders.length === 0 && (
            <View
              style={{
                borderRadius: 16,
                backgroundColor: UI.white,
                borderWidth: 1,
                borderColor: UI.border,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: UI.muted }}>
                You don’t have any folders yet. Create one below to get organized.
              </Text>
            </View>
          )}

          {/* Inline create card */}
          <View
            style={{
              borderRadius: 16,
              backgroundColor: UI.white,
              borderWidth: 1,
              borderColor: UI.border,
              padding: 12,
              marginTop: 6,
            }}
            accessibilityLabel="Create folder form"
          >
            <Text style={{ fontWeight: "800", marginBottom: 8, color: UI.text }}>Create Folder</Text>
            <TextInput
              ref={inputRef}
              value={name}
              onChangeText={setName}
              placeholder="Folder name"
              placeholderTextColor="#94a3b8"
              autoCorrect={false}
              autoCapitalize="sentences"
              accessibilityLabel="Folder name"
              style={{
                borderWidth: 1,
                borderColor: UI.border,
                borderRadius: 12,
                padding: 12,
                backgroundColor: "#fff",
                color: UI.text,
              }}
            />
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              {COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setColor(c)}
                  accessibilityRole="button"
                  accessibilityLabel={`Pick color ${c}`}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: c,
                    borderWidth: 2,
                    borderColor: color === c ? "#111827" : "#fff",
                  }}
                />
              ))}
            </View>
            <TouchableOpacity
              onPress={create}
              disabled={saving}
              style={{
                marginTop: 12,
                backgroundColor: saving ? "#93c5fd" : UI.brand,
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: "center",
              }}
              accessibilityRole="button"
              accessibilityLabel="Add folder"
            >
              <Text style={{ color: "#fff", fontWeight: "900" }}>
                {saving ? "Saving…" : "Add Folder"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
