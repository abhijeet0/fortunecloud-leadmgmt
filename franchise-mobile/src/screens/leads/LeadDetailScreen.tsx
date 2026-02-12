import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { franchiseService } from '../../services/api';

const LeadDetailScreen = ({ route }: any) => {
  const { leadId } = route.params;
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const response = await franchiseService.getLead(leadId);
        setLead(response.data);
      } catch (error) {
        console.error('Failed to fetch lead details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [leadId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!lead) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Lead not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Student Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{lead.studentName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{lead.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Qualification:</Text>
          <Text style={styles.value}>{lead.qualification} ({lead.stream})</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status History</Text>
        {lead.statusHistory?.map((item: any, index: number) => (
          <View key={index} style={styles.historyItem}>
            <View style={styles.timeline}>
              <View style={styles.dot} />
              {index !== lead.statusHistory.length - 1 && <View style={styles.line} />}
            </View>
            <View style={styles.historyContent}>
              <Text style={styles.historyStatus}>{item.status}</Text>
              <Text style={styles.historyDate}>{new Date(item.updatedAt).toLocaleString()}</Text>
              <Text style={styles.historyRemark}>{item.remarks}</Text>
            </View>
          </View>
        ))}
      </View>

      {lead.commissionInfo && (
        <View style={[styles.section, styles.commissionSection]}>
          <Text style={styles.sectionTitle}>Commission Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Commission Amount:</Text>
            <Text style={styles.commissionValue}>₹{lead.commissionInfo.commissionAmount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Status:</Text>
            <Text style={[styles.value, { fontWeight: 'bold' }]}>{lead.commissionInfo.status}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  section: { backgroundColor: '#fff', padding: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#2196F3' },
  infoRow: { flexDirection: 'row', marginBottom: 10 },
  label: { width: 120, color: '#666', fontSize: 14 },
  value: { flex: 1, color: '#333', fontSize: 14, fontWeight: '500' },
  historyItem: { flexDirection: 'row' },
  timeline: { alignItems: 'center', marginRight: 15 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#2196F3' },
  line: { width: 2, flex: 1, backgroundColor: '#e0e0e0' },
  historyContent: { flex: 1, paddingBottom: 20 },
  historyStatus: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  historyDate: { fontSize: 12, color: '#999', marginVertical: 4 },
  historyRemark: { fontSize: 14, color: '#666', fontStyle: 'italic' },
  commissionSection: { borderLeftWidth: 5, borderLeftColor: '#4CAF50' },
  commissionValue: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50' },
});

export default LeadDetailScreen;
