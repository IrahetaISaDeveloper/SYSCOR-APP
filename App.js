import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { ROLES, EMPLOYEE_TYPES } from './src/constants/roles';
import AppTabBar from './src/navigation/AppTabBar';
import BootGate from './src/navigation/BootGate';

// Auth
import LoginCustomerScreen from './src/screens/auth/LoginCustomerScreen';
import RegisterCustomerScreen from './src/screens/auth/RegisterCustomerScreen';
import CustomerCodeVerificationScreen from './src/screens/auth/CustomerCodeVerificationScreen';
import VerifiedSuccessScreen from './src/screens/auth/VerifiedSuccessScreen';
import RequestRecoveryCodeScreen from './src/screens/auth/RequestRecoveryCodeScreen';
import VerifyRecoveryCodeScreen from './src/screens/auth/VerifyRecoveryCodeScreen';
import ResetPasswordScreen from './src/screens/auth/ResetPasswordScreen';
import LoginEmployeeScreen from './src/screens/auth/LoginEmployeeScreen';

// Customer
import CustomerMenu from './src/screens/CustomerMenu';
import CartScreen from './src/screens/customer/CartScreen';
import CustomerProfileScreen from './src/screens/customer/CustomerProfileScreen';
import ProductDetailsScreen from './src/screens/customer/ProductDetailsScreen';
import PaymentScreenWrapper from './src/screens/customer/PaymentScreenWrapper';

// Waiter
import WaiterDashboardScreen from './src/screens/waiter/WaiterDashboardScreen';
import WaiterProfileScreen from './src/screens/waiter/WaiterProfileScreen';

// Kitchen
import Orders from './src/screens/Orders';
import KitchenProfileScreen from './src/screens/chef/KitchenProfileScreen';

import UnsupportedRoleScreen from './src/screens/UnsupportedRoleScreen';

const AuthStack = createNativeStackNavigator();
const CustomerStack = createNativeStackNavigator();
const CustomerTab = createBottomTabNavigator();
const WaiterTab = createBottomTabNavigator();
const KitchenTab = createBottomTabNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginCustomerScreen} />
      <AuthStack.Screen name="RegisterCustomer" component={RegisterCustomerScreen} />
      <AuthStack.Screen name="CustomerCodeVerification" component={CustomerCodeVerificationScreen} />
      <AuthStack.Screen name="VerifiedSuccess" component={VerifiedSuccessScreen} />
      <AuthStack.Screen name="ForgotPassword" component={RequestRecoveryCodeScreen} />
      <AuthStack.Screen name="VerifyRecoveryCode" component={VerifyRecoveryCodeScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <AuthStack.Screen name="EmployeeLogin" component={LoginEmployeeScreen} />
    </AuthStack.Navigator>
  );
}

function CustomerTabNavigator() {
  return (
    <CustomerTab.Navigator
      tabBar={(props) => <AppTabBar {...props} accentColor="#E74C3C" />}
      screenOptions={{ headerShown: false }}
    >
      <CustomerTab.Screen
        name="Menu"
        component={CustomerMenu}
        options={{ tabBarLabel: 'Menú', tabBarIcon: 'restaurant' }}
      />
      <CustomerTab.Screen
        name="Cart"
        component={CartScreen}
        options={{ tabBarLabel: 'Carrito', tabBarIcon: 'cart-outline' }}
      />
      <CustomerTab.Screen
        name="Profile"
        component={CustomerProfileScreen}
        options={{ tabBarLabel: 'Perfil', tabBarIcon: 'person-outline' }}
      />
    </CustomerTab.Navigator>
  );
}

function CustomerRootNavigator() {
  return (
    <CartProvider>
      <CustomerStack.Navigator screenOptions={{ headerShown: false }}>
        <CustomerStack.Screen name="CustomerTabs" component={CustomerTabNavigator} />
        <CustomerStack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <CustomerStack.Screen name="PaymentVerification" component={PaymentScreenWrapper} />
      </CustomerStack.Navigator>
    </CartProvider>
  );
}

function WaiterTabNavigator() {
  return (
    <WaiterTab.Navigator
      tabBar={(props) => <AppTabBar {...props} accentColor="#E74C3C" />}
      screenOptions={{ headerShown: false }}
    >
      <WaiterTab.Screen
        name="Dashboard"
        component={WaiterDashboardScreen}
        options={{ tabBarLabel: 'Mesas', tabBarIcon: 'grid-outline' }}
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
      tabBar={(props) => <AppTabBar {...props} accentColor="#3498DB" />}
      screenOptions={{ headerShown: false }}
    >
      <KitchenTab.Screen
        name="Dashboard"
        component={Orders}
        options={{ tabBarLabel: 'Dashboard', tabBarIcon: 'grid' }}
      />
      <KitchenTab.Screen
        name="Profile"
        component={KitchenProfileScreen}
        options={{ tabBarLabel: 'Perfil', tabBarIcon: 'person-outline' }}
      />
    </KitchenTab.Navigator>
  );
}

// Decide qué stack de navegación mostrar según sesión y rol/puesto
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

  if (user.role === ROLES.CUSTOMER) {
    return <CustomerRootNavigator />;
  }

  if (user.role === ROLES.EMPLOYEE) {
    if (user.type === EMPLOYEE_TYPES.WAITER) return <WaiterTabNavigator />;
    if (user.type === EMPLOYEE_TYPES.KITCHEN) return <KitchenTabNavigator />;
  }

  return <UnsupportedRoleScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <BootGate>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </BootGate>
    </AuthProvider>
  );
}
