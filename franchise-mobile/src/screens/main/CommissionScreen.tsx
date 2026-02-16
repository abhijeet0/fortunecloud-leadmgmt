import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { franchiseService } from '../../services/api';
import type { Commission } from '../../types/index';

const CommissionScreen = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({
    total: 0,
    paid: 0,
    pending: 0,
  });

  const fetchCommissions = useCallback(async () => {
    try {
      const response = await franchiseService.getCommissions();
      const { commissions: commList, total, paid, pending } = response.data;
      setCommissions(commList);
      setSummary({ total, paid, pending });
    } catch (error) {
      console.error('Error fetching commissions:', error);
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

  const renderSummaryCard = (
    label: string,
    value: number,
    icon: string,
    color: string,
    bgColor: string,
  ) => (
    <View style={[styles.summaryBox, { backgroundColor: bgColor }]}>
      <View style={[styles.summaryIconContainer, { backgroundColor: '#FFFFFF' }]}>
        <Icon name={icon} size={22} color={color} />
      </View>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, { color }]}>₹{value.toLocaleString('en-IN')}</Text>
    </View>
  );

  const renderItem = ({ item }: { item: Commission }) => (
    <TouchableOpacity style={styles.commissionCard} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.studentInfo}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {item.leadId?.studentName?.charAt(0).toUpperCase() || 'S'}
            </Text>
          </View>
          <View>
            <Text style={styles.studentName}>{item.leadId?.studentName || 'Student'}</Text>
            <Text style={styles.courseName}>Commission earned</Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          item.status.toLowerCase() === 'paid' ? styles.statusPaid : styles.statusPending
        ]}>
          <Text style={[
            styles.statusText,
            item.status.toLowerCase() === 'paid' ? styles.textPaid : styles.textPending
          ]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Icon name="event" size={16} color="#94A3B8" />
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </Text>
        </View>
        <Text style={styles.amountText}>₹{item.commissionAmount.toLocaleString('en-IN')}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Commissions</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="tune" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryContainer}>
        {renderSummaryCard('Total Earnings', summary.total, 'account-balance-wallet', '#2196F3', '#E3F2FD')}
        <View style={styles.summaryRow}>
          <View style={styles.flexHalf}>
            {renderSummaryCard('Paid', summary.paid, 'check-circle', '#10B981', '#ECFDF5')}
          </View>
          <View style={{ width: 12 }} />
          <View style={styles.flexHalf}>
            {renderSummaryCard('Pending', summary.pending, 'pending', '#F59E0B', '#FFFBEB')}
          </View>
        </View>
      </View>

      <FlatList
        data={commissions}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2196F3" />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="payments" size={64} color="#E2E8F0" />
            <Text style={styles.emptyTitle}>No Commissions Yet</Text>
            <Text style={styles.emptySubtitle}>Your earnings will appear here once leads are converted.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
  },
  filterButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  summaryContainer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  flexHalf: { flex: 1 },
  summaryBox: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 0,
  },
  summaryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  listContent: {
    padding: 20,
    paddingTop: 24,
  },
  commissionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#475569',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  courseName: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusPaid: { backgroundColor: '#DCFCE7' },
  statusPending: { backgroundColor: '#FEF3C7' },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textPaid: { color: '#166534' },
  textPending: { color: '#92400E' },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    color: '#94A3B8',
    marginLeft: 6,
    fontWeight: '500',
  },
  amountText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#475569',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
});

export default CommissionScreen;
