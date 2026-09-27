import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

import { AuthProvider, useAuth } from '@syscor/shared/src/context/AuthContext';
import { ROLES, EMPLOYEE_TYPES } from '@syscor/shared/src/constants/roles';
import BootGate from '@syscor/shared/src/navigation/BootGate';
import UnsupportedRoleScreen from '@syscor/shared/src/screens/UnsupportedRoleScreen';

// Auth (solo empleados)
import LoginEmployeeScreen from './src/screens/auth/LoginEmployeeScreen';

// Mesero
import WaiterDashboardScreen from './src/screens/waiter/WaiterDashboardScreen';
import WaiterOrdersScreen from './src/screens/waiter/WaiterOrdersScreen';
import WaiterNewOrderScreen from './src/screens/waiter/WaiterNewOrderScreen';
import WaiterProfileScreen from './src/screens/waiter/WaiterProfileScreen';
import EmployeeTabBar from './src/components/commons/EmployeeTabBar';
import { fontAssets } from './src/styles/fonts';

// Cocina
import Orders from './src/screens/chef/Orders';
import KitchenHistoryScreen from './src/screens/chef/KitchenHistoryScreen';
import KitchenProfileScreen from './src/screens/chef/KitchenProfileScreen';

// Reparto
import DeliveryNavigator from './src/navigation/DeliveryNavigator';

const AuthStack = createNativeStackNavigator();
const WaiterStack = createNativeStackNavigator();
const WaiterTab = createBottomTabNavigator();
const KitchenTab = createBottomTabNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="EmployeeLogin" component={LoginEmployeeScreen} />
    </AuthStack.Navigator>
  );
}

function WaiterTabNavigator() {
  return (
    <WaiterTab.Navigator
      tabBar={(props) => <EmployeeTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <WaiterTab.Screen
        name="Dashboard"
        component={WaiterDashboardScreen}
        options={{ tabBarLabel: 'Mesas', tabBarIcon: 'table_restaurant' }}
      />
      <WaiterTab.Screen
        name="Orders"
        component={WaiterOrdersScreen}
        options={{ tabBarLabel: 'Comandas', tabBarIcon: 'receipt_long' }}
      />
      <WaiterTab.Screen
        name="Profile"
        component={WaiterProfileScreen}
        options={{ tabBarLabel: 'Perfil', tabBarIcon: 'person' }}
      />
    </WaiterTab.Navigator>
  );
}

function WaiterNavigator() {
  return (
    <WaiterStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F7F3E9' } }}>
      <WaiterStack.Screen name="WaiterTabs" component={WaiterTabNavigator} />
      <WaiterStack.Screen
        name="NewOrder"
        component={WaiterNewOrderScreen}
        options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
      />
    </WaiterStack.Navigator>
  );
}

function KitchenTabNavigator() {
  return (
    <KitchenTab.Navigator
      tabBar={(props) => <EmployeeTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <KitchenTab.Screen
        name="Dashboard"
        component={Orders}
        options={{ tabBarLabel: 'Comandas', tabBarIcon: 'receipt_long' }}
      />
      <KitchenTab.Screen
        name="History"
        component={KitchenHistoryScreen}
        options={{ tabBarLabel: 'Historial', tabBarIcon: 'history' }}
      />
      <KitchenTab.Screen
        name="Profile"
        component={KitchenProfileScreen}
        options={{ tabBarLabel: 'Perfil', tabBarIcon: 'person' }}
      />
    </KitchenTab.Navigator>
  );
}

function RootNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F0EB' }}>
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  if (!isAuthenticated) return <AuthNavigator />;

  // Esta app es exclusiva de empleados: un cliente autenticado debe usar la app de clientes.
  if (user.role === ROLES.EMPLOYEE) {
    if (user.type === EMPLOYEE_TYPES.WAITER) return <WaiterNavigator />;
    if (user.type === EMPLOYEE_TYPES.KITCHEN) return <KitchenTabNavigator />;
    if (user.type === EMPLOYEE_TYPES.DELIVERY) return <DeliveryNavigator />;
  }

  return <UnsupportedRoleScreen />;
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <BootGate>
          <NavigationContainer>
            <StatusBar style="dark" />
            <RootNavigator />
          </NavigationContainer>
        </BootGate>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
