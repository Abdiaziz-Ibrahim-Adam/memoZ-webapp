// app/(tabs)/add.tsx
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  LayoutAnimation,
  UIManager,
  ScrollView,
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { addDoc, collection, getDocs, Timestamp } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { format } from "date-fns";

// Enable layout animation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Folder = { id: string; name: string };

const COLORS = {
  bg: "#F7F8FD",
  card: "#F1F5F9",
  white: "#FFFFFF",
  text: "#0b0f18",
  muted: "#6b7280",
  border: "#E5E7EB",
  primary: "#7C3AED",
  low: { text: "#166534", border: "#86EFAC", bg: "#DCFCE7" },
  med: { text: "#92400E", border: "#FDE68A", bg: "#FEF9C3" },
  high: { text: "#B91C1C", border: "#FCA5A5", bg: "#FEE2E2" },
};

function Section({
  icon,
  title,
  children,
  open,
  onToggle,
}: {
  icon: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        borderRadius: 16,
        backgroundColor: COLORS.card,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 12,
      }}
    >
      <TouchableOpacity
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          onToggle();
        }}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
        accessibilityRole="button"
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 18 }}>{icon}</Text>
          <Text style={{ fontSize: 16, fontWeight: "800", color: COLORS.text }}>{title}</Text>
        </View>
        <Text style={{ fontSize: 16, color: COLORS.muted }}>{open ? "▾" : "▸"}</Text>
      </TouchableOpacity>

      {open ? <View style={{ marginTop: 12 }}>{children}</View> : null}
    </View>
  );
}

export default function AddScreen() {
  // Form state
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low");
  const [date, setDate] = useState(new Date());

  // Picker visibility (native only)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Sections open/close
  const [openPriority, setOpenPriority] = useState(true);
  const [openDate, setOpenDate] = useState(true);
  const [openNotif, setOpenNotif] = useState(false);
  const [openFolder, setOpenFolder] = useState(true);

  // Folders
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const isWeb = Platform.OS === "web";

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "folders"));
        const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        const mapped: Folder[] = rows.map((r: any) => ({
          id: r.id,
          name: r.name || "Folder",
        }));
        setFolders(mapped);
        if (!selectedFolder && mapped.length) setSelectedFolder(mapped[0].id);
      } catch (e) {
        console.warn("Failed to load folders", e);
      }
    })();
  }, []);

  const params = useLocalSearchParams<{ folder?: string }>();

// after folders are loaded:
useEffect(() => {
  if (params.folder && folders.length) {
    const exists = folders.find((f) => f.id === params.folder);
    if (exists) setSelectedFolder(params.folder);
  }
}, [params.folder, folders]);

  // Native pickers
  const onChangeDate = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (!selected) return;
    setDate((prev) => {
      const next = new Date(prev);
      next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      return next;
    });
  };
  const onChangeTime = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setShowTimePicker(false);
    if (!selected) return;
    setDate((prev) => {
      const next = new Date(prev);
      next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      return next;
    });
  };

  // Web pickers (HTML inputs)
  const onWebDateChange = (value: string) => {
    // value like "2025-08-19"
    const [y, m, d] = value.split("-").map((n) => parseInt(n, 10));
    if (!y || !m || !d) return;
    setDate((prev) => {
      const next = new Date(prev);
      next.setFullYear(y, m - 1, d);
      return next;
    });
  };
  const onWebTimeChange = (value: string) => {
    // value like "13:45"
    const [hh, mm] = value.split(":").map((n) => parseInt(n, 10));
    if (hh == null || mm == null) return;
    setDate((prev) => {
      const next = new Date(prev);
      next.setHours(hh, mm, 0, 0);
      return next;
    });
  };

  const saveTask = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      Alert.alert("Add Task", "Please enter a task.");
      return;
    }
    try {
      setSaving(true);
      const userId = auth?.currentUser?.uid ?? "guest";
      await addDoc(collection(db, "tasks"), {
        userId,
        title: trimmed,
        priority,
        startsAt: Timestamp.fromDate(date),
        folder: selectedFolder || null,
        createdAt: Timestamp.fromDate(new Date()),
        done: false,
      });
      setTitle("");
      Alert.alert("Saved", "Your task was added.");
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error", e?.message ?? "Could not save task.");
    } finally {
      setSaving(false);
    }
  };

  const displayDate = format(date, "MMM d, yyyy");
  const displayTime = format(date, "HH:mm");

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Title bar */}
      <View
        style={{
          height: 56,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
          backgroundColor: COLORS.white,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "800", color: COLORS.text }}>Add Task</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
        {/* Big textarea-like input */}
        <View
          style={{
            borderWidth: 1,
            borderColor: COLORS.border,
            backgroundColor: COLORS.white,
            borderRadius: 16,
            marginBottom: 12,
            overflow: "hidden",
          }}
        >
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Add a new task..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={4}
            style={{
              minHeight: 120,
              padding: 14,
              fontSize: 18,
              color: COLORS.text,
            }}
          />
          {/* Toolbar row (decorative) */}
          <View
            style={{
              height: 48,
              borderTopWidth: 1,
              borderTopColor: COLORS.border,
              paddingHorizontal: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
            }}
          >
            <Text style={{ fontSize: 18 }}>🎨</Text>
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.primary }} />
            <Text style={{ fontSize: 18 }}>🔖</Text>
            <Text style={{ fontSize: 18 }}>✏️</Text>
          </View>
        </View>

        {/* Priority */}
        <Section icon="🏷️" title="Priority" open={openPriority} onToggle={() => setOpenPriority((v) => !v)}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {([
              { key: "low", label: "Low", theme: COLORS.low },
              { key: "medium", label: "Medium", theme: COLORS.med },
              { key: "high", label: "High", theme: COLORS.high },
            ] as const).map((opt) => {
              const active = priority === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => setPriority(opt.key)}
                  style={{
                    borderWidth: 2,
                    borderColor: active ? opt.theme.border : COLORS.border,
                    backgroundColor: active ? opt.theme.bg : COLORS.white,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 999,
                  }}
                >
                  <Text style={{ fontWeight: "800", color: active ? opt.theme.text : COLORS.text }}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        {/* Set Date */}
        <Section icon="📅" title="Set Date" open={openDate} onToggle={() => setOpenDate((v) => !v)}>
          {isWeb ? (
            // Web: HTML inputs
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                {/* @ts-ignore — using DOM input for web */}
                <input
                  type="date"
                  value={format(date, "yyyy-MM-dd")}
                  onChange={(e: any) => onWebDateChange(e.target.value)}
                  style={{
                    width: "100%",
                    border: `1px solid ${COLORS.border}`,
                    background: COLORS.white,
                    borderRadius: 12,
                    padding: "12px",
                    fontSize: 16,
                    color: COLORS.text,
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                {/* @ts-ignore — using DOM input for web */}
                <input
                  type="time"
                  value={format(date, "HH:mm")}
                  onChange={(e: any) => onWebTimeChange(e.target.value)}
                  style={{
                    width: "100%",
                    border: `1px solid ${COLORS.border}`,
                    background: COLORS.white,
                    borderRadius: 12,
                    padding: "12px",
                    fontSize: 16,
                    color: COLORS.text,
                  }}
                />
              </View>
            </View>
          ) : (
            // Native: RN community pickers
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  backgroundColor: COLORS.white,
                  borderRadius: 12,
                  padding: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 12, color: COLORS.muted, marginBottom: 4 }}>DATE</Text>
                <Text style={{ fontSize: 16, fontWeight: "800", color: COLORS.text }}>{displayDate}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  backgroundColor: COLORS.white,
                  borderRadius: 12,
                  padding: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 12, color: COLORS.muted, marginBottom: 4 }}>TIME</Text>
                <Text style={{ fontSize: 16, fontWeight: "800", color: COLORS.text }}>{displayTime}</Text>
              </TouchableOpacity>
            </View>
          )}

          {showDatePicker && (
            <DateTimePicker value={date} mode="date" display={Platform.OS === "ios" ? "inline" : "default"} onChange={onChangeDate} />
          )}
          {showTimePicker && (
            <DateTimePicker value={date} mode="time" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onChangeTime} />
          )}
        </Section>

        {/* Add Notification (placeholder) */}
        <Section icon="🔔" title="Add Notification" open={openNotif} onToggle={() => setOpenNotif((v) => !v)}>
          <Text style={{ color: COLORS.muted }}>
            We’ll add reminders later. Saving the task stores the correct date & time now.
          </Text>
        </Section>

        {/* Select Folder */}
        <Section icon="📁" title="Select Folder" open={openFolder} onToggle={() => setOpenFolder((v) => !v)}>
          {folders.length === 0 ? (
            <Text style={{ color: COLORS.muted }}>No folders yet.</Text>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {folders.map((f) => {
                const active = selectedFolder === f.id;
                return (
                  <TouchableOpacity
                    key={f.id}
                    onPress={() => setSelectedFolder(f.id)}
                    style={{
                      borderWidth: 2,
                      borderColor: active ? COLORS.primary : COLORS.border,
                      backgroundColor: active ? "#EDE9FE" : COLORS.white,
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderRadius: 999,
                    }}
                  >
                    <Text style={{ fontWeight: "800", color: active ? "#4C1D95" : COLORS.text }}>{f.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Section>

        {/* Save button */}
        <TouchableOpacity
          onPress={saveTask}
          disabled={saving}
          style={{
            backgroundColor: saving ? "#A78BFA" : COLORS.primary,
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: "center",
            shadowOpacity: 0.15,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 3,
            marginTop: 4,
          }}
        >
          <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: "900" }}>
            {saving ? "Saving…" : "Save Task"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
