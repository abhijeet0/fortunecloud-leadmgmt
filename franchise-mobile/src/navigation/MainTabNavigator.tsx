import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DashboardScreen from '../screens/main/DashboardScreen';
import LeadListScreen from '../screens/leads/LeadListScreen';
import CreateLeadScreen from '../screens/leads/CreateLeadScreen';
import LeadDetailScreen from '../screens/leads/LeadDetailScreen';
import CommissionScreen from '../screens/main/CommissionScreen';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();
const LeadStack = createNativeStackNavigator();

const LeadNavigator = () => (
  <LeadStack.Navigator>
    <LeadStack.Screen
      name="LeadList"
      component={LeadListScreen}
      options={{title: 'Student Leads'}}
    />
    <LeadStack.Screen
      name="LeadDetail"
      component={LeadDetailScreen}
      options={{title: 'Lead Details'}}
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
    }
    return <Icon name={iconName} size={size} color={color} />;
  };
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: route.name !== 'Leads',
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
        headerStyle: {
          backgroundColor: '#fff',
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 1},
          shadowOpacity: 0.06,
          shadowRadius: 3,
          elevation: 2,
        },
        headerTitleStyle: {
          color: '#1A1A2E',
          fontWeight: 'bold',
          fontSize: 18,
        },
      })}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Leads" component={LeadNavigator} />
      <Tab.Screen name="Add Lead" component={CreateLeadScreen} />
      <Tab.Screen name="Commission" component={CommissionScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
