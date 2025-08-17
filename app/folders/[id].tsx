// app/folders/[id].tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useLocalSearchParams, Link, useRouter } from "expo-router";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "../../lib/firebase";

type List = { id: string; name: string; folderId: string; userId: string };
type Task = {
  id: string;
  title: string;
  done?: boolean;
  listId?: string;
  userId: string;
  startsAt?: any;
  folder?: string | null;
};

const UI = {
  bg: "#F7F8FD",
  text: "#0B0F18",
  muted: "#6B7280",
  border: "#E5E7EB",
  white: "#fff",
  soft: "#F1F5F9",
  brand: "#0EA5E9",
};

function Progress({ value, color }: { value: number; color: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <View
      style={{
        height: 8,
        borderRadius: 4,
        backgroundColor: "#E5E7EB",
        overflow: "hidden",
      }}
      accessibilityRole="progressbar"
      accessibilityValue={{ now: pct, min: 0, max: 100 }}
    >
      <View style={{ width: `${pct}%`, height: "100%", backgroundColor: color }} />
    </View>
  );
}

export default function FolderDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const uid = auth?.currentUser?.uid ?? "guest";

  const [folderName, setFolderName] = useState("Folder");
  const [folderColor, setFolderColor] = useState("#DB2777");
  const [lists, setLists] = useState<List[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newListName, setNewListName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const inputRef = useRef<TextInput>(null);

  // Realtime folder header
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const unsub = onSnapshot(doc(db, "folders", String(id)), (snap) => {
      if (snap.exists()) {
        const d = snap.data() as any;
        setFolderName(d.name || "Folder");
        setFolderColor(d.color || "#DB2777");
      }
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  // Realtime lists for this folder
  useEffect(() => {
    if (!id) return;
    const qLists = query(
      collection(db, "lists"),
      where("userId", "==", uid),
      where("folderId", "==", String(id))
    );
    const unsub = onSnapshot(
      qLists,
      (snap) => {
        setLists(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      },
      (e) => console.warn("lists subscribe error", e)
    );
    return () => unsub();
  }, [id, uid]);

  // Realtime tasks in this folder (to compute per-list progress)
  useEffect(() => {
    if (!id) return;
    const qTasks = query(
      collection(db, "tasks"),
      where("userId", "==", uid),
      where("folder", "==", String(id)),
      orderBy("startsAt", "asc")
    );
    const unsub = onSnapshot(
      qTasks,
      (snap) => {
        setTasks(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Task[]);
      },
      (e) => console.warn("tasks subscribe error", e)
    );
    return () => unsub();
  }, [id, uid]);

  // Compute progress per list (done/total)
  const progressByList = useMemo(() => {
    const m: Record<string, { done: number; total: number }> = {};
    for (const t of tasks) {
      const key = t.listId || "__none__";
      if (!m[key]) m[key] = { done: 0, total: 0 };
      m[key].total += 1;
      if (t.done) m[key].done += 1;
    }
    const pct: Record<string, number> = {};
    Object.keys(m).forEach((k) => {
      const { done, total } = m[k];
      pct[k] = total ? (done / total) * 100 : 0;
    });
    return pct;
  }, [tasks]);

  const makeList = async () => {
    const t = newListName.trim();
    if (!t) return Alert.alert("List", "Enter a list name.");
    try {
      setSaving(true);
      await addDoc(collection(db, "lists"), {
        name: t,
        folderId: String(id),
        userId: uid,
        createdAt: Timestamp.now(),
      });
      setNewListName("");
      inputRef.current?.blur();
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Could not create list.");
    } finally {
      setSaving(false);
    }
  };

  if (!id) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: UI.bg }}>
        <Text style={{ color: UI.muted }}>No folder selected.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: UI.bg }}>
        <ActivityIndicator />
        <Text style={{ color: UI.muted, marginTop: 8 }}>Loading…</Text>
      </View>
    );
  }

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
        <Text style={{ fontSize: 18, fontWeight: "800", color: UI.text }}>{folderName}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* Add Task (route to your unified add screen) */}
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/(tabs)/add", params: { folder: String(id) } })}
          accessibilityRole="button"
          accessibilityLabel="Add task"
          style={{
            borderRadius: 16,
            backgroundColor: UI.brand,
            height: 52,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
            shadowOpacity: Platform.OS === "ios" ? 0.12 : 0,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: Platform.OS === "android" ? 2 : 0,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "900" }}>Add Task</Text>
        </TouchableOpacity>

        {/* Inline create list */}
        <View
          style={{
            borderRadius: 18,
            backgroundColor: UI.white,
            borderWidth: 1,
            borderColor: UI.border,
            padding: 14,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontWeight: "900", color: UI.text, marginBottom: 8 }}>New List</Text>
          <TextInput
            ref={inputRef}
            value={newListName}
            onChangeText={setNewListName}
            placeholder="e.g. Weekly Planner"
            placeholderTextColor="#94a3b8"
            autoCorrect={false}
            accessibilityLabel="List name"
            style={{
              borderWidth: 1,
              borderColor: UI.border,
              borderRadius: 12,
              padding: 12,
              backgroundColor: "#fff",
              color: UI.text,
              marginBottom: 10,
            }}
          />
          <TouchableOpacity
            onPress={makeList}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel="Create list"
            style={{
              backgroundColor: saving ? "#93c5fd" : UI.brand,
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "900" }}>{saving ? "Saving…" : "Add List"}</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 14, fontWeight: "900", color: UI.text, marginBottom: 10 }}>LISTS</Text>

        {lists.length === 0 ? (
          <View
            style={{
              borderRadius: 16,
              backgroundColor: UI.white,
              borderWidth: 1,
              borderColor: UI.border,
              padding: 16,
            }}
          >
            <Text style={{ color: UI.muted }}>No lists yet. Create one above.</Text>
          </View>
        ) : (
          lists.map((l, idx) => {
            const pct = progressByList[l.id] ?? 0;
            const chip = ["#DCFCE7", "#FCE7F3", "#FEF3C7", "#E0E7FF"][idx % 4];
            const bar = ["#16A34A", "#DB2777", "#F59E0B", "#6366F1"][idx % 4];
            return (
              <Link key={l.id} href={`/lists/${l.id}`} asChild>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`Open list ${l.name}`}
                  style={{
                    borderRadius: 16,
                    backgroundColor: chip,
                    borderWidth: 1,
                    borderColor: UI.border,
                    padding: 14,
                    marginBottom: 12,
                    shadowOpacity: Platform.OS === "ios" ? 0.06 : 0,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: Platform.OS === "android" ? 1 : 0,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: "900", color: folderColor }}>
                      {l.name}
                    </Text>
                    <Text style={{ color: UI.muted }}>{Math.round(pct)}%</Text>
                  </View>
                  <View style={{ marginTop: 8 }}>
                    <Progress value={pct} color={bar} />
                  </View>
                </TouchableOpacity>
              </Link>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
