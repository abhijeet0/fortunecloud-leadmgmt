import React, {useCallback, useEffect, useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AppState} from 'react-native';
import DashboardScreen from '../screens/main/DashboardScreen';
import LeadListScreen from '../screens/leads/LeadListScreen';
import CreateLeadScreen from '../screens/leads/CreateLeadScreen';
import LeadDetailScreen from '../screens/leads/LeadDetailScreen';
import CommissionScreen from '../screens/main/CommissionScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import {franchiseService} from '../services/api';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();
const LeadStack = createNativeStackNavigator();

const LeadNavigator = () => (
  <LeadStack.Navigator screenOptions={{headerShown: false}}>
    <LeadStack.Screen
      name="LeadList"
      component={LeadListScreen}
      options={{title: 'Student Leads'}}
    />
    <LeadStack.Screen
      name="LeadDetail"
      component={LeadDetailScreen}
      options={{headerShown: true, title: 'Lead Details'}}
    />
  </LeadStack.Navigator>
);

const getTabBarIcon = (route: any) => {
  return ({color, size}: {color: string; size: number}) => {
    let iconName = 'home';
    if (route.name === 'Dashboard') {
      iconName = 'dashboard';
    } else if (route.name === 'Leads') {
      iconName = 'list';
    } else if (route.name === 'Add Lead') {
      iconName = 'add-circle';
    } else if (route.name === 'Commission') {
      iconName = 'payments';
    } else if (route.name === 'Notifications') {
      iconName = 'notifications';
    }
    return <Icon name={iconName} size={size} color={color} />;
  };
};

const MainTabNavigator = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await franchiseService.getNotifications({page: 1, limit: 1});
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.warn('Failed to fetch unread notification count:', error);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const intervalId = setInterval(fetchUnreadCount, 15000);
    const appStateSub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        fetchUnreadCount();
      }
    });

    return () => {
      clearInterval(intervalId);
      appStateSub.remove();
    };
  }, [fetchUnreadCount]);

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: getTabBarIcon(route),
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#E0E0E0',
          paddingBottom: 4,
          height: 56,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      })}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Leads" component={LeadNavigator} />
      <Tab.Screen name="Add Lead" component={CreateLeadScreen} />
      <Tab.Screen name="Commission" component={CommissionScreen} />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarBadge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined,
        }}
        listeners={{
          focus: fetchUnreadCount,
          blur: fetchUnreadCount,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
