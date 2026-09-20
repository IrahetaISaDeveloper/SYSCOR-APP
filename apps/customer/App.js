import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AuthProvider, useAuth } from '@syscor/shared/src/context/AuthContext';
import { ROLES } from '@syscor/shared/src/constants/roles';
import AppTabBar from '@syscor/shared/src/navigation/AppTabBar';
import BootGate from '@syscor/shared/src/navigation/BootGate';
import UnsupportedRoleScreen from '@syscor/shared/src/screens/UnsupportedRoleScreen';

import { CartProvider } from './src/context/CartContext';

// Auth (solo cliente)
import LoginCustomerScreen from './src/screens/auth/LoginCustomerScreen';
import RegisterCustomerScreen from './src/screens/auth/RegisterCustomerScreen';
import CustomerCodeVerificationScreen from './src/screens/auth/CustomerCodeVerificationScreen';
import VerifiedSuccessScreen from './src/screens/auth/VerifiedSuccessScreen';
import RequestRecoveryCodeScreen from './src/screens/auth/RequestRecoveryCodeScreen';
import VerifyRecoveryCodeScreen from './src/screens/auth/VerifyRecoveryCodeScreen';
import ResetPasswordScreen from './src/screens/auth/ResetPasswordScreen';

// Pantallas del cliente
import CustomerMenu from './src/screens/CustomerMenu';
import CartScreen from './src/screens/CartScreen';
import CustomerProfileScreen from './src/screens/CustomerProfileScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';
import PaymentScreenWrapper from './src/screens/PaymentScreenWrapper';

const AuthStack = createNativeStackNavigator();
const CustomerStack = createNativeStackNavigator();
const CustomerTab = createBottomTabNavigator();

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
    </AuthStack.Navigator>
  );
}

function CustomerTabNavigator() {
  return (
    <CustomerTab.Navigator
      tabBar={(props) => <AppTabBar {...props} accentColor="#C62828" />}
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

  // Esta app es exclusiva de clientes: un empleado autenticado debe usar la app de empleados.
  if (user.role === ROLES.CUSTOMER) return <CustomerRootNavigator />;

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
