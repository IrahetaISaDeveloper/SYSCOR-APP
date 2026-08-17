import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import ProfileHeader from '../../components/commons/ProfileHeader';

export default function CustomerProfileScreen() {
  const { user, logout } = useAuth();

  const fullName = user?.name || user?.fullName || 'Cliente';

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mi perfil</Text>

      <ProfileHeader
        image={user?.image}
        fullName={fullName}
        typeLabel="Cliente"
        email={user?.email}
      />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2C3E50',
    textAlign: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  logoutButton: {
    marginTop: 8,
    marginHorizontal: 20,
    alignItems: 'center',
    paddingVertical: 12,
  },
  logoutText: {
    color: '#C62828',
    fontWeight: '600',
    fontSize: 14,
  },
});
