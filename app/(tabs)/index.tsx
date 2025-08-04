import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { db } from '../../lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  DocumentData,
} from 'firebase/firestore';

export default function HomeScreen() {
  const [folders, setFolders] = useState<DocumentData[]>([]);
  const [tasks, setTasks] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const router = useRouter();
  const user = getAuth().currentUser;

  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    const week: Date[] = [];
    start.setDate(start.getDate() - start.getDay() + 1); // Monday

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0]; // yyyy-mm-dd
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const folderSnap = await getDocs(collection(db, 'folders'));
        const foldersData = folderSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFolders(foldersData);

        const dateKey = formatDateKey(selectedDate);
        const q = query(collection(db, 'tasks'), where('date', '==', dateKey));
        const taskSnap = await getDocs(q);
        const taskData = taskSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTasks(taskData);

        setLoading(false);
      } catch (err) {
        console.error('🔥 Error fetching data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const renderFolder = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.folderCard}
      onPress={() => router.push(`./folders/${item.id}`)}
    >
      <Text style={styles.folderEmoji}>{item.icon || '📁'}</Text>
      <Text style={styles.folderName}>{item.name}</Text>
      <Text style={styles.folderLists}>{item.lists?.length || 0} Lists</Text>
    </TouchableOpacity>
  );

  const renderTask = ({ item }: { item: any }) => (
    <View style={styles.taskCard}>
      <Text style={styles.taskCategory}>{item.category}</Text>
      <View style={styles.taskItem}>
        <Text style={styles.taskDot}>○</Text>
        <View>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <View style={styles.taskMeta}>
            <Text style={styles.taskTime}>{item.time}</Text>
            <Text style={[styles.taskPriority, priorityColor(item.priority)]}>
              {item.priority}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return { color: '#FF3B30' };
      case 'Medium': return { color: '#FF9500' };
      case 'Low': return { color: '#34C759' };
      default: return { color: '#999' };
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {user?.photoURL && (
          <Image source={{ uri: user.photoURL }} style={styles.avatar} />
        )}
        <View>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.username}>
            {user?.displayName || 'Guest User'} 👋
          </Text>
        </View>
      </View>

      {/* Dynamic Date Row */}
      <View style={styles.dateRow}>
        {getWeekDates(new Date()).map((day, i) => {
          const isSelected = day.toDateString() === selectedDate.toDateString();
          return (
            <TouchableOpacity
              key={i}
              style={[styles.dayButton, isSelected && styles.daySelected]}
              onPress={() => setSelectedDate(day)}
            >
              <Text style={[styles.dayLabel, isSelected && { color: '#fff' }]}>
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </Text>
              <Text style={[styles.dayNumber, isSelected && { color: '#fff' }]}>
                {day.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Search */}
      <TextInput placeholder="🔍 Search Task" style={styles.searchInput} />

      {/* Folders */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Folders</Text>
        <TouchableOpacity onPress={() => router.push('/folders')}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={folders}
        renderItem={renderFolder}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 10 }}
      />

      {/* Tasks */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tasks</Text>
        <TouchableOpacity onPress={() => router.push('/tasks')}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={item => item.id}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FB',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  greeting: {
    color: '#888',
    fontSize: 16,
  },
  username: {
    fontSize: 22,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  dayButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#EDEDED',
    alignItems: 'center',
    width: 42,
  },
  daySelected: {
    backgroundColor: '#007AFF',
  },
  dayLabel: {
    fontSize: 12,
    color: '#555',
  },
  dayNumber: {
    fontWeight: 'bold',
    color: '#000',
  },
  searchInput: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    color: '#007AFF',
    fontWeight: '500',
  },
  folderCard: {
    width: 120,
    height: 110,
    borderRadius: 14,
    backgroundColor: '#FFF',
    padding: 14,
    marginRight: 12,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  folderEmoji: {
    fontSize: 28,
  },
  folderName: {
    fontSize: 16,
    fontWeight: '600',
  },
  folderLists: {
    fontSize: 12,
    color: '#888',
  },
  taskCard: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  taskCategory: {
    color: '#C56CF0',
    fontWeight: '600',
    marginBottom: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskDot: {
    fontSize: 20,
    color: '#aaa',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  taskTime: {
    fontSize: 12,
    color: '#666',
  },
  taskPriority: {
    fontSize: 12,
    fontWeight: '500',
  },
});
