import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {franchiseService} from '../../services/api';

const CommissionScreen = () => {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [summary, setSummary] = useState({totalPayable: '₹0'});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCommissions = useCallback(async () => {
    try {
      const response = await franchiseService.getCommissions();
      setCommissions(response.data.commissions);
      setSummary({totalPayable: response.data.totalPayable});
    } catch (error) {
      console.error('Failed to fetch commissions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCommissions();
  };

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  const renderItem = ({item}: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.studentName}>
          {item.leadId?.studentName || 'N/A'}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: getStatusColor(item.status)},
          ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Admission Amt</Text>
          <Text style={styles.detailValue}>₹{item.admissionAmount}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Percentage</Text>
          <Text style={styles.detailValue}>{item.commissionPercentage}%</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Commission</Text>
          <Text style={styles.commissionAmount}>₹{item.commissionAmount}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>
          Generated on: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>Total Payable Commission</Text>
        <Text style={styles.summaryValue}>₹{summary.totalPayable}</Text>
        <Text style={styles.summarySubtext}>Includes Pending & Approved</Text>
      </View>

      <FlatList
        data={commissions}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Recent Commissions</Text>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Paid':
      return '#4CAF50';
    case 'Approved':
      return '#2196F3';
    case 'Pending':
      return '#FF9800';
    default:
      return '#757575';
  }
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  summaryBox: {
    backgroundColor: '#2196F3',
    padding: 25,
    margin: 15,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 4,
  },
  summaryLabel: {color: '#fff', fontSize: 16, opacity: 0.9},
  summaryValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  summarySubtext: {color: '#fff', fontSize: 12, opacity: 0.8},
  listContainer: {padding: 15},
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  studentName: {fontSize: 17, fontWeight: 'bold', color: '#333'},
  statusBadge: {paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5},
  statusText: {color: '#fff', fontSize: 11, fontWeight: 'bold'},
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailItem: {alignItems: 'flex-start'},
  detailLabel: {fontSize: 12, color: '#999', marginBottom: 4},
  detailValue: {fontSize: 14, color: '#333', fontWeight: '500'},
  commissionAmount: {fontSize: 16, color: '#4CAF50', fontWeight: 'bold'},
  cardFooter: {marginTop: 10},
  dateText: {fontSize: 12, color: '#999'},
});

export default CommissionScreen;
