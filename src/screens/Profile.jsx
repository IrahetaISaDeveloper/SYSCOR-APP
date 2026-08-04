import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  SafeAreaView 
} from 'react-native';
import { styles } from '../styles/Profile';

export const ProfileScreen = ({ 
  user = {
    name: 'Juan Pérez',
    avatarUrl: null, // Puedes pasar la URL de la imagen registrada
    points: 450,
    vouchers: 3
  },
  onChangeAvatar,
  onEditProfile,
  onNavigateToOrders,
  onNavigateToPaymentMethods,
  onNavigateToSupport,
  onLogout 
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Card Principal de Usuario */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {user?.avatarUrl ? (
              <Image 
                source={{ uri: user.avatarUrl }} 
                style={styles.avatar} 
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={{ fontSize: 32 }}>👤</Text>
              </View>
            )}

            {/* Botón Flotante Cámara */}
            <TouchableOpacity 
              style={styles.cameraButton} 
              onPress={onChangeAvatar}
              activeOpacity={0.8}
            >
              <Text style={styles.cameraIcon}>📷</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>

          <TouchableOpacity 
            style={styles.editButton} 
            onPress={onEditProfile}
            activeOpacity={0.85}
          >
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Tarjetas Stats (Puntos y Vales) */}
        <View style={styles.statsRow}>
          {/* Card Lealtad */}
          <View style={[styles.statCard, styles.pointsCard]}>
            <View style={styles.statHeader}>
              <View style={[styles.statIconContainer, styles.pointsIconBg]}>
                <Text style={{ fontSize: 10, color: '#FFFFFF' }}>★</Text>
              </View>
              <Text style={[styles.statValue, styles.pointsValue]}>
                {user?.points || 0} pts
              </Text>
            </View>
            <Text style={styles.statLabel}>Lealtad</Text>
          </View>

          {/* Card Vales */}
          <View style={[styles.statCard, styles.vouchersCard]}>
            <View style={styles.statHeader}>
              <View style={[styles.statIconContainer, styles.vouchersIconBg]}>
                <Text style={{ fontSize: 10, color: '#FFFFFF' }}>🎟️</Text>
              </View>
              <Text style={[styles.statValue, styles.vouchersValue]}>
                {user?.vouchers || 0} Vales
              </Text>
            </View>
            <Text style={styles.statLabel}>Disponibles</Text>
          </View>
        </View>

        {/* Menú de Opciones */}
        <View style={styles.menuCard}>
          {/* Mis Pedidos */}
          <TouchableOpacity 
            style={[styles.menuItem, styles.menuItemBorder]} 
            onPress={onNavigateToOrders}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={styles.menuIconBg}>
                <Text style={{ fontSize: 16 }}>🕒</Text>
              </View>
              <Text style={styles.menuText}>Mis Pedidos</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          {/* Métodos de Pago */}
          <TouchableOpacity 
            style={[styles.menuItem, styles.menuItemBorder]} 
            onPress={onNavigateToPaymentMethods}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={styles.menuIconBg}>
                <Text style={{ fontSize: 16 }}>💳</Text>
              </View>
              <Text style={styles.menuText}>Métodos de Pago</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          {/* Ayuda y Soporte */}
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={onNavigateToSupport}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={styles.menuIconBg}>
                <Text style={{ fontSize: 16 }}>❓</Text>
              </View>
              <Text style={styles.menuText}>Ayuda y Soporte</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Botón Cerrar Sesión */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={onLogout}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 16 }}>🚪</Text>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};
export default ProfileScreen;
