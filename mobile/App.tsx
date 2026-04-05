import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { registerDevice } from './services/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PriceUpdateScreen from './screens/PriceUpdateScreen';
import NightUpdateScreen from './screens/NightUpdateScreen';

const Tab = createBottomTabNavigator();

const theme = {
  colors: {
    primary: '#b88a5f',
    accent: '#d4a574',
    background: '#f9f7f4',
    surface: '#ffffff',
    error: '#ef5350',
    text: '#1a1a1a',
    onSurface: '#333333',
    disabled: '#bdbdbd',
  },
};

export default function App() {
  useEffect(() => {
    // Request permissions so the upper banner works on iOS/Android
    const setupNotifications = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        return;
      }

      // Try to get the raw FCM/APNs token for Firebase
      try {
        const token = await Notifications.getDevicePushTokenAsync();
        if (token && token.data) {
          // Send it to your python backend
          await registerDevice(token.data);
        }
      } catch (e) {
        console.log("Could not obtain or register push token:", e);
      }
    };
    
    setupNotifications();
  }, []);

  return (
    <PaperProvider theme={{ colors: theme.colors }}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'PriceUpdate') {
                iconName = focused ? 'currency-inr' : 'currency-inr';
              } else if (route.name === 'NightUpdate') {
                iconName = focused ? 'moon-waning-crescent' : 'moon-waning-crescent';
              }
              return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#b88a5f',
            tabBarInactiveTintColor: '#999999',
            tabBarStyle: {
              backgroundColor: '#ffffff',
              borderTopColor: '#e0e0e0',
              borderTopWidth: 1,
              paddingTop: 8,
              paddingBottom: 8,
            },
            tabBarLabel: route.name === 'PriceUpdate' ? 'Price Update' : 'Night Update',
          })}
        >
          <Tab.Screen
            name="PriceUpdate"
            component={PriceUpdateScreen}
            options={{
              title: 'Price Update',
            }}
          />
          <Tab.Screen
            name="NightUpdate"
            component={NightUpdateScreen}
            options={{
              title: 'Night Update',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
