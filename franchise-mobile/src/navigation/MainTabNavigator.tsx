import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
    <LeadStack.Screen name="LeadList" component={LeadListScreen} options={{ title: 'Student Leads' }} />
    <LeadStack.Screen name="LeadDetail" component={LeadDetailScreen} options={{ title: 'Lead Details' }} />
  </LeadStack.Navigator>
);

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: route.name !== 'Leads',
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';
          if (route.name === 'Dashboard') iconName = 'dashboard';
          else if (route.name === 'Leads') iconName = 'list';
          else if (route.name === 'Add Lead') iconName = 'add-circle';
          else if (route.name === 'Commission') iconName = 'payments';
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Leads" component={LeadNavigator} />
      <Tab.Screen name="Add Lead" component={CreateLeadScreen} />
      <Tab.Screen name="Commission" component={CommissionScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
