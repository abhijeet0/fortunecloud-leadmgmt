import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Franchise {
  id: string;
  firebaseUid: string;
  phone: string;
  franchiseName: string;
  email: string;
  [key: string]: any;
}

export interface AppContextType {
  franchise: Franchise | null;
  token: string | null;
  isLoading: boolean;
  login: (franchiseData: Franchise, authToken: string) => Promise<void>;
  logout: () => Promise<void>;
  isSignedIn: boolean;
}

export const AppContext = createContext<AppContextType>({
  franchise: null,
  token: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  isSignedIn: false,
});

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [franchise, setFranchise] = useState<Franchise | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async (): Promise<void> => {
    try {
      const storedToken = await AsyncStorage.getItem('franchiseToken');
      const storedFranchise = await AsyncStorage.getItem('franchise');

      if (storedToken) {
        setToken(storedToken);
        setFranchise(storedFranchise ? JSON.parse(storedFranchise) : null);
      }
    } catch (err) {
      console.error('Failed to restore session', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (franchiseData: Franchise, authToken: string): Promise<void> => {
    setToken(authToken);
    setFranchise(franchiseData);
    await AsyncStorage.setItem('franchiseToken', authToken);
    await AsyncStorage.setItem('franchise', JSON.stringify(franchiseData));
  };

  const logout = async (): Promise<void> => {
    setToken(null);
    setFranchise(null);
    await AsyncStorage.removeItem('franchiseToken');
    await AsyncStorage.removeItem('franchise');
  };

  const value: AppContextType = {
    franchise,
    token,
    isLoading,
    login,
    logout,
    isSignedIn: !!token,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
