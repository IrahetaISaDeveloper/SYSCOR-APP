import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, useColorScheme } from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

import { AuthProvider, useAuth } from '@syscor/shared/src/context/AuthContext';
import { fontAssets } from '@syscor/shared/src/styles/typography';
import { getMenuColors } from './src/styles/CustomerMenu';
import { ROLES } from '@syscor/shared/src/constants/roles';
import CustomerTabBar from './src/navigation/CustomerTabBar';
import CustomerBootGate from './src/navigation/CustomerBootGate';
import UnsupportedRoleScreen from '@syscor/shared/src/screens/UnsupportedRoleScreen';

import { CartProvider } from './src/context/CartContext';
import { TabBarVisibilityProvider } from './src/context/TabBarVisibilityContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { PreferencesProvider } from './src/context/PreferencesContext';
import { PanchitaProvider } from './src/context/PanchitaContext';
import PanchitaAlertBanner from './src/components/PanchitaAlertBanner';
import CartAddedToast from './src/components/CartAddedToast';
import { navigationRef } from './src/navigation/navigationRef';

// Auth (solo cliente)
import LoginCustomerScreen from './src/screens/auth/LoginCustomerScreen';
import RegisterCustomerScreen from './src/screens/auth/RegisterCustomerScreen';
import CustomerCodeVerificationScreen from './src/screens/auth/CustomerCodeVerificationScreen';
import VerifiedSuccessScreen from './src/screens/auth/VerifiedSuccessScreen';
import RequestRecoveryCodeScreen from './src/screens/auth/RequestRecoveryCodeScreen';
import VerifyRecoveryCodeScreen from './src/screens/auth/VerifyRecoveryCodeScreen';
import ResetPasswordScreen from './src/screens/auth/ResetPasswordScreen';
import RegisterAddressScreen from './src/screens/auth/RegisterAddressScreen';
import TermsAndConditionsScreen from './src/screens/auth/TermsAndConditionsScreen';

// Pantallas del cliente
import CustomerMenu from './src/screens/CustomerMenu';
import CartScreen from './src/screens/CartScreen';
import MoreScreen from './src/screens/MoreScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import SavedCardsScreen from './src/screens/SavedCardsScreen';
import WalletScreen from './src/screens/WalletScreen';
import PanchitaScreen from './src/screens/PanchitaScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import AddressesScreen from './src/screens/AddressesScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';
import PaymentScreenWrapper from './src/screens/PaymentScreenWrapper';
import GuestProductDetailsScreen from './src/screens/GuestProductDetailsScreen';

const AuthStack = createNativeStackNavigator();
const CustomerStack = createNativeStackNavigator();
const CustomerTab = createBottomTabNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginCustomerScreen} />
      <AuthStack.Screen name="RegisterCustomer" component={RegisterCustomerScreen} />
      <AuthStack.Screen name="RegisterAddress" component={RegisterAddressScreen} />
      <AuthStack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
      <AuthStack.Screen name="CustomerCodeVerification" component={CustomerCodeVerificationScreen} />
      <AuthStack.Screen name="VerifiedSuccess" component={VerifiedSuccessScreen} />
      <AuthStack.Screen name="ForgotPassword" component={RequestRecoveryCodeScreen} />
      <AuthStack.Screen name="VerifyRecoveryCode" component={VerifyRecoveryCodeScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      {/* Consulta del menú sin sesión: se puede ver, pero no comprar. */}
      <AuthStack.Screen name="GuestMenu" component={CustomerMenu} />
      <AuthStack.Screen name="ProductDetails" component={GuestProductDetailsScreen} />
    </AuthStack.Navigator>
  );
}

function CustomerTabNavigator() {
  return (
    <TabBarVisibilityProvider>
      <CustomerTab.Navigator
        tabBar={(props) => <CustomerTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <CustomerTab.Screen
          name="Menu"
          component={CustomerMenu}
          options={{ tabBarLabel: 'Menú', tabBarIcon: 'restaurant' }}
        />
        <CustomerTab.Screen
          name="Orders"
          component={OrdersScreen}
          options={{ tabBarLabel: 'Pedidos', tabBarIcon: 'time-outline' }}
        />
        <CustomerTab.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{ tabBarLabel: 'Favoritos', tabBarIcon: 'heart-outline' }}
        />
        <CustomerTab.Screen
          name="Addresses"
          component={AddressesScreen}
          options={{ tabBarLabel: 'Dirección', tabBarIcon: 'location-outline' }}
        />
        <CustomerTab.Screen
          name="Cart"
          component={CartScreen}
          options={{ tabBarLabel: 'Carrito', tabBarIcon: 'cart-outline' }}
        />
        <CustomerTab.Screen
          name="More"
          component={MoreScreen}
          options={{ tabBarLabel: 'Más', tabBarIcon: 'menu-outline' }}
        />
      </CustomerTab.Navigator>
    </TabBarVisibilityProvider>
  );
}

function CustomerRootNavigator() {
  return (
    <CartProvider>
      <FavoritesProvider>
        <PanchitaProvider>
        <CustomerStack.Navigator screenOptions={{ headerShown: false }}>
          <CustomerStack.Screen name="CustomerTabs" component={CustomerTabNavigator} />
          <CustomerStack.Screen name="ProductDetails" component={ProductDetailsScreen} />
          <CustomerStack.Screen name="EditProfile" component={EditProfileScreen} />
          <CustomerStack.Screen name="SavedCards" component={SavedCardsScreen} />
          <CustomerStack.Screen name="Wallet" component={WalletScreen} />
          <CustomerStack.Screen name="Panchita" component={PanchitaScreen} />
          <CustomerStack.Screen name="PaymentVerification" component={PaymentScreenWrapper} />
        </CustomerStack.Navigator>
        {/* Avisos de Panchita encima de cualquier pantalla */}
        <PanchitaAlertBanner />
        {/* "Se agregó a tu bolsa", también encima de todo */}
        <CartAddedToast />
        </PanchitaProvider>
      </FavoritesProvider>
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

  // Sin sesión se abre el login: desde ahí se crea la cuenta o se explora el menú.
  if (!isAuthenticated) return <AuthNavigator />;

  // Esta app es exclusiva de clientes: un empleado autenticado debe usar la app de empleados.
  if (user.role === ROLES.CUSTOMER) return <CustomerRootNavigator />;

  return <UnsupportedRoleScreen />;
}

// Tema de la navegación: el fondo debe ser el de la app, no el blanco que
// React Navigation usa por defecto. Se nota al esconderse la barra inferior,
// que deja ver lo que hay debajo.
const useNavigationTheme = () => {
  const isDark = useColorScheme() === 'dark';
  const c = getMenuColors(isDark);
  const base = isDark ? DarkTheme : DefaultTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      background: c.background,
      card: c.navBackground,
      border: c.navBorder,
      primary: c.primary,
      text: c.textDark,
    },
  };
};

export default function App() {
  // Archivo / Inter / IBM Plex Mono: las mismas del sistema web. Mientras
  // cargan seguimos mostrando el splash nativo, así que no hay parpadeo de
  // texto con la fuente del sistema.
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const navigationTheme = useNavigationTheme();

  // Si una fuente no carga, la app arranca igual con la del sistema: es
  // preferible a dejar al cliente ante una pantalla en blanco.
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      {/* Va arriba de todo: el tema elegido en "Más" aplica también al login. */}
      <PreferencesProvider>
        <AuthProvider>
          <CustomerBootGate>
            <NavigationContainer ref={navigationRef} theme={navigationTheme}>
              <StatusBar style="auto" />
              <RootNavigator />
            </NavigationContainer>
          </CustomerBootGate>
        </AuthProvider>
      </PreferencesProvider>
    </SafeAreaProvider>
  );
}
