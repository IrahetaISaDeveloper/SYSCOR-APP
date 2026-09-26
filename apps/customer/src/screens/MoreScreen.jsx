import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Linking,
  useColorScheme,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons as Icon } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { useAuthMetrics } from '@syscor/shared/src/styles/authTheme';
import { useAuth } from '@syscor/shared/src/context/AuthContext';
import {
  SUPPORT_PHONE,
  SUPPORT_EMAIL,
  SUPPORT_TEL_URL,
  SUPPORT_WHATSAPP_URL,
  SUPPORT_EMAIL_URL,
} from '@syscor/shared/src/constants/support';
import { getMenuColors } from '../styles/CustomerMenu';
import ordersStyles, { getOrderBandColor } from '../styles/Orders';
import { usePreferences } from '../context/PreferencesContext';
import { useTabBarVisibility } from '../context/TabBarVisibilityContext';
import Sheet from '../components/Sheet';
import { usePanchita } from '../context/PanchitaContext';

const THEME_LABELS = { system: 'Sistema', light: 'Claro', dark: 'Oscuro' };
const THEME_ICONS = { system: 'phone-portrait-outline', light: 'sunny-outline', dark: 'moon-outline' };

const APP_VERSION = Constants.expoConfig?.version || '1.0.0';

// ── PANTALLA ────────────────────────────────────────────────────────────
const MoreScreen = ({ navigation }) => {
  const isDark = useColorScheme() === 'dark';
  const c = getMenuColors(isDark);
  const bandColor = getOrderBandColor(isDark);
  const m = useAuthMetrics();
  const ms = m.ms;
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  // Saldo a favor, para mostrarlo junto a "Mi saldo".
  const walletBalance = Number(usePanchita().wallet?.balance) || 0;
  const prefs = usePreferences();

  // null | 'support' | 'theme'
  const [sheet, setSheet] = useState(null);

  const { handleScroll, reset: resetTabBar } = useTabBarVisibility();
  useFocusEffect(useCallback(() => () => resetTabBar?.(), [resetTabBar]));

  const fullName = [user?.name, user?.lastname].filter(Boolean).join(' ') || 'Cliente';
  const initials = fullName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  const confirmLogout = () =>
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
    ]);

  const open = (url) => {
    setSheet(null);
    Linking.openURL(url).catch(() => Alert.alert('No se pudo abrir', 'Inténtalo de nuevo más tarde.'));
  };

  const card = [
    ordersStyles.activeCard,
    { backgroundColor: c.surface, borderColor: c.border, borderRadius: ms(18), marginTop: ms(14) },
  ];

  return (
    <View style={[ordersStyles.container, { backgroundColor: c.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={{ height: insets.top }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: m.gutter, paddingBottom: ms(130) }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* ── ENCABEZADO ── */}
        <View style={[ordersStyles.header, { marginTop: ms(18) }]}>
          <View style={{ flex: 1, gap: ms(4) }}>
            <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(26) }]}>Más</Text>
            <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10.5) }]}>
              CUENTA Y PREFERENCIAS
            </Text>
          </View>
        </View>

        {/* ── PERFIL ── */}
        <TouchableOpacity
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.85}
          style={[card, ordersStyles.pastCard, { padding: ms(14), gap: ms(14), marginTop: ms(18) }]}
          accessibilityRole="button"
          accessibilityLabel="Editar mi perfil"
        >
          <View
            style={[
              ordersStyles.pastIcon,
              {
                width: ms(58),
                height: ms(58),
                borderRadius: ms(29),
                backgroundColor: bandColor,
                overflow: 'hidden',
              },
            ]}
          >
            {user?.image ? (
              <Image source={{ uri: user.image }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Text style={[textStyles.title, { color: c.primary, fontSize: ms(20) }]}>{initials || '?'}</Text>
            )}
          </View>
          <View style={{ flex: 1, gap: ms(3) }}>
            <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(17) }]} numberOfLines={1}>
              {fullName}
            </Text>
            <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10.5) }]} numberOfLines={1}>
              {(user?.email || '').toUpperCase()}
            </Text>
          </View>
          <Icon name="chevron-forward" size={ms(18)} color={c.textGray} />
        </TouchableOpacity>

        {/* ── CUENTA ── */}
        <View style={[card, { paddingHorizontal: ms(14) }]}>
          <Row
            icon="chatbubbles-outline"
            label="Chef Panchita: seguimiento y ayuda"
            onPress={() => navigation.navigate('Panchita')}
            tint
            colors={c}
            bandColor={bandColor}
            ms={ms}
          />
          <Row
            icon="wallet-outline"
            label="Mi saldo"
            onPress={() => navigation.navigate('Wallet')}
            right={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: ms(4) }}>
                <Text style={[textStyles.num, { color: walletBalance > 0 ? '#1FC47A' : c.textGray, fontSize: ms(13.5) }]}>
                  ${walletBalance.toFixed(2)}
                </Text>
                <Icon name="chevron-forward" size={ms(17)} color={c.textGray} />
              </View>
            }
            tint
            colors={c}
            bandColor={bandColor}
            ms={ms}
          />
          <Row
            icon="card-outline"
            label="Métodos de pago"
            onPress={() => navigation.navigate('SavedCards')}
            tint
            colors={c}
            bandColor={bandColor}
            ms={ms}
          />
          <Row
            icon="help-circle-outline"
            label="Ayuda y soporte"
            onPress={() => setSheet('support')}
            tint
            last
            colors={c}
            bandColor={bandColor}
            ms={ms}
          />
        </View>

        {/* ── PREFERENCIAS ── */}
        <View style={[card, { paddingHorizontal: ms(14) }]}>
          <Row
            icon="notifications-outline"
            label="Avisos de mi pedido"
            colors={c}
            bandColor={bandColor}
            ms={ms}
            right={
              <Toggle
                value={prefs.orderAlerts}
                onChange={(orderAlerts) => prefs.update({ orderAlerts })}
                colors={c}
              />
            }
          />
          <Row
            icon="megaphone-outline"
            label="Promociones por correo"
            colors={c}
            bandColor={bandColor}
            ms={ms}
            right={
              <Toggle
                value={prefs.promoEmails}
                onChange={(promoEmails) => prefs.update({ promoEmails })}
                colors={c}
              />
            }
          />
          <Row
            icon="moon-outline"
            label="Tema oscuro"
            onPress={() => setSheet('theme')}
            last
            colors={c}
            bandColor={bandColor}
            ms={ms}
            right={
              <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10.5) }]}>
                {THEME_LABELS[prefs.theme].toUpperCase()}
              </Text>
            }
          />
        </View>

        {/* ── CERRAR SESIÓN ── */}
        <TouchableOpacity
          onPress={confirmLogout}
          activeOpacity={0.85}
          style={[
            ordersStyles.outlineButton,
            {
              backgroundColor: c.surface,
              borderColor: c.border,
              borderRadius: ms(16),
              height: ms(50),
              gap: ms(8),
              marginTop: ms(14),
            },
          ]}
          accessibilityRole="button"
        >
          <Icon name="log-out-outline" size={ms(18)} color={c.primary} />
          <Text style={[textStyles.title, { color: c.primary, fontSize: ms(14.5) }]}>Cerrar sesión</Text>
        </TouchableOpacity>

        <Text
          style={[
            textStyles.kicker,
            { color: c.textLight, fontSize: ms(10), textAlign: 'center', marginTop: ms(18) },
          ]}
        >
          SYSCOR · VERSIÓN {APP_VERSION}
        </Text>
      </ScrollView>

      {/* ── HOJAS ── */}
      <Sheet visible={sheet === 'support'} onClose={() => setSheet(null)} colors={c} ms={ms} bottomInset={insets.bottom}>
        <SheetTitle title="Ayuda y soporte" subtitle="Escríbenos o llámanos, con gusto te ayudamos." colors={c} ms={ms} />
        <InfoItem
          icon="logo-whatsapp"
          title="WhatsApp"
          text={SUPPORT_PHONE}
          onPress={() => open(SUPPORT_WHATSAPP_URL)}
          colors={c}
          bandColor={bandColor}
          ms={ms}
        />
        <InfoItem
          icon="call-outline"
          title="Llamar"
          text={SUPPORT_PHONE}
          onPress={() => open(SUPPORT_TEL_URL)}
          colors={c}
          bandColor={bandColor}
          ms={ms}
        />
        <InfoItem
          icon="mail-outline"
          title="Correo"
          text={SUPPORT_EMAIL}
          onPress={() => open(SUPPORT_EMAIL_URL)}
          colors={c}
          bandColor={bandColor}
          ms={ms}
        />
      </Sheet>

      <Sheet visible={sheet === 'theme'} onClose={() => setSheet(null)} colors={c} ms={ms} bottomInset={insets.bottom}>
        <SheetTitle title="Tema" subtitle="'Sistema' sigue la configuración de tu teléfono." colors={c} ms={ms} />
        {Object.keys(THEME_LABELS).map((theme) => {
          const selected = prefs.theme === theme;
          return (
            <TouchableOpacity
              key={theme}
              onPress={() => {
                prefs.update({ theme });
                setSheet(null);
              }}
              style={[ordersStyles.row, { gap: ms(12), paddingVertical: ms(13) }]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <Icon name={THEME_ICONS[theme]} size={ms(19)} color={selected ? c.primary : c.textGray} />
              <Text
                style={[
                  selected ? textStyles.title : textStyles.body,
                  { flex: 1, color: c.textDark, fontSize: ms(14.5) },
                ]}
              >
                {THEME_LABELS[theme]}
              </Text>
              {selected ? <Icon name="checkmark-circle" size={ms(20)} color={c.primary} /> : null}
            </TouchableOpacity>
          );
        })}
      </Sheet>
    </View>
  );
};

// ── COMPONENTES ─────────────────────────────────────────────────────────

// Fila de una tarjeta de opciones. Con `onPress` lleva flecha (o lo que se
// pase en `right`); sin él es solo una fila con su control.
const Row = ({ icon, label, onPress, right, tint, last, colors: c, bandColor, ms }) => {
  const content = (
    <>
      <View
        style={[
          ordersStyles.pastIcon,
          {
            width: ms(36),
            height: ms(36),
            borderRadius: ms(10),
            backgroundColor: tint ? 'rgba(226,61,40,0.12)' : bandColor,
          },
        ]}
      >
        <Icon name={icon} size={ms(18)} color={tint ? c.primary : c.textGray} />
      </View>
      <Text style={[textStyles.body, { flex: 1, color: c.textDark, fontSize: ms(14.5) }]}>{label}</Text>
      {right || (onPress ? <Icon name="chevron-forward" size={ms(17)} color={c.textGray} /> : null)}
    </>
  );
  const style = [
    ordersStyles.row,
    {
      gap: ms(13),
      paddingVertical: ms(14),
      borderBottomWidth: last ? 0 : 1,
      borderBottomColor: c.border,
    },
  ];
  return onPress ? (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={style} accessibilityRole="button">
      {content}
    </TouchableOpacity>
  ) : (
    <View style={style}>{content}</View>
  );
};

const Toggle = ({ value, onChange, colors: c }) => (
  <Switch
    value={value}
    onValueChange={onChange}
    trackColor={{ false: c.borderStrong, true: c.primary }}
    thumbColor="#FFFFFF"
    ios_backgroundColor={c.borderStrong}
  />
);

const SheetTitle = ({ title, subtitle, colors: c, ms }) => (
  <View style={{ gap: ms(4), marginBottom: ms(10) }}>
    <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(18) }]}>{title}</Text>
    <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12.5) }]}>{subtitle}</Text>
  </View>
);

const InfoItem = ({ icon, title, text, onPress, colors: c, bandColor, ms }) => {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      onPress={onPress}
      style={[ordersStyles.row, { gap: ms(12), paddingVertical: ms(11) }]}
      {...(onPress ? { accessibilityRole: 'button' } : {})}
    >
      <View
        style={[
          ordersStyles.pastIcon,
          { width: ms(40), height: ms(40), borderRadius: ms(10), backgroundColor: bandColor },
        ]}
      >
        <Icon name={icon} size={ms(19)} color={c.primary} />
      </View>
      <View style={{ flex: 1, gap: ms(2) }}>
        <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(14.5) }]}>{title}</Text>
        <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12.5) }]}>{text}</Text>
      </View>
      {onPress ? <Icon name="open-outline" size={ms(16)} color={c.textLight} /> : null}
    </Wrapper>
  );
};

export default MoreScreen;
