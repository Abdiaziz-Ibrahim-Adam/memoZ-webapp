// app/lists/[id].tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, Link } from "expo-router";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";

type Task = { id: string; title: string; done?: boolean; startsAt?: any; folder?: string | null; listId?: string; userId: string };

const UI = {
  bg: "#F7F8FD", text: "#0B0F18", muted: "#6B7280", border: "#E5E7EB", white: "#fff", brand: "#0EA5E9"
};

function Row({ t }: { t: Task }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: UI.border, backgroundColor: t.done ? UI.brand : "#fff" }} />
      <Text style={{ color: t.done ? "#9CA3AF" : UI.text, textDecorationLine: t.done ? "line-through" : "none" }}>{t.title}</Text>
    </View>
  );
}

export default function ListDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const uid = auth?.currentUser?.uid ?? "guest";
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    (async () => {
      const q = query(
        collection(db, "tasks"),
        where("userId", "==", uid),
        where("listId", "==", String(id)),
        orderBy("startsAt", "asc")
      );
      const snap = await getDocs(q);
      setTasks(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Task[]);
    })().catch(console.warn);
  }, [id, uid]);

  const groups = useMemo(() => {
    return {
      todo: tasks.filter((t) => !t.done),
      done: tasks.filter((t) => t.done),
    };
  }, [tasks]);

  return (
    <View style={{ flex: 1, backgroundColor: UI.bg }}>
      {/* Header */}
      <View style={{ height: 56, alignItems: "center", justifyContent: "center", borderBottomWidth: 1, borderBottomColor: UI.border, backgroundColor: UI.white }}>
        <Text style={{ fontSize: 18, fontWeight: "800", color: UI.text }}>List</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <Link href={{ pathname: "/(tabs)/add", params: { listId: String(id) } }} asChild>
          <TouchableOpacity style={{ borderRadius: 16, backgroundColor: UI.brand, height: 52, alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Text style={{ color: "#fff", fontWeight: "900" }}>Add Task</Text>
          </TouchableOpacity>
        </Link>

        <Text style={{ color: "#0EA5E9", fontWeight: "900", marginBottom: 8 }}>TO BUY</Text>
        {groups.todo.length === 0 ? (
          <Text style={{ color: UI.muted, marginBottom: 16 }}>No items.</Text>
        ) : (
          groups.todo.map((t) => <Row key={t.id} t={t} />)
        )}

        <Text style={{ color: "#2563EB", fontWeight: "900", marginTop: 12, marginBottom: 8 }}>DONE</Text>
        {groups.done.length === 0 ? (
          <Text style={{ color: UI.muted }}>Nothing done yet.</Text>
        ) : (
          groups.done.map((t) => <Row key={t.id} t={t} />)
        )}
      </ScrollView>
    </View>
  );
}
