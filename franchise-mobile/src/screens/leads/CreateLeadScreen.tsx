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
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { franchiseService } from '../../services/api';

const CreateLeadScreen = ({ navigation }: any) => {
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_REGEX = /^\d{10}$/;

  const [form, setForm] = useState({
    studentName: '',
    phone: '',
    email: '',
    qualification: '',
    stream: '',
    city: '',
    yearOfPassing: '',
  });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!form.studentName || !form.phone || !form.qualification || !form.stream || !form.city) {
      Alert.alert('Missing Fields', 'Name, Phone, Qualification, Stream and City are mandatory');
      return;
    }

    if (!PHONE_REGEX.test(form.phone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
      return;
    }

    if (form.email && !EMAIL_REGEX.test(form.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await franchiseService.createLead({
        studentName: form.studentName,
        phone: form.phone,
        email: form.email,
        qualification: form.qualification,
        stream: form.stream,
        city: form.city,
        yearOfPassing: form.yearOfPassing,
      });
      Alert.alert('Success', 'Lead created successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Leads') },
      ]);
    } catch (error) {
      console.error('Create lead error:', error);
      Alert.alert('Error', 'Failed to create lead. Please try again.');
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
    keyboardType: any = 'default',
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Icon name={icon} size={22} color="#94A3B8" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#A0AEC0"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Lead</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          <View style={styles.infoBox}>
            <View style={styles.infoIconCircle}>
              <Icon name="info" size={20} color="#2196F3" />
            </View>
            <Text style={styles.infoText}>
              Enter accurate student details to ensure higher conversion rates and faster processing.
            </Text>
          </View>

          <View style={styles.card}>
            {renderInput(
              'Student Full Name',
              form.studentName,
              text => setForm({ ...form, studentName: text }),
              'Enter student name',
              'person',
            )}
            
            {renderInput(
              'Phone Number',
              form.phone,
              text => setForm({ ...form, phone: text }),
              '10-digit number',
              'phone-iphone',
              'phone-pad',
            )}

            {renderInput(
              'City',
              form.city,
              text => setForm({ ...form, city: text }),
              'Current city',
              'place',
            )}

            {renderInput(
              'Highest Qualification',
              form.qualification,
              text => setForm({ ...form, qualification: text }),
              'e.g. B.Tech, MCA',
              'school',
            )}

            {renderInput(
              'Stream/Branch',
              form.stream,
              text => setForm({ ...form, stream: text }),
              'e.g. CS, IT',
              'account-tree',
            )}

            {renderInput(
              'Passing Year',
              form.yearOfPassing,
              text => setForm({ ...form, yearOfPassing: text }),
              'YYYY',
              'event',
              'numeric',
            )}

            {renderInput(
              'Email ID (Optional)',
              form.email,
              text => setForm({ ...form, email: text }),
              'Enter email address',
              'email',
              'email-address',
            )}

            <View style={styles.spacer} />

            <TouchableOpacity
              style={[styles.createButton, loading && styles.buttonDisabled]}
              onPress={handleCreate}
              disabled={loading}
              activeOpacity={0.8}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.createButtonText}>Submit Lead</Text>
                  <Icon name="check-circle" size={20} color="#FFFFFF" style={styles.btnIcon} />
                </>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel and Go Back</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  scrollContent: {
    padding: 24,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  infoIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 18,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputGroup: {
    marginBottom: 20,
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
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
  },
  spacer: {
    height: 12,
  },
  createButton: {
    backgroundColor: '#2196F3',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  btnIcon: {
    marginLeft: 8,
  },
  cancelButton: {
    marginTop: 24,
    alignItems: 'center',
    padding: 16,
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default CreateLeadScreen;
