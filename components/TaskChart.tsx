// components/TaskChart.tsx
import { VictoryPie, VictoryBar } from 'victory-native';
import { View, Text } from 'react-native';

export default function TaskChart({ completed, total, overdue, upcoming }: {
  completed: number;
  total: number;
  overdue: number;
  upcoming: number;
}) {
  return (
    <View className="p-4">
      <Text className="text-xl font-bold mb-2">Completion Status</Text>
      <VictoryPie
        data={[
          { x: 'Completed', y: completed },
          { x: 'Incomplete', y: total - completed },
        ]}
        colorScale={['green', 'red']}
        height={200}
      />

      <Text className="text-xl font-bold mt-6 mb-2">Overdue vs Upcoming</Text>
      <VictoryBar
        data={[
          { x: 'Overdue', y: overdue },
          { x: 'Upcoming', y: upcoming },
        ]}
        height={200}
      />
    </View>
  );
}
