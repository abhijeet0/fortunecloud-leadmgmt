import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import auth from '@react-native-firebase/auth';

const OTPScreen = ({ route }: any) => {
  const { phone, isSignup, userData, confirmation } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleVerify = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      // 1. Verify OTP with Firebase
      let userCredential;
      if (confirmation) {
        userCredential = await confirmation.confirm(otp);
      } else {
        // For development/demo purposes, we'll try a fallback if backend supports it
        // In a real flow, confirmation object is essential
        throw new Error('Verification session expired');
      }

      const idToken = await userCredential.user.getIdToken();

      if (isSignup) {
        // 2. Register in Backend if signing up
        await authService.signup({
          ...userData,
          phone: phone,
          password: 'FirebaseVerifiedUser', // Placeholder as backend requires it
        });
      }

      // 3. Login to Backend to get session JWT/Token
      const response = await authService.login(idToken);
      const { franchise, token } = response.data;
      
      await login(franchise, token);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Verification Failed', error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>Sent to +91 {phone}</Text>
      <TextInput
        style={styles.input}
        placeholder="6-digit OTP"
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
      />
      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Verify & Continue</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Alert.alert('OTP Resent')}>
        <Text style={styles.link}>Resend OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#333' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 30, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16, textAlign: 'center', letterSpacing: 5 },
  button: { backgroundColor: '#2196F3', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  link: { marginTop: 20, textAlign: 'center', color: '#2196F3', fontSize: 16 },
});

export default OTPScreen;
