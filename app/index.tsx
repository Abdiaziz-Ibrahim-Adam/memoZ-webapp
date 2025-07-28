import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/paper_17737469.png')} 
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Välkommen till memoZ</Text>
      <Text style={styles.subtitle}>Din visuella hjälp med rutiner, medicin och mer!</Text>

      <View style={styles.buttonContainer}>
        <Pressable style={styles.primaryButton} onPress={() => router.replace('/(tabs)/schedule')}>
          <Text style={styles.primaryText}>🎯 Fortsätt som gäst</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => router.push('/login')}>
          <Text style={styles.secondaryText}>🔐 Logga in</Text>
        </Pressable>

        <Pressable style={styles.tertiaryButton} onPress={() => router.push('/register')}>
          <Text style={styles.tertiaryText}>🆕 Skapa konto</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1DA1F2',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#1DA1F2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderColor: '#1DA1F2',
    borderWidth: 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#1DA1F2',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tertiaryButton: {
    backgroundColor: '#FFA726',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  tertiaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
