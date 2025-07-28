import { Tabs } from 'expo-router';
import {
  CalendarDays,
  Pill,
  AlertCircle,
  PlusCircle,
  Home,
} from 'lucide-react-native';
import { View, StyleSheet, Platform } from 'react-native';

export default function TabLayout() {
  return (
    <View style={styles.tabWrapper}>
      <Tabs
        screenOptions={{
          tabBarShowLabel: true,
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            position: 'absolute',
            height: 75,
            borderRadius: 20,
            marginHorizontal: 20,
            marginBottom: Platform.OS === 'ios' ? 30 : 20,
            backgroundColor: '#ffffff',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 10,
          },
          headerShown: false,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Hem',
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />

        <Tabs.Screen
          name="schedule"
          options={{
            title: 'Schema',
            tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} />,
          }}
        />

        <Tabs.Screen
          name="add"
          options={{
            title: '',
            tabBarIcon: () => (
              <View style={styles.addButton}>
                <PlusCircle color="#fff" size={36} />
              </View>
            ),
            tabBarLabelStyle: { display: 'none' },
          }}
        />

        <Tabs.Screen
          name="medicin"
          options={{
            title: 'medicin',
            tabBarIcon: ({ color, size }) => <Pill color={color} size={size} />,
          }}
        />

        <Tabs.Screen
          name="important"
          options={{
            title: 'Viktigt',
            tabBarIcon: ({ color, size }) => <AlertCircle color={color} size={size} />,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  tabWrapper: {
    flex: 1,
    backgroundColor: '#F0F4F8', // Bakgrundsfärg hela appen
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
});
