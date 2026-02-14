import {NativeEventEmitter, NativeModules, Platform} from 'react-native';

type AuthEventType = 'unauthorized';
type AuthEventCallback = () => void;

class AuthEventEmitter {
  private listeners: Map<AuthEventType, Set<AuthEventCallback>> = new Map();

  on(event: AuthEventType, callback: AuthEventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  emit(event: AuthEventType): void {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback();
      } catch (e) {
        console.error('AuthEventEmitter callback error:', e);
      }
    });
  }
}

export const authEventEmitter = new AuthEventEmitter();
