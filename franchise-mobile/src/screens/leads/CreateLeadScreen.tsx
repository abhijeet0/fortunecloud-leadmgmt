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
import {franchiseService} from '../../services/api';
import type {LeadCreatePayload} from '../../types';

const PHONE_REGEX = /^\d{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM: LeadCreatePayload = {
  studentName: '',
  qualification: '',
  stream: '',
  yearOfPassing: '',
  city: '',
  phone: '',
  email: '',
};

const CreateLeadScreen = ({navigation}: any) => {
  const [form, setForm] = useState<LeadCreatePayload>({...INITIAL_FORM});
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (text: string) => {
    setForm({...form, phone: text.replace(/[^0-9]/g, '')});
  };

  const handleYearChange = (text: string) => {
    setForm({...form, yearOfPassing: text.replace(/[^0-9]/g, '')});
  };

  const handleSubmit = async () => {
    const {studentName, qualification, stream, city, phone, email} = form;
    if (!studentName || !qualification || !stream || !city || !phone) {
      Alert.alert('Missing Fields', 'Please fill all mandatory fields');
      return;
    }

    if (!PHONE_REGEX.test(phone)) {
      Alert.alert(
        'Invalid Phone',
        'Please enter a valid 10-digit phone number',
      );
      return;
    }

    if (email && !EMAIL_REGEX.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await franchiseService.createLead(form);
      // Reset form after successful submission
      setForm({...INITIAL_FORM});
      Alert.alert('Success', 'Lead submitted successfully!', [
        {text: 'OK', onPress: () => navigation.navigate('Leads')},
      ]);
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to submit lead',
      );
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
      keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
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
          <Text style={styles.title}>Submit Student Lead</Text>
          <Text style={styles.subtitle}>Fill in the student details below</Text>
        </View>

        {renderInput(
          'Student Name',
          form.studentName,
          text => setForm({...form, studentName: text}),
          'Full name',
        )}
        {renderInput(
          'Qualification',
          form.qualification,
          text => setForm({...form, qualification: text}),
          'e.g. BE, BCom, MBA',
        )}
        {renderInput(
          'Stream',
          form.stream,
          text => setForm({...form, stream: text}),
          'e.g. Computer Science',
        )}
        {renderInput(
          'Year of Passing',
          form.yearOfPassing || '',
          handleYearChange,
          'e.g. 2024',
          {keyboardType: 'number-pad', maxLength: 4, mandatory: false},
        )}
        {renderInput(
          'City',
          form.city,
          text => setForm({...form, city: text}),
          'Enter city name',
        )}
        {renderInput(
          'Phone Number',
          form.phone,
          handlePhoneChange,
          '10-digit number',
          {keyboardType: 'phone-pad', maxLength: 10},
        )}
        {renderInput(
          'Email ID',
          form.email || '',
          text => setForm({...form, email: text}),
          'Optional',
          {keyboardType: 'email-address', mandatory: false},
        )}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Lead</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: '#F8F9FA'},
  container: {
    flexGrow: 1,
    padding: 20,
  },
  headerSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 30,
    shadowColor: '#4CAF50',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default CreateLeadScreen;
