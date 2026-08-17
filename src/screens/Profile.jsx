import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import profileStyles from '../styles/Profile';
import { colors } from '../styles/Orders';
import useProfile from '../hooks/useProfile';

/**
 * Pantalla 'Profile' (Perfil del Empleado)
 * Muestra los datos del empleado activo (foto, nombre, ID, cargo, email) y gestiona la salida/logout de la aplicación.
 */
const Profile = ({ navigation }) => {
  // Extraemos la información del empleado y la función de logout del hook useProfile
  const { employee, handleLogout } = useProfile();

  // Muestra un diálogo de alerta de confirmación antes de cerrar sesión
  const onLogoutPress = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => handleLogout(() => {
          // Aquí se puede redirigir al Login o reiniciar los tokens de autenticación
        }),
      },
    ]);
  };

  return (
    <SafeAreaView style={profileStyles.container}>
      {/* ── ENCABEZADO SUPERIOR ── */}
      <View style={profileStyles.header}>
        <Icon name="menu" size={22} color={colors.primary} />
        <Text style={profileStyles.headerTitle}>Mi Perfil</Text>
        <Icon name="notifications-outline" size={22} color={colors.primary} />
      </View>

      <ScrollView contentContainerStyle={profileStyles.scrollContent}>
        {/* ── SECCIÓN DE AVATAR / FOTO Y NOMBRE ── */}
        <View style={profileStyles.avatarSection}>
          <View style={profileStyles.avatarWrapper}>
            <Image source={{ uri: employee.avatarUrl }} style={profileStyles.avatarImage} />
            <TouchableOpacity style={profileStyles.editBadge}>
              <Icon name="pencil" size={14} color={colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={profileStyles.userName}>{employee.fullName}</Text>
        </View>

        {/* ── TARJETA DE INFORMACIÓN DETALLADA ── */}
        <View style={profileStyles.infoCard}>
          <View style={profileStyles.infoBlock}>
            <Text style={profileStyles.infoLabel}>NOMBRE COMPLETO</Text>
            <Text style={profileStyles.infoValue}>{employee.fullName}</Text>
          </View>

          <View style={profileStyles.infoBlockRow}>
            <View style={profileStyles.infoBlockHalf}>
              <Text style={profileStyles.infoLabel}>ID DE EMPLEADO</Text>
              <Text style={profileStyles.infoValue}>{employee.employeeId}</Text>
            </View>
            <View style={profileStyles.infoBlockHalf}>
              <Text style={profileStyles.infoLabel}>CARGO</Text>
              <Text style={profileStyles.infoValueLink}>{employee.position}</Text>
            </View>
          </View>

          <View>
            <Text style={profileStyles.infoLabel}>EMAIL</Text>
            <Text style={profileStyles.infoValueLink}>{employee.email}</Text>
          </View>
        </View>

        {/* ── BOTÓN CERRAR SESIÓN ── */}
        <TouchableOpacity style={profileStyles.logoutButton} onPress={onLogoutPress}>
          <Icon name="log-out-outline" size={18} color={colors.white} />
          <Text style={profileStyles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── BARRA DE NAVEGACIÓN INFERIOR ── */}
      <View style={profileStyles.bottomNav}>
        <TouchableOpacity
          style={profileStyles.bottomNavItem}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Icon name="grid-outline" size={20} color={colors.textGray} />
          <Text style={profileStyles.bottomNavText}>Dashboard</Text>
        </TouchableOpacity>
        <View style={[profileStyles.bottomNavItem, profileStyles.bottomNavItemActive]}>
          <Icon name="person" size={20} color={colors.white} />
          <Text style={[profileStyles.bottomNavText, profileStyles.bottomNavTextActive]}>Profile</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Profile;