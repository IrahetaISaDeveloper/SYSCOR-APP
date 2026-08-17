import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { InputText } from '../components/commons/InputText';
import Toast from '../components/commons/Toast';
import { useProfile } from '../hooks/useProfile';
import { styles } from '../styles/Profile';

export const ProfileScreen = (props) => {
  const { user, onBack } = props;
  const {
    isEditing,
    toast,
    hideToast,
    form,
    updateField,
    handleEditPress,
    handleAvatarPress,
    handleLogoutPress,
    goToOrders,
    goToPaymentMethods,
    goToSupport,
  } = useProfile(props);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* Header */}
      <View style={styles.header}>
        {onBack ? (
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <Text style={{ fontSize: 20, color: '#B91C1C' }}>←</Text>
          </TouchableOpacity>
        ) : null}
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
              onPress={handleAvatarPress}
              activeOpacity={0.8}
            >
              <Text style={styles.cameraIcon}>📷</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{`${form.name || ''} ${form.lastname || ''}`.trim() || 'Usuario'}</Text>

          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditPress}
            activeOpacity={0.85}
          >
            <Text style={styles.editButtonText}>{isEditing ? 'Guardar Cambios' : 'Editar Perfil'}</Text>
          </TouchableOpacity>
        </View>

        {/* Información Personal */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Información Personal</Text>

          {isEditing ? (
            <>
              <InputText label="Nombre" value={form.name} onChangeText={updateField('name')} />
              <InputText label="Apellido" value={form.lastname} onChangeText={updateField('lastname')} />
              <InputText
                label="Correo electrónico"
                value={form.email}
                onChangeText={updateField('email')}
                keyboardType="email-address"
              />
              <InputText
                label="Teléfono"
                value={form.phone}
                onChangeText={updateField('phone')}
                keyboardType="phone-pad"
              />
              <InputText
                label="Fecha de nacimiento"
                placeholder="DD/MM/AAAA"
                value={form.birthdate}
                onChangeText={updateField('birthdate')}
              />
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Correo electrónico</Text>
                <Text style={styles.infoValue}>{form.email || 'No registrado'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <Text style={styles.infoValue}>{form.phone || 'No registrado'}</Text>
              </View>
              <View style={[styles.infoRow, styles.infoRowLast]}>
                <Text style={styles.infoLabel}>Fecha de nacimiento</Text>
                <Text style={styles.infoValue}>{form.birthdate || 'No registrada'}</Text>
              </View>
            </>
          )}
        </View>

        {/* Menú de Opciones */}
        <View style={styles.menuCard}>
          {/* Mis Pedidos */}
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={goToOrders}
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
            onPress={goToPaymentMethods}
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
            onPress={goToSupport}
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
          onPress={handleLogoutPress}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 16 }}>🚪</Text>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
        <View style={[profileStyles.bottomNavItem, profileStyles.bottomNavItemActive]}>
          <Icon name="person" size={20} color={colors.white} />
          <Text style={[profileStyles.bottomNavText, profileStyles.bottomNavTextActive]}>Profile</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;

export default Profile;