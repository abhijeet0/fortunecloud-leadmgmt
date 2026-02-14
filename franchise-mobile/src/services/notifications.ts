import {Platform, Alert, PermissionsAndroid} from 'react-native';
import {notificationService} from './api';

/**
 * Safely get Firebase messaging instance.
 * Returns null if Firebase is not available (mock auth mode).
 */
function getMessaging() {
  try {
    const messaging = require('@react-native-firebase/messaging').default;
    return messaging();
  } catch (e) {
    console.warn('Firebase Messaging not available (mock mode)');
    return null;
  }
}

/**
 * Request push notification permissions from the user.
 * Returns true if permission was granted.
 * In mock mode, skips Firebase permission request.
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

    const msg = getMessaging();
    if (!msg) {
      return false;
    }

    const authStatus = await msg.requestPermission();
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
    const msg = getMessaging();
    if (!msg) {
      return;
    }

    const token = await msg.getToken();
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
  try {
    const msg = getMessaging();
    if (!msg) {
      return () => {};
    }

    return msg.onMessage(async (remoteMessage: any) => {
      const title = remoteMessage.notification?.title || 'Fortune Cloud';
      const body = remoteMessage.notification?.body || '';
      Alert.alert(title, body);
    });
  } catch (error) {
    console.warn('Failed to setup foreground notifications:', error);
    return () => {};
  }
}

/**
 * Set up background/quit notification handler.
 * Call this at app startup (outside of React component tree).
 */
export function setupBackgroundNotifications(): void {
  try {
    const msg = getMessaging();
    if (!msg) {
      return;
    }

    msg.setBackgroundMessageHandler(async (remoteMessage: any) => {
      console.log(
        'Background notification received:',
        remoteMessage.notification?.title,
      );
    });
  } catch (error) {
    console.warn('Failed to setup background notifications:', error);
  }
}

/**
 * Listen for token refresh events and re-register with backend.
 * Returns an unsubscribe function.
 */
export function setupTokenRefreshListener(): () => void {
  try {
    const msg = getMessaging();
    if (!msg) {
      return () => {};
    }

    return msg.onTokenRefresh(async (newToken: string) => {
      try {
        const deviceName = `${Platform.OS}-${Platform.Version}`;
        await notificationService.registerDeviceToken(newToken, deviceName);
        console.log('Refreshed FCM token registered');
      } catch (error) {
        console.warn('Failed to register refreshed FCM token:', error);
      }
    });
  } catch (error) {
    console.warn('Failed to setup token refresh listener:', error);
    return () => {};
  }
}

/**
 * Initialize all notification services after user login.
 * Call this once after successful authentication.
 * Safe to call in mock mode — will no-op.
 */
export async function initializeNotifications(): Promise<void> {
  const permissionGranted = await requestNotificationPermission();
  if (permissionGranted) {
    await registerDeviceToken();
  }
}
