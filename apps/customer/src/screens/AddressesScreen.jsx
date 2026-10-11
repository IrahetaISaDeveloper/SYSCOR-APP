import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  useColorScheme,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons as Icon } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { useAuthMetrics } from '@syscor/shared/src/styles/authTheme';
import { useAuth } from '@syscor/shared/src/context/AuthContext';
import { getMenuColors } from '../styles/CustomerMenu';
import ordersStyles, { orderStatusColors as sc, getOrderBandColor } from '../styles/Orders';
import { BRANCH, getBranchSchedule } from '../constants/branch';
import { getDirectionsUrl, getRouteToBranch, getSearchUrl, formatDistance } from '../services/mapsApi';
import * as addressesApi from '../services/addressesApi';
import { useTabBarVisibility } from '../context/TabBarVisibilityContext';
import Sheet from '../components/Sheet';
import AddressFormSheet from '../components/AddressFormSheet';

const TABS = [
  { id: 'branch', label: 'Llegar al local', icon: 'storefront-outline' },
  { id: 'mine', label: 'Mis direcciones', icon: 'home-outline' },
];

const iconForTag = (tag = '') => {
  const t = tag.toLowerCase();
  if (t.includes('casa') || t.includes('hogar')) return 'home-outline';
  if (t.includes('oficina') || t.includes('trabajo')) return 'briefcase-outline';
  return 'location-outline';
};

// ── PANTALLA ────────────────────────────────────────────────────────────
const AddressesScreen = () => {
  const isDark = useColorScheme() === 'dark';
  const c = getMenuColors(isDark);
  const bandColor = getOrderBandColor(isDark);
  const m = useAuthMetrics();
  const ms = m.ms;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const customerId = user?.id || user?._id;

  const [tab, setTab] = useState('branch');
  const { handleScroll, reset: resetTabBar } = useTabBarVisibility();
  useFocusEffect(useCallback(() => () => resetTabBar?.(), [resetTabBar]));

  // ── Ubicación y ruta al local ──
  // status: 'idle' | 'loading' | 'denied' | 'ready' | 'error'
  const [route, setRoute] = useState({ status: 'idle' });

  const locate = useCallback(async ({ ask = true } = {}) => {
    setRoute({ status: 'loading' });
    try {
      let perm = await Location.getForegroundPermissionsAsync();
      if (!perm.granted && ask && perm.canAskAgain) {
        perm = await Location.requestForegroundPermissionsAsync();
      }
      if (!perm.granted) {
        setRoute({ status: 'denied', canAskAgain: perm.canAskAgain });
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const result = await getRouteToBranch({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setRoute({ status: 'ready', ...result });
    } catch {
      setRoute({ status: 'error' });
    }
  }, []);

  // Al entrar solo se usa la ubicación si ya hay permiso: el cuadro del
  // sistema sale cuando el cliente toca "Ver distancia".
  useEffect(() => {
    locate({ ask: false });
  }, [locate]);

  // ── Libreta de direcciones ──
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressesError, setAddressesError] = useState(null);
  const [optionsFor, setOptionsFor] = useState(null);
  const [editing, setEditing] = useState(null); // null | { index?, tag, details, isDefault }
  const [saving, setSaving] = useState(false);

  const loadAddresses = useCallback(async () => {
    if (!customerId) return;
    setAddressesLoading(true);
    setAddressesError(null);
    const res = await addressesApi.getAddresses(customerId);
    if (res.success) setAddresses(res.addresses);
    else setAddressesError(res.error);
    setAddressesLoading(false);
  }, [customerId]);

  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [loadAddresses]),
  );

  // Todas las rutas devuelven la libreta completa: se reemplaza tal cual.
  const applyResult = (res) => {
    if (res.success) {
      setAddresses(res.addresses);
      return true;
    }
    Alert.alert('No se pudo guardar', res.error);
    return false;
  };

  const saveAddress = async (form) => {
    setSaving(true);
    const payload = { tag: form.tag.trim(), details: form.details.trim(), isDefault: form.isDefault };
    const res =
      form.index == null
        ? await addressesApi.addAddress(customerId, payload)
        : await addressesApi.updateAddress(customerId, form.index, payload);
    setSaving(false);
    if (applyResult(res)) setEditing(null);
  };

  const makeDefault = async (address) => {
    setOptionsFor(null);
    applyResult(await addressesApi.setDefaultAddress(customerId, address.index));
  };

  const removeAddress = (address) => {
    setOptionsFor(null);
    Alert.alert('Eliminar dirección', `¿Quieres eliminar "${address.tag}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => applyResult(await addressesApi.deleteAddress(customerId, address.index)),
      },
    ]);
  };

  const schedule = getBranchSchedule();

  return (
    <View style={[ordersStyles.container, { backgroundColor: c.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={{ height: insets.top }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: m.gutter, paddingBottom: ms(130) }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── ENCABEZADO ── */}
        <View style={[ordersStyles.header, { marginTop: ms(18) }]}>
          <View style={{ flex: 1, gap: ms(4) }}>
            <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(26) }]}>Dónde comes</Text>
            <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10.5) }]}>
              SUCURSAL Y DIRECCIONES
            </Text>
          </View>
        </View>

        {/* ── FILTROS ── */}
        <View style={[ordersStyles.row, { gap: ms(10), marginTop: ms(18) }]}>
          {TABS.map((t) => {
            const selected = tab === t.id;
            const color = selected ? c.white : c.textGray;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setTab(t.id)}
                activeOpacity={0.85}
                style={[
                  ordersStyles.pill,
                  {
                    flex: 1,
                    flexDirection: 'row',
                    gap: ms(8),
                    backgroundColor: selected ? c.primary : c.surface,
                    borderColor: selected ? c.primary : c.border,
                    borderRadius: ms(14),
                    height: ms(44),
                  },
                ]}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
              >
                <Icon name={t.icon} size={ms(16)} color={color} />
                <Text style={[selected ? textStyles.title : textStyles.body, { color, fontSize: ms(13.5) }]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {tab === 'branch' ? (
          <BranchCard
            route={route}
            schedule={schedule}
            onLocate={() => locate()}
            colors={c}
            bandColor={bandColor}
            ms={ms}
          />
        ) : (
          <>
            <Text
              style={[textStyles.kicker, { color: c.textGray, fontSize: ms(11), marginTop: ms(22), marginBottom: ms(12) }]}
            >
              MIS DIRECCIONES
            </Text>

            {addressesLoading && addresses.length === 0 ? (
              <View style={[ordersStyles.centerBox, { paddingVertical: ms(40) }]}>
                <ActivityIndicator size="large" color={c.primary} />
              </View>
            ) : addressesError ? (
              <View style={[ordersStyles.centerBox, { paddingVertical: ms(30), gap: ms(8) }]}>
                <Icon name="cloud-offline-outline" size={ms(30)} color={c.textLight} />
                <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13), textAlign: 'center' }]}>
                  {addressesError}
                </Text>
                <TouchableOpacity onPress={loadAddresses} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={[textStyles.link, { color: c.primary, fontSize: ms(13.5) }]}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ gap: ms(12) }}>
                {addresses.map((address) => (
                  <AddressRow
                    key={`${address.index}-${address.tag}`}
                    address={address}
                    colors={c}
                    bandColor={bandColor}
                    ms={ms}
                    onOptions={() => setOptionsFor(address)}
                  />
                ))}

                <TouchableOpacity
                  onPress={() => setEditing({ tag: 'Casa', details: '', isDefault: addresses.length === 0 })}
                  activeOpacity={0.8}
                  style={[
                    ordersStyles.outlineButton,
                    {
                      borderColor: c.borderStrong,
                      borderStyle: 'dashed',
                      borderRadius: ms(16),
                      height: ms(52),
                      gap: ms(8),
                    },
                  ]}
                  accessibilityRole="button"
                >
                  <Icon name="add-circle-outline" size={ms(18)} color={c.textGray} />
                  <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13.5) }]}>Agregar dirección</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <AddressOptionsSheet
        address={optionsFor}
        onClose={() => setOptionsFor(null)}
        onEdit={() => {
          setEditing({ ...optionsFor });
          setOptionsFor(null);
        }}
        onMakeDefault={() => makeDefault(optionsFor)}
        onOpenMap={() => {
          Linking.openURL(getSearchUrl(optionsFor.details));
          setOptionsFor(null);
        }}
        onDelete={() => removeAddress(optionsFor)}
        colors={c}
        ms={ms}
        bottomInset={insets.bottom}
      />

      <AddressFormSheet
        value={editing}
        saving={saving}
        onClose={() => setEditing(null)}
        onSave={saveAddress}
        colors={c}
        ms={ms}
        bottomInset={insets.bottom}
      />
    </View>
  );
};

// ── COMPONENTES ─────────────────────────────────────────────────────────

const BranchCard = ({ route, schedule, onLocate, colors: c, bandColor, ms }) => {
  const openUrl = (url) =>
    Linking.openURL(url).catch(() => Alert.alert('No se pudo abrir', 'Inténtalo de nuevo más tarde.'));

  return (
    <View
      style={[
        ordersStyles.activeCard,
        { backgroundColor: c.surface, borderColor: c.primary, borderRadius: ms(18), marginTop: ms(16) },
      ]}
    >
      {/* Franja superior: sucursal + distancia */}
      <View style={[ordersStyles.band, { backgroundColor: bandColor, padding: ms(14), gap: ms(12) }]}>
        <View
          style={[ordersStyles.pastIcon, { backgroundColor: c.primary, width: ms(46), height: ms(46), borderRadius: ms(12) }]}
        >
          <Icon name="storefront" size={ms(22)} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1, gap: ms(2) }}>
          <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(9.5) }]}>NUESTRO LOCAL</Text>
          <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(14) }]}>Mesa asignada al llegar</Text>
        </View>
        <DistanceBlock route={route} onLocate={onLocate} colors={c} ms={ms} />
      </View>

      <View style={{ padding: ms(15), gap: ms(10) }}>
        <View style={[ordersStyles.row, { gap: ms(8) }]}>
          <View
            style={[
              ordersStyles.badge,
              {
                backgroundColor: schedule.isOpen ? sc.success : sc.danger,
                borderRadius: ms(6),
                paddingHorizontal: ms(8),
                paddingVertical: ms(3),
              },
            ]}
          >
            <Text style={[textStyles.kicker, { color: '#FFFFFF', fontSize: ms(9.5) }]}>
              {schedule.isOpen ? 'ABIERTO' : 'CERRADO'}
            </Text>
          </View>
          <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10) }]}>{schedule.label}</Text>
        </View>

        <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(19) }]}>{BRANCH.shortName}</Text>
        <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12.5), lineHeight: ms(18) }]}>
          {BRANCH.address}
          {route.status === 'ready' ? ` · a ${formatDistance(route.meters)} de ti` : ''}
        </Text>

        <View style={[ordersStyles.row, { gap: ms(10), marginTop: ms(6) }]}>
          <TouchableOpacity
            onPress={() => openUrl(BRANCH.telUrl)}
            activeOpacity={0.85}
            style={[
              ordersStyles.outlineButton,
              { flex: 1, borderColor: c.border, borderRadius: ms(14), height: ms(46), gap: ms(8) },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Llamar al ${BRANCH.phone}`}
          >
            <Icon name="call-outline" size={ms(16)} color={c.textGray} />
            <Text style={[textStyles.title, { color: c.textGray, fontSize: ms(14) }]}>Llamar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => openUrl(getDirectionsUrl())}
            activeOpacity={0.9}
            style={[
              ordersStyles.outlineButton,
              {
                flex: 1.2,
                backgroundColor: c.primary,
                borderColor: c.primary,
                borderRadius: ms(14),
                height: ms(46),
                gap: ms(8),
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Cómo llegar con Google Maps"
          >
            <Icon name="navigate" size={ms(16)} color="#FFFFFF" />
            <Text style={[textStyles.title, { color: '#FFFFFF', fontSize: ms(14) }]}>Cómo llegar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Distancia y minutos en carro, o el botón para activar la ubicación.
const DistanceBlock = ({ route, onLocate, colors: c, ms }) => {
  if (route.status === 'loading' || route.status === 'idle') {
    return <ActivityIndicator size="small" color={c.primary} />;
  }
  if (route.status === 'ready') {
    return (
      <View style={[ordersStyles.alignEnd, { gap: ms(2) }]}>
        <Text style={[textStyles.num, { color: c.primary, fontSize: ms(17) }]}>{formatDistance(route.meters)}</Text>
        <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(9.5) }]}>
          {route.source === 'estimate' ? '≈ ' : ''}
          {route.minutes} MIN
        </Text>
      </View>
    );
  }
  // Sin permiso (o si falló): se ofrece activarla. Si el sistema ya no deja
  // volver a preguntar, se manda a los ajustes de la app.
  const goToSettings = route.status === 'denied' && route.canAskAgain === false;
  return (
    <TouchableOpacity
      onPress={goToSettings ? () => Linking.openSettings() : onLocate}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={ordersStyles.alignEnd}
      accessibilityRole="button"
    >
      <Icon name="locate-outline" size={ms(18)} color={c.primary} />
      <Text style={[textStyles.link, { color: c.primary, fontSize: ms(11) }]}>
        {goToSettings ? 'Activar en ajustes' : route.status === 'error' ? 'Reintentar' : 'Ver distancia'}
      </Text>
    </TouchableOpacity>
  );
};

const AddressRow = ({ address, colors: c, bandColor, ms, onOptions }) => (
  <View
    style={[
      ordersStyles.pastCard,
      {
        backgroundColor: c.surface,
        borderColor: address.isDefault ? c.primary : c.border,
        borderRadius: ms(16),
        padding: ms(13),
        gap: ms(12),
      },
    ]}
  >
    <View
      style={[
        ordersStyles.pastIcon,
        {
          backgroundColor: address.isDefault ? c.primaryTint : bandColor,
          width: ms(40),
          height: ms(40),
          borderRadius: ms(10),
        },
      ]}
    >
      <Icon name={iconForTag(address.tag)} size={ms(18)} color={address.isDefault ? c.primary : c.textGray} />
    </View>

    <View style={{ flex: 1, gap: ms(3) }}>
      <View style={[ordersStyles.row, { gap: ms(8), flexWrap: 'wrap' }]}>
        <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(15) }]}>{address.tag}</Text>
        {address.isDefault ? (
          <View
            style={{
              backgroundColor: c.primaryTint,
              borderRadius: ms(6),
              paddingHorizontal: ms(7),
              paddingVertical: ms(2),
            }}
          >
            <Text style={[textStyles.kicker, { color: c.primary, fontSize: ms(9) }]}>PREDETERMINADA</Text>
          </View>
        ) : null}
      </View>
      <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12) }]} numberOfLines={2}>
        {address.details}
      </Text>
    </View>

    <TouchableOpacity
      onPress={onOptions}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      accessibilityRole="button"
      accessibilityLabel={`Opciones de ${address.tag}`}
    >
      <Icon name="ellipsis-vertical" size={ms(18)} color={c.textGray} />
    </TouchableOpacity>
  </View>
);

const AddressOptionsSheet = ({ address, onClose, onEdit, onMakeDefault, onOpenMap, onDelete, colors: c, ms, bottomInset }) => {
  const options = address
    ? [
        !address.isDefault && { icon: 'star-outline', label: 'Usar como predeterminada', onPress: onMakeDefault },
        { icon: 'create-outline', label: 'Editar', onPress: onEdit },
        { icon: 'map-outline', label: 'Ver en Google Maps', onPress: onOpenMap },
        { icon: 'trash-outline', label: 'Eliminar', onPress: onDelete, danger: true },
      ].filter(Boolean)
    : [];

  return (
    <Sheet visible={!!address} onClose={onClose} colors={c} ms={ms} bottomInset={bottomInset}>
      <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(17), marginBottom: ms(8) }]}>
        {address?.tag}
      </Text>
      {options.map((option) => (
        <TouchableOpacity
          key={option.label}
          onPress={option.onPress}
          style={[ordersStyles.row, { gap: ms(12), paddingVertical: ms(13) }]}
          accessibilityRole="button"
        >
          <Icon name={option.icon} size={ms(19)} color={option.danger ? sc.danger : c.textGray} />
          <Text style={[textStyles.body, { color: option.danger ? sc.danger : c.textDark, fontSize: ms(14.5) }]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </Sheet>
  );
};

export default AddressesScreen;
