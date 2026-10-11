import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Ionicons as Icon } from "@expo/vector-icons";
import { useAuth } from "@syscor/shared/src/context/AuthContext";
import { textStyles } from "@syscor/shared/src/styles/typography";
import { useAuthMetrics } from "@syscor/shared/src/styles/authTheme";
import EditProfileSheet from "./EditProfileSheet";
import { makeStyles, useTheme, useThemeMode } from "../../theme/ThemeContext";
import { getScheduleText, getShiftText } from "../../utils/workSchedule";

// El encabezado es oscuro en los dos temas; en el oscuro se separa un poco
// del fondo para que no se funda con él.
const HERO = { light: "#211C18", dark: "#241E1A" };

const STATUS_DOT = { active: "#4CC38A", inactive: "#A8A49E", suspended: "#E5484D", on_leave: "#E2A336" };

const THEME_CHOICES = [
  { key: "system", label: "Sistema", icon: "phone-portrait-outline" },
  { key: "light", label: "Claro", icon: "sunny-outline" },
  { key: "dark", label: "Oscuro", icon: "moon-outline" },
];

// "DG" a partir de nombre y apellido.
const initialsOf = (user) => {
  const name = user?.personalInfo?.name || user?.name || "";
  const lastname = user?.personalInfo?.lastname || user?.lastname || "";
  return `${name.trim().charAt(0)}${lastname.trim().charAt(0)}`.toUpperCase() || "?";
};

// Oculta un dato sensible dejando su forma: "7000-1234" → "•••• ••••".
const mask = (value) => (value ? String(value).replace(/[0-9A-Za-z]/g, "•").replace(/-/g, " ") : "—");

// Perfil de un empleado (mesero, cocina o reparto): encabezado oscuro con su
// resumen del día, sus datos personales y laborales, lo que puede hacer en el
// panel web dicho con palabras, y la apariencia de la app.
//
// `profile` es lo que devuelve useEmployeeProfile; `statTiles` son las tres
// cifras del encabezado ({ value, label }), distintas para cada puesto.
export default function EmployeeProfileView({ profile, statTiles, onBack }) {
  const { ms, gutter } = useAuthMetrics();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { isDark, c, p } = useTheme();
  const styles = useStyles();
  const {
    user,
    fullName,
    typeLabel,
    status,
    statusLabel,
    permissions,
    refreshing,
    onRefresh,
    saving,
    saveContact,
    savePassword,
    uploadingPhoto,
    savePhoto,
  } = profile;
  const [editOpen, setEditOpen] = useState(false);
  const focused = useIsFocused();

  const personalInfo = user?.personalInfo || {};
  const workInfo = user?.workInfo || {};
  const scheduleText = getScheduleText(workInfo);
  const hero = isDark ? HERO.dark : HERO.light;

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Seguro que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: logout },
    ]);
  };

  // Foto de perfil: de la galería o con la cámara, recortada en cuadrado.
  const pickPhoto = async (source) => {
    const fromCamera = source === "camera";
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Sin permiso",
        fromCamera
          ? "Permite el acceso a la cámara para tomarte la foto."
          : "Permite el acceso a tus fotos para elegir tu foto de perfil."
      );
      return;
    }
    const options = { mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.7 };
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
    if (!result.canceled && result.assets?.[0]) await savePhoto(result.assets[0]);
  };

  const choosePhoto = () => {
    if (uploadingPhoto) return;
    Alert.alert(personalInfo.image ? "Cambiar foto" : "Agregar foto", "¿De dónde la tomas?", [
      { text: "Galería", onPress: () => pickPhoto("library") },
      { text: "Cámara", onPress: () => pickPhoto("camera") },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const hasPermissions = permissions.screens.length + permissions.actions.length > 0;

  return (
    <View style={styles.container}>
      {/* Íconos claros sobre el encabezado oscuro, solo mientras se ve el perfil */}
      {focused ? <StatusBar style="light" /> : null}
      <ScrollView
        contentContainerStyle={{ paddingBottom: ms(32) }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} colors={[c.primary]} />
        }
      >
        {/* ── ENCABEZADO OSCURO ── */}
        <View
          style={{
            backgroundColor: hero,
            paddingTop: insets.top + ms(12),
            paddingHorizontal: gutter,
            paddingBottom: ms(22),
            borderBottomLeftRadius: ms(28),
            borderBottomRightRadius: ms(28),
            gap: ms(20),
          }}
        >
          <View style={[styles.row, { justifyContent: "space-between" }]}>
            {onBack ? (
              <HeroButton icon="arrow-back" label="Regresar" onPress={onBack} ms={ms} />
            ) : (
              <View style={{ width: ms(40) }} />
            )}
            <Text style={[textStyles.kicker, { color: "rgba(255,255,255,0.75)", fontSize: ms(11) }]}>MI PERFIL</Text>
            <HeroButton icon="pencil" label="Editar perfil" onPress={() => setEditOpen(true)} ms={ms} />
          </View>

          <View style={[styles.row, { gap: ms(14) }]}>
            {/* Tocar la foto la cambia */}
            <TouchableOpacity
              onPress={choosePhoto}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={personalInfo.image ? "Cambiar foto de perfil" : "Agregar foto de perfil"}
            >
              {personalInfo.image ? (
                <Image source={{ uri: personalInfo.image }} style={{ width: ms(64), height: ms(64), borderRadius: ms(16) }} />
              ) : (
                <View style={[styles.avatar, { width: ms(64), height: ms(64), borderRadius: ms(16) }]}>
                  <Text style={[textStyles.title, { color: c.white, fontSize: ms(24) }]}>{initialsOf(user)}</Text>
                </View>
              )}
              {uploadingPhoto ? (
                <View style={[StyleSheet.absoluteFill, styles.avatarBusy, { borderRadius: ms(16) }]}>
                  <ActivityIndicator color={c.white} />
                </View>
              ) : null}
              <View
                style={[
                  styles.cameraBadge,
                  { borderColor: hero, width: ms(24), height: ms(24), borderRadius: ms(12), right: -ms(5), bottom: -ms(5) },
                ]}
              >
                <Icon name="camera" size={ms(13)} color={hero} />
              </View>
            </TouchableOpacity>
            <View style={{ flex: 1, gap: ms(6) }}>
              <Text style={[textStyles.title, { color: c.white, fontSize: ms(20), lineHeight: ms(24) }]}>{fullName || "—"}</Text>
              <View style={[styles.row, { gap: ms(8) }]}>
                <View style={[styles.typePill, { borderRadius: ms(10), paddingHorizontal: ms(9), paddingVertical: ms(3) }]}>
                  <Text style={[textStyles.kicker, { color: c.white, fontSize: ms(9.5) }]}>{typeLabel.toUpperCase()}</Text>
                </View>
                <View style={[styles.row, { gap: ms(5) }]}>
                  <View
                    style={{
                      width: ms(6),
                      height: ms(6),
                      borderRadius: ms(3),
                      backgroundColor: STATUS_DOT[status] || STATUS_DOT.inactive,
                    }}
                  />
                  <Text style={[textStyles.kicker, { color: STATUS_DOT[status] || STATUS_DOT.inactive, fontSize: ms(9.5) }]}>
                    {statusLabel.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.row, { gap: ms(8) }]}>
            {statTiles.map((tile) => (
              <View key={tile.label} style={[styles.statTile, { borderRadius: ms(12), padding: ms(10), gap: ms(4) }]}>
                <Text style={[textStyles.title, { color: c.white, fontSize: ms(19) }]} numberOfLines={1}>
                  {tile.value === null || tile.value === undefined ? "—" : tile.value}
                </Text>
                <Text style={[textStyles.body, { color: "rgba(255,255,255,0.65)", fontSize: ms(11.5) }]}>{tile.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: gutter, paddingTop: ms(20), gap: ms(10) }}>
          {/* ── INFORMACIÓN PERSONAL ── */}
          <SectionTitle text="INFORMACIÓN PERSONAL" ms={ms} />
          <View style={[styles.card, { borderRadius: ms(16) }]}>
            <InfoRow icon="mail-outline" label="Correo" value={user?.email} ms={ms} />
            <InfoRow icon="call-outline" label="Teléfono" value={personalInfo.phone} sensitive ms={ms} />
            <InfoRow icon="card-outline" label="DUI / NIT" value={personalInfo.duiNit} sensitive ms={ms} />
            <InfoRow icon="location-outline" label="Dirección" value={personalInfo.address} last ms={ms} />
          </View>

          {/* ── INFORMACIÓN LABORAL ── */}
          <SectionTitle text="INFORMACIÓN LABORAL" ms={ms} style={{ marginTop: ms(10) }} />
          <View style={[styles.card, { borderRadius: ms(16) }]}>
            <InfoRow icon="briefcase-outline" label="Puesto" value={typeLabel} ms={ms} />
            <InfoRow icon="shield-checkmark-outline" label="Estado" value={statusLabel} ms={ms} />
            <InfoRow icon="time-outline" label="Turno" value={getShiftText(workInfo) || "Sin asignar"} last={!scheduleText} ms={ms} />
            {scheduleText ? <InfoRow icon="calendar-outline" label="Horario" value={scheduleText} last ms={ms} /> : null}
          </View>

          {/* ── PERMISOS ── */}
          <SectionTitle text="PERMISOS EN EL PANEL WEB" ms={ms} style={{ marginTop: ms(10) }} />
          <View style={[styles.card, { borderRadius: ms(16), padding: ms(14), gap: ms(12) }]}>
            {hasPermissions ? (
              <>
                {permissions.screens.length ? (
                  <PermissionGroup title="Puedes entrar a" items={permissions.screens} ms={ms} />
                ) : null}
                {permissions.actions.length ? (
                  <PermissionGroup title="Puedes hacer" items={permissions.actions} ms={ms} />
                ) : null}
              </>
            ) : (
              <View style={[styles.row, { gap: ms(10) }]}>
                <Icon name="phone-portrait-outline" size={ms(18)} color={c.textGray} />
                <Text style={[textStyles.body, { flex: 1, color: c.textGray, fontSize: ms(13) }]}>
                  No tienes acceso al panel web. Tu trabajo se hace desde esta app.
                </Text>
              </View>
            )}
            <Text style={[textStyles.body, { color: c.textLight, fontSize: ms(11.5) }]}>
              Los permisos los asigna un administrador.
            </Text>
          </View>

          {/* ── APARIENCIA ── */}
          <SectionTitle text="APARIENCIA" ms={ms} style={{ marginTop: ms(10) }} />
          <ThemePicker ms={ms} />

          {/* ── CERRAR SESIÓN ── */}
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.85}
            style={[styles.row, styles.logout, { marginTop: ms(10), height: ms(50), borderRadius: ms(14), gap: ms(8) }]}
            accessibilityRole="button"
          >
            <Icon name="log-out-outline" size={ms(19)} color={p.accent} />
            <Text style={[textStyles.button, { color: p.accent, fontSize: ms(15) }]}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <EditProfileSheet
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        user={user}
        saving={saving}
        onSaveContact={saveContact}
        onSavePassword={savePassword}
      />
    </View>
  );
}

function HeroButton({ icon, label, onPress, ms }) {
  const styles = useStyles();
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={8}
      style={[styles.heroButton, { width: ms(40), height: ms(40), borderRadius: ms(12) }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Icon name={icon} size={ms(19)} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

function SectionTitle({ text, ms, style }) {
  const { c } = useTheme();
  return <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10.5) }, style]}>{text}</Text>;
}

// Renglón de dato. Los sensibles (teléfono, DUI) salen ocultos y se muestran
// al tocarlos, por si alguien está viendo la pantalla del empleado.
function InfoRow({ icon, label, value, sensitive, last, ms }) {
  const { c, p } = useTheme();
  const styles = useStyles();
  const [revealed, setRevealed] = useState(false);
  const hidden = sensitive && !revealed && value;
  const Wrapper = sensitive && value ? TouchableOpacity : View;
  return (
    <Wrapper
      {...(sensitive && value ? { onPress: () => setRevealed((v) => !v), activeOpacity: 0.7 } : {})}
      style={[styles.row, { gap: ms(12), paddingHorizontal: ms(14), paddingVertical: ms(12) }, !last && styles.divider]}
    >
      <View style={[styles.iconTile, { width: ms(36), height: ms(36), borderRadius: ms(10) }]}>
        <Icon name={icon} size={ms(17)} color={p.accent} />
      </View>
      <View style={{ flex: 1, gap: ms(1) }}>
        <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(11.5) }]}>{label}</Text>
        <Text style={[textStyles.bodyMedium, { color: c.textDark, fontSize: ms(14.5) }]}>{hidden ? mask(value) : value || "—"}</Text>
      </View>
      {sensitive && value ? (
        <Icon name={revealed ? "eye-off-outline" : "eye-outline"} size={ms(17)} color={c.textLight} />
      ) : null}
    </Wrapper>
  );
}

function PermissionGroup({ title, items, ms }) {
  const { c, p } = useTheme();
  const styles = useStyles();
  return (
    <View style={{ gap: ms(8) }}>
      <Text style={[textStyles.link, { color: c.textDark, fontSize: ms(13) }]}>{title}</Text>
      <View style={[styles.row, { flexWrap: "wrap", gap: ms(8) }]}>
        {items.map((perm) => (
          <View
            key={perm.id}
            style={[styles.row, styles.permissionChip, { borderRadius: ms(10), paddingHorizontal: ms(10), paddingVertical: ms(7), gap: ms(6) }]}
          >
            <Icon name={perm.icon} size={ms(14)} color={p.accent} />
            <Text style={[textStyles.body, { color: c.textDark, fontSize: ms(12.5) }]}>{perm.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// Sistema / Claro / Oscuro. La elección se guarda en el teléfono.
function ThemePicker({ ms }) {
  const { c } = useTheme();
  const styles = useStyles();
  const { mode, setMode } = useThemeMode();
  return (
    <View style={[styles.card, styles.row, { borderRadius: ms(16), padding: ms(5), gap: ms(5) }]}>
      {THEME_CHOICES.map((choice) => {
        const active = mode === choice.key;
        return (
          <TouchableOpacity
            key={choice.key}
            onPress={() => setMode(choice.key)}
            activeOpacity={0.85}
            style={[
              styles.row,
              {
                flex: 1,
                justifyContent: "center",
                gap: ms(6),
                height: ms(42),
                borderRadius: ms(12),
                backgroundColor: active ? c.primary : "transparent",
              },
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`Tema ${choice.label}`}
          >
            <Icon name={choice.icon} size={ms(16)} color={active ? c.white : c.textGray} />
            <Text style={[active ? textStyles.link : textStyles.body, { color: active ? c.white : c.textGray, fontSize: ms(13) }]}>
              {choice.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles(({ c, isDark }) => ({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.primary,
  },
  avatarBusy: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  cameraBadge: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
  },
  typePill: {
    backgroundColor: c.primary,
  },
  statTile: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  card: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  iconTile: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: isDark ? c.surfaceMuted : "#F3EEE6",
  },
  permissionChip: {
    backgroundColor: isDark ? c.surfaceMuted : "#F6F1E7",
  },
  logout: {
    justifyContent: "center",
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
}));
