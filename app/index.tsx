// app/index.tsx
import { View, Text, Pressable, Image, StyleSheet, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <Image
        source={require('../assets/images/paper_17737469.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
        Välkommen till memoZ
      </Text>
      <Text style={[styles.subtitle, { color: isDark ? '#aaa' : '#555' }]}>
        Din visuella hjälp med rutiner, medicin och mer!
      </Text>

      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.button, styles.guest]}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.buttonText}>🎯 Fortsätt som gäst</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.login]}
          onPress={() => router.push('/login')}
        >
          <Text style={[styles.buttonText, { color: '#7c3aed' }]}>🔐 Logga in</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.register]}
          onPress={() => router.push('/register')}
        >
          <Text style={styles.buttonText}>🆕 Skapa konto</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  guest: {
    backgroundColor: '#1DA1F2',
  },
  login: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#7c3aed',
  },
  register: {
    backgroundColor: '#7c3aed',
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 16,
  },
});
