import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {franchiseService} from '../../services/api';
import {useAuth} from '../../context/AuthContext';
import type {DashboardResponse} from '../../types';

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'HOT':
      return '#E53935';
    case 'WARM':
      return '#FF9800';
    case 'COLD':
      return '#2196F3';
    case 'Enrolled':
      return '#4CAF50';
    case 'Visited':
      return '#9C27B0';
    case 'Lead acknowledged':
      return '#00BCD4';
    case 'Unspoken':
      return '#607D8B';
    case 'Submitted':
      return '#78909C';
    default:
      return '#757575';
  }
};

interface DashboardStats {
  totalLeads: number;
  enrolledCount: number;
  pendingCommission: number;
  paidCommission: number;
  totalCommissionEarned: number;
  leadsByStatus: Array<{_id: string; count: number}>;
  commissionPercentage: number;
}

const DashboardScreen = ({navigation}: any) => {
  const {user, logout} = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    enrolledCount: 0,
    pendingCommission: 0,
    paidCommission: 0,
    totalCommissionEarned: 0,
    leadsByStatus: [],
    commissionPercentage: 10,
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(false);
      const response = await franchiseService.getDashboard();
      const {statistics, franchise} = response.data;
      const enrolledEntry = statistics.leadsByStatus.find(
        (s: any) => s._id === 'Enrolled',
      );
      setStats({
        totalLeads: statistics.totalLeads || 0,
        enrolledCount: enrolledEntry?.count || 0,
        pendingCommission: statistics.pendingCommission || 0,
        paidCommission: statistics.paidCommission || 0,
        totalCommissionEarned: statistics.totalCommissionEarned || 0,
        leadsByStatus: statistics.leadsByStatus || [],
        commissionPercentage: franchise?.commissionPercentage || 10,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refresh on tab focus
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#2196F3']}
        />
      }>
      {/* Header with logout */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.welcome}>Welcome back,</Text>
          <Text style={styles.name}>
            {user?.franchiseName || 'Fortune Franchise'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.7}>
          <Icon name="logout" size={22} color="#E53935" />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Icon name="cloud-off" size={16} color="#E53935" />
          <Text style={styles.errorBannerText}>
            Could not refresh data. Pull down to retry.
          </Text>
        </View>
      )}

      {/* Stats Cards Row */}
      <View style={styles.summaryRow}>
        <View style={styles.card}>
          <Icon name="people" size={28} color="#2196F3" />
          <Text style={styles.cardValue}>{stats.totalLeads}</Text>
          <Text style={styles.cardLabel}>Total Leads</Text>
        </View>
        <View style={styles.card}>
          <Icon name="check-circle" size={28} color="#4CAF50" />
          <Text style={styles.cardValue}>{stats.enrolledCount}</Text>
          <Text style={styles.cardLabel}>Enrolled</Text>
        </View>
      </View>

      {/* Commission Card */}
      <View style={[styles.card, styles.fullCard]}>
        <View style={styles.commissionHeader}>
          <Icon name="payments" size={28} color="#FFD700" />
          <Text style={styles.commissionLabel}>Commission Earned</Text>
        </View>
        <Text style={styles.commissionValue}>
          ₹{stats.totalCommissionEarned.toLocaleString('en-IN')}
        </Text>
        <View style={styles.commissionBreakdown}>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Pending</Text>
            <Text style={[styles.breakdownValue, {color: '#FF9800'}]}>
              ₹{stats.pendingCommission.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.breakdownDivider} />
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Paid</Text>
            <Text style={[styles.breakdownValue, {color: '#4CAF50'}]}>
              ₹{stats.paidCommission.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.detailsBtn}
          onPress={() => navigation.navigate('Commission')}>
          <Text style={styles.detailsText}>View Full Breakdown</Text>
          <Icon name="chevron-right" size={18} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* Leads by Status */}
      {stats.leadsByStatus.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Leads by Status</Text>
          {stats.leadsByStatus.map((item, index) => (
            <View key={item._id || index} style={styles.statusRow}>
              <View
                style={[
                  styles.statusIndicator,
                  {backgroundColor: getStatusColor(item._id)},
                ]}
              />
              <Text style={styles.statusLabel}>{item._id}</Text>
              <Text style={styles.statusCount}>{item.count}</Text>
            </View>
          ))}
        </>
      )}

      {/* Add Lead CTA */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate('Add Lead')}
        activeOpacity={0.8}>
        <Icon name="add" size={22} color="#fff" />
        <Text style={styles.addBtnText}>New Lead</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8F9FA', padding: 16},
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  headerLeft: {flex: 1},
  welcome: {fontSize: 14, color: '#888'},
  name: {fontSize: 22, fontWeight: 'bold', color: '#1A1A2E'},
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorBannerText: {
    color: '#E53935',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    width: '48%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  fullCard: {width: '100%', marginBottom: 20, alignItems: 'flex-start'},
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 4,
    color: '#1A1A2E',
  },
  cardLabel: {fontSize: 13, color: '#888'},
  commissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commissionLabel: {fontSize: 15, color: '#666', marginLeft: 10},
  commissionValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  commissionBreakdown: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 10,
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  breakdownDivider: {
    width: 1,
    backgroundColor: '#F0F0F0',
  },
  detailsBtn: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsText: {color: '#2196F3', fontWeight: '600', fontSize: 14},
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1A1A2E',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  statusIndicator: {width: 10, height: 10, borderRadius: 5, marginRight: 14},
  statusLabel: {flex: 1, fontSize: 15, color: '#1A1A2E'},
  statusCount: {fontSize: 15, fontWeight: 'bold', color: '#666'},
  addBtn: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#2196F3',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default DashboardScreen;
