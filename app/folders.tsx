import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useRouter } from 'expo-router';

export default function FoldersScreen() {
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'folders'));
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFolders(data);
      } catch (err) {
        console.error('❌ Error fetching folders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFolders();
  }, []);

  const renderFolder = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`./folders/${item.id}`)}
    >
      <Text style={styles.emoji}>{item.icon || '📁'}</Text>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.meta}>
        {item.lists?.length || 0} {item.lists?.length === 1 ? 'List' : 'Lists'}
      </Text>
    </TouchableOpacity>
  );

  const renderNewFolder = () => (
    <TouchableOpacity
      style={[styles.card, styles.newCard]}
      onPress={() => router.push('/new-folder')}
    >
      <Text style={styles.plus}>＋</Text>
      <Text style={styles.newLabel}>New Folder</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Folders</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={[{ id: 'new' }, ...folders]}
          keyExtractor={item => item.id}
          renderItem={({ item }) =>
            item.id === 'new' ? renderNewFolder() : renderFolder({ item })
          }
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ paddingBottom: 20 }}
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
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFF',
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  emoji: {
    fontSize: 30,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
  },
  meta: {
    fontSize: 13,
    color: '#888',
  },
  newCard: {
    backgroundColor: '#E8F0FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    fontSize: 36,
    color: '#007AFF',
  },
  newLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginTop: 8,
  },
});
