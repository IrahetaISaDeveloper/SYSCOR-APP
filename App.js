import React from 'react';
import { SafeAreaView, StatusBar, ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginEmployeeScreen from './src/screens/auth/LoginEmployeeScreen';
import WaiterRootNavigator from './src/screens/waiter/WaiterRootNavigator';
function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F0EB' }}>
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {isAuthenticated ? <WaiterRootNavigator  /> : <LoginEmployeeScreen />}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}