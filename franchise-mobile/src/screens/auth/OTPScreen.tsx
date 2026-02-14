import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useAuth} from '../../context/AuthContext';
import {authService} from '../../services/api';
import {
  DEFAULT_COUNTRY_CODE,
  OTP_LENGTH,
  OTP_RESEND_TIMEOUT_SECONDS,
  USE_MOCK_AUTH,
} from '../../config';

const OTPScreen = ({route, navigation}: any) => {
  const {
    phone,
    isSignup,
    userData,
    isMock,
    confirmation: initialConfirmation,
  } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState(initialConfirmation);
  const [resendTimer, setResendTimer] = useState(OTP_RESEND_TIMEOUT_SECONDS);
  const {login} = useAuth();

  const handleOtpChange = (text: string) => {
    setOtp(text.replace(/[^0-9]/g, ''));
  };

  useEffect(() => {
    if (resendTimer <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setResendTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleResend = useCallback(async () => {
    try {
      setResendTimer(OTP_RESEND_TIMEOUT_SECONDS);

      if (isMock || USE_MOCK_AUTH) {
        // Mock: re-request OTP from backend
        if (isSignup && userData) {
          await authService.mockRequestSignupOtp({
            ...userData,
            phone,
          });
        } else {
          await authService.mockRequestLoginOtp(phone);
        }
        Alert.alert('OTP Sent', 'Mock OTP: 123456');
      } else {
        // Firebase: resend via phone auth
        const auth = (await import('@react-native-firebase/auth')).default;
        const formattedPhone = phone.startsWith('+')
          ? phone
          : `${DEFAULT_COUNTRY_CODE}${phone}`;
        const newConfirmation = await auth().signInWithPhoneNumber(
          formattedPhone,
          true,
        );
        setConfirmation(newConfirmation);
        Alert.alert('OTP Sent', 'A new OTP has been sent to your phone.');
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      const backendError = error.response?.data?.error;
      Alert.alert(
        'Error',
        backendError || error.message || 'Failed to resend OTP',
      );
    }
  }, [phone, isSignup, userData, isMock]);

  const handleVerifyMock = async () => {
    try {
      let response;
      if (isSignup) {
        response = await authService.mockVerifySignupOtp(phone, otp);
      } else {
        response = await authService.mockVerifyLoginOtp(phone, otp);
      }

      if (!response?.data) {
        throw new Error('Invalid response from server');
      }

      const {franchise, token} = response.data;

      if (!franchise || !token) {
        throw new Error('Login response missing required data');
      }

      await login(franchise, token);
    } catch (error: any) {
      throw error; // Re-throw to be handled by handleVerify's catch block
    }
  };

  const handleVerifyFirebase = async () => {
    if (!confirmation) {
      Alert.alert('Error', 'Verification session expired. Please resend OTP.');
      return;
    }

    try {
      const userCredential = await confirmation.confirm(otp);
      const idToken = await userCredential.user.getIdToken();

      if (isSignup) {
        await authService.signup({
          ...userData,
          phone,
          password: 'FirebaseVerifiedUser',
        });
      }

      const response = await authService.login(idToken);

      if (!response?.data) {
        throw new Error('Invalid response from server');
      }

      const {franchise, token} = response.data;

      if (!franchise || !token) {
        throw new Error('Login response missing required data');
      }

      await login(franchise, token);
    } catch (error: any) {
      throw error; // Re-throw to be handled by handleVerify's catch block
    }
  };

  const handleVerify = async () => {
    if (!otp || otp.length < OTP_LENGTH) {
      Alert.alert('Error', `Please enter a valid ${OTP_LENGTH}-digit OTP`);
      return;
    }

    setLoading(true);
    try {
      if (isMock || USE_MOCK_AUTH) {
        await handleVerifyMock();
      } else {
        await handleVerifyFirebase();
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);

      // Handle Firebase OTP errors
      if (error.code === 'auth/invalid-verification-code') {
        Alert.alert(
          'Invalid OTP',
          'The OTP you entered is incorrect. Please try again.',
        );
        return;
      }

      if (error.code === 'auth/session-expired') {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please resend OTP.',
        );
        return;
      }

      // Handle backend errors
      const backendError = error.response?.data?.error;

      if (backendError === 'Franchise not found') {
        Alert.alert(
          'Account Not Found',
          "You don't have an account yet. Please sign up to continue.",
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Go to Signup',
              onPress: () => navigation.navigate('Signup'),
            },
          ],
        );
        return;
      }

      if (
        backendError === 'Phone or email already registered' ||
        backendError === 'Email already registered' ||
        backendError === 'Phone number already registered'
      ) {
        Alert.alert(
          'Already Registered',
          'This account already exists. Please login instead.',
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Go to Login',
              onPress: () => navigation.navigate('Login'),
            },
          ],
        );
        return;
      }

      if (backendError === 'Account is suspended') {
        Alert.alert(
          'Account Suspended',
          'Your account has been suspended. Please contact support.',
        );
        return;
      }

      if (backendError === 'Invalid OTP') {
        Alert.alert(
          'Invalid OTP',
          'The OTP you entered is incorrect. Please try again.',
        );
        return;
      }

      if (backendError === 'OTP expired') {
        Alert.alert(
          'OTP Expired',
          'Your OTP has expired. Please request a new one.',
        );
        return;
      }

      if (backendError === 'OTP not found or expired') {
        Alert.alert(
          'OTP Expired',
          'Your OTP session has expired. Please request a new OTP.',
        );
        return;
      }

      // Generic fallback
      const message = backendError || error.message || 'Verification failed';
      Alert.alert('Verification Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const displayPhone = phone.startsWith('+')
    ? phone
    : `${DEFAULT_COUNTRY_CODE} ${phone}`;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>OTP</Text>
        </View>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the {OTP_LENGTH}-digit code sent to
        </Text>
        <Text style={styles.phoneDisplay}>{displayPhone}</Text>
        {(isMock || USE_MOCK_AUTH) && (
          <Text style={styles.mockHint}>Dev mode — use OTP: 123456</Text>
        )}

        <TextInput
          style={styles.otpInput}
          placeholder={'\u2022'.repeat(OTP_LENGTH)}
          placeholderTextColor="#CCC"
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          value={otp}
          onChangeText={handleOtpChange}
          autoFocus
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}
          activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify & Continue</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={resendTimer > 0 ? undefined : handleResend}
          disabled={resendTimer > 0}
          style={styles.resendContainer}>
          {resendTimer > 0 ? (
            <Text style={styles.resendDisabled}>
              Resend OTP in <Text style={styles.timerText}>{resendTimer}s</Text>
            </Text>
          ) : (
            <Text style={styles.resendActive}>Resend OTP</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A2E',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
    fontSize: 14,
  },
  phoneDisplay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 8,
    marginTop: 4,
  },
  mockHint: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
    marginBottom: 20,
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  otpInput: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#D0D5DD',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 10,
    color: '#1A1A2E',
    fontWeight: '700',
    width: '100%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#2196F3',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  resendContainer: {
    marginTop: 24,
  },
  resendDisabled: {
    fontSize: 15,
    color: '#999',
  },
  timerText: {
    fontWeight: '700',
    color: '#666',
  },
  resendActive: {
    fontSize: 15,
    color: '#2196F3',
    fontWeight: '600',
  },
});

export default OTPScreen;
