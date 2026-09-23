import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '@syscor/shared/src/services/apiClient';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { useAuthMetrics } from '@syscor/shared/src/styles/authTheme';
import { useAuth } from '@syscor/shared/src/context/AuthContext';
import { getMenuColors } from '../styles/CustomerMenu';
import ordersStyles, { getOrderBandColor } from '../styles/Orders';

// Edita nombre, apellido y foto del cliente (PATCH /users/customers/:id).
// El correo no se cambia aquí: es el usuario con el que inicia sesión.
const EditProfileScreen = ({ navigation }) => {
  const isDark = useColorScheme() === 'dark';
  const c = getMenuColors(isDark);
  const bandColor = getOrderBandColor(isDark);
  const m = useAuthMetrics();
  const ms = m.ms;
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [lastname, setLastname] = useState(user?.lastname || '');
  // Foto elegida y todavía sin guardar: { uri, mimeType, fileName }.
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);

  const dirty =
    !!photo || name.trim() !== (user?.name || '') || lastname.trim() !== (user?.lastname || '');
  const valid = name.trim().length > 0 && lastname.trim().length > 0;

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Sin permiso', 'Permite el acceso a tus fotos para elegir una foto de perfil.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]) setPhoto(result.assets[0]);
  };

  const save = async () => {
    const customerId = user?.id || user?._id;
    if (!customerId) return;
    setSaving(true);
    try {
      const body = new FormData();
      body.append('name', name.trim());
      body.append('lastname', lastname.trim());
      if (photo) {
        body.append('image', {
          uri: photo.uri,
          name: photo.fileName || 'perfil.jpg',
          type: photo.mimeType || 'image/jpeg',
        });
      }
      const { data } = await apiClient.patch(`/users/customers/${customerId}`, body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const info = data?.data?.personalInfo || {};
      updateUser({
        ...user,
        name: info.name ?? name.trim(),
        lastname: info.lastname ?? lastname.trim(),
        image: info.image ?? user?.image ?? null,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'No se pudo guardar',
        error.response?.data?.message || 'Revisa tu conexión e inténtalo de nuevo.',
      );
    } finally {
      setSaving(false);
    }
  };

  const avatarUri = photo?.uri || user?.image;
  const initials = [name, lastname].map((w) => w.trim()[0]?.toUpperCase()).join('');

  const inputStyle = [
    textStyles.body,
    {
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
      borderRadius: ms(12),
      paddingHorizontal: ms(14),
      paddingVertical: ms(13),
      fontSize: ms(15),
      color: c.textDark,
    },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[ordersStyles.container, { backgroundColor: c.background }]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={{ height: insets.top }} />

      {/* ── ENCABEZADO ── */}
      <View style={[ordersStyles.row, { paddingHorizontal: m.gutter, paddingVertical: ms(12), gap: ms(12) }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[
            ordersStyles.roundButton,
            { backgroundColor: c.surface, borderColor: c.border, width: ms(40), height: ms(40), borderRadius: ms(20) },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Icon name="chevron-back" size={ms(20)} color={c.textDark} />
        </TouchableOpacity>
        <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(20) }]}>Mi perfil</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: m.gutter, paddingBottom: ms(40) }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Foto */}
        <TouchableOpacity
          onPress={pickPhoto}
          activeOpacity={0.85}
          style={{ alignSelf: 'center', marginTop: ms(16), marginBottom: ms(24) }}
          accessibilityRole="button"
          accessibilityLabel="Cambiar foto de perfil"
        >
          <View
            style={[
              ordersStyles.pastIcon,
              { width: ms(104), height: ms(104), borderRadius: ms(52), backgroundColor: bandColor, overflow: 'hidden' },
            ]}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Text style={[textStyles.title, { color: c.primary, fontSize: ms(34) }]}>{initials || '?'}</Text>
            )}
          </View>
          <View
            style={[
              ordersStyles.pastIcon,
              {
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: ms(34),
                height: ms(34),
                borderRadius: ms(17),
                backgroundColor: c.primary,
                borderWidth: 3,
                borderColor: c.background,
              },
            ]}
          >
            <Icon name="camera" size={ms(15)} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10), marginBottom: ms(8) }]}>NOMBRE</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={inputStyle}
          maxLength={40}
          autoCapitalize="words"
          placeholderTextColor={c.textLight}
        />

        <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10), marginTop: ms(16), marginBottom: ms(8) }]}>
          APELLIDO
        </Text>
        <TextInput
          value={lastname}
          onChangeText={setLastname}
          style={inputStyle}
          maxLength={40}
          autoCapitalize="words"
          placeholderTextColor={c.textLight}
        />

        <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10), marginTop: ms(16), marginBottom: ms(8) }]}>
          CORREO
        </Text>
        <View style={[inputStyle, { opacity: 0.7 }]}>
          <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(15) }]}>{user?.email}</Text>
        </View>
        <Text style={[textStyles.body, { color: c.textLight, fontSize: ms(11.5), marginTop: ms(6) }]}>
          El correo es tu usuario para iniciar sesión y no se puede cambiar.
        </Text>

        <TouchableOpacity
          onPress={save}
          disabled={!dirty || !valid || saving}
          activeOpacity={0.9}
          style={[
            ordersStyles.outlineButton,
            {
              backgroundColor: c.primary,
              borderColor: c.primary,
              borderRadius: ms(14),
              height: ms(52),
              marginTop: ms(28),
              opacity: !dirty || !valid || saving ? 0.5 : 1,
            },
          ]}
          accessibilityRole="button"
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={[textStyles.title, { color: '#FFFFFF', fontSize: ms(15) }]}>Guardar cambios</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditProfileScreen;
