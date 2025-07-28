import { View, Text, StyleSheet, FlatList } from 'react-native';

export default function MedicinScreen() {
  const todaysMedications = [
    { name: 'Metformin', time: '08:00' },
    { name: 'Levaxin', time: '20:00' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>💊 Mediciner för idag</Text>

      <FlatList
        data={todaysMedications}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.medicineBox}>
            <View style={styles.leftSide}>
              <Text style={styles.medicineName}>{item.name}</Text>
              <Text style={styles.medicineTime}>🕒 {item.time}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noMed}>Inga mediciner planerade för idag.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#EFF9F2',
    flex: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2E7D32',
    textAlign: 'center',
  },
  medicineBox: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  leftSide: {
    flex: 1,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  medicineTime: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  noMed: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
});
