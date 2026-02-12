import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { franchiseAPI } from '../../services/api';

const CreateLeadScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    qualification: '',
    stream: '',
    yearOfPassing: '',
    city: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    let newErrors: any = {};
    if (!formData.studentName) newErrors.studentName = 'Student name is required';
    if (!formData.qualification) newErrors.qualification = 'Qualification is required';
    if (!formData.stream) newErrors.stream = 'Stream is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number (10 digits)';
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await franchiseAPI.createLead(formData);
      Alert.alert('Success', 'Lead submitted successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Error creating lead:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit lead');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label: string, field: string, icon: string, placeholder: string, options: any = {}) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label} {options.required && <Text style={{ color: 'red' }}>*</Text>}</Text>
      <View style={[styles.inputWrapper, errors[field] && styles.inputError]}>
        <MaterialIcons name={icon} size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={(formData as any)[field]}
          onChangeText={(text) => {
            setFormData({ ...formData, [field]: text });
            if (errors[field]) setErrors({ ...errors, [field]: null });
          }}
          {...options}
        />
      </View>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <MaterialIcons name="person-add" size={40} color="#1976d2" />
        <Text style={styles.title}>Submit New Lead</Text>
        <Text style={styles.subtitle}>Enter student details below</Text>
      </View>

      {renderInput('Student Name', 'studentName', 'person', 'Full Name', { required: true })}
      {renderInput('Qualification', 'qualification', 'school', 'e.g. B.E, MBA', { required: true })}
      {renderInput('Stream', 'stream', 'business', 'e.g. Computer Science', { required: true })}
      {renderInput('Year of Passing', 'yearOfPassing', 'event', 'e.g. 2023', { keyboardType: 'numeric' })}
      {renderInput('City', 'city', 'location-on', 'Current City', { required: true })}
      {renderInput('Phone Number', 'phone', 'phone', '10-digit number', { required: true, keyboardType: 'phone-pad', maxLength: 10 })}
      {renderInput('Email ID', 'email', 'email', 'Email Address (Optional)', { keyboardType: 'email-address' })}

      <TouchableOpacity 
        style={[styles.submitButton, loading && styles.disabledButton]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>SUBMIT LEAD</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: '#1976d2',
    height: 55,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: '#a0c4ff',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default CreateLeadScreen;
