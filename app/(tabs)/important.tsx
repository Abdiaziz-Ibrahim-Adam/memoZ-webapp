import { View, Text, StyleSheet } from 'react-native';

export default function ViktigtScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>⚠️ Viktiga tider</Text>

      <View style={styles.alertBox}>
        <Text style={styles.alertTitle}>Läkarbesök</Text>
        <Text style={styles.alertTime}>14:00</Text>
      </View>

      <View style={styles.alertBox}>
        <Text style={styles.alertTitle}>Ring apoteket</Text>
        <Text style={styles.alertTime}>17:00</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#FFF9F0',
    flex: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  alertBox: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  alertTime: {
    color: '#777',
    marginTop: 4,
  },
});
