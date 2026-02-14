import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {franchiseService} from '../../services/api';
import type {Commission} from '../../types';

interface CommissionSummary {
  total: number;
  pending: number;
  approved: number;
  paid: number;
}

const getStatusColor = (status: string): string => {
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

const CommissionScreen = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [summary, setSummary] = useState<CommissionSummary>({
    total: 0,
    pending: 0,
    approved: 0,
    paid: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const fetchCommissions = useCallback(async () => {
    try {
      setError(false);
      const response = await franchiseService.getCommissions();
      setCommissions(response.data.commissions || []);
      setSummary({
        total: response.data.total || 0,
        pending: response.data.pending || 0,
        approved: response.data.approved || 0,
        paid: response.data.paid || 0,
      });
    } catch (err) {
      console.error('Failed to fetch commissions:', err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCommissions();
    }, [fetchCommissions]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchCommissions();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  const renderItem = ({item}: {item: Commission}) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.studentName} numberOfLines={1}>
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
          <Text style={styles.detailValue}>
            ₹{item.admissionAmount?.toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Percentage</Text>
          <Text style={styles.detailValue}>{item.commissionPercentage}%</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Commission</Text>
          <Text style={styles.commissionAmountText}>
            ₹{item.commissionAmount?.toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>
          Generated:{' '}
          {new Date(item.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Summary Box */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>Total Commission</Text>
        <Text style={styles.summaryValue}>
          ₹{summary.total.toLocaleString('en-IN')}
        </Text>
        <View style={styles.summaryBreakdown}>
          <View style={styles.summaryBreakdownItem}>
            <View style={[styles.summaryDot, {backgroundColor: '#FF9800'}]} />
            <Text style={styles.summaryBreakdownLabel}>Pending</Text>
            <Text style={styles.summaryBreakdownValue}>
              ₹{summary.pending.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.summaryBreakdownItem}>
            <View style={[styles.summaryDot, {backgroundColor: '#64B5F6'}]} />
            <Text style={styles.summaryBreakdownLabel}>Approved</Text>
            <Text style={styles.summaryBreakdownValue}>
              ₹{summary.approved.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.summaryBreakdownItem}>
            <View style={[styles.summaryDot, {backgroundColor: '#81C784'}]} />
            <Text style={styles.summaryBreakdownLabel}>Paid</Text>
            <Text style={styles.summaryBreakdownValue}>
              ₹{summary.paid.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={commissions}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Commission History</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="account-balance-wallet" size={48} color="#CCC" />
            <Text style={styles.emptyText}>
              {error ? 'Failed to load commissions' : 'No commissions yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              Commissions are generated when leads get enrolled
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8F9FA'},
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  summaryBox: {
    backgroundColor: '#2196F3',
    padding: 22,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#2196F3',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  summaryLabel: {color: '#fff', fontSize: 14, opacity: 0.85},
  summaryValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 6,
  },
  summaryBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  summaryBreakdownItem: {
    alignItems: 'center',
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  summaryBreakdownLabel: {
    color: '#fff',
    fontSize: 11,
    opacity: 0.8,
    marginBottom: 2,
  },
  summaryBreakdownValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContainer: {padding: 16},
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1A1A2E',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A2E',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6},
  statusText: {color: '#fff', fontSize: 11, fontWeight: 'bold'},
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailItem: {alignItems: 'flex-start'},
  detailLabel: {fontSize: 11, color: '#999', marginBottom: 3},
  detailValue: {fontSize: 14, color: '#1A1A2E', fontWeight: '500'},
  commissionAmountText: {fontSize: 15, color: '#4CAF50', fontWeight: 'bold'},
  cardFooter: {marginTop: 10},
  dateText: {fontSize: 12, color: '#999'},
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 12,
    color: '#999',
    fontSize: 15,
  },
  emptySubtext: {
    textAlign: 'center',
    marginTop: 6,
    color: '#BBB',
    fontSize: 13,
  },
});

export default CommissionScreen;
