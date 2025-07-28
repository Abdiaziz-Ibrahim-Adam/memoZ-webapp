import { View, Text, StyleSheet } from 'react-native';

export default function MedicinScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>💊 Mediciner för idag</Text>

      <View style={styles.medicineBox}>
        <Text style={styles.medicineName}>Metformin</Text>
        <Text style={styles.medicineTime}>08:00</Text>
      </View>

      <View style={styles.medicineBox}>
        <Text style={styles.medicineName}>Levaxin</Text>
        <Text style={styles.medicineTime}>20:00</Text>
      </View>
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
  },
  medicineBox: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 3,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '600',
  },
  medicineTime: {
    color: '#888',
  },
});
