import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {franchiseService} from '../../services/api';
import type {Lead, LeadStatus} from '../../types';

const STATUS_FILTERS: Array<{label: string; value: string}> = [
  {label: 'All', value: 'All'},
  {label: 'Submitted', value: 'Submitted'},
  {label: 'HOT', value: 'HOT'},
  {label: 'WARM', value: 'WARM'},
  {label: 'COLD', value: 'COLD'},
  {label: 'Enrolled', value: 'Enrolled'},
];

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

const LeadListScreen = ({navigation}: any) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const fetchLeads = useCallback(async () => {
    try {
      setError(false);
      const response = await franchiseService.getLeads();
      setLeads(response.data.leads || []);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refresh on tab focus
  useFocusEffect(
    useCallback(() => {
      fetchLeads();
    }, [fetchLeads]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeads();
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone?.includes(search);
    const matchesFilter = filter === 'All' || lead.currentStatus === filter;
    return matchesSearch && matchesFilter;
  });

  const renderItem = ({item}: {item: Lead}) => (
    <TouchableOpacity
      style={styles.leadCard}
      onPress={() => navigation.navigate('LeadDetail', {leadId: item._id})}
      activeOpacity={0.7}>
      <View style={styles.leadInfo}>
        <Text style={styles.leadName}>{item.studentName}</Text>
        <Text style={styles.leadMeta}>
          {item.phone} \u2022 {item.city}
        </Text>
        <Text style={styles.leadDate}>
          {new Date(item.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          {backgroundColor: getStatusColor(item.currentStatus)},
        ]}>
        <Text style={styles.statusText}>{item.currentStatus}</Text>
      </View>
      <Icon name="chevron-right" size={22} color="#C0C0C0" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (error && leads.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="cloud-off" size={48} color="#999" />
        <Text style={styles.errorText}>Failed to load leads</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            fetchLeads();
          }}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or phone"
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon name="close" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredLeads}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <View style={styles.filterScroll}>
            {STATUS_FILTERS.map(f => (
              <TouchableOpacity
                key={f.value}
                style={[
                  styles.filterChip,
                  filter === f.value && styles.activeChip,
                ]}
                onPress={() => setFilter(f.value)}>
                <Text
                  style={[
                    styles.filterText,
                    filter === f.value && styles.activeFilterText,
                  ]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={48} color="#CCC" />
            <Text style={styles.emptyText}>No leads found</Text>
            {filter !== 'All' && (
              <TouchableOpacity onPress={() => setFilter('All')}>
                <Text style={styles.clearFilterText}>Clear filter</Text>
              </TouchableOpacity>
            )}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 14,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  searchIcon: {marginRight: 10},
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 15,
    color: '#1A1A2E',
  },
  filterScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 8,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#E8EDF2',
  },
  activeChip: {backgroundColor: '#2196F3'},
  filterText: {color: '#555', fontSize: 13, fontWeight: '500'},
  activeFilterText: {color: '#fff', fontWeight: 'bold'},
  listContainer: {padding: 16},
  leadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  leadInfo: {flex: 1},
  leadName: {fontSize: 16, fontWeight: 'bold', color: '#1A1A2E'},
  leadMeta: {fontSize: 13, color: '#666', marginTop: 3},
  leadDate: {fontSize: 12, color: '#999', marginTop: 2},
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {color: '#fff', fontSize: 11, fontWeight: 'bold'},
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 12,
    color: '#999',
    fontSize: 15,
  },
  clearFilterText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
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

export default LeadListScreen;
