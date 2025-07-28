import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase'; 

export default function SchemaScreen() {
  const [selectedDate, setSelectedDate] = useState('');
  const [tasks, setTasks] = useState<{ title: string; time: string }[]>([]);

  useEffect(() => {
    if (!selectedDate) return;

    const loadTasks = async () => {
      const q = query(collection(db, 'schema'), where('date', '==', selectedDate));
      const snapshot = await getDocs(q);
      const result: { title: string; time: string }[] = [];

      snapshot.forEach(doc => {
        result.push(doc.data() as any);
      });

      setTasks(result);
    };

    loadTasks();
  }, [selectedDate]);
  

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: '#007AFF',
          },
        }}
        theme={{
          todayTextColor: '#007AFF',
          arrowColor: '#007AFF',
          textDayFontWeight: '600',
        }}
      />

      {selectedDate ? (
        <View style={styles.taskContainer}>
          <Text style={styles.taskTitle}>🗓 {selectedDate}</Text>
          {tasks.length === 0 ? (
            <Text style={styles.noTasks}>Inga uppgifter för denna dag</Text>
          ) : (
            tasks.map((task, i) => (
              <View key={i} style={styles.taskBox}>
                <Text style={styles.taskName}>{task.title}</Text>
                <Text style={styles.taskTime}>{task.time}</Text>
              </View>
            ))
          )}
        </View>
      ) : (
        <Text style={styles.infoText}>Välj ett datum för att se uppgifter</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F9FD',
  },
  taskContainer: {
    padding: 20,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  taskBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
  },
  taskTime: {
    color: '#555',
  },
  noTasks: {
    fontStyle: 'italic',
    color: '#777',
  },
  infoText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: '#777',
  },
});
