// app/register.tsx
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { signUp } from '../lib/auth';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react-native';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (password !== confirm) {
      setError("Lösenorden matchar inte");
      return;
    }

    try {
      await signUp(email, password);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Skapa Konto</Text>
      <Text style={styles.subtitle}>Bli en del av TaskNexus</Text>

      {/* Email */}
      <View style={styles.inputGroup}>
        <Mail size={20} color="#888" />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Password */}
      <View style={styles.inputGroup}>
        <Lock size={20} color="#888" />
        <TextInput
          style={styles.input}
          placeholder="Lösenord"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPass}
        />
        <TouchableOpacity onPress={() => setShowPass(!showPass)}>
          {showPass ? <EyeOff size={20} color="#888" /> : <Eye size={20} color="#888" />}
        </TouchableOpacity>
      </View>

      {/* Confirm Password */}
      <View style={styles.inputGroup}>
        <Lock size={20} color="#888" />
        <TextInput
          style={styles.input}
          placeholder="Bekräfta Lösenord"
          placeholderTextColor="#999"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry={!showConfirm}
        />
        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
          {showConfirm ? (
            <EyeOff size={20} color="#888" />
          ) : (
            <Eye size={20} color="#888" />
          )}
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable onPress={handleRegister} style={styles.registerButton}>
        <Text style={styles.registerText}>Registrera</Text>
      </Pressable>

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.linkText}>
          Har du redan ett konto? <Text style={styles.linkAccent}>Logga in</Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/')}>
        <Text style={styles.backLink}>← Tillbaka till startsidan</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    color: '#888',
    marginBottom: 24,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginBottom: 24,
    paddingBottom: 4,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    color: '#000',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  registerButton: {
    backgroundColor: '#7c3aed', // Violet
    paddingVertical: 12,
    borderRadius: 30,
    marginBottom: 20,
  },
  registerText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  linkText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  linkAccent: {
    color: '#7c3aed',
    fontWeight: '600',
  },
  backLink: {
    textAlign: 'center',
    color: '#999',
    fontSize: 13,
    marginTop: 24,
  },
});
