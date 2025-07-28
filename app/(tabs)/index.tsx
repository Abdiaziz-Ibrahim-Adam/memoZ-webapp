import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>👋 Välkommen till memoZ</Text>
      <Text style={styles.subtitle}>Ditt personliga stöd varje dag</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🗓️ Dagens Schema</Text>
        <Text style={styles.cardContent}>3 uppgifter planerade</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>💊 Mediciner</Text>
        <Text style={styles.cardContent}>2 mediciner kvar att ta</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🚨 Viktigt idag</Text>
        <Text style={styles.cardContent}>Läkarbesök kl 14:00</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#F9FBFF',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardContent: {
    fontSize: 14,
    color: '#444',
  },
});
