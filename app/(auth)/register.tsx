import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import FormField from '@/components/FormField';
import { text, shadow, radius, spacing } from '@/constants/Styles';
// This is the registration screen. It allows new users to create an account by providing their name, email, and password.
// It includes form validation to ensure all fields are filled, the password meets length requirements, and the confirmation matches.
// If registration fails, it shows appropriate 
// error messages. Like the login screen, it uses a 
// KeyboardAvoidingView to prevent the keyboard from 
// covering the form on mobile devices.
// The screen also includes a link to the 
// login screen for users who already have an account.
export default function RegisterScreen() {
  const { register } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    if (!name.trim() || !email.trim() || !password) { setError('All fields are required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const err = await register(name, email, password);
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={[styles.logoWrap, { backgroundColor: theme.primary }]}>
            <Ionicons name="airplane" size={40} color="#fff" />
          </View>
          <Text style={[text.h1, styles.appName, { color: theme.text }]}>Spectacular Solomon's Trip Planner</Text>
          <Text style={[text.body, { color: theme.textSecondary, textAlign: 'center' }]}>
            Start planning your adventures
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card }, shadow.md]}>
          <Text style={[text.h3, { color: theme.text, marginBottom: 20 }]}>Create account</Text>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: theme.danger + '15', borderColor: theme.danger + '40' }]}>
              <Ionicons name="alert-circle-outline" size={16} color={theme.danger} />
              <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
            </View>
          ) : null}

          <FormField label="Full Name" placeholder="Your name" value={name} onChangeText={setName} autoCapitalize="words" />
          <FormField label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          <FormField label="Password" placeholder="Min. 6 characters" value={password} onChangeText={setPassword} secureTextEntry />
          <FormField label="Confirm Password" placeholder="Repeat password" value={confirm} onChangeText={setConfirm} secureTextEntry />

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.primary }, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Create account"
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : (
                <View style={styles.btnInner}>
                  <Text style={styles.btnText}>Create Account</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </View>
              )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.replace('/(auth)/login' as any)} style={styles.link}>
          <Text style={[text.body, { color: theme.textSecondary }]}>
            Already have an account?{' '}
            <Text style={{ color: theme.primary, fontFamily: 'Poppins_600SemiBold' }}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 32, gap: 10 },
  logoWrap: { width: 84, height: 84, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  appName: { letterSpacing: -1 },
  card: { borderRadius: radius['2xl'], padding: spacing['2xl'], marginBottom: 16 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: radius.md, borderWidth: 1, padding: 12, marginBottom: 14 },
  errorText: { fontFamily: 'Poppins_400Regular', fontSize: 13, flex: 1 },
  btn: { borderRadius: radius.lg, paddingVertical: 15, alignItems: 'center', marginTop: 6 },
  btnDisabled: { opacity: 0.6 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { color: '#fff', fontFamily: 'Poppins_600SemiBold', fontSize: 15 },
  link: { alignItems: 'center', paddingVertical: 4 },
});
