import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';

import LoginEmployeeScreen from './src/screens/auth/LoginEmployeeScreen';
import WaiterDashboardScreen from './src/screens/waiter/WaiterDashboardScreen';
import WaiterProfileScreen from './src/screens/waiter/WaiterProfileScreen';

import RequestRecoveryCodeScreen from './src/screens/auth/RequestRecoveryCodeScreen';
import VerifyRecoveryCodeScreen from './src/screens/auth/VerifyRecoveryCodeScreen';
import ResetPasswordScreen from './src/screens/auth/ResetPasswordScreen';

import Orders from './src/screens/Orders';
import KitchenProfileScreen from './src/screens/chef/KitchenProfileScreen'; // <-- nuevo import

const AuthStack = createNativeStackNavigator();
const WaiterStack = createNativeStackNavigator();
const KitchenStack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginEmployeeScreen} />
      <AuthStack.Screen name="RequestRecoveryCode" component={RequestRecoveryCodeScreen} />
      <AuthStack.Screen name="VerifyRecoveryCode" component={VerifyRecoveryCodeScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function WaiterNavigator() {
  return (
    <WaiterStack.Navigator screenOptions={{ headerShown: false }}>
      <WaiterStack.Screen name="Dashboard" component={WaiterDashboardScreen} />
      <WaiterStack.Screen name="Profile" component={WaiterProfileScreen} />
    </WaiterStack.Navigator>
  );
}

function KitchenNavigator() {
  return (
    <KitchenStack.Navigator screenOptions={{ headerShown: false }}>
      <KitchenStack.Screen name="Dashboard" component={Orders} />
      <KitchenStack.Screen name="Profile" component={KitchenProfileScreen} />
    </KitchenStack.Navigator>
  );
}

// Decide qué stack de navegación mostrar según rol/puesto
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

  if (user.role === 'employee') {
    if (user.type === 'waiter') return <WaiterNavigator />;
    if (user.type === 'kitchen') return <KitchenNavigator />;
    return <UnsupportedRoleScreen />;
  }

  return <UnsupportedRoleScreen />;
}

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
