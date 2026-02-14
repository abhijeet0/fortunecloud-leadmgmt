import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import {Platform, Alert, PermissionsAndroid} from 'react-native';
import {notificationService} from './api';

type RemoteMessage = FirebaseMessagingTypes['RemoteMessage'];

/**
 * Request push notification permissions from the user.
 * Returns true if permission was granted.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (result !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Android notification permission denied');
        return false;
      }
    }

    const authStatus = await messaging().requestPermission();
    // AuthorizationStatus: 1 = AUTHORIZED, 2 = PROVISIONAL
    const enabled = authStatus === 1 || authStatus === 2;

    if (!enabled) {
      console.log('FCM notification permission not granted');
    }
    return enabled;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Get the FCM device token and register it with the backend.
 */
export async function registerDeviceToken(): Promise<void> {
  try {
    const token = await messaging().getToken();
    if (!token) {
      console.warn('FCM token is empty');
      return;
    }

    const deviceName = `${Platform.OS}-${Platform.Version}`;
    await notificationService.registerDeviceToken(token, deviceName);
    console.log('FCM device token registered successfully');
  } catch (error) {
    // Non-critical — don't block app flow
    console.warn('Failed to register FCM device token:', error);
  }
}

/**
 * Set up foreground notification handler.
 * Returns an unsubscribe function.
 */
export function setupForegroundNotifications(): () => void {
  return messaging().onMessage(async (remoteMessage: RemoteMessage) => {
    const title = remoteMessage.notification?.title || 'Fortune Cloud';
    const body = remoteMessage.notification?.body || '';

    Alert.alert(title, body);
  });
}

/**
 * Set up background/quit notification handler.
 * Call this at app startup (outside of React component tree).
 */
export function setupBackgroundNotifications(): void {
  messaging().setBackgroundMessageHandler(
    async (remoteMessage: RemoteMessage) => {
      console.log(
        'Background notification received:',
        remoteMessage.notification?.title,
      );
    },
  );
}

/**
 * Listen for token refresh events and re-register with backend.
 * Returns an unsubscribe function.
 */
export function setupTokenRefreshListener(): () => void {
  return messaging().onTokenRefresh(async (newToken: string) => {
    try {
      const deviceName = `${Platform.OS}-${Platform.Version}`;
      await notificationService.registerDeviceToken(newToken, deviceName);
      console.log('Refreshed FCM token registered');
    } catch (error) {
      console.warn('Failed to register refreshed FCM token:', error);
    }
  });
}

/**
 * Initialize all notification services after user login.
 * Call this once after successful authentication.
 */
export async function initializeNotifications(): Promise<void> {
  const permissionGranted = await requestNotificationPermission();
  if (permissionGranted) {
    await registerDeviceToken();
  }
}
