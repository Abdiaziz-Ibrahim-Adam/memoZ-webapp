// app/folders.tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Link } from "expo-router";
import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore";
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

  useEffect(() => {
    (async () => {
      const fs = await getDocs(query(collection(db, "folders"), where("userId", "==", uid)));
      setFolders(fs.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));

      const ls = await getDocs(query(collection(db, "lists"), where("userId", "==", uid)));
      setLists(ls.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    })().catch(console.warn);
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
        createdAt: Timestamp.fromDate(new Date()),
      });
      setName("");
      const fs = await getDocs(query(collection(db, "folders"), where("userId", "==", uid)));
      setFolders(fs.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Could not create folder.");
    } finally {
      setSaving(false);
    }
  };

  const Card = ({ f }: { f: Folder }) => (
    <Link href={`/folders/${f.id}`} asChild>
      <TouchableOpacity
        style={{
          width: "48%",
          borderRadius: 18,
          backgroundColor: UI.white,
          borderWidth: 1,
          borderColor: UI.border,
          padding: 14,
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "900", color: f.color || UI.text }}>{f.name}</Text>
        <Text style={{ color: UI.muted, marginTop: 6 }}>
          {countByFolder[f.id] ?? 0} Lists
        </Text>
        <Text style={{ marginTop: 8, color: UI.brand, fontWeight: "800" }}>→</Text>
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

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
        {/* New Folder tile + grid */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
          {/* New Folder tile opens inline form below */}
          <TouchableOpacity
            onPress={() => {}}
            activeOpacity={1}
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
        >
          <Text style={{ fontWeight: "800", marginBottom: 8, color: UI.text }}>
            Create Folder
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Folder name"
            placeholderTextColor="#94a3b8"
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
              backgroundColor: UI.brand,
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "900" }}>
              {saving ? "Saving…" : "Add Folder"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
