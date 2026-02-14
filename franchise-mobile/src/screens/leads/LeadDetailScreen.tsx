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
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#2196F3']}
        />
      }>
      {/* Current Status Banner */}
      <View
        style={[
          styles.statusBanner,
          {backgroundColor: getStatusColor(lead.currentStatus)},
        ]}>
        <Text style={styles.statusBannerText}>{lead.currentStatus}</Text>
      </View>

      {/* Student Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Student Information</Text>
        <InfoRow label="Name" value={lead.studentName} />
        <InfoRow label="Phone" value={lead.phone} />
        {lead.email ? <InfoRow label="Email" value={lead.email} /> : null}
        <InfoRow
          label="Qualification"
          value={`${lead.qualification} (${lead.stream})`}
        />
        {lead.yearOfPassing ? (
          <InfoRow label="Year of Passing" value={String(lead.yearOfPassing)} />
        ) : null}
        <InfoRow label="City" value={lead.city} />
        <InfoRow
          label="Submitted"
          value={new Date(lead.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        />
      </View>

      {/* Status History */}
      {history.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status History</Text>
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
                <Text style={styles.historyStatus}>{item.status}</Text>
                <Text style={styles.historyDate}>
                  {new Date(item.updatedAt || item.createdAt).toLocaleString(
                    'en-IN',
                    {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    },
                  )}
                </Text>
                {item.remarks ? (
                  <Text style={styles.historyRemark}>{item.remarks}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Commission Details */}
      {commission && (
        <View style={[styles.section, styles.commissionSection]}>
          <Text style={styles.sectionTitle}>Commission Details</Text>
          <InfoRow
            label="Admission Amount"
            value={`₹${commission.admissionAmount?.toLocaleString('en-IN')}`}
          />
          <InfoRow
            label="Commission %"
            value={`${commission.commissionPercentage}%`}
          />
          <InfoRow
            label="Commission Amount"
            value={`₹${commission.commissionAmount?.toLocaleString('en-IN')}`}
            valueStyle={styles.commissionAmountText}
          />
          <InfoRow
            label="Status"
            value={commission.status}
            valueStyle={{
              fontWeight: 'bold',
              color: getCommissionStatusColor(commission.status),
            }}
          />
          {commission.paidDate && (
            <InfoRow
              label="Paid On"
              value={new Date(commission.paidDate).toLocaleDateString('en-IN')}
            />
          )}
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const InfoRow = ({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: any;
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, valueStyle]}>{value}</Text>
  </View>
);

const getCommissionStatusColor = (status: string): string => {
  switch (status) {
    case 'Paid':
      return '#4CAF50';
    case 'Approved':
      return '#2196F3';
    case 'Pending':
      return '#FF9800';
    default:
      return '#666';
  }
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8F9FA'},
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  statusBanner: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  statusBannerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    backgroundColor: '#fff',
    padding: 18,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 14,
    color: '#2196F3',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  label: {
    width: 130,
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
  },
  value: {
    flex: 1,
    color: '#1A1A2E',
    fontSize: 14,
    fontWeight: '500',
  },
  historyItem: {flexDirection: 'row'},
  timeline: {alignItems: 'center', marginRight: 14},
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2196F3',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
  },
  historyContent: {flex: 1, paddingBottom: 20},
  historyStatus: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
    marginVertical: 3,
  },
  historyRemark: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  commissionSection: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  commissionAmountText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  bottomSpacer: {height: 30},
  errorText: {
    color: '#666',
    fontSize: 16,
    marginTop: 12,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default LeadDetailScreen;
