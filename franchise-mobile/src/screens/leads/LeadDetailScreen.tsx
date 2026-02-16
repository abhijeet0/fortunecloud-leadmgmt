import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {franchiseService} from '../../services/api';
import type {Lead, LeadStatusHistoryItem, Commission} from '../../types';

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

const LeadDetailScreen = ({route}: any) => {
  const {leadId} = route.params;
  const [lead, setLead] = useState<Lead | null>(null);
  const [history, setHistory] = useState<LeadStatusHistoryItem[]>([]);
  const [commission, setCommission] = useState<Commission | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const fetchLead = useCallback(async () => {
    try {
      setError(false);
      const response = await franchiseService.getLead(leadId);
      setLead(response.data.lead);
      setHistory(response.data.history || []);
      setCommission(response.data.commission || null);
    } catch (err) {
      console.error('Failed to fetch lead details:', err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLead();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (error || !lead) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="error-outline" size={48} color="#999" />
        <Text style={styles.errorText}>
          {error ? 'Failed to load lead details' : 'Lead not found'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            fetchLead();
          }}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#2196F3']}
          tintColor="#2196F3"
        />
      }>
      {/* Current Status Header */}
      <View style={styles.header}>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: `${getStatusColor(lead.currentStatus)}15`},
          ]}>
          <Text style={[styles.statusText, {color: getStatusColor(lead.currentStatus)}]}>
            {lead.currentStatus}
          </Text>
        </View>
        <Text style={styles.studentName}>{lead.studentName}</Text>
        <Text style={styles.submissionDate}>
          Submitted on {new Date(lead.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>
      </View>

      {/* Student Information */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="person-outline" size={20} color="#2196F3" />
          <Text style={styles.cardTitle}>Student Details</Text>
        </View>
        <View style={styles.infoGrid}>
          <InfoItem label="Phone" value={lead.phone} icon="phone" />
          <InfoItem label="Email" value={lead.email || 'Not provided'} icon="email" />
          <InfoItem 
            label="Education" 
            value={`${lead.qualification} (${lead.stream})`} 
            icon="school" 
          />
          {lead.yearOfPassing ? (
            <InfoItem label="Passing Year" value={String(lead.yearOfPassing)} icon="event" />
          ) : null}
          <InfoItem label="City" value={lead.city} icon="place" />
        </View>
      </View>

      {/* Commission Details */}
      {commission && (
        <View style={[styles.card, styles.commissionCard]}>
          <View style={styles.cardHeader}>
            <Icon name="payments" size={20} color="#48BB78" />
            <Text style={[styles.cardTitle, {color: '#2D3748'}]}>Commission</Text>
            <View style={[styles.miniBadge, {backgroundColor: `${getCommissionStatusColor(commission.status)}15`}]}>
              <Text style={[styles.miniBadgeText, {color: getCommissionStatusColor(commission.status)}]}>
                {commission.status}
              </Text>
            </View>
          </View>
          
          <View style={styles.commissionMain}>
            <View>
              <Text style={styles.commLabel}>Earned Amount</Text>
              <Text style={styles.commValue}>₹{commission.commissionAmount?.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.commDivider} />
            <View>
              <Text style={styles.commLabel}>Course Fee</Text>
              <Text style={styles.commSubValue}>₹{commission.admissionAmount?.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          {commission.paidDate && (
            <View style={styles.paidInfo}>
              <Icon name="check-circle" size={14} color="#48BB78" />
              <Text style={styles.paidText}>Paid on {new Date(commission.paidDate).toLocaleDateString('en-IN')}</Text>
            </View>
          )}
        </View>
      )}

      {/* Status History */}
      {history.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="history" size={20} color="#718096" />
            <Text style={styles.cardTitle}>Status History</Text>
          </View>
          <View style={styles.historyList}>
            {history.map((item, index) => (
              <View key={item._id || index} style={styles.historyItem}>
                <View style={styles.timeline}>
                  <View
                    style={[
                      styles.dot,
                      {backgroundColor: getStatusColor(item.status)},
                    ]}
                  />
                  {index !== history.length - 1 && <View style={styles.line} />}
                </View>
                <View style={styles.historyContent}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyStatus}>{item.status}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(item.updatedAt || item.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </Text>
                  </View>
                  {item.remarks ? (
                    <Text style={styles.historyRemark}>{item.remarks}</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const InfoItem = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) => (
  <View style={styles.infoItem}>
    <View style={styles.infoIconBox}>
      <Icon name={icon} size={16} color="#718096" />
    </View>
    <View style={{flex: 1}}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const getCommissionStatusColor = (status: string): string => {
  switch (status) {
    case 'Paid':
      return '#48BB78';
    case 'Approved':
      return '#2196F3';
    case 'Pending':
      return '#F6AD55';
    default:
      return '#718096';
  }
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FFFFFF'},
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 40,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderColor: '#EDF2F7',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  studentName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A202C',
    textAlign: 'center',
  },
  submissionDate: {
    fontSize: 14,
    color: '#718096',
    marginTop: 6,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D3748',
    marginLeft: 10,
    flex: 1,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#A0AEC0',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 15,
    color: '#2D3748',
    fontWeight: '600',
    marginTop: 1,
  },
  commissionCard: {
    borderColor: '#C6F6D5',
    backgroundColor: '#FCFFFF',
  },
  miniBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  miniBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  commissionMain: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    padding: 16,
    borderRadius: 16,
  },
  commLabel: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '700',
  },
  commValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D3748',
  },
  commSubValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A5568',
  },
  commDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 20,
  },
  paidInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginLeft: 4,
  },
  paidText: {
    fontSize: 13,
    color: '#48BB78',
    fontWeight: '700',
    marginLeft: 6,
  },
  historyList: {
    marginTop: 4,
  },
  historyItem: {flexDirection: 'row'},
  timeline: {alignItems: 'center', marginRight: 16},
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#EDF2F7',
    marginVertical: 4,
  },
  historyContent: {flex: 1, paddingBottom: 24},
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyStatus: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2D3748',
  },
  historyDate: {
    fontSize: 12,
    color: '#A0AEC0',
    fontWeight: '700',
  },
  historyRemark: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
    lineHeight: 20,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderColor: '#CBD5E0',
  },
  bottomSpacer: {height: 40},
  errorText: {
    color: '#2D3748',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#2196F3',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  retryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});

export default LeadDetailScreen;
