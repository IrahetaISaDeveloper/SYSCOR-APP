import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

import { AuthProvider, useAuth } from '@syscor/shared/src/context/AuthContext';
import { ROLES, EMPLOYEE_TYPES } from '@syscor/shared/src/constants/roles';
import { fontAssets as authFontAssets } from '@syscor/shared/src/styles/typography';
import EmployeeBootGate from './src/navigation/EmployeeBootGate';
import UnsupportedRoleScreen from '@syscor/shared/src/screens/UnsupportedRoleScreen';

// Auth (solo empleados)
import LoginEmployeeScreen from './src/screens/auth/LoginEmployeeScreen';
import RequestRecoveryCodeScreen from './src/screens/auth/RequestRecoveryCodeScreen';
import VerifyRecoveryCodeScreen from './src/screens/auth/VerifyRecoveryCodeScreen';
import ResetPasswordScreen from './src/screens/auth/ResetPasswordScreen';

// Mesero
import WaiterDashboardScreen from './src/screens/waiter/WaiterDashboardScreen';
import WaiterOrdersScreen from './src/screens/waiter/WaiterOrdersScreen';
import WaiterMenuScreen from './src/screens/waiter/WaiterMenuScreen';
import WaiterProfileScreen from './src/screens/waiter/WaiterProfileScreen';
import EmployeeTabBar from './src/components/commons/EmployeeTabBar';
import WaiterTabBar from './src/components/waiter/WaiterTabBar';
import { fontAssets } from './src/styles/fonts';
import { ThemeModeProvider, useTheme } from './src/theme/ThemeContext';

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
    <AuthStack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginEmployeeScreen} />
      <AuthStack.Screen name="ForgotPassword" component={RequestRecoveryCodeScreen} />
      <AuthStack.Screen name="VerifyRecoveryCode" component={VerifyRecoveryCodeScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function WaiterTabNavigator() {
  // Mesas va al centro, en el botón elevado (ver WaiterTabBar).
  return (
    <WaiterTab.Navigator
      initialRouteName="Dashboard"
      tabBar={(props) => <WaiterTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <WaiterTab.Screen
        name="Orders"
        component={WaiterOrdersScreen}
        options={{ tabBarLabel: 'Comandas', tabBarIcon: 'receipt-outline' }}
      />
      <WaiterTab.Screen
        name="Dashboard"
        component={WaiterDashboardScreen}
        options={{ tabBarLabel: 'Mesas', tabBarIcon: 'table-furniture', tabBarIconSet: 'material-community', tabBarCenter: true }}
      />
      <WaiterTab.Screen
        name="Profile"
        component={WaiterProfileScreen}
        options={{ tabBarLabel: 'Perfil', tabBarIcon: 'person-outline' }}
      />
    </WaiterTab.Navigator>
  );
}

function WaiterNavigator() {
  const { p } = useTheme();
  return (
    <WaiterStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: p.bg } }}>
      <WaiterStack.Screen name="WaiterTabs" component={WaiterTabNavigator} />
      <WaiterStack.Screen
        name="NewOrder"
        component={WaiterMenuScreen}
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
  const { p } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: p.bg }}>
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
  // DM Sans/Mono para las pantallas de trabajo y el juego compartido
  // (Archivo, Inter, IBM Plex Mono) para la introducción y el login.
  const [fontsLoaded, fontError] = useFonts({ ...fontAssets, ...authFontAssets });

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ThemeModeProvider>
        <AuthProvider>
          <EmployeeBootGate>
            <ThemedNavigation />
          </EmployeeBootGate>
        </AuthProvider>
      </ThemeModeProvider>
    </SafeAreaProvider>
  );
}

// El tema de React Navigation pinta el fondo entre pantallas y durante las
// transiciones; sin esto se ve un destello blanco en modo oscuro.
function ThemedNavigation() {
  const { isDark, c, p } = useTheme();
  const base = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: { ...base.colors, primary: c.primary, background: p.bg, card: p.surface, text: p.ink, border: p.line },
  };
  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </NavigationContainer>
  );
}
