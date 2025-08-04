// components/TaskItem.tsx
import React from 'react';
import { View, Text } from 'react-native';

type Props = {
  title: string;
  completed: boolean;
  due: string; // ex: "2025-08-04 15:00"
};

export default function TaskItem({ title, completed, due }: Props) {
  const bgColor = completed ? 'bg-green-300' : 'bg-red-300';

  return (
    <View className={`p-4 mb-2 rounded ${bgColor}`}>
      <Text className="text-lg font-semibold">{title}</Text>
      <Text className="text-xs">Due: {due}</Text>
      <Text className="text-xs">{completed ? '✅ Completed' : '⏳ Incomplete'}</Text>
    </View>
  );
}
