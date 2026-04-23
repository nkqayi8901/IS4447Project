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

// Thiss is the login screen. It allows 
// users to enter their email and password to log in.
// It also handles form validation and shows 
// error messages if login fails.
// The screen is wrapped in a KeyboardAvoidingView to ensure
// the form is not obscured by the keyboard on 
// mobile devices.
export default function LoginScreen() {
  const { login } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    const err = await login(email, password);
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
        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.logoWrap, { backgroundColor: theme.primary }]}>
            <Ionicons name="airplane" size={40} color="#fff" />
          </View>
          <Text style={[text.h1, styles.appName, { color: theme.text }]}>Spectacular Solomon's Trip Planner</Text>
          <Text style={[text.body, { color: theme.textSecondary, textAlign: 'center' }]}>
            Your personal travel companion
          </Text>
        </View>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: theme.card }, shadow.md]}>
          <Text style={[text.h3, { color: theme.text, marginBottom: 20 }]}>Welcome back</Text>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: theme.danger + '15', borderColor: theme.danger + '40' }]}>
              <Ionicons name="alert-circle-outline" size={16} color={theme.danger} />
              <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
            </View>
          ) : null}

          <FormField
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <FormField
            label="Password"
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.primary }, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Log in"
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : (
                <View style={styles.btnInner}>
                  <Text style={[styles.btnText]}>Log In</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </View>
              )}
          </TouchableOpacity>
        </View>

        {/* Demo hint */}
        <View style={[styles.demoBox, { backgroundColor: theme.primary + '12', borderColor: theme.primary + '30' }]}>
          <Ionicons name="information-circle-outline" size={16} color={theme.primary} />
          <Text style={[styles.demoText, { color: theme.textSecondary }]}>
            New here? <Text style={{ color: theme.primary, fontFamily: 'Poppins_600SemiBold' }}>Register</Text> to create an account.{' '}
            
          </Text>
        </View>

        <TouchableOpacity onPress={() => router.replace('/(auth)/register' as any)} style={styles.link}>
          <Text style={[text.body, { color: theme.textSecondary }]}>
            Don't have an account?{' '}
            <Text style={{ color: theme.primary, fontFamily: 'Poppins_600SemiBold' }}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 32, gap: 10 },
  logoWrap: {
    width: 84, height: 84, borderRadius: radius.xl,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  appName: { letterSpacing: -1 },
  card: { borderRadius: radius['2xl'], padding: spacing['2xl'], marginBottom: 16 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: radius.md, borderWidth: 1, padding: 12, marginBottom: 14 },
  errorText: { fontFamily: 'Poppins_400Regular', fontSize: 13, flex: 1 },
  btn: { borderRadius: radius.lg, paddingVertical: 15, alignItems: 'center', marginTop: 6 },
  btnDisabled: { opacity: 0.6 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { color: '#fff', fontFamily: 'Poppins_600SemiBold', fontSize: 15 },
  demoBox: { flexDirection: 'row', gap: 8, borderRadius: radius.md, borderWidth: 1, padding: 12, marginBottom: 16, alignItems: 'flex-start' },
  demoText: { fontFamily: 'Poppins_400Regular', fontSize: 12, flex: 1, lineHeight: 18 },
  link: { alignItems: 'center', paddingVertical: 4 },
});
