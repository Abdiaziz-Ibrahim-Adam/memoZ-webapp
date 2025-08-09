// app/folders/[id].tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from "react-native";
import { useLocalSearchParams, Link } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "../../lib/firebase";

type List = { id: string; name: string; folderId: string; userId: string };
type Task = { id: string; title: string; done?: boolean; listId?: string; userId: string; startsAt?: any };

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
  return (
    <View style={{ height: 8, borderRadius: 4, backgroundColor: "#E5E7EB", overflow: "hidden" }}>
      <View style={{ width: `${Math.min(100, Math.max(0, value))}%`, height: "100%", backgroundColor: color }} />
    </View>
  );
}

export default function FolderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const uid = auth?.currentUser?.uid ?? "guest";

  const [name, setName] = useState("Folder");
  const [color, setColor] = useState("#DB2777");
  const [lists, setLists] = useState<List[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newList, setNewList] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const fref = doc(db, "folders", String(id));
      const fsnap = await getDoc(fref);
      if (fsnap.exists()) {
        const d = fsnap.data() as any;
        setName(d.name || "Folder");
        setColor(d.color || "#DB2777");
      }

      const lq = query(collection(db, "lists"), where("userId", "==", uid), where("folderId", "==", String(id)));
      const ls = await getDocs(lq);
      const listRows = ls.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as List[];
      setLists(listRows);

      const tq = query(collection(db, "tasks"), where("userId", "==", uid), where("folder", "==", String(id)), orderBy("startsAt", "asc"));
      const ts = await getDocs(tq);
      setTasks(ts.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Task[]);
    })().catch(console.warn);
  }, [id, uid]);

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
      pct[k] = total ? Math.round((done / total) * 100) : 0;
    });
    return pct;
  }, [tasks]);

  const makeList = async () => {
    const t = newList.trim();
    if (!t) return Alert.alert("List", "Enter a list name.");
    try {
      setSaving(true);
      await addDoc(collection(db, "lists"), {
        name: t,
        folderId: String(id),
        userId: uid,
        createdAt: Timestamp.fromDate(new Date()),
      });
      setNewList("");
      const lq = query(collection(db, "lists"), where("userId", "==", uid), where("folderId", "==", String(id)));
      const ls = await getDocs(lq);
      setLists(ls.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as List[]);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Could not create list.");
    } finally {
      setSaving(false);
    }
  };

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
        <Text style={{ fontSize: 18, fontWeight: "800", color: UI.text }}>{name}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* New List button like screenshot */}
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
            value={newList}
            onChangeText={setNewList}
            placeholder="e.g. Weekly Planner"
            placeholderTextColor="#94a3b8"
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
            style={{ backgroundColor: UI.brand, paddingVertical: 12, borderRadius: 12, alignItems: "center" }}
          >
            <Text style={{ color: "#fff", fontWeight: "900" }}>{saving ? "Saving…" : "Add List"}</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 14, fontWeight: "900", color: UI.text, marginBottom: 10 }}>LISTS</Text>

        {lists.map((l, idx) => {
          const pct = progressByList[l.id] ?? 0;
          const chip = ["#DCFCE7", "#FCE7F3", "#FEF3C7", "#E0E7FF"][idx % 4];
          const bar = [ "#16A34A", "#DB2777", "#F59E0B", "#6366F1" ][idx % 4];
          return (
            <Link key={l.id} href={`./lists/${l.id}`} asChild>
              <TouchableOpacity
                style={{
                  borderRadius: 16,
                  backgroundColor: chip,
                  borderWidth: 1,
                  borderColor: UI.border,
                  padding: 14,
                  marginBottom: 12,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ fontSize: 16, fontWeight: "900", color }}>{l.name}</Text>
                  <Text style={{ color: UI.muted }}>{pct}%</Text>
                </View>
                <View style={{ marginTop: 8 }}>
                  <Progress value={pct} color={bar} />
                </View>
              </TouchableOpacity>
            </Link>
          );
        })}

        {lists.length === 0 && (
          <Text style={{ color: UI.muted, textAlign: "center" }}>No lists yet. Create one above.</Text>
        )}
      </ScrollView>
    </View>
  );
}
