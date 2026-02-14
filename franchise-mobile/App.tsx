import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {AuthProvider} from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import {setupBackgroundNotifications} from './src/services/notifications';

// Must be called outside of React component tree per Firebase docs
setupBackgroundNotifications();

function App(): JSX.Element {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

export default App;
