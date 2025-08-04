// app/folders/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function FolderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [folder, setFolder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchFolder = async () => {
      try {
        const ref = doc(db, 'folders', id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setFolder({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error('❌ Error fetching folder:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFolder();
  }, [id]);

  const renderList = ({ item }: { item: string }) => (
    <TouchableOpacity style={styles.listCard}>
      <Text style={styles.listText}>📌 {item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : folder ? (
        <>
          <Text style={styles.title}>
            {folder.icon || '📁'} {folder.name}
          </Text>
          <FlatList
            data={folder.lists || []}
            keyExtractor={(item, index) => `${index}`}
            renderItem={renderList}
            ListEmptyComponent={<Text style={styles.empty}>No lists found</Text>}
            contentContainerStyle={{ paddingTop: 16 }}
          />
        </>
      ) : (
        <Text style={styles.empty}>Folder not found</Text>
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  listCard: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
    elevation: 1,
  },
  listText: {
    fontSize: 16,
    color: '#333',
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  },
});
