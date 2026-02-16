import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DEFAULT_COUNTRY_CODE } from '../../config';
import { authService } from '../../services/api';

const PHONE_REGEX = /^\d{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizePhone = (input: string) => {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  if (digits.length > 10) {
    return digits.slice(-10);
  }
  return digits;
};

const SignupScreen = ({ navigation }: any) => {
  const [form, setForm] = useState({
    franchiseName: '',
    ownerName: '',
    email: '',
    phone: '',
    city: '',
  });
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (text: string) => {
    setForm(prev => ({ ...prev, phone: normalizePhone(text) }));
  };

  const handleSignup = async () => {
    const normalizedPhone = normalizePhone(form.phone);
    const franchiseName = form.franchiseName.trim();
    const ownerName = form.ownerName.trim();
    const email = form.email.trim();
    const city = form.city.trim();

    if (!franchiseName || !ownerName || !email || !normalizedPhone || !city) {
      Alert.alert('Missing Fields', 'All fields are mandatory');
      return;
    }

    if (!PHONE_REGEX.test(normalizedPhone)) {
      Alert.alert(
        'Invalid Phone',
        'Please enter a valid 10-digit phone number',
      );
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = `${DEFAULT_COUNTRY_CODE}${normalizedPhone}`;
      await authService.signup({
        ...form,
        franchiseName,
        ownerName,
        email,
        city,
        // Backend expects 10-digit local phone; country code is only for Firebase OTP.
        phone: normalizedPhone,
        password: 'FirebaseVerifiedUser',
      });

      const auth = (await import('@react-native-firebase/auth')).default;
      const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
      navigation.navigate('OTP', {
        phone: formattedPhone,
        isSignup: true,
        userData: {
          ...form,
          franchiseName,
          ownerName,
          email,
          city,
          phone: formattedPhone,
        },
        confirmation,
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      const backendError = error.response?.data?.error;

      if (
        backendError === 'Phone or email already registered' ||
        backendError === 'Phone number already registered' ||
        backendError === 'Email already registered'
      ) {
        Alert.alert(
          'Already Registered',
          'An account with this phone or email already exists. Please login instead.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Go to Login',
              onPress: () => navigation.navigate('Login'),
            },
          ],
        );
      } else {
        Alert.alert(
          'Signup Error',
          backendError ||
          error.message ||
          'Failed to send OTP. Please try again.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    icon: string,
    options?: {
      keyboardType?: 'default' | 'email-address' | 'phone-pad';
      maxLength?: number;
    },
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Icon name={icon} size={22} color="#94A3B8" style={styles.inputIcon} />
        {options?.keyboardType === 'phone-pad' && (
          <Text style={styles.countryCodeText}>{DEFAULT_COUNTRY_CODE}</Text>
        )}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#A0AEC0"
          value={value}
          onChangeText={onChangeText}
          keyboardType={options?.keyboardType || 'default'}
          maxLength={options?.maxLength}
          autoCapitalize={
            options?.keyboardType === 'email-address' ? 'none' : 'words'
          }
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Image
            source={require('../../assets/fortunecloud-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join our network and start growing your business today
          </Text>
        </View>

        <View style={styles.card}>
          {renderInput(
            'Franchise Name',
            form.franchiseName,
            text => setForm({ ...form, franchiseName: text }),
            'e.g. Fortune Tech',
            'business',
          )}
          {renderInput(
            'Owner Name',
            form.ownerName,
            text => setForm({ ...form, ownerName: text }),
            'Your full name',
            'person',
          )}
          {renderInput(
            'Email ID',
            form.email,
            text => setForm({ ...form, email: text }),
            'example@email.com',
            'email',
            { keyboardType: 'email-address' },
          )}
          {renderInput(
            'Phone Number',
            form.phone,
            handlePhoneChange,
            '10-digit number',
            'phone-iphone',
            { keyboardType: 'phone-pad', maxLength: 10 },
          )}
          {renderInput(
            'City',
            form.city,
            text => setForm({ ...form, city: text }),
            'Your current city',
            'place',
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Register & Continue</Text>
                <Icon name="arrow-forward" size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.linkText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
            <Text style={styles.linkAction}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  logoImage: {
    width: 210,
    height: 90,
    marginBottom: 16,
  },
  appName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2196F3',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
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
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 8,
  },
  input: {
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
    marginTop: 12,
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

export default SignupScreen;
