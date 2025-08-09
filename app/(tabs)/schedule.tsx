// app/(tabs)/schedule.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Bell } from "lucide-react-native";
import { collection, getDocs, orderBy, query, Timestamp, where } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  format,
  startOfDay,
  endOfDay,
} from "date-fns";

type Task = {
  id: string;
  userId: string;
  title: string;
  startsAt?: any; // Firestore Timestamp
  priority?: "low" | "medium" | "high";
  folder?: string | null;
  done?: boolean;
};

const UI = {
  bg: "#F7F8FD",
  pageBg: "#FFFFFF",
  card: "#FFFFFF",
  soft: "#F1F5F9",
  text: "#0B0F18",
  muted: "#6B7280",
  border: "#E5E7EB",
  primary: "#3B82F6",
  accent: "#EC4899", // pink bar like screenshot
};

function MonthGrid({
  month,
  selected,
  onSelect,
  onPrev,
  onNext,
}: {
  month: Date;
  selected: Date;
  onSelect: (d: Date) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  // Build a 6x7 grid from the calendar weeks that cover this month
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    const result: Date[] = [];
    let cur = start;
    while (cur <= end) {
      result.push(cur);
      cur = addDays(cur, 1);
    }
    return result;
  }, [month]);

  return (
    <View
      style={{
        borderRadius: 20,
        backgroundColor: UI.soft,
        borderWidth: 1,
        borderColor: UI.border,
        padding: 12,
      }}
    >
      {/* Header with arrows */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <TouchableOpacity
          onPress={onPrev}
          accessibilityRole="button"
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: UI.border,
          }}
        >
          <Text style={{ fontSize: 16 }}>‹</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 16, fontWeight: "900", color: UI.text }}>
          {format(month, "LLLL yyyy")}
        </Text>

        <TouchableOpacity
          onPress={onNext}
          accessibilityRole="button"
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: UI.border,
          }}
        >
          <Text style={{ fontSize: 16 }}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Weekday labels */}
      <View style={{ flexDirection: "row", marginBottom: 6 }}>
        {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((d) => (
          <Text
            key={d}
            style={{
              flex: 1,
              textAlign: "center",
              color: UI.muted,
              textTransform: "lowercase",
            }}
          >
            {d}
          </Text>
        ))}
      </View>

      {/* Grid */}
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {days.map((d) => {
          const inMonth = isSameMonth(d, month);
          const active = isSameDay(d, selected);
          return (
            <TouchableOpacity
              key={d.toISOString()}
              onPress={() => onSelect(d)}
              style={{
                width: `${100 / 7}%`,
                paddingVertical: 8,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  borderRadius: 10,
                  paddingVertical: 6,
                  paddingHorizontal: 8,
                  backgroundColor: active ? "#DBEAFE" : "transparent",
                }}
              >
                <Text
                  style={{
                    fontWeight: "800",
                    color: active ? "#1D4ED8" : inMonth ? UI.text : "#CBD5E1",
                  }}
                >
                  {format(d, "d")}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function HourRow({ hour, children }: { hour: number; children?: React.ReactNode }) {
  const hh = hour.toString().padStart(2, "0");
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", paddingVertical: 10 }}>
      <View style={{ width: 56 }}>
        <Text style={{ color: "#94A3B8", fontWeight: "700" }}>{hh}:00</Text>
      </View>
      <View style={{ flex: 1 }}>
        {children ? (
          <View
            style={{
              borderRadius: 12,
              backgroundColor: UI.pageBg,
              borderWidth: 1,
              borderColor: UI.border,
              padding: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            {/* pink bar */}
            <View style={{ width: 4, height: "100%", backgroundColor: UI.accent, borderRadius: 2 }} />
            <View style={{ flex: 1 }}>
              {children}
            </View>
          </View>
        ) : (
          <View style={{ height: 1, backgroundColor: "#EEF2F7" }} />
        )}
      </View>
    </View>
  );
}

export default function CalendarScreen() {
  const userId = auth?.currentUser?.uid ?? "guest";
  const [month, setMonth] = useState<Date>(startOfMonth(new Date()));
  const [selected, setSelected] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onPrev = () => setMonth((m) => subMonths(m, 1));
  const onNext = () => setMonth((m) => addMonths(m, 1));

  // Fetch tasks for selected day
  const fetchDay = async (day: Date) => {
    try {
      setLoading(true);
      setError(null);

      const start = Timestamp.fromDate(startOfDay(day));
      const end = Timestamp.fromDate(endOfDay(day));

      // Requires composite index: userId asc, startsAt asc
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
    } catch (e: any) {
      setError(e?.message ?? "Couldn't load tasks.");
      console.warn("Schedule query error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDay(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, userId]);

  // Build hourly buckets 07:00–21:00 (you can change this)
  const hours = Array.from({ length: 15 }, (_, i) => i + 7);
  const tasksByHour = useMemo(() => {
    const map: Record<number, Task[]> = {};
    for (const t of tasks) {
      const dt = t.startsAt?.toDate?.() ?? (t.startsAt ? new Date(t.startsAt) : null);
      if (!dt) continue;
      const h = new Date(dt).getHours();
      if (!map[h]) map[h] = [];
      map[h].push(t);
    }
    return map;
  }, [tasks]);

  return (
    <View style={{ flex: 1, backgroundColor: UI.bg }}>
      {/* Title bar */}
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
        <Text style={{ fontSize: 18, fontWeight: "800", color: UI.text }}>Calendar</Text>
        <View style={{ position: "absolute", right: 12 }}>
          <Bell size={20} color={UI.text} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* Month card */}
        <MonthGrid
          month={month}
          selected={selected}
          onSelect={(d) => {
            setSelected(d);
            // Keep month header in sync if user taps a spill-day
            if (!isSameMonth(d, month)) setMonth(startOfMonth(d));
          }}
          onPrev={onPrev}
          onNext={onNext}
        />

        {/* Day agenda */}
        <View style={{ marginTop: 16 }}>
          {loading ? (
            <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 24 }}>
              <ActivityIndicator />
              <Text style={{ marginTop: 8, color: UI.muted }}>Loading…</Text>
            </View>
          ) : error ? (
            <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 24 }}>
              <Text style={{ color: "#B91C1C", fontWeight: "800", marginBottom: 6 }}>
                Couldn’t load tasks
              </Text>
              <Text style={{ color: UI.muted, textAlign: "center" }}>{error}</Text>
            </View>
          ) : tasks.length === 0 ? (
            <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 24 }}>
              <Text style={{ color: UI.muted }}>No tasks on this day.</Text>
            </View>
          ) : (
            <View
              style={{
                borderRadius: 16,
                backgroundColor: UI.pageBg,
                borderWidth: 1,
                borderColor: UI.border,
                paddingHorizontal: 12,
                paddingTop: 6,
              }}
            >
              {hours.map((h) => (
                <HourRow key={h} hour={h}>
                  {tasksByHour[h]?.map((t) => {
                    const dt = t.startsAt?.toDate?.() ?? new Date(t.startsAt);
                    const time = new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                    return (
                      <View key={t.id} style={{ marginVertical: 2 }}>
                        <Text style={{ fontSize: 15, fontWeight: "700", color: UI.text }}>
                          {t.title}
                        </Text>
                        <Text style={{ color: UI.muted, marginTop: 2 }}>⏰ {time}</Text>
                      </View>
                    );
                  })}
                </HourRow>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
