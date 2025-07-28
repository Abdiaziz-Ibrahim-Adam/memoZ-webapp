import { View, Text, StyleSheet, FlatList } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

export default function ViktigtScreen() {
  const importantEvents = [
    { title: 'Läkarbesök', time: '14:00', type: 'health' },
    { title: 'Ring apoteket', time: '17:00', type: 'call' },
    { title: 'Påminn mamma', time: '18:30', type: 'reminder' },
  ];

  const getColor = (type: string) => {
    switch (type) {
      case 'health':
        return '#EF5350'; // röd
      case 'call':
        return '#FFA726'; // orange
      case 'reminder':
        return '#42A5F5'; // blå
      default:
        return '#999';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>⚠️ Viktiga tider</Text>

      <FlatList
        data={importantEvents}
        keyExtractor={(item, index) => `${item.title}-${index}`}
        renderItem={({ item }) => (
          <View
            style={[
              styles.alertBox,
              { borderLeftColor: getColor(item.type), shadowColor: getColor(item.type) },
            ]}
          >
            <View style={styles.row}>
              <AlertTriangle size={20} color={getColor(item.type)} />
              <Text style={[styles.alertTitle, { color: getColor(item.type) }]}>
                {item.title}
              </Text>
            </View>
            <Text style={styles.alertTime}>🕒 {item.time}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noImportant}>Inga viktiga tider planerade.</Text>
        }
      />
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
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#D84315',
    textAlign: 'center',
  },
  alertBox: {
    backgroundColor: '#fff',
    borderLeftWidth: 5,
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    elevation: 4,
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  alertTime: {
    color: '#555',
    fontSize: 14,
    marginTop: 4,
  },
  noImportant: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#999',
  },
});
