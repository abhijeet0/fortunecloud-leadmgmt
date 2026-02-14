import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authEventEmitter} from '../services/authEvents';
import {setAuthToken} from '../services/api';
import {USE_MOCK_AUTH} from '../config';
import {
  initializeNotifications,
  setupForegroundNotifications,
  setupTokenRefreshListener,
} from '../services/notifications';
import type {User} from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const logoutRef = useRef<() => Promise<void>>();

  const logout = useCallback(async () => {
    // Only try Firebase signOut in non-mock mode
    if (!USE_MOCK_AUTH) {
      try {
        const auth = (await import('@react-native-firebase/auth')).default;
        await auth().signOut();
      } catch (e) {
        console.warn('Firebase signout error (non-critical):', e);
      }
    }
    setAuthToken(null);
    setUser(null);
    await AsyncStorage.multiRemove(['user', 'token']);
  }, []);

  // Keep ref updated so the event listener always calls latest logout
  logoutRef.current = logout;

  // Listen for 401 unauthorized events from API interceptor
  useEffect(() => {
    const unsubscribe = authEventEmitter.on('unauthorized', () => {
      logoutRef.current?.();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const storedToken = await AsyncStorage.getItem('token');
      if (storedUser && storedToken) {
        setAuthToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Re-register FCM token on app restart (non-blocking)
        initializeNotifications().catch(() => {});
      }
    } catch (e) {
      console.error('Failed to load user from storage:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (userData: User, token: string) => {
    // Set in-memory token SYNCHRONOUSLY so the very first API call after
    // setUser() already has the token (avoids AsyncStorage async race).
    setAuthToken(token);
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    // Register for push notifications after login (non-blocking)
    initializeNotifications().catch(() => {});
  }, []);

  // Set up foreground notification listener & token refresh when user is logged in
  useEffect(() => {
    if (!user) {
      return;
    }
    const unsubForeground = setupForegroundNotifications();
    const unsubTokenRefresh = setupTokenRefreshListener();
    return () => {
      unsubForeground();
      unsubTokenRefresh();
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{user, login, logout, loading}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
