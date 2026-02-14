import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useAuth} from '../../context/AuthContext';
import {authService} from '../../services/api';
import auth from '@react-native-firebase/auth';
import {
  DEFAULT_COUNTRY_CODE,
  OTP_LENGTH,
  OTP_RESEND_TIMEOUT_SECONDS,
} from '../../config';

const OTPScreen = ({route}: any) => {
  const {
    phone,
    isSignup,
    userData,
    confirmation: initialConfirmation,
  } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState(initialConfirmation);
  const [resendTimer, setResendTimer] = useState(OTP_RESEND_TIMEOUT_SECONDS);
  const {login} = useAuth();

  // ── Resend countdown ──────────────────────────────────────
  useEffect(() => {
    if (resendTimer <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setResendTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  // ── Resend OTP ────────────────────────────────────────────
  const handleResend = useCallback(async () => {
    try {
      setResendTimer(OTP_RESEND_TIMEOUT_SECONDS);
      const formattedPhone = phone.startsWith('+')
        ? phone
        : `${DEFAULT_COUNTRY_CODE}${phone}`;
      const newConfirmation = await auth().signInWithPhoneNumber(
        formattedPhone,
        true,
      );
      setConfirmation(newConfirmation);
      Alert.alert('OTP Sent', 'A new OTP has been sent to your phone.');
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      Alert.alert('Error', error.message || 'Failed to resend OTP');
    }
  }, [phone]);

  // ── Verify OTP ────────────────────────────────────────────
  const handleVerify = async () => {
    if (!otp || otp.length < OTP_LENGTH) {
      Alert.alert('Error', `Please enter a valid ${OTP_LENGTH}-digit OTP`);
      return;
    }

    if (!confirmation) {
      Alert.alert('Error', 'Verification session expired. Please resend OTP.');
      return;
    }

    setLoading(true);
    try {
      // 1. Verify OTP with Firebase
      const userCredential = await confirmation.confirm(otp);
      const idToken = await userCredential.user.getIdToken();

      if (isSignup) {
        // 2. Register in Backend if signing up
        await authService.signup({
          ...userData,
          phone,
          password: 'FirebaseVerifiedUser', // Placeholder — backend requires it
        });
      }

      // 3. Login to Backend to get session JWT
      const response = await authService.login(idToken);
      const {franchise, token} = response.data;

      await login(franchise, token);
    } catch (error: any) {
      console.error('OTP verification error:', error);
      const message =
        error.code === 'auth/invalid-verification-code'
          ? 'The OTP you entered is incorrect. Please try again.'
          : error.code === 'auth/session-expired'
          ? 'Session expired. Please resend OTP.'
          : error.message || 'Verification failed';
      Alert.alert('Verification Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>
        Sent to {DEFAULT_COUNTRY_CODE} {phone}
      </Text>
      <TextInput
        style={styles.input}
        placeholder={`${OTP_LENGTH}-digit OTP`}
        keyboardType="number-pad"
        maxLength={OTP_LENGTH}
        value={otp}
        onChangeText={setOtp}
        autoFocus
      />
      <TouchableOpacity
        style={[styles.button, loading && {opacity: 0.7}]}
        onPress={handleVerify}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verify & Continue</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={resendTimer > 0 ? undefined : handleResend}
        disabled={resendTimer > 0}>
        <Text style={[styles.link, resendTimer > 0 && {color: '#999'}]}>
          {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#333'},
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 8,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {color: '#fff', fontSize: 18, fontWeight: 'bold'},
  link: {marginTop: 20, textAlign: 'center', color: '#2196F3', fontSize: 16},
});

export default OTPScreen;
