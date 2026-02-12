import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { franchiseService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DashboardScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalLeads: 0,
    enrolled: 0,
    pending: 0,
    totalCommission: '₹0',
    statusBreakdown: [] as any[]
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await franchiseService.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome back,</Text>
        <Text style={styles.name}>{user?.franchiseName || 'Fortune Franchise'}</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.card}>
          <Icon name="people" size={30} color="#2196F3" />
          <Text style={styles.cardValue}>{stats.totalLeads}</Text>
          <Text style={styles.cardLabel}>Total Leads</Text>
        </View>
        <View style={styles.card}>
          <Icon name="check-circle" size={30} color="#4CAF50" />
          <Text style={styles.cardValue}>{stats.enrolled}</Text>
          <Text style={styles.cardLabel}>Enrolled</Text>
        </View>
      </View>

      <View style={[styles.card, styles.fullCard]}>
        <View style={styles.commissionHeader}>
          <Icon name="payments" size={30} color="#FFD700" />
          <Text style={styles.commissionLabel}>Commission Earned</Text>
        </View>
        <Text style={styles.commissionValue}>{stats.totalCommission}</Text>
        <TouchableOpacity style={styles.detailsBtn} onPress={() => navigation.navigate('Commission')}>
          <Text style={styles.detailsText}>View Breakdown</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Leads by Status</Text>
      {stats.statusBreakdown.map((item: any, index: number) => (
        <View key={index} style={styles.statusRow}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item._id) }]} />
          <Text style={styles.statusLabel}>{item._id}</Text>
          <Text style={styles.statusCount}>{item.count}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('Add Lead')}>
        <Icon name="add" size={24} color="#fff" />
        <Text style={styles.addBtnText}>New Lead</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'HOT': return '#f44336';
    case 'WARM': return '#ff9800';
    case 'COLD': return '#2196f3';
    case 'ENROLLED': return '#4caf50';
    default: return '#757575';
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
  header: { marginBottom: 20, marginTop: 10 },
  welcome: { fontSize: 16, color: '#666' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, width: '48%', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  fullCard: { width: '100%', marginBottom: 20, alignItems: 'flex-start' },
  cardValue: { fontSize: 20, fontWeight: 'bold', marginVertical: 5 },
  cardLabel: { fontSize: 14, color: '#666' },
  commissionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  commissionLabel: { fontSize: 16, color: '#333', marginLeft: 10 },
  commissionValue: { fontSize: 28, fontWeight: 'bold', color: '#4CAF50', marginBottom: 10 },
  detailsBtn: { borderTopWidth: 1, borderTopColor: '#eee', width: '100%', paddingTop: 10, alignItems: 'center' },
  detailsText: { color: '#2196F3', fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  statusRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8 },
  statusIndicator: { width: 12, height: 12, borderRadius: 6, marginRight: 15 },
  statusLabel: { flex: 1, fontSize: 16, color: '#333' },
  statusCount: { fontSize: 16, fontWeight: 'bold', color: '#666' },
  addBtn: { backgroundColor: '#2196F3', flexDirection: 'row', padding: 15, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 30 },
  addBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
});

export default DashboardScreen;
