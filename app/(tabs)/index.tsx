// app/(tabs)/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Bell, Settings, SlidersHorizontal } from "lucide-react-native";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import {
  addDays,
  format,
  isSameDay,
  startOfWeek,
  startOfDay,
  endOfDay,
} from "date-fns";

type Folder = { id: string; name: string; lists: number; emoji?: string };
type List = { id: string; folderId: string; userId: string };
type Task = {
  id: string;
  title: string;
  startsAt?: any; // Firestore Timestamp
  priority?: "low" | "medium" | "high";
  folder?: string | null;
  done?: boolean;
};

const BG = "#F7F8FD";
const TEXT = "#0b0f18";
const MUTED = "#6b7280";
const CARD = "#ffffff";
const BORDER = "#e5e7eb";
const PRIMARY = "#7c3aed";

/* ---------- UI bits ---------- */
function WeekStrip({
  selected,
  onChange,
}: {
  selected: Date;
  onChange: (d: Date) => void;
}) {
  const weekStart = useMemo(
    () => startOfWeek(selected, { weekStartsOn: 1 }),
    [selected]
  );
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  return (
    <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
      {days.map((d) => {
        const active = isSameDay(d, selected);
        return (
          <TouchableOpacity
            key={d.toISOString()}
            onPress={() => onChange(d)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 14,
              backgroundColor: active ? "#E0E7FF" : "#EEF2FF",
              borderWidth: 1.5,
              borderColor: active ? "#6366F1" : "#E5E7EB",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 12, color: active ? "#1E3A8A" : "#334155" }}>
              {format(d, "EEE").toLowerCase()}
            </Text>
            <Text style={{ fontSize: 14, fontWeight: "800", color: active ? "#1E3A8A" : TEXT }}>
              {format(d, "d")}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function FolderCard({ folder }: { folder: Folder }) {
  return (
    <Link href={`/folders/${folder.id}`} asChild>
      <TouchableOpacity
        style={{
          width: 220,
          height: 110,
          borderRadius: 20,
          backgroundColor: CARD,
          borderWidth: 1,
          borderColor: BORDER,
          padding: 14,
          marginRight: 12,
          shadowOpacity: 0.06,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: TEXT }}>
            {folder.name || "Untitled"}
          </Text>
          <Text style={{ fontSize: 20 }}>{folder.emoji || "📁"}</Text>
        </View>
        <Text style={{ fontSize: 13, color: MUTED, marginTop: 8 }}>
          {folder.lists} {folder.lists === 1 ? "List" : "Lists"}
        </Text>
        <Text style={{ marginTop: "auto", color: PRIMARY, fontWeight: "700" }}>See →</Text>
      </TouchableOpacity>
    </Link>
  );
}

function TaskRow({ task }: { task: Task }) {
  const dt = task.startsAt?.toDate?.() ?? (task.startsAt ? new Date(task.startsAt) : undefined);
  const time = dt ? new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
  const pill =
    task.priority === "high"
      ? { bg: "#FEE2E2", txt: "#B91C1C", dot: "🔴" }
      : task.priority === "medium"
      ? { bg: "#FEF3C7", txt: "#92400E", dot: "🟠" }
      : { bg: "#E0E7FF", txt: "#3730A3", dot: "🔵" };

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: BORDER,
        backgroundColor: CARD,
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 16, fontWeight: "800", color: TEXT, flexShrink: 1 }}>
          {task.title}
        </Text>
        <View
          style={{
            backgroundColor: pill.bg,
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 999,
            marginLeft: 8,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "800", color: pill.txt }}>
            {pill.dot} {(task.priority ?? "low").toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={{ marginTop: 6, color: MUTED, fontSize: 14 }}>⏰ {time}</Text>
    </View>
  );
}

/* ---------- Screen ---------- */
export default function HomeScreen() {
  const user = auth?.currentUser || null;
  const userId = user?.uid ?? "guest";
  const displayName = user?.displayName || user?.email?.split("@")[0] || "Friend";

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const router = useRouter();

  // Load folders + list counts for this user
  useEffect(() => {
    (async () => {
      const fSnap = await getDocs(query(collection(db, "folders"), where("userId", "==", userId)));
      const lSnap = await getDocs(query(collection(db, "lists"), where("userId", "==", userId)));

      const listsByFolder: Record<string, number> = {};
      lSnap.docs.forEach((d) => {
        const { folderId } = d.data() as List;
        listsByFolder[folderId] = (listsByFolder[folderId] ?? 0) + 1;
      });

      const rows = fSnap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          name: data.name || "Personal",
          lists: listsByFolder[d.id] ?? 0,
          emoji: data.emoji || "📁",
        } as Folder;
      });

      setFolders(rows);
    })().catch(console.warn);
  }, [userId]);

  // Load tasks for selected day (requires composite index: userId asc, startsAt asc)
  const loadTasks = async (day: Date) => {
    const start = Timestamp.fromDate(startOfDay(day));
    const end = Timestamp.fromDate(endOfDay(day));
    const q = query(
      collection(db, "tasks"),
      where("userId", "==", userId),
      where("startsAt", ">=", start),
      where("startsAt", "<=", end),
      orderBy("startsAt", "asc")
    );
    const snap = await getDocs(q);
    const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Task[];
    setTasks(rows);
  };

  useEffect(() => {
    loadTasks(selectedDate).catch(console.warn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, userId]);

  const filteredTasks = tasks.filter((t) =>
    t.title?.toLowerCase?.().includes((search || "").toLowerCase())
  );

  const greeting =
    new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
    >
      {/* Top bar with user name */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: "#EDE9FE",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: "#C4B5FD",
            marginRight: 10,
          }}
        >
          <Text style={{ fontWeight: "900", color: "#4C1D95" }}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: MUTED, fontSize: 12 }}>Good {greeting},</Text>
          <Text style={{ color: TEXT, fontSize: 18, fontWeight: "900" }}>{displayName}</Text>
        </View>
        <TouchableOpacity style={{ padding: 8 }}>
          <Bell size={22} color={TEXT} />
        </TouchableOpacity>
        <TouchableOpacity style={{ padding: 8 }} onPress={() => router.push("/setting")}>
          <Settings size={22} color={TEXT} />
        </TouchableOpacity>
      </View>

      {/* Week strip */}
      <WeekStrip selected={selectedDate} onChange={setSelectedDate} />

      {/* Search */}
      <View
        style={{
          borderWidth: 1.5,
          borderColor: BORDER,
          backgroundColor: CARD,
          borderRadius: 16,
          paddingVertical: Platform.OS === "ios" ? 14 : 10,
          paddingHorizontal: 14,
          marginBottom: 14,
        }}
      >
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search Task"
          placeholderTextColor="#94a3b8"
          style={{ fontSize: 16, color: TEXT }}
        />
      </View>

      {/* FOLDERS */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: "900", color: TEXT, flex: 1 }}>FOLDERS</Text>
        <Link href="/folders" asChild>
          <TouchableOpacity>
            <Text style={{ color: PRIMARY, fontWeight: "800" }}>See All</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 8, marginBottom: 16 }}
      >
        {folders.length === 0 ? (
          <View
            style={{
              width: "100%",
              padding: 14,
              borderWidth: 1,
              borderColor: BORDER,
              borderRadius: 16,
              backgroundColor: CARD,
            }}
          >
            <Text style={{ color: MUTED }}>No folders yet.</Text>
          </View>
        ) : (
          folders.map((f) => <FolderCard key={f.id} folder={f} />)
        )}
      </ScrollView>

      {/* TASKS */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: "900", color: TEXT, flex: 1 }}>TASKS</Text>
        <TouchableOpacity style={{ padding: 6 }}>
          <SlidersHorizontal size={18} color={TEXT} />
        </TouchableOpacity>
        <Link href="/(tabs)/tasks" asChild>
          <TouchableOpacity style={{ marginLeft: 8 }}>
            <Text style={{ color: PRIMARY, fontWeight: "800" }}>See All</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View
        style={{
          borderRadius: 20,
          backgroundColor: CARD,
          padding: 12,
          borderWidth: 1,
          borderColor: BORDER,
        }}
      >
        {filteredTasks.length === 0 ? (
          <View style={{ padding: 8 }}>
            <Text style={{ color: MUTED }}>No tasks for this day.</Text>
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TaskRow task={item} />}
            scrollEnabled={false}
          />
        )}
      </View>
    </ScrollView>
  );
}
