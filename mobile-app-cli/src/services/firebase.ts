import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

export const setupPushNotifications = async (): Promise<string | null> => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const token = await messaging().getToken();
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error setting up push notifications:', error);
    return null;
  }
};

export const sendPhoneOTP = async (phoneNumber: string): Promise<FirebaseAuthTypes.ConfirmationResult> => {
  try {
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    const confirmationResult = await auth().signInWithPhoneNumber(formattedPhone);
    return confirmationResult;
  } catch (error) {
    throw error;
  }
};

export const verifyPhoneOTP = async (
  confirmationResult: FirebaseAuthTypes.ConfirmationResult,
  otp: string
): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    const userCredential = await confirmationResult.confirm(otp);
    return userCredential;
  } catch (error) {
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    return userCredential;
  } catch (error) {
    throw error;
  }
};

export const signUpWithEmail = async (
  email: string,
  password: string
): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    return userCredential;
  } catch (error) {
    throw error;
  }
};

export { auth };
