// app/(tabs)/tasks.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { SlidersHorizontal, Plus } from "lucide-react-native";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "../../lib/firebase";

type Task = {
  id: string;
  userId: string;
  title: string;
  startsAt?: any;
  priority?: "low" | "medium" | "high";
  folder?: string | null;
  done?: boolean;
};

type Folder = { id: string; name: string; color?: string };

const UI = {
  bg: "#F7F8FD",
  pageBg: "#FFFFFF",
  card: "#FFFFFF",
  soft: "#F1F5F9",
  text: "#0B0F18",
  muted: "#6B7280",
  border: "#E5E7EB",
  purple: "#3B82F6",
  primary: "#7C3AED",
};

function PriorityTag({ level }: { level?: Task["priority"] }) {
  const style =
    level === "high"
      ? { border: "#FCA5A5", text: "#B91C1C", label: "High" }
      : level === "medium"
      ? { border: "#FDE68A", text: "#92400E", label: "Medium" }
      : { border: "#A5B4FC", text: "#3730A3", label: "Low" };
  return (
    <View
      style={{
        borderWidth: 1.5,
        borderColor: style.border,
        borderRadius: 999,
        paddingVertical: 2,
        paddingHorizontal: 8,
        marginLeft: 8,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: "800", color: style.text }}>
        {style.label}
      </Text>
    </View>
  );
}

function TaskRow({ task }: { task: Task }) {
  const router = useRouter();
  const dt =
    task.startsAt?.toDate?.() ??
    (task.startsAt ? new Date(task.startsAt) : undefined);
  const time = dt
    ? new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "—";

  const toggleDone = async () => {
    await updateDoc(doc(db, "tasks", task.id), {
      done: !task.done,
      updatedAt: Timestamp.now(),
    });
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`./task/${task.id}`)}
      style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}
    >
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          toggleDone();
        }}
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          borderWidth: 1.5,
          borderColor: UI.border,
          marginRight: 8,
          backgroundColor: task.done ? "#22C55E" : "#fff",
        }}
      />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            color: task.done ? "#9CA3AF" : UI.text,
            textDecorationLine: task.done ? "line-through" : "none",
          }}
        >
          {task.title}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
          <Text style={{ fontSize: 13, color: UI.muted }}>⏰ {time}</Text>
          <PriorityTag level={task.priority} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function FolderCard({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        borderRadius: 18,
        backgroundColor: UI.soft,
        padding: 14,
        borderWidth: 1,
        borderColor: UI.border,
        marginBottom: 14,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "900", color }}>{title}</Text>
        <SlidersHorizontal size={18} color={color} />
      </View>
      {children}
    </View>
  );
}

export default function TasksScreen() {
  const userId = auth?.currentUser?.uid ?? "guest";
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [folders, setFolders] = useState<Record<string, Folder>>({});
  const [filter, setFilter] = useState<"upcoming" | "done" | "all">("upcoming");

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, "tasks"),
      where("userId", "==", userId),
      orderBy("startsAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Task[];
      setTasks(rows);
      setLoading(false);
    });
    return () => unsub();
  }, [userId]);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, "folders"));
      const map: Record<string, Folder> = {};
      snap.docs.forEach((d) => {
        const data = d.data() as any;
        map[d.id] = {
          id: d.id,
          name: data.name || "Folder",
          color: data.color || "#EA4C89",
        };
      });
      setFolders(map);
    })();
  }, []);

  const shown = useMemo(() => {
    const base =
      filter === "all"
        ? tasks
        : filter === "done"
        ? tasks.filter((t) => t.done)
        : tasks.filter((t) => !t.done);

    const grouped: Record<string, Task[]> = {};
    for (const t of base) {
      const key = t.folder || "__none__";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(t);
    }
    Object.values(grouped).forEach((arr) =>
      arr.sort((a, b) => {
        const ta = (a.startsAt?.toDate?.() ?? new Date(a.startsAt || 0)).getTime();
        const tb = (b.startsAt?.toDate?.() ?? new Date(b.startsAt || 0)).getTime();
        return ta - tb;
      })
    );
    return grouped;
  }, [tasks, filter]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: UI.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: UI.muted }}>Loading tasks…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: UI.bg }}>
      <View
        style={{
          height: 56,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          borderBottomWidth: 1,
          borderBottomColor: UI.border,
          backgroundColor: UI.pageBg,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "800", color: UI.text }}>Tasks</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <Link href="/(tabs)/add" asChild>
          <TouchableOpacity
            style={{
              borderRadius: 18,
              backgroundColor: UI.purple,
              height: 56,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              shadowOpacity: 0.12,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Plus size={20} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "900" }}>Add Task</Text>
            </View>
          </TouchableOpacity>
        </Link>

        <Text style={{ fontSize: 14, fontWeight: "900", color: UI.text, marginBottom: 10 }}>TASKS</Text>

        <View style={{ marginBottom: 12 }}>
          <View
            style={{
              alignSelf: "flex-start",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              borderWidth: 1.5,
              borderColor: UI.border,
              backgroundColor: "#fff",
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 999,
            }}
          >
            {(["upcoming", "done", "all"] as const).map((k) => {
              const active = filter === k;
              return (
                <TouchableOpacity
                  key={k}
                  onPress={() => setFilter(k)}
                  style={{
                    backgroundColor: active ? "#EDE9FE" : "transparent",
                    borderRadius: 999,
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                  }}
                >
                  <Text style={{ fontWeight: "800", color: active ? "#4C1D95" : UI.text }}>
                    {k[0].toUpperCase() + k.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {Object.keys(shown).length === 0 ? (
          <View
            style={{
              borderRadius: 18,
              backgroundColor: UI.soft,
              padding: 16,
              borderWidth: 1,
              borderColor: UI.border,
            }}
          >
            <Text style={{ color: UI.muted }}>No tasks yet. Add one above.</Text>
          </View>
        ) : (
          Object.entries(shown).map(([folderId, list]) => {
            const info =
              folders[folderId] ||
              ({ id: folderId, name: "Personal", color: "#DB2777" } as Folder);
            const color = info.color || "#DB2777";
            const title =
              folderId === "__none__" ? "Unsorted" : info.name || "Folder";

            return (
              <FolderCard key={folderId} title={title} color={color}>
                {list.map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </FolderCard>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
