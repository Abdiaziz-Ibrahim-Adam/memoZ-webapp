import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router';

export default function AddTaskScreen() {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | null>(null);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  const router = useRouter();
  const user = getAuth().currentUser;

  useEffect(() => {
    const fetchFolders = async () => {
      if (!user) return;
      const q = query(collection(db, 'folders'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFolders(data);
    };

    fetchFolders();
  }, [user]);

  const handleSave = async () => {
    if (!title || !priority || !selectedFolder) {
      Alert.alert('Please fill in all fields');
      return;
    }

    try {
      await addDoc(collection(db, 'tasks'), {
        userId: user?.uid || 'guest',
        title,
        priority,
        date: date.toISOString().split('T')[0],
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        folder: selectedFolder,
        createdAt: new Date(),
      });
      Alert.alert('Success', 'Task added!');
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not save task');
    }
  };

  const handlePickerChange = (_: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const openPicker = (mode: 'date' | 'time') => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Add Task</Text>

      {/* Input card */}
      <View style={styles.inputCard}>
        <TextInput
          placeholder="Add a new task..."
          multiline
          value={title}
          onChangeText={setTitle}
          style={styles.textArea}
        />

        {/* Priority */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.icon}>🏷️</Text>
            <Text style={styles.label}>Priority</Text>
          </View>
          <View style={styles.priorityGroup}>
            {['Low', 'Medium', 'High'].map(p => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityBtn,
                  priority === p && styles[`priority${p}`],
                ]}
                onPress={() => setPriority(p as 'Low' | 'Medium' | 'High')}
              >
                <Text
                  style={[
                    styles.priorityText,
                    priority === p && styles.priorityTextActive,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.icon}>📅</Text>
            <Text style={styles.label}>Date & Time</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <TouchableOpacity style={styles.dropdown} onPress={() => openPicker('date')}>
              <Text>{date.toDateString()}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dropdown} onPress={() => openPicker('time')}>
              <Text>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>
          </View>

          {showPicker && (
            <DateTimePicker
              value={date}
              mode={pickerMode}
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={handlePickerChange}
            />
          )}
        </View>

        {/* Notification placeholder */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.icon}>🔔</Text>
            <Text style={styles.label}>Add Notification</Text>
          </TouchableOpacity>
        </View>

        {/* Folder dropdown */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowFolderDropdown(!showFolderDropdown)}
          >
            <Text style={styles.icon}>🗂️</Text>
            <Text style={styles.label}>
              {selectedFolder || 'Select Folder'}
            </Text>
          </TouchableOpacity>

          {showFolderDropdown && (
            <View style={styles.dropdownList}>
              {folders.map(folder => (
                <TouchableOpacity
                  key={folder.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedFolder(folder.name);
                    setShowFolderDropdown(false);
                  }}
                >
                  <Text>{folder.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Save */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>Save Task</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputCard: {
    backgroundColor: '#F3F6FC',
    borderRadius: 20,
    padding: 14,
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    height: 120,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  icon: {
    fontSize: 18,
  },
  dropdown: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    flex: 1,
  },
  dropdownList: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  priorityGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  priorityBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  priorityLow: {
    backgroundColor: '#E6F4EA',
    borderColor: '#34C759',
  },
  priorityMedium: {
    backgroundColor: '#FFF4E5',
    borderColor: '#FF9500',
  },
  priorityHigh: {
    backgroundColor: '#FFE5E5',
    borderColor: '#FF3B30',
  },
  priorityText: {
    fontWeight: '600',
    color: '#555',
  },
  priorityTextActive: {
    color: '#000',
  },
  saveBtn: {
    marginTop: 30,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
