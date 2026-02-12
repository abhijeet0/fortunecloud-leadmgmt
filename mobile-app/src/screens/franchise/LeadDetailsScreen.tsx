import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { franchiseAPI } from '../../services/api';

const LeadDetailsScreen: React.FC<{ route: any }> = ({ route }) => {
  const { leadId } = route.params;
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeadDetails = async () => {
    try {
      const response = await franchiseAPI.getLead(leadId);
      setLead(response.data);
    } catch (error) {
      console.error('Error fetching lead details:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeadDetails();
  }, [leadId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeadDetails();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  if (!lead) {
    return (
      <View style={styles.center}>
        <Text>Lead not found</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.studentName}>{lead.studentName}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{lead.status}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <View style={styles.infoRow}>
          <MaterialIcons name="school" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Qualification</Text>
            <Text style={styles.infoValue}>{lead.qualification}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="business" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Stream</Text>
            <Text style={styles.infoValue}>{lead.stream}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="phone" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>{lead.phone}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="email" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email ID</Text>
            <Text style={styles.infoValue}>{lead.email || 'N/A'}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="location-on" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>City</Text>
            <Text style={styles.infoValue}>{lead.city}</Text>
          </View>
        </View>
      </View>

      {lead.commission && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Commission Information</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="attach-money" size={20} color="#4caf50" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Commission Amount</Text>
              <Text style={[styles.infoValue, { color: '#4caf50', fontWeight: 'bold' }]}>
                ₹{lead.commission.amount}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="info" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Payment Status</Text>
              <Text style={styles.infoValue}>{lead.commission.status}</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status History</Text>
        {lead.statusHistory?.map((history: any, index: number) => (
          <View key={index} style={styles.historyItem}>
            <View style={styles.historyLine}>
              <View style={styles.historyDot} />
              {index !== lead.statusHistory.length - 1 && <View style={styles.historyConnector} />}
            </View>
            <View style={styles.historyContent}>
              <Text style={styles.historyStatus}>{history.status}</Text>
              <Text style={styles.historyDate}>
                {new Date(history.createdAt).toLocaleString()}
              </Text>
              {history.remarks && <Text style={styles.historyRemarks}>{history.remarks}</Text>}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#1976d2',
    alignItems: 'center',
  },
  studentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 15,
    padding: 20,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    marginTop: 2,
  },
  historyItem: {
    flexDirection: 'row',
  },
  historyLine: {
    alignItems: 'center',
    width: 20,
  },
  historyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1976d2',
    zIndex: 1,
  },
  historyConnector: {
    width: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 2,
  },
  historyContent: {
    marginLeft: 15,
    paddingBottom: 25,
    flex: 1,
  },
  historyStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  historyRemarks: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
  },
});

export default LeadDetailsScreen;
