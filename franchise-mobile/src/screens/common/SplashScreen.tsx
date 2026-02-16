import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');

const SplashScreen = ({ navigation, onFinish }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigation logic
    const checkAuth = async () => {
      try {
        const userPhone = await AsyncStorage.getItem('userPhone');
        setTimeout(() => {
          if (onFinish) {
            onFinish();
          } else if (navigation) {
            if (userPhone) {
              navigation.replace('Main');
            } else {
              navigation.replace('Login');
            }
          }
        }, 2500); // Give users time to see the beautiful splash
      } catch (error) {
        if (onFinish) {
          onFinish();
        } else if (navigation) {
          navigation.replace('Login');
        }
      }
    };

    checkAuth();
  }, [fadeAnim, scaleAnim, slideAnim, navigation, onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/fortunecloud-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          {/* <Text style={styles.appName}>Fortune Cloud</Text> */}
          <Text style={styles.tagline}>Empowering Franchise Growth</Text>
        </Animated.View>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>

      {/* Background Decorative Elements */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 280,
    height: 120,
  },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  version: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '700',
    letterSpacing: 1,
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: '#2196F3',
    opacity: 0.05,
  },
  circle1: {
    width: 300,
    height: 300,
    top: -50,
    right: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: 100,
    left: -50,
  },
});

export default SplashScreen;
