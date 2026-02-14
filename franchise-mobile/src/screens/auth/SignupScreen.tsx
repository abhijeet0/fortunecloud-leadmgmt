import React, {useState} from 'react';
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
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {DEFAULT_COUNTRY_CODE} from '../../config';

const PHONE_REGEX = /^\d{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignupScreen = ({navigation}: any) => {
  const [form, setForm] = useState({
    franchiseName: '',
    ownerName: '',
    email: '',
    phone: '',
    city: '',
  });
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (text: string) => {
    setForm({...form, phone: text.replace(/[^0-9]/g, '')});
  };

  const handleSignup = async () => {
    const {phone, franchiseName, ownerName, email, city} = form;
    if (!franchiseName || !ownerName || !email || !phone || !city) {
      Alert.alert('Missing Fields', 'All fields are mandatory');
      return;
    }

    if (!PHONE_REGEX.test(phone)) {
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
      const formattedPhone = `${DEFAULT_COUNTRY_CODE}${phone}`;
      const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
      navigation.navigate('OTP', {
        phone,
        isSignup: true,
        userData: form,
        confirmation,
      });
    } catch (error: any) {
      console.error(error);
      Alert.alert('Signup Error', error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    options?: {
      keyboardType?: 'default' | 'email-address' | 'phone-pad';
      maxLength?: number;
      mandatory?: boolean;
    },
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label}
        {options?.mandatory !== false && (
          <Text style={styles.required}> *</Text>
        )}
      </Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        keyboardType={options?.keyboardType || 'default'}
        maxLength={options?.maxLength}
        autoCapitalize={
          options?.keyboardType === 'email-address' ? 'none' : 'words'
        }
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.appName}>Fortune Cloud</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Register your franchise to start submitting leads
          </Text>
        </View>

        {renderInput(
          'Franchise Name',
          form.franchiseName,
          text => setForm({...form, franchiseName: text}),
          'Enter franchise name',
        )}
        {renderInput(
          'Owner Name',
          form.ownerName,
          text => setForm({...form, ownerName: text}),
          'Enter owner full name',
        )}
        {renderInput(
          'Email ID',
          form.email,
          text => setForm({...form, email: text}),
          'example@email.com',
          {keyboardType: 'email-address'},
        )}
        {renderInput(
          'Phone Number',
          form.phone,
          handlePhoneChange,
          '10-digit phone number',
          {keyboardType: 'phone-pad', maxLength: 10},
        )}
        {renderInput(
          'City',
          form.city,
          text => setForm({...form, city: text}),
          'Enter your city',
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={loading}
          activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Get OTP</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          disabled={loading}
          style={styles.linkContainer}>
          <Text style={styles.linkText}>Already have an account? </Text>
          <Text style={styles.linkAction}>Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: '#F8F9FA'},
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  headerSection: {
    marginBottom: 28,
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
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  required: {
    color: '#E53935',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 10,
    fontSize: 15,
    color: '#1A1A2E',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
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
    marginBottom: 20,
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

export default SignupScreen;
