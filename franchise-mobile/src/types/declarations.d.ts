declare module 'react-native-vector-icons/MaterialIcons' {
  import {Component} from 'react';
  import {TextStyle, ViewStyle} from 'react-native';

  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: TextStyle | ViewStyle;
  }

  class Icon extends Component<IconProps> {}
  export default Icon;
}

declare module '@react-native-firebase/messaging' {
  export interface FirebaseMessagingTypes {
    RemoteMessage: {
      notification?: {
        title?: string;
        body?: string;
      };
      data?: {[key: string]: string};
    };
  }

  interface Messaging {
    requestPermission(): Promise<number>;
    getToken(): Promise<string>;
    onMessage(
      listener: (
        remoteMessage: FirebaseMessagingTypes['RemoteMessage'],
      ) => void,
    ): () => void;
    onTokenRefresh(listener: (token: string) => void): () => void;
    setBackgroundMessageHandler(
      handler: (
        remoteMessage: FirebaseMessagingTypes['RemoteMessage'],
      ) => Promise<void>,
    ): void;
  }

  export default function messaging(): Messaging;
}
