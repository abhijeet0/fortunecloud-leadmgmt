import React, {useState} from 'react';
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
import {DEFAULT_COUNTRY_CODE, USE_MOCK_AUTH} from '../../config';
import {authService} from '../../services/api';

const PHONE_REGEX = /^\d{10}$/;

const LoginScreen = ({navigation}: any) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (text: string) => {
    // Only allow digits
    setPhone(text.replace(/[^0-9]/g, ''));
  };

  const handleLogin = async () => {
    if (!PHONE_REGEX.test(phone)) {
      Alert.alert(
        'Invalid Phone',
        'Please enter a valid 10-digit phone number',
      );
      return;
    }

    setLoading(true);
    try {
      if (USE_MOCK_AUTH) {
        // Mock flow: call backend to request OTP
        const formattedPhone = `${DEFAULT_COUNTRY_CODE}${phone}`;
        const response = await authService.mockRequestLoginOtp(formattedPhone);
        console.log('Mock OTP:', response.data.mockOtp);
        navigation.navigate('OTP', {
          phone: formattedPhone,
          isSignup: false,
          isMock: true,
          confirmation: null,
        });
      } else {
        // Firebase flow
        const auth = (await import('@react-native-firebase/auth')).default;
        const formattedPhone = `${DEFAULT_COUNTRY_CODE}${phone}`;
        const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
        navigation.navigate('OTP', {
          phone,
          isSignup: false,
          isMock: false,
          confirmation,
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const backendError = error.response?.data?.error;

      if (backendError === 'Franchise not found') {
        Alert.alert(
          'Account Not Found',
          "You don't have an account yet. Please sign up first.",
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Go to Signup',
              onPress: () => navigation.navigate('Signup'),
            },
          ],
        );
      } else {
        Alert.alert(
          'Login Error',
          backendError ||
            error.message ||
            'Failed to send OTP. Please try again.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <View style={styles.headerSection}>
          <Text style={styles.appName}>Fortune Cloud</Text>
          <Text style={styles.title}>Franchise Login</Text>
          <Text style={styles.subtitle}>
            Enter your phone number to continue
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneInputRow}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>{DEFAULT_COUNTRY_CODE}</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter 10-digit number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={handlePhoneChange}
              maxLength={10}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Get OTP</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Signup')}
          disabled={loading}
          style={styles.linkContainer}>
          <Text style={styles.linkText}>New here? </Text>
          <Text style={styles.linkAction}>Create account</Text>
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
  },
  headerSection: {
    marginBottom: 36,
  },
  appName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A2E',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 6,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCode: {
    backgroundColor: '#E8EDF2',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#D0D5DD',
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    fontSize: 16,
    color: '#1A1A2E',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
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
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  linkText: {
    fontSize: 15,
    color: '#666',
  },
  linkAction: {
    fontSize: 15,
    color: '#2196F3',
    fontWeight: '600',
  },
});

export default LoginScreen;
