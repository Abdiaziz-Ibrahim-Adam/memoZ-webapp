import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function LaggTill() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('daglig');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Fel', 'Du måste skriva en titel');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'schema'), {
        title,
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: date.toISOString().split('T')[0],
        category,
        createdAt: new Date(),
      });

      Alert.alert('✅ Sparat', 'Uppgiften har lagts till!');
      setTitle('');
      setDate(new Date());
      setCategory('daglig');
    } catch (error) {
      Alert.alert('Fel vid sparande', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>➕ Lägg till ny uppgift</Text>

      <Text style={styles.label}>Titel</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="T.ex. Ta medicin"
      />

      <Text style={styles.label}>Kategori</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={category} onValueChange={setCategory} style={styles.picker}>
          <Picker.Item label="Daglig rutin" value="daglig" />
          <Picker.Item label="Planner" value="schema" />
          <Picker.Item label="Mediciner" value="medicin" />
          <Picker.Item label="Viktigt" value="viktigt" />
        </Picker>
      </View>

      <Text style={styles.label}>Tid / Datum</Text>

      {Platform.OS === 'web' ? (
        <TextInput
          style={styles.input}
          value={date.toISOString().slice(0, 16).replace('T', ' ')}
          onChangeText={(text) => {
            const d = new Date(text);
            if (!isNaN(d.getTime())) setDate(d);
          }}
        />
      ) : (
        <>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {date.toLocaleString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
              {date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                if (Platform.OS === 'android') setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}
        </>
      )}

      <TouchableOpacity
        style={[styles.saveButton, loading && { opacity: 0.5 }]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>{loading ? 'Sparar...' : '💾 Spara uppgift'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F9FAFB' },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', marginTop: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 8,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  dateButton: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#EAF0FF',
    borderRadius: 10,
    alignItems: 'center',
  },
  dateButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
