import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { franchiseAPI } from '../../services/api';

interface Lead {
  studentName: string;
}

interface Commission {
  _id: string;
  leadId: Lead;
  status: 'Pending' | 'Approved' | 'Paid';
  admissionAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
}

interface CommissionsData {
  total: number;
  pending: number;
  approved: number;
  paid: number;
  commissions: Commission[];
}

interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  color?: string;
}

interface RowProps {
  label: string;
  value: string;
  bold?: boolean;
}

export default function CommissionsScreen(): React.ReactElement {
  const [data, setData] = useState<CommissionsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await franchiseAPI.getCommissions();
      setData(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load commissions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Paid':
        return '#4caf50';
      case 'Approved':
        return '#ff9800';
      case 'Pending':
        return '#2196f3';
      default:
        return '#999';
    }
  };

  const renderCommissionItem = ({ item }: { item: Commission }): React.ReactElement => (
    <View style={styles.commissionCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.studentName}>{item.leadId?.studentName || 'N/A'}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Row label="Admission Amount" value={`₹${item.admissionAmount?.toLocaleString('en-IN')}`} />
        <Row label="Rate" value={`${item.commissionPercentage}%`} />
        <Row
          label="Commission"
          value={`₹${item.commissionAmount?.toLocaleString('en-IN')}`}
          bold
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centerContainer}>
        <Text>Failed to load data</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statsSection}>
        <StatCard
          icon="receipt"
          label="Total Commissions"
          value={data.total}
        />
        <StatCard
          icon="hourglass-empty"
          label="Pending"
          value={data.pending}
          color="#2196f3"
        />
        <StatCard
          icon="check-circle"
          label="Approved"
          value={data.approved}
          color="#ff9800"
        />
        <StatCard
          icon="done-all"
          label="Paid"
          value={data.paid}
          color="#4caf50"
        />
      </View>

      <View style={styles.listSection}>
        <Text style={styles.listTitle}>Commission Details</Text>
        {data.commissions && data.commissions.length > 0 ? (
          <FlatList
            data={data.commissions}
            renderItem={renderCommissionItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inbox" size={48} color="#ddd" />
            <Text style={styles.emptyText}>No commissions yet</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function StatCard({ icon, label, value, color = '#1976d2' }: StatCardProps): React.ReactElement {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <MaterialIcons name={icon} size={24} color={color} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

function Row({ label, value, bold = false }: RowProps): React.ReactElement {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowValueBold]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  listSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  commissionCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rowLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  rowValueBold: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
});
