import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function TaskListScreen() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'tasks'));
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTasks(data);
      } catch (err) {
        console.error('❌ Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const renderTask = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={[styles.category, { color: getCategoryColor(item.category) }]}>
        {item.category}
      </Text>
      <View style={styles.row}>
        <Text style={styles.dot}>○</Text>
        <View>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.meta}>
            <Text style={styles.time}>{item.time}</Text>
            <Text style={[styles.priority, getPriorityColor(item.priority)]}>
              {item.priority}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return { color: '#FF3B30' };
      case 'Medium':
        return { color: '#FF9500' };
      case 'Low':
        return { color: '#34C759' };
      default:
        return { color: '#999' };
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'personal': return '#C56CF0';
      case 'writing': return '#7B61FF';
      case 'uxui': return '#34C759';
      case 'yoga': return '#FF9F0A';
      default: return '#555';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/add')}>
        <Text style={styles.addText}>＋ Add Task</Text>
      </TouchableOpacity>

      <Text style={styles.header}>TASKS</Text>
      <Text style={styles.subHeader}>Upcoming ⌄</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={item => item.id}
          renderItem={renderTask}
          ListEmptyComponent={
            <Text style={styles.empty}>No tasks available</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FB',
    padding: 20,
  },
  addBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 16,
  },
  addText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
  },
  category: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  dot: {
    fontSize: 24,
    color: '#aaa',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  time: {
    fontSize: 12,
    color: '#777',
  },
  priority: {
    fontSize: 12,
    fontWeight: '500',
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  },
});
