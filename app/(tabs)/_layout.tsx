import { Tabs } from 'expo-router';
import { Home, CalendarDays, Plus, ListTodo } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#C5C5C5',
        tabBarStyle: {
          backgroundColor: '#fff',
          height: 65,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={24} />
          ),
        }}
      />

      <Tabs.Screen
        name="tasks"
        options={{
          tabBarIcon: ({ color, size }) => (
            <ListTodo color={color} size={24} />
          ),
        }}
      />

      <Tabs.Screen
        name="schedule"
        options={{
          tabBarIcon: ({ color, size }) => (
            <CalendarDays color={color} size={24} />
          ),
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Plus color={color} size={28} />
          ),
        }}
      />
    </Tabs>
  );
}
