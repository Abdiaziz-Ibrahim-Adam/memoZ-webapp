import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View, SafeAreaView } from 'react-native';

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../assets/images/paper_17737469.png')}
        style={styles.logo}
        resizeMode="contain"
        accessible
        accessibilityLabel="MemoZ logotyp"
      />

      <Text style={styles.title}>Välkommen till memoZ</Text>
      <Text style={styles.subtitle}>Din visuella hjälp med rutiner, medicin och mer!</Text>

      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.replace('/(tabs)/schedule')}
          accessibilityLabel="Fortsätt som gäst"
        >
          <Text style={styles.primaryText}>🎯 Fortsätt som gäst</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressedSecondary,
          ]}
          onPress={() => router.push('/login')}
          accessibilityLabel="Logga in"
        >
          <Text style={styles.secondaryText}>🔐 Logga in</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.tertiaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push('/register')}
          accessibilityLabel="Skapa konto"
        >
          <Text style={styles.tertiaryText}>🆕 Skapa konto</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
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
    color: '#333',
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
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderColor: '#1DA1F2',
    borderWidth: 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  tertiaryButton: {
    backgroundColor: '#FFA726',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryText: {
    color: '#1DA1F2',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tertiaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonPressedSecondary: {
    backgroundColor: '#e3f3ff',
  },
});
