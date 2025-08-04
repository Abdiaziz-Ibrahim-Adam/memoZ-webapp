import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { db } from '../../lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  DocumentData,
} from 'firebase/firestore';
import { Calendar } from 'react-native-calendars';

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [tasks, setTasks] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasksForDate(selectedDate);
  }, [selectedDate]);

const fetchTasksForDate = async (date: string) => {
  setLoading(true);
  try {
    const q = query(collection(db, 'tasks'), where('date', '==', date));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort safely by time
    const sorted = data.sort((a, b) => {
      const timeA = a.time || '';
      const timeB = b.time || '';
      return timeA.localeCompare(timeB);
    });

    setTasks(sorted);
  } catch (error) {
    console.error('Error loading tasks:', error);
  } finally {
    setLoading(false);
  }
};


  const renderTask = ({ item }: { item: any }) => (
    <View style={styles.taskRow}>
      <Text style={styles.time}>{item.time}</Text>
      <View style={styles.taskDot} />
      <Text style={styles.taskTitle}>{item.title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Calendar</Text>

      <Calendar
        current={selectedDate}
        onDayPress={day => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: '#007AFF',
          },
        }}
        theme={{
          selectedDayBackgroundColor: '#007AFF',
          selectedDayTextColor: '#fff',
          todayTextColor: '#007AFF',
          arrowColor: '#007AFF',
        }}
        style={styles.calendar}
      />

      <Text style={styles.taskHeader}>Tasks</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : tasks.length === 0 ? (
        <Text style={styles.noTasks}>No tasks on this date.</Text>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={item => item.id}
          renderItem={renderTask}
        />
      )}
    </View>
  );
}

function getToday() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FB',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  calendar: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  taskHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 8,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  time: {
    width: 60,
    color: '#888',
    fontWeight: '600',
  },
  taskDot: {
    width: 6,
    height: 40,
    backgroundColor: '#FF2D55',
    borderRadius: 3,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    flex: 1,
  },
  noTasks: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 20,
  },
});
