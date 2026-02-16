import React, { useState } from 'react';
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
  Dimensions,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DEFAULT_COUNTRY_CODE } from '../../config';
import { authService } from '../../services/api';

const { width } = Dimensions.get('window');
const PHONE_REGEX = /^\d{10}$/;

const LoginScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (text: string) => {
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
      const auth = (await import('@react-native-firebase/auth')).default;
      const formattedPhone = `${DEFAULT_COUNTRY_CODE}${phone}`;
      const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
      navigation.navigate('OTP', {
        phone: formattedPhone,
        isSignup: false,
        confirmation,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      const backendError = error.response?.data?.error;

      if (backendError === 'Franchise not found') {
        Alert.alert(
          'Account Not Found',
          "You don't have an account yet. Please sign up first.",
          [
            { text: 'Cancel', style: 'cancel' },
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
          <Image
            source={require('../../assets/fortunecloud-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Enter your phone number to sign in to your account
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Icon name="phone-iphone" size={22} color="#94A3B8" style={styles.inputIcon} />
              <Text style={styles.countryCodeText}>{DEFAULT_COUNTRY_CODE}</Text>
              <View style={styles.divider} />
              <TextInput
                style={styles.phoneInput}
                placeholder="10-digit number"
                placeholderTextColor="#A0AEC0"
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
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Continue</Text>
                <Icon name="arrow-forward" size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.linkText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')} disabled={loading}>
            <Text style={styles.linkAction}>Create account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoImage: {
    width: 220,
    height: 95,
    marginBottom: 20,
  },
  appName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2196F3',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#718096',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 10,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 10,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 10,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E0',
    marginRight: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#2196F3',
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginRight: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  linkText: {
    fontSize: 16,
    color: '#718096',
    fontWeight: '500',
  },
  linkAction: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '700',
  },
});

export default LoginScreen;
