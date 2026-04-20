import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { db } from '@/db/client';
import { trips } from '@/db/schema';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import FormField from '@/components/FormField';

export default function AddTripScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Trip name is required';
    if (!destination.trim()) e.destination = 'Destination is required';
    if (!startDate.match(/^\d{4}-\d{2}-\d{2}$/)) e.startDate = 'Use YYYY-MM-DD format';
    if (!endDate.match(/^\d{4}-\d{2}-\d{2}$/)) e.endDate = 'Use YYYY-MM-DD format';
    if (startDate && endDate && endDate < startDate) e.endDate = 'End date must be after start date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !user) return;
    setLoading(true);
    await db.insert(trips).values({
      userId: user.id,
      name: name.trim(),
      destination: destination.trim(),
      startDate,
      endDate,
      notes: notes.trim() || null,
      createdAt: new Date().toISOString(),
    });
    setLoading(false);
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <FormField label="Trip Name" placeholder="e.g. Paris Adventure" value={name} onChangeText={setName} error={errors.name} />
        <FormField label="Destination" placeholder="e.g. Paris, France" value={destination} onChangeText={setDestination} error={errors.destination} />
        <FormField label="Start Date" placeholder="YYYY-MM-DD" value={startDate} onChangeText={setStartDate} error={errors.startDate} keyboardType="numeric" />
        <FormField label="End Date" placeholder="YYYY-MM-DD" value={endDate} onChangeText={setEndDate} error={errors.endDate} keyboardType="numeric" />
        <FormField label="Notes (optional)" placeholder="Any notes about the trip" value={notes} onChangeText={setNotes} multiline numberOfLines={3} style={styles.textArea} />

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.primary }, loading && styles.btnDisabled]}
          onPress={handleSave}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Save trip"
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save Trip</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  textArea: { height: 80, textAlignVertical: 'top' },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
