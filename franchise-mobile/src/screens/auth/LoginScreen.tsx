import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {GOOGLE_WEB_CLIENT_ID} from '../../config';
import {authService} from '../../services/api';
import {useAuth} from '../../context/AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginScreen = ({navigation}: any) => {
  const {login} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
    });
  }, []);

  const loginWithFirebaseToken = async (idToken: string) => {
    const response = await authService.login(idToken);
    const {token, franchise} = response.data;
    await login(franchise, token);
  };

  const handleLogin = async () => {
    if (!EMAIL_REGEX.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const auth = (await import('@react-native-firebase/auth')).default;
      const userCredential = await auth().signInWithEmailAndPassword(email.trim(), password);
      const idToken = await userCredential.user.getIdToken(true);
      await loginWithFirebaseToken(idToken);
    } catch (error: any) {
      console.error('Login error:', error);
      const backendError = error.response?.data?.error;
      if (backendError === 'Franchise not found') {
        Alert.alert(
          'Account Not Found',
          "You don't have a franchise account yet. Please sign up first.",
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Go to Signup', onPress: () => navigation.navigate('Signup')},
          ],
        );
      } else {
        Alert.alert('Login Error', backendError || error.message || 'Failed to login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      await GoogleSignin.signOut().catch(() => {});
      const googleResult: any = await GoogleSignin.signIn();
      const idToken = googleResult?.idToken || googleResult?.data?.idToken;
      if (!idToken) {
        throw new Error('Google ID token not found');
      }

      const auth = (await import('@react-native-firebase/auth')).default;
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const firebaseIdToken = await userCredential.user.getIdToken(true);

      await loginWithFirebaseToken(firebaseIdToken);
    } catch (error: any) {
      const backendError = error.response?.data?.error;
      if (backendError === 'Franchise not found') {
        const auth = (await import('@react-native-firebase/auth')).default;
        const currentUser = auth().currentUser;
        Alert.alert(
          'Complete Signup',
          'Google account found, but franchise profile is missing. Please complete signup.',
          [
            {
              text: 'Continue',
              onPress: () =>
                navigation.navigate('Signup', {
                  prefillEmail: currentUser?.email || '',
                  prefillOwnerName: currentUser?.displayName || '',
                }),
            },
          ],
        );
      } else {
        Alert.alert('Google Login Error', backendError || error.message || 'Google login failed');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <View style={styles.headerSection}>
          <Image
            source={require('../../assets/fortunecloud-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in with email or Google</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Icon name="email" size={22} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#A0AEC0"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Icon name="lock" size={22} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor="#A0AEC0"
                secureTextEntry
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading || googleLoading}
            activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Login</Text>
                <Icon name="arrow-forward" size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>

          <TouchableOpacity
            style={[styles.googleButton, googleLoading && styles.buttonDisabled]}
            onPress={handleGoogleLogin}
            disabled={loading || googleLoading}
            activeOpacity={0.8}>
            {googleLoading ? (
              <ActivityIndicator color="#334155" />
            ) : (
              <View style={styles.buttonContent}>
                <Icon name="g-translate" size={20} color="#334155" />
                <Text style={styles.googleText}>Continue with Google</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.linkText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')} disabled={loading || googleLoading}>
            <Text style={styles.linkAction}>Create account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FFFFFF'},
  inner: {flex: 1, padding: 24, justifyContent: 'center'},
  headerSection: {alignItems: 'center', marginBottom: 48},
  logoImage: {width: 220, height: 95, marginBottom: 20},
  title: {fontSize: 32, fontWeight: '800', color: '#1A202C', marginBottom: 8},
  subtitle: {
    fontSize: 15,
    color: '#718096',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputGroup: {marginBottom: 16},
  label: {fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 10, marginLeft: 4},
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {marginRight: 10},
  input: {flex: 1, fontSize: 16, color: '#1E293B', fontWeight: '600'},
  button: {
    backgroundColor: '#2196F3',
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#2196F3',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 8,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 2,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  orText: {
    marginHorizontal: 10,
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  googleButton: {
    backgroundColor: '#F8FAFC',
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  googleText: {color: '#334155', fontSize: 15, fontWeight: '700', marginLeft: 8},
  buttonDisabled: {backgroundColor: '#E2E8F0', shadowOpacity: 0, elevation: 0},
  buttonContent: {flexDirection: 'row', alignItems: 'center'},
  buttonText: {color: '#fff', fontSize: 16, fontWeight: '800', marginRight: 8},
  footer: {flexDirection: 'row', justifyContent: 'center', marginTop: 32},
  linkText: {fontSize: 16, color: '#718096', fontWeight: '500'},
  linkAction: {fontSize: 16, color: '#2196F3', fontWeight: '700'},
});

export default LoginScreen;
