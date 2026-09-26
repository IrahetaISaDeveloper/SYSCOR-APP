import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { formatPhone, phoneDigits } from '../hooks/useCustomerAuth';
import { MAX_PHONES, PHONE_TYPES, phoneTypeOf, savePhones } from '../services/phonesApi';
import {
  isoToDisplay,
  formatBirthdateInput,
  parseBirthdate,
  ageFromIso,
} from '../utils/birthdateUtils';

// Clave local de cada teléfono en la lista (el backend no les da id).
let phoneKeySeq = 0;
const withKey = (phone) => ({ ...phone, number: formatPhone(phone.number || ''), key: `p${(phoneKeySeq += 1)}` });

// Lo que se compara para saber si la lista cambió.
const phonesSignature = (phones) =>
  JSON.stringify(phones.map((p) => [phoneDigits(p.number), p.type, !!p.isDefault]));

// "Mi perfil": nombre, apellido, foto y fecha de nacimiento
// (PATCH /users/customers/:id) y sus teléfonos (PUT /users/customers/:id/phones).
// El correo no se cambia aquí: es el usuario con el que inicia sesión.
const EditProfileScreen = ({ navigation }) => {
  const isDark = useColorScheme() === 'dark';
  const c = getMenuColors(isDark);
  const bandColor = getOrderBandColor(isDark);
  const m = useAuthMetrics();
  const ms = m.ms;
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const customerId = user?.id || user?._id;

  const [name, setName] = useState(user?.name || '');
  const [lastname, setLastname] = useState(user?.lastname || '');
  const [birthdate, setBirthdate] = useState(isoToDisplay(user?.birthdate));
  // Foto elegida y todavía sin guardar: { uri, mimeType, fileName }.
  const [photo, setPhoto] = useState(null);
  const [phones, setPhones] = useState(() => (user?.phones || []).map(withKey));
  const [saving, setSaving] = useState(false);
  const [loadingContact, setLoadingContact] = useState(true);
  // La fecha y los teléfonos no se pudieron leer (sin conexión, o un backend
  // que todavía no los devuelve). Mientras tanto no se dejan editar, para no
  // hacer creer al cliente que no los tiene ni sobrescribirlos en blanco.
  const [contactUnavailable, setContactUnavailable] = useState(false);

  // Lo que hay guardado en el servidor, para saber qué cambió.
  const original = useRef({
    birthdate: isoToDisplay(user?.birthdate),
    phones: phonesSignature(user?.phones || []),
  });

  // La sesión se cargó al iniciar sesión y puede no traer la fecha ni los
  // teléfonos (o traerlos viejos), así que se piden de nuevo al entrar.
  useEffect(() => {
    let active = true;
    apiClient
      .get('/auth/me')
      .then(({ data }) => {
        if (!active) return;
        if (!Array.isArray(data?.phones)) {
          setContactUnavailable(true);
          return;
        }
        const nextBirthdate = isoToDisplay(data?.birthdate);
        const nextPhones = data?.phones || [];
        original.current = { birthdate: nextBirthdate, phones: phonesSignature(nextPhones) };
        setBirthdate(nextBirthdate);
        setPhones(nextPhones.map(withKey));
        updateUser({ ...user, birthdate: data?.birthdate ?? null, phones: nextPhones });
      })
      .catch(() => active && setContactUnavailable(true))
      .finally(() => active && setLoadingContact(false));
    return () => {
      active = false;
    };
    // Solo al abrir la pantalla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const birthdateCheck = parseBirthdate(birthdate);
  const age = birthdateCheck.valid && birthdateCheck.iso ? ageFromIso(birthdateCheck.iso) : null;

  const profileDirty =
    !!photo ||
    name.trim() !== (user?.name || '') ||
    lastname.trim() !== (user?.lastname || '') ||
    (!contactUnavailable && birthdate !== original.current.birthdate);
  const phonesDirty = !contactUnavailable && phonesSignature(phones) !== original.current.phones;
  const dirty = profileDirty || phonesDirty;

  const phoneError = useMemo(() => {
    const seen = new Set();
    for (const phone of phones) {
      const digits = phoneDigits(phone.number);
      if (digits.length !== 8) return 'Cada teléfono debe tener 8 dígitos.';
      if (seen.has(digits)) return 'Hay un teléfono repetido.';
      seen.add(digits);
    }
    return null;
  }, [phones]);

  const valid =
    name.trim().length > 0 &&
    lastname.trim().length > 0 &&
    (contactUnavailable || (birthdateCheck.valid && !phoneError));

  // ── TELÉFONOS ──
  const updatePhone = (key, patch) =>
    setPhones((list) => list.map((p) => (p.key === key ? { ...p, ...patch } : p)));

  const setDefaultPhone = (key) =>
    setPhones((list) => list.map((p) => ({ ...p, isDefault: p.key === key })));

  const addPhone = () =>
    setPhones((list) =>
      list.length >= MAX_PHONES
        ? list
        : [...list, withKey({ number: '', type: 'mobile', isDefault: list.length === 0 })],
    );

  const removePhone = (key) =>
    setPhones((list) => {
      const removed = list.find((p) => p.key === key);
      const rest = list.filter((p) => p.key !== key);
      // Si se quita el predeterminado, el primero que queda toma su lugar.
      if (removed?.isDefault && rest.length > 0) rest[0] = { ...rest[0], isDefault: true };
      return rest;
    });

  const confirmRemovePhone = (phone) => {
    if (!phoneDigits(phone.number)) {
      removePhone(phone.key);
      return;
    }
    Alert.alert('Quitar teléfono', `¿Quitar el ${phone.number} de tu perfil?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Quitar', style: 'destructive', onPress: () => removePhone(phone.key) },
    ]);
  };

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
    if (!customerId) return;
    setSaving(true);
    try {
      let nextUser = { ...user };

      if (profileDirty) {
        const body = new FormData();
        body.append('name', name.trim());
        body.append('lastname', lastname.trim());
        if (!contactUnavailable) body.append('birthdate', birthdateCheck.iso);
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
        nextUser = {
          ...nextUser,
          name: info.name ?? name.trim(),
          lastname: info.lastname ?? lastname.trim(),
          image: info.image ?? user?.image ?? null,
          birthdate: birthdateCheck.iso || null,
        };
      }

      if (phonesDirty) {
        const res = await savePhones(
          customerId,
          phones.map((p) => ({ ...p, number: phoneDigits(p.number) })),
        );
        if (!res.success) throw new Error(res.error);
        nextUser = { ...nextUser, phones: res.phones };
      }

      updateUser(nextUser);
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'No se pudo guardar',
        error.response?.data?.message || error.message || 'Revisa tu conexión e inténtalo de nuevo.',
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

  const label = (text, first) => (
    <Text
      style={[
        textStyles.kicker,
        { color: c.textGray, fontSize: ms(10), marginTop: first ? 0 : ms(16), marginBottom: ms(8) },
      ]}
    >
      {text}
    </Text>
  );

  const sectionTitle = (text, right) => (
    <View style={[ordersStyles.row, { justifyContent: 'space-between', marginTop: ms(28), marginBottom: ms(12) }]}>
      <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(17) }]}>{text}</Text>
      {right}
    </View>
  );

  return (
    // Con edge-to-edge en Android la ventana ya no se redimensiona sola al abrir
    // el teclado, así que también ahí hay que dejarle espacio con padding.
    <KeyboardAvoidingView
      behavior="padding"
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
          style={{ alignSelf: 'center', marginTop: ms(16), marginBottom: ms(8) }}
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

        {/* ── DATOS PERSONALES ── */}
        {sectionTitle('Datos personales')}

        {label('NOMBRE', true)}
        <TextInput
          value={name}
          onChangeText={setName}
          style={inputStyle}
          maxLength={40}
          autoCapitalize="words"
          placeholderTextColor={c.textLight}
        />

        {label('APELLIDO')}
        <TextInput
          value={lastname}
          onChangeText={setLastname}
          style={inputStyle}
          maxLength={40}
          autoCapitalize="words"
          placeholderTextColor={c.textLight}
        />

        {label('FECHA DE NACIMIENTO')}
        {contactUnavailable ? (
          <ContactNotice colors={c} ms={ms} />
        ) : (
        <>
        <View
          style={[
            inputStyle,
            ordersStyles.row,
            { paddingVertical: 0, gap: ms(10), borderColor: birthdateCheck.valid ? c.border : c.error },
          ]}
        >
          <Icon name="calendar-outline" size={ms(18)} color={c.textGray} />
          <TextInput
            value={birthdate}
            onChangeText={(text) => setBirthdate(formatBirthdateInput(text))}
            placeholder="DD/MM/AAAA"
            placeholderTextColor={c.textLight}
            keyboardType="number-pad"
            maxLength={10}
            style={[textStyles.num, { flex: 1, fontSize: ms(15), color: c.textDark, paddingVertical: ms(13) }]}
            accessibilityLabel="Fecha de nacimiento"
          />
          {age !== null ? (
            <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10) }]}>{age} AÑOS</Text>
          ) : null}
        </View>
        <Text
          style={[
            textStyles.body,
            { color: birthdateCheck.valid ? c.textLight : c.error, fontSize: ms(11.5), marginTop: ms(6) },
          ]}
        >
          {birthdateCheck.valid
            ? birthdate
              ? 'Así podemos consentirte en tu cumpleaños.'
              : 'Aún no la has registrado.'
            : birthdateCheck.message}
        </Text>
        </>
        )}

        {label('CORREO')}
        <View style={[inputStyle, { opacity: 0.7 }]}>
          <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(15) }]}>{user?.email}</Text>
        </View>
        <Text style={[textStyles.body, { color: c.textLight, fontSize: ms(11.5), marginTop: ms(6) }]}>
          El correo es tu usuario para iniciar sesión y no se puede cambiar.
        </Text>

        {/* ── TELÉFONOS ── */}
        {sectionTitle(
          'Teléfonos',
          <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10) }]}>
            {phones.length} DE {MAX_PHONES}
          </Text>,
        )}

        {contactUnavailable ? <ContactNotice colors={c} ms={ms} /> : null}

        {!contactUnavailable ? (
        <>
        {loadingContact && phones.length === 0 ? (
          <ActivityIndicator color={c.primary} style={{ marginVertical: ms(16) }} />
        ) : null}

        {!loadingContact && phones.length === 0 ? (
          <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13), marginBottom: ms(10) }]}>
            Agrega un número para que podamos avisarte sobre tu pedido.
          </Text>
        ) : null}

        {phones.map((phone) => (
          <PhoneCard
            key={phone.key}
            phone={phone}
            onChangeNumber={(text) => updatePhone(phone.key, { number: formatPhone(text) })}
            onChangeType={(type) => updatePhone(phone.key, { type })}
            onMakeDefault={() => setDefaultPhone(phone.key)}
            onRemove={() => confirmRemovePhone(phone)}
            colors={c}
            bandColor={bandColor}
            ms={ms}
          />
        ))}

        {phones.length < MAX_PHONES ? (
          <TouchableOpacity
            onPress={addPhone}
            activeOpacity={0.8}
            style={[
              ordersStyles.outlineButton,
              {
                borderColor: c.borderStrong,
                borderStyle: 'dashed',
                borderRadius: ms(14),
                height: ms(48),
                gap: ms(8),
              },
            ]}
            accessibilityRole="button"
          >
            <Icon name="add" size={ms(18)} color={c.primary} />
            <Text style={[textStyles.link, { color: c.primary, fontSize: ms(14) }]}>Agregar teléfono</Text>
          </TouchableOpacity>
        ) : (
          <Text style={[textStyles.body, { color: c.textLight, fontSize: ms(11.5), textAlign: 'center' }]}>
            Llegaste al máximo de {MAX_PHONES} teléfonos.
          </Text>
        )}

        {phoneError && phones.length > 0 ? (
          <Text style={[textStyles.body, { color: c.error, fontSize: ms(12), marginTop: ms(10) }]}>{phoneError}</Text>
        ) : null}
        </>
        ) : null}

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

// ── COMPONENTES ─────────────────────────────────────────────────────────

const ContactNotice = ({ colors: c, ms }) => (
  <View
    style={[
      ordersStyles.row,
      {
        gap: ms(10),
        padding: ms(12),
        borderRadius: ms(12),
        borderWidth: 1,
        borderColor: c.border,
        backgroundColor: c.surface,
      },
    ]}
  >
    <Icon name="cloud-offline-outline" size={ms(18)} color={c.textGray} />
    <Text style={[textStyles.body, { flex: 1, color: c.textGray, fontSize: ms(12.5) }]}>
      No pudimos cargar este dato. Vuelve a abrir tu perfil en un momento.
    </Text>
  </View>
);

// Un teléfono: número, tipo y si es el predeterminado.
const PhoneCard = ({ phone, onChangeNumber, onChangeType, onMakeDefault, onRemove, colors: c, bandColor, ms }) => {
  const type = phoneTypeOf(phone.type);
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: phone.isDefault ? c.primary : c.border,
        backgroundColor: c.surface,
        borderRadius: ms(16),
        padding: ms(12),
        marginBottom: ms(10),
        gap: ms(12),
      }}
    >
      <View style={[ordersStyles.row, { gap: ms(10) }]}>
        <View
          style={[
            ordersStyles.pastIcon,
            { width: ms(38), height: ms(38), borderRadius: ms(10), backgroundColor: bandColor },
          ]}
        >
          <Icon name={type.icon} size={ms(18)} color={c.primary} />
        </View>
        <Text style={[textStyles.num, { color: c.textGray, fontSize: ms(15) }]}>+503</Text>
        <TextInput
          value={phone.number}
          onChangeText={onChangeNumber}
          placeholder="0000-0000"
          placeholderTextColor={c.textLight}
          keyboardType="phone-pad"
          maxLength={9}
          style={[textStyles.num, { flex: 1, fontSize: ms(16), color: c.textDark, paddingVertical: ms(6) }]}
          accessibilityLabel={`Número ${type.label}`}
        />
        <TouchableOpacity onPress={onRemove} hitSlop={10} accessibilityRole="button" accessibilityLabel="Quitar teléfono">
          <Icon name="trash-outline" size={ms(18)} color={c.textGray} />
        </TouchableOpacity>
      </View>

      {/* Tipo */}
      <View style={[ordersStyles.row, { gap: ms(6), flexWrap: 'wrap' }]}>
        {PHONE_TYPES.map((option) => {
          const selected = option.value === phone.type;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onChangeType(option.value)}
              style={[
                ordersStyles.row,
                {
                  gap: ms(5),
                  paddingHorizontal: ms(10),
                  height: ms(30),
                  borderRadius: ms(15),
                  borderWidth: 1,
                  borderColor: selected ? c.primary : c.border,
                  backgroundColor: selected ? 'rgba(226,61,40,0.12)' : 'transparent',
                },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <Icon name={option.icon} size={ms(13)} color={selected ? c.primary : c.textGray} />
              <Text
                style={[
                  selected ? textStyles.link : textStyles.body,
                  { color: selected ? c.primary : c.textGray, fontSize: ms(12.5) },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Predeterminado */}
      <TouchableOpacity
        onPress={onMakeDefault}
        disabled={phone.isDefault}
        style={[ordersStyles.row, { gap: ms(8) }]}
        accessibilityRole="radio"
        accessibilityState={{ selected: phone.isDefault }}
      >
        <Icon
          name={phone.isDefault ? 'radio-button-on' : 'radio-button-off'}
          size={ms(18)}
          color={phone.isDefault ? c.primary : c.textGray}
        />
        <Text style={[textStyles.body, { color: phone.isDefault ? c.textDark : c.textGray, fontSize: ms(13) }]}>
          {phone.isDefault ? 'Número predeterminado' : 'Usar como predeterminado'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditProfileScreen;
