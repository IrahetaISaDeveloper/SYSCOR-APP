import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@syscor/shared/src/context/AuthContext';
import { ROLES, EMPLOYEE_TYPES } from '@syscor/shared/src/constants/roles';
import AppTabBar from '@syscor/shared/src/navigation/AppTabBar';
import BootGate from '@syscor/shared/src/navigation/BootGate';
import UnsupportedRoleScreen from '@syscor/shared/src/screens/UnsupportedRoleScreen';

// Auth (solo empleados)
import LoginEmployeeScreen from './src/screens/auth/LoginEmployeeScreen';

// Mesero
import WaiterDashboardScreen from './src/screens/waiter/WaiterDashboardScreen';
import WaiterProfileScreen from './src/screens/waiter/WaiterProfileScreen';

// Cocina
import Orders from './src/screens/chef/Orders';
import KitchenProfileScreen from './src/screens/chef/KitchenProfileScreen';

const AuthStack = createNativeStackNavigator();
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
      tabBar={(props) => <AppTabBar {...props} accentColor="#8E2222" />}
      screenOptions={{ headerShown: false }}
    >
      <WaiterTab.Screen
        name="Dashboard"
        component={WaiterDashboardScreen}
        options={{ tabBarLabel: 'Mesas', tabBarIcon: 'restaurant-outline' }}
      />
      <WaiterTab.Screen
        name="Profile"
        component={WaiterProfileScreen}
        options={{ tabBarLabel: 'Mi perfil', tabBarIcon: 'person-outline' }}
      />
    </WaiterTab.Navigator>
  );
}

function KitchenTabNavigator() {
  return (
    <KitchenTab.Navigator
      tabBar={(props) => <AppTabBar {...props} accentColor="#8E2222" />}
      screenOptions={{ headerShown: false }}
    >
      <KitchenTab.Screen
        name="Dashboard"
        component={Orders}
        options={{ tabBarLabel: 'Comandas', tabBarIcon: 'receipt-outline' }}
      />
      <KitchenTab.Screen
        name="Profile"
        component={KitchenProfileScreen}
        options={{ tabBarLabel: 'Perfil', tabBarIcon: 'person-outline' }}
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
    if (user.type === EMPLOYEE_TYPES.WAITER) return <WaiterTabNavigator />;
    if (user.type === EMPLOYEE_TYPES.KITCHEN) return <KitchenTabNavigator />;
  }

  return <UnsupportedRoleScreen />;
}

export default function App() {
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
