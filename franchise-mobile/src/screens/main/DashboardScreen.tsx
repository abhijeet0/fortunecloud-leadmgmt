import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { franchiseService } from '../../services/api';
import {useAuth} from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }: any) => {
  const {logout} = useAuth();
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    convertedLeads: 0,
    totalCommission: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('Partner');

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await franchiseService.getDashboard();
      const { statistics, franchise } = response.data;
      
      const newLeads = statistics.leadsByStatus.find(s => s._id === 'Submitted')?.count || 0;
      const convertedLeads = statistics.leadsByStatus.find(s => s._id === 'Enrolled')?.count || 0;

      setStats({
        totalLeads: statistics.totalLeads,
        newLeads,
        convertedLeads,
        totalCommission: statistics.totalCommissionEarned,
      });
      
      if (franchise.owner) setUserName(franchise.owner);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
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

  const handleProfilePress = () => {
    Alert.alert('Account', `Signed in as ${userName}`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout().catch(error => {
            console.error('Logout failed:', error);
          });
        },
      },
    ]);
  };

  const renderStatCard = (
    title: string,
    value: string | number,
    icon: string,
    color: string,
    bgColor: string,
    onPress: () => void,
  ) => (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: '#FFFFFF' }]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        <Icon name={icon} size={28} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Icon name="chevron-right" size={20} color="#CBD5E1" />
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2196F3" />
        }
        showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userNameText}>{userName} 👋</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={handleProfilePress}>
            <View style={styles.profileBadge}>
              <Text style={styles.profileInitial}>{userName.charAt(0)}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.mainBalanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Total Earnings</Text>
            <Icon name="account-balance-wallet" size={24} color="#FFFFFF" opacity={0.8} />
          </View>
          <Text style={styles.balanceAmount}>₹{stats.totalCommission.toLocaleString()}</Text>
          <View style={styles.balanceFooter}>
            <TouchableOpacity 
              style={styles.viewDetailsBtn}
              onPress={() => navigation.navigate('Commission')}>
              <Text style={styles.viewDetailsText}>View Statement</Text>
              <Icon name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Performance Overview</Text>
        
        <View style={styles.statsGrid}>
          {renderStatCard(
            'Total Leads',
            stats.totalLeads,
            'people',
            '#2196F3',
            '#E3F2FD',
            () => navigation.navigate('Leads'),
          )}
          {renderStatCard(
            'New Leads',
            stats.newLeads,
            'fiber-new',
            '#F59E0B',
            '#FFFBEB',
            () => navigation.navigate('Leads'),
          )}
          {renderStatCard(
            'Converted',
            stats.convertedLeads,
            'check-circle',
            '#10B981',
            '#ECFDF5',
            () => navigation.navigate('Leads'),
          )}
        </View>

        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Add Lead')}>
              <View style={[styles.actionIcon, { backgroundColor: '#F1F5F9' }]}>
                <Icon name="person-add" size={24} color="#1E293B" />
              </View>
              <Text style={styles.actionLabel}>Add Lead</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Commission')}>
              <View style={[styles.actionIcon, { backgroundColor: '#F1F5F9' }]}>
                <Icon name="payments" size={24} color="#1E293B" />
              </View>
              <Text style={styles.actionLabel}>Earnings</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Leads')}>
              <View style={[styles.actionIcon, { backgroundColor: '#F1F5F9' }]}>
                <Icon name="list-alt" size={24} color="#1E293B" />
              </View>
              <Text style={styles.actionLabel}>All Leads</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.promoCard}>
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>Grow your business</Text>
            <Text style={styles.promoSubtitle}>Add more leads to increase your monthly commissions.</Text>
            <TouchableOpacity 
              style={styles.promoButton}
              onPress={() => navigation.navigate('Add Lead')}>
              <Text style={styles.promoButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
          <Icon name="trending-up" size={80} color="#FFFFFF" opacity={0.15} style={styles.promoIcon} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 24, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  userNameText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 4,
  },
  profileButton: {
    padding: 2,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  mainBalanceCard: {
    backgroundColor: '#2196F3',
    borderRadius: 28,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    opacity: 0.9,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },
  balanceFooter: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
  },
  statsGrid: {
    marginBottom: 32,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  statTitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  actionSection: {
    marginBottom: 32,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 48 - 32) / 3,
    alignItems: 'center',
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  promoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 28,
    padding: 24,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  promoContent: {
    flex: 1,
    zIndex: 1,
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  promoSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    fontWeight: '500',
  },
  promoButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  promoIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});

export default DashboardScreen;
