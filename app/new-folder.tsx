import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  DocumentData,
} from 'firebase/firestore';

export default function FolderDetailsScreen() {
  const { id } = useLocalSearchParams(); // folder id
  const router = useRouter();
  const [folder, setFolder] = useState<DocumentData | null>(null);
  const [tasks, setTasks] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setLoading(true);

      const folderSnap = await getDocs(
        query(collection(db, 'folders'), where('__name__', '==', id))
      );

      if (!folderSnap.empty) {
        setFolder({ id, ...folderSnap.docs[0].data() });
      }

      const taskSnap = await getDocs(
        query(collection(db, 'tasks'), where('folder', '==', id))
      );

      const taskList = taskSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTasks(taskList);
      setLoading(false);
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {folder && (
        <>
          <Text style={styles.header}>
            {folder.icon} {folder.name}
          </Text>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push({ pathname: '/add', params: { folder: id } })}
          >
            <Text style={styles.addButtonText}>+ Add Task</Text>
          </TouchableOpacity>

          {tasks.length === 0 ? (
            <Text style={styles.empty}>No tasks in this folder.</Text>
          ) : (
            <FlatList
              data={tasks}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.taskCard}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  <Text style={styles.taskMeta}>
                    {item.date} • {item.time} • {item.priority}
                  </Text>
                </View>
              )}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#F6F8FB',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  taskCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  taskMeta: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  empty: {
    marginTop: 40,
    textAlign: 'center',
    color: '#aaa',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
});
