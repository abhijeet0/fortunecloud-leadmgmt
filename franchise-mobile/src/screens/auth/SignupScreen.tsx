import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';

const SignupScreen = ({ navigation }: any) => {
  const [form, setForm] = useState({
    franchiseName: '',
    ownerName: '',
    email: '',
    phone: '',
    city: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    const { phone, franchiseName, ownerName, email, city } = form;
    if (!phone || !franchiseName || !ownerName || !email || !city) {
      Alert.alert('Error', 'All fields are mandatory');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
      navigation.navigate('OTP', { 
        phone, 
        isSignup: true, 
        userData: form,
        confirmation 
      });
    } catch (error: any) {
      console.error(error);
      Alert.alert('Signup Error', error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Franchise Signup</Text>
      <TextInput
        style={styles.input}
        placeholder="Franchise Name"
        value={form.franchiseName}
        onChangeText={(text) => setForm({ ...form, franchiseName: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Owner Name"
        value={form.ownerName}
        onChangeText={(text) => setForm({ ...form, ownerName: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Email ID"
        keyboardType="email-address"
        value={form.email}
        onChangeText={(text) => setForm({ ...form, email: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={form.phone}
        onChangeText={(text) => setForm({ ...form, phone: text })}
        maxLength={10}
      />
      <TextInput
        style={styles.input}
        placeholder="City"
        value={form.city}
        onChangeText={(text) => setForm({ ...form, city: text })}
      />
      <TouchableOpacity 
        style={[styles.button, loading && { opacity: 0.7 }]} 
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Get OTP</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#2196F3', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  link: { marginTop: 20, textAlign: 'center', color: '#2196F3', fontSize: 16 },
});

export default SignupScreen;
