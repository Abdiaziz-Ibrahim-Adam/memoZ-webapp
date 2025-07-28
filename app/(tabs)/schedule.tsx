import { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function ScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState('');

  const tasks: Record<string, string[]> = {
    '2025-07-28': ['Ta medicin 08:00', 'Träffa läkare 15:00'],
    '2025-07-29': ['Gå en promenad', 'Middag med familj'],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Mitt schema</Text>

      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: '#1DA1F2',
          },
        }}
        theme={{
          todayTextColor: '#1DA1F2',
          selectedDayBackgroundColor: '#1DA1F2',
          arrowColor: '#1DA1F2',
        }}
        style={styles.calendar}
      />

      <Text style={styles.taskTitle}>
        {selectedDate ? `Uppgifter för ${selectedDate}` : 'Välj ett datum'}
      </Text>

      <FlatList
        data={tasks[selectedDate] || []}
        keyExtractor={(item, index) => `${selectedDate}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.taskBox}>
            <Text style={styles.taskText}>🗓️ {item}</Text>
          </View>
        )}
        ListEmptyComponent={
          selectedDate ? (
            <Text style={styles.noTasks}>Inga uppgifter planerade för denna dag.</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1DA1F2',
    textAlign: 'center',
  },
  calendar: {
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  taskBox: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 2,
  },
  taskText: {
    fontSize: 16,
  },
  noTasks: {
    textAlign: 'center',
    marginTop: 16,
    color: '#888',
  },
});
