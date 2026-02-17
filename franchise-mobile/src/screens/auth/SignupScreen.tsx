import React, {useEffect, useState} from 'react';
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
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {DEFAULT_COUNTRY_CODE, GOOGLE_WEB_CLIENT_ID} from '../../config';
import {authService} from '../../services/api';
import {useAuth} from '../../context/AuthContext';

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

const SignupScreen = ({navigation, route}: any) => {
  const {login} = useAuth();
  const [form, setForm] = useState({
    franchiseName: '',
    ownerName: route?.params?.prefillOwnerName || '',
    email: route?.params?.prefillEmail || '',
    phone: '',
    city: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
    });
  }, []);

  const handlePhoneChange = (text: string) => {
    setForm(prev => ({...prev, phone: normalizePhone(text)}));
  };

  const signupWithIdToken = async (idToken: string) => {
    const normalizedPhone = normalizePhone(form.phone);
    const franchiseName = form.franchiseName.trim();
    const ownerName = form.ownerName.trim();
    const email = form.email.trim();
    const city = form.city.trim();

    await authService.signup({
      franchiseName,
      ownerName,
      email,
      city,
      phone: normalizedPhone,
      idToken,
    });

    const response = await authService.login(idToken);
    const {token, franchise} = response.data;
    await login(franchise, token);
  };

  const validateForm = () => {
    const normalizedPhone = normalizePhone(form.phone);
    if (
      !form.franchiseName.trim() ||
      !form.ownerName.trim() ||
      !form.email.trim() ||
      !normalizedPhone ||
      !form.city.trim()
    ) {
      Alert.alert('Missing Fields', 'All fields are mandatory');
      return false;
    }
    if (!PHONE_REGEX.test(normalizedPhone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
      return false;
    }
    if (!EMAIL_REGEX.test(form.email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }
    if (!form.password || form.password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const auth = (await import('@react-native-firebase/auth')).default;
      const userCredential = await auth().createUserWithEmailAndPassword(
        form.email.trim(),
        form.password,
      );
      const idToken = await userCredential.user.getIdToken(true);
      await signupWithIdToken(idToken);
    } catch (error: any) {
      console.error('Signup error:', error);
      const backendError = error.response?.data?.error;
      Alert.alert('Signup Error', backendError || error.message || 'Failed to signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    setGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      await GoogleSignin.signOut().catch(() => {});
      const googleResult: any = await GoogleSignin.signIn();
      const googleIdToken = googleResult?.idToken || googleResult?.data?.idToken;
      if (!googleIdToken) {
        throw new Error('Google ID token not found');
      }

      const auth = (await import('@react-native-firebase/auth')).default;
      const googleCredential = auth.GoogleAuthProvider.credential(googleIdToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const firebaseIdToken = await userCredential.user.getIdToken(true);
      await signupWithIdToken(firebaseIdToken);
    } catch (error: any) {
      console.error('Google signup error:', error);
      const backendError = error.response?.data?.error;
      Alert.alert('Google Signup Error', backendError || error.message || 'Failed to signup with Google');
    } finally {
      setGoogleLoading(false);
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
      secureTextEntry?: boolean;
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
          secureTextEntry={options?.secureTextEntry}
          autoCapitalize={options?.keyboardType === 'email-address' ? 'none' : 'words'}
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
          <Text style={styles.subtitle}>Sign up with email/password or Google</Text>
        </View>

        <View style={styles.card}>
          {renderInput(
            'Franchise Name',
            form.franchiseName,
            text => setForm({...form, franchiseName: text}),
            'e.g. Fortune Tech',
            'business',
          )}
          {renderInput(
            'Owner Name',
            form.ownerName,
            text => setForm({...form, ownerName: text}),
            'Your full name',
            'person',
          )}
          {renderInput(
            'Email ID',
            form.email,
            text => setForm({...form, email: text}),
            'example@email.com',
            'email',
            {keyboardType: 'email-address'},
          )}
          {renderInput(
            'Phone Number',
            form.phone,
            handlePhoneChange,
            '10-digit number',
            'phone-iphone',
            {keyboardType: 'phone-pad', maxLength: 10},
          )}
          {renderInput(
            'City',
            form.city,
            text => setForm({...form, city: text}),
            'Your current city',
            'place',
          )}
          {renderInput(
            'Password',
            form.password,
            text => setForm({...form, password: text}),
            'Minimum 6 characters',
            'lock',
            {secureTextEntry: true},
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading || googleLoading}
            activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Register</Text>
                <Icon name="arrow-forward" size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>

          <TouchableOpacity
            style={[styles.googleButton, googleLoading && styles.buttonDisabled]}
            onPress={handleGoogleSignup}
            disabled={loading || googleLoading}
            activeOpacity={0.8}>
            {googleLoading ? (
              <ActivityIndicator color="#334155" />
            ) : (
              <View style={styles.buttonContent}>
                <Icon name="g-translate" size={20} color="#334155" />
                <Text style={styles.googleText}>Sign up with Google</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.linkText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading || googleLoading}>
            <Text style={styles.linkAction}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: '#FFFFFF'},
  scrollContainer: {padding: 24, paddingBottom: 40},
  headerSection: {alignItems: 'center', marginBottom: 32, marginTop: 20},
  logoImage: {width: 210, height: 90, marginBottom: 16},
  title: {fontSize: 28, fontWeight: '800', color: '#1A202C', marginBottom: 8},
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
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputGroup: {marginBottom: 14},
  label: {fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 8, marginLeft: 4},
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
  inputIcon: {marginRight: 12},
  countryCodeText: {fontSize: 16, fontWeight: '700', color: '#1E293B', marginRight: 8},
  input: {flex: 1, fontSize: 16, color: '#1E293B', fontWeight: '600'},
  button: {
    backgroundColor: '#2196F3',
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#2196F3',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 8,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 2,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  orText: {
    marginHorizontal: 10,
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  googleButton: {
    backgroundColor: '#F8FAFC',
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  googleText: {color: '#334155', fontSize: 15, fontWeight: '700', marginLeft: 8},
  buttonDisabled: {backgroundColor: '#E2E8F0', shadowOpacity: 0, elevation: 0},
  buttonContent: {flexDirection: 'row', alignItems: 'center'},
  buttonText: {color: '#fff', fontSize: 16, fontWeight: '800', marginRight: 8},
  footer: {flexDirection: 'row', justifyContent: 'center', marginTop: 24},
  linkText: {fontSize: 16, color: '#718096', fontWeight: '500'},
  linkAction: {fontSize: 16, color: '#2196F3', fontWeight: '700'},
});

export default SignupScreen;
