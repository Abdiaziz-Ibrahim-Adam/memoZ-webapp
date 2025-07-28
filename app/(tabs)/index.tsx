import { View, Text, StyleSheet, Image } from 'react-native';

export default function HomeTabScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/paper_17737469.png')}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Appens logotyp"
      />

      <Text style={styles.heading}>👋 Välkommen till memoZ!</Text>
      <Text style={styles.subheading}>Här kan du enkelt hålla koll på dina rutiner, mediciner och viktiga tider.</Text>

      <View style={styles.tipBox}>
        <Text style={styles.tipTitle}>💡 Tips:</Text>
        <Text style={styles.tipText}>Använd "+"-knappen i mitten för att lägga till nya uppgifter i ditt schema!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1DA1F2',
    textAlign: 'center',
    marginBottom: 10,
  },
  subheading: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  tipBox: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: '#1DA1F2',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  tipTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
  },
  tipText: {
    fontSize: 14,
    color: '#555',
  },
});
