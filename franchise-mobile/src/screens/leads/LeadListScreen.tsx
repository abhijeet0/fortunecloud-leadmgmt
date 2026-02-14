import React, {useEffect, useState, useCallback} from 'react';
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
import Icon from 'react-native-vector-icons/MaterialIcons';
import {franchiseService} from '../../services/api';

const LeadListScreen = ({navigation}: any) => {
  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeads = useCallback(async () => {
    try {
      const response = await franchiseService.getLeads();
      setLeads(response.data);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeads();
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.studentName.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone.includes(search);
    const matchesFilter = filter === 'All' || lead.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'HOT':
        return '#f44336';
      case 'ENROLLED':
        return '#4CAF50';
      case 'WARM':
        return '#ff9800';
      default:
        return '#757575';
    }
  };

  const renderItem = ({item}: any) => (
    <TouchableOpacity
      style={styles.leadCard}
      onPress={() => navigation.navigate('LeadDetail', {leadId: item._id})}>
      <View style={styles.leadInfo}>
        <Text style={styles.leadName}>{item.studentName}</Text>
        <Text style={styles.leadPhone}>{item.phone}</Text>
        <Text style={styles.leadDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          {backgroundColor: getStatusColor(item.status)},
        ]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
      <Icon name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#2196F3" />
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
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filterContainer}>
        {['All', 'HOT', 'WARM', 'Enrolled'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.activeChip]}
            onPress={() => setFilter(f)}>
            <Text
              style={[
                styles.filterText,
                filter === f && styles.activeFilterText,
              ]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredLeads}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No leads found</Text>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    elevation: 2,
  },
  searchIcon: {marginRight: 10},
  searchInput: {flex: 1, height: 45, fontSize: 16},
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
  },
  activeChip: {backgroundColor: '#2196F3'},
  filterText: {color: '#666', fontSize: 14},
  activeFilterText: {color: '#fff', fontWeight: 'bold'},
  listContainer: {padding: 15},
  leadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
  },
  leadInfo: {flex: 1},
  leadName: {fontSize: 18, fontWeight: 'bold', color: '#333'},
  leadPhone: {fontSize: 14, color: '#666', marginTop: 2},
  leadDate: {fontSize: 12, color: '#999', marginTop: 2},
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
    marginRight: 10,
  },
  statusText: {color: '#fff', fontSize: 12, fontWeight: 'bold'},
  emptyText: {textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16},
});

export default LeadListScreen;
