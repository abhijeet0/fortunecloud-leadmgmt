import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { franchiseService } from '../../services/api';

const CreateLeadScreen = ({ navigation }: any) => {
  const [form, setForm] = useState({
    studentName: '',
    qualification: '',
    stream: '',
    yearOfPassing: '',
    city: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const { studentName, qualification, stream, city, phone } = form;
    if (!studentName || !qualification || !stream || !city || !phone) {
      Alert.alert('Error', 'Please fill all mandatory fields');
      return;
    }
    
    setLoading(true);
    try {
      await franchiseService.createLead(form);
      Alert.alert('Success', 'Lead submitted successfully', [
        { text: 'OK', onPress: () => navigation.navigate('Leads') }
      ]);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to submit lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Submit Student Lead</Text>
      
      <Text style={styles.label}>Student Name *</Text>
      <TextInput style={styles.input} value={form.studentName} onChangeText={(text) => setForm({ ...form, studentName: text })} placeholder="Full Name" />

      <Text style={styles.label}>Qualification *</Text>
      <TextInput style={styles.input} value={form.qualification} onChangeText={(text) => setForm({ ...form, qualification: text })} placeholder="e.g. BE, BCom, MBA" />

      <Text style={styles.label}>Stream *</Text>
      <TextInput style={styles.input} value={form.stream} onChangeText={(text) => setForm({ ...form, stream: text })} placeholder="e.g. Computer Science" />

      <Text style={styles.label}>Year of Passing</Text>
      <TextInput style={styles.input} value={form.yearOfPassing} onChangeText={(text) => setForm({ ...form, yearOfPassing: text })} placeholder="e.g. 2023" keyboardType="number-pad" />

      <Text style={styles.label}>City *</Text>
      <TextInput style={styles.input} value={form.city} onChangeText={(text) => setForm({ ...form, city: text })} placeholder="City" />

      <Text style={styles.label}>Phone Number *</Text>
      <TextInput style={styles.input} value={form.phone} onChangeText={(text) => setForm({ ...form, phone: text })} placeholder="10-digit number" keyboardType="phone-pad" maxLength={10} />

      <Text style={styles.label}>Email ID</Text>
      <TextInput style={styles.input} value={form.email} onChangeText={(text) => setForm({ ...form, email: text })} placeholder="Optional" keyboardType="email-address" />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Lead</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  label: { fontSize: 14, color: '#666', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default CreateLeadScreen;
