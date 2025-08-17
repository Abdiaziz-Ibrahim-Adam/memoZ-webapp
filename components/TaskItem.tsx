// components/TaskItem.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";

type Task = {
  id: string;
  title: string;
  startsAt?: any;
  priority?: "low" | "medium" | "high";
  done?: boolean;
};

export default function TaskItem({
  task,
  onToggleDone,
  onEdit,
}: {
  task: Task;
  onToggleDone?: (t: Task) => void;
  onEdit?: (t: Task) => void;
}) {
  const dt = task.startsAt?.toDate?.() ?? (task.startsAt ? new Date(task.startsAt) : undefined);
  const time = dt ? new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
  const pill =
    task.priority === "high"
      ? { bg: "#FEE2E2", txt: "#B91C1C", dot: "🔴" }
      : task.priority === "medium"
      ? { bg: "#FEF3C7", txt: "#92400E", dot: "🟠" }
      : { bg: "#E0E7FF", txt: "#3730A3", dot: "🔵" };

  return (
    <Pressable
      onPress={() => onEdit?.(task)}
      accessibilityLabel={`Task ${task.title}`}
      accessibilityHint="Double tap to edit"
      style={({ pressed }) => ({
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        opacity: pressed ? 0.9 : 1,
        minHeight: 56,
      })}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "800",
            color: task.done ? "#9CA3AF" : "#0B0F18",
            textDecorationLine: task.done ? "line-through" : "none",
            flexShrink: 1,
          }}
        >
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

      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, justifyContent: "space-between" }}>
        <Text style={{ color: "#6b7280", fontSize: 14 }}>⏰ {time}</Text>

        <Pressable
          onPress={() => onToggleDone?.(task)}
          accessibilityLabel={task.done ? "Mark as not done" : "Mark as done"}
          style={({ pressed }) => ({
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 999,
            borderWidth: 1.5,
            borderColor: task.done ? "#86EFAC" : "#E5E7EB",
            backgroundColor: task.done ? "#DCFCE7" : "#fff",
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ fontWeight: "800", color: task.done ? "#166534" : "#0B0F18" }}>
            {task.done ? "✓ Done" : "Mark done"}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
