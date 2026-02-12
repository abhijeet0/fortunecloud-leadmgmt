import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { franchiseAPI } from '../../services/api';

const DashboardScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const response = await franchiseAPI.getDashboard();
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <Text>Loading Dashboard...</Text>
      </View>
    );
  }

  const stats = data?.stats || {
    totalLeads: 0,
    enrolledLeads: 0,
    pendingCommissions: 0,
    paidCommissions: 0
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome back!</Text>
        <Text style={styles.subHeader}>Here is your franchise summary</Text>
      </View>

      <View style={styles.grid}>
        <View style={[styles.card, { borderLeftColor: '#1976d2' }]}>
          <MaterialIcons name="people" size={32} color="#1976d2" />
          <Text style={styles.cardValue}>{stats.totalLeads}</Text>
          <Text style={styles.cardLabel}>Total Leads</Text>
        </View>

        <View style={[styles.card, { borderLeftColor: '#4caf50' }]}>
          <MaterialIcons name="school" size={32} color="#4caf50" />
          <Text style={styles.cardValue}>{stats.enrolledLeads}</Text>
          <Text style={styles.cardLabel}>Enrolled</Text>
        </View>

        <View style={[styles.card, { borderLeftColor: '#ff9800' }]}>
          <MaterialIcons name="account-balance-wallet" size={32} color="#ff9800" />
          <Text style={styles.cardValue}>₹{stats.pendingCommissions}</Text>
          <Text style={styles.cardLabel}>Pending Comm.</Text>
        </View>

        <View style={[styles.card, { borderLeftColor: '#2196f3' }]}>
          <MaterialIcons name="payments" size={32} color="#2196f3" />
          <Text style={styles.cardValue}>₹{stats.paidCommissions}</Text>
          <Text style={styles.cardLabel}>Paid Comm.</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status Breakdown</Text>
        {data?.statusBreakdown?.map((item: any) => (
          <View key={item.status} style={styles.statusRow}>
            <Text style={styles.statusName}>{item.status}</Text>
            <View style={styles.progressBarBg}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${(item.count / stats.totalLeads) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.statusCount}>{item.count}</Text>
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
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subHeader: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 5,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  cardLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusName: {
    width: 100,
    fontSize: 14,
    color: '#555',
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginHorizontal: 10,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#1976d2',
    borderRadius: 4,
  },
  statusCount: {
    width: 30,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default DashboardScreen;
