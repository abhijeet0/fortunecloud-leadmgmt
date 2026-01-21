import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AppProvider, AppContext } from './context/AppContext';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from './screens/auth/LoginScreen';
import SignupScreen from './screens/auth/SignupScreen';
import VerifyOTPScreen from './screens/auth/VerifyOTPScreen';
import DashboardScreen from './screens/franchise/DashboardScreen';
import LeadsScreen from './screens/franchise/LeadsScreen';
import LeadDetailsScreen from './screens/franchise/LeadDetailsScreen';
import CreateLeadScreen from './screens/franchise/CreateLeadScreen';
import CommissionsScreen from './screens/franchise/CommissionsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: 'white' },
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
    <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
  </Stack.Navigator>
);

const FranchiseNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: string;
        if (route.name === 'Dashboard') {
          iconName = focused ? 'dashboard' : 'dashboard';
        } else if (route.name === 'Leads') {
          iconName = focused ? 'people' : 'people';
        } else if (route.name === 'Commissions') {
          iconName = 'attach-money';
        } else {
          iconName = 'circle';
        }
        return <MaterialIcons name={iconName as any} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#1976d2',
      tabBarInactiveTintColor: '#999',
      headerShown: true,
      headerStyle: {
        backgroundColor: '#1976d2',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: '600',
      },
    })}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{ title: 'Dashboard' }}
    />
    <Tab.Screen
      name="Leads"
      component={LeadsNavigator}
      options={{ title: 'Leads', headerShown: false }}
    />
    <Tab.Screen
      name="Commissions"
      component={CommissionsScreen}
      options={{ title: 'Commissions' }}
    />
  </Tab.Navigator>
);

const LeadsNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#1976d2',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: '600',
      },
    }}
  >
    <Stack.Screen
      name="LeadsList"
      component={LeadsScreen}
      options={{ title: 'Leads' }}
    />
    <Stack.Screen
      name="LeadDetails"
      component={LeadDetailsScreen}
      options={{ title: 'Lead Details' }}
    />
    <Stack.Screen
      name="CreateLead"
      component={CreateLeadScreen}
      options={{ title: 'Submit Lead' }}
    />
  </Stack.Navigator>
);

interface AppContextType {
  isSignedIn: boolean;
  isLoading: boolean;
}

const RootNavigator: React.FC = () => {
  const { isSignedIn, isLoading } = useContext(AppContext) as unknown as AppContextType;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isSignedIn ? <FranchiseNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
};

export default App;
