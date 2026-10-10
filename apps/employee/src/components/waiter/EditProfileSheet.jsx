import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons as Icon } from "@expo/vector-icons";
import useKeyboardHeight from "@syscor/shared/src/hooks/useKeyboardHeight";
import { textStyles } from "@syscor/shared/src/styles/typography";
import { useAuthMetrics } from "@syscor/shared/src/styles/authTheme";
import { checkPasswordRules, isPasswordValid } from "@syscor/shared/src/utils/passwordRules";
import { waiterColors as c } from "../../styles/waiterTheme";

const MAROON = "#8E2222";

// Lo que el empleado puede cambiar por su cuenta: teléfono y dirección, y su
// contraseña. Puesto, salario, estado y permisos solo los cambia un
// administrador desde el panel.
export default function EditProfileSheet({ visible, onClose, user, saving, onSaveContact, onSavePassword }) {
  const { ms, gutter, height: windowHeight } = useAuthMetrics();
  const insets = useSafeAreaInsets();
  // Sin KeyboardAvoidingView: con edge-to-edge Android no redimensiona la
  // ventana. Se mide el teclado y la hoja se apoya encima.
  const keyboard = useKeyboardHeight();

  const [tab, setTab] = useState("contact");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setTab("contact");
    setPhone(user?.personalInfo?.phone || "");
    setAddress(user?.personalInfo?.address || "");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswords(false);
  }, [visible, user]);

  const phoneDigits = phone.replace(/\D/g, "");
  const phoneOk = phoneDigits.length === 8 && /^[267]/.test(phoneDigits);
  const contactChanged =
    phone.trim() !== (user?.personalInfo?.phone || "") || address.trim() !== (user?.personalInfo?.address || "");
  const canSaveContact = contactChanged && phoneOk && address.trim().length >= 5 && !saving;

  const rules = checkPasswordRules(newPassword);
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const canSavePassword = currentPassword.length > 0 && isPasswordValid(newPassword) && passwordsMatch && !saving;

  const submit = async () => {
    if (tab === "contact") {
      if (await onSaveContact({ phone: phone.trim(), address: address.trim() })) onClose();
    } else if (await onSavePassword({ currentPassword, newPassword })) {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent statusBarTranslucent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              marginBottom: keyboard,
              maxHeight: (windowHeight - keyboard - insets.top) * 0.95,
              borderTopLeftRadius: ms(24),
              borderTopRightRadius: ms(24),
              paddingTop: ms(10),
            },
          ]}
        >
          <View style={[styles.handle, { width: ms(40), marginBottom: ms(14) }]} />

          <View style={[styles.row, { paddingHorizontal: gutter, marginBottom: ms(14), gap: ms(12) }]}>
            <Text style={[textStyles.title, { flex: 1, color: c.textDark, fontSize: ms(20) }]}>Editar perfil</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10} style={[styles.circle, { width: ms(34), height: ms(34), borderRadius: ms(17) }]}>
              <Icon name="close" size={ms(18)} color={c.textDark} />
            </TouchableOpacity>
          </View>

          {/* ── CONTACTO / CONTRASEÑA ── */}
          <View style={[styles.row, styles.segmented, { marginHorizontal: gutter, borderRadius: ms(12), padding: ms(3), gap: ms(3), marginBottom: ms(14) }]}>
            {[
              { key: "contact", label: "Datos de contacto", icon: "call-outline" },
              { key: "password", label: "Contraseña", icon: "lock-closed-outline" },
            ].map((t) => {
              const active = tab === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  onPress={() => setTab(t.key)}
                  style={[styles.row, { flex: 1, justifyContent: "center", gap: ms(6), height: ms(38), borderRadius: ms(10), backgroundColor: active ? c.textDark : "transparent" }]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                >
                  <Icon name={t.icon} size={ms(15)} color={active ? c.white : c.textGray} />
                  <Text style={[active ? textStyles.link : textStyles.body, { color: active ? c.white : c.textGray, fontSize: ms(12.5) }]}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView
            style={{ flexGrow: 0, flexShrink: 1 }}
            contentContainerStyle={{ paddingHorizontal: gutter, paddingBottom: ms(12), gap: ms(12) }}
            keyboardShouldPersistTaps="handled"
          >
            {tab === "contact" ? (
              <>
                <Field
                  label="TELÉFONO"
                  icon="call-outline"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="7000-0000"
                  keyboardType="phone-pad"
                  error={phone && !phoneOk ? "8 dígitos; empieza con 2, 6 o 7." : null}
                  ms={ms}
                />
                <Field
                  label="DIRECCIÓN"
                  icon="location-outline"
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Colonia, municipio, departamento"
                  multiline
                  ms={ms}
                />
                <Text style={[textStyles.body, { color: c.textLight, fontSize: ms(12) }]}>
                  Tu nombre, DUI, puesto y permisos los cambia un administrador desde el panel.
                </Text>
              </>
            ) : (
              <>
                <Field
                  label="CONTRASEÑA ACTUAL"
                  icon="lock-closed-outline"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showPasswords}
                  ms={ms}
                />
                <Field
                  label="NUEVA CONTRASEÑA"
                  icon="key-outline"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPasswords}
                  ms={ms}
                />
                <View style={[styles.card, { borderRadius: ms(12), padding: ms(12), gap: ms(6) }]}>
                  {rules.map((rule) => (
                    <View key={rule.id} style={[styles.row, { gap: ms(8) }]}>
                      <Icon name={rule.met ? "checkmark-circle" : "ellipse-outline"} size={ms(15)} color={rule.met ? "#1E8E4E" : c.textLight} />
                      <Text style={[textStyles.body, { flex: 1, color: rule.met ? c.textGray : c.textLight, fontSize: ms(12.5) }]}>{rule.label}</Text>
                    </View>
                  ))}
                </View>
                <Field
                  label="CONFIRMAR CONTRASEÑA"
                  icon="key-outline"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPasswords}
                  error={confirmPassword && !passwordsMatch ? "Las contraseñas no coinciden." : null}
                  ms={ms}
                />
                <TouchableOpacity onPress={() => setShowPasswords((v) => !v)} style={[styles.row, { gap: ms(6), alignSelf: "flex-start" }]} hitSlop={8}>
                  <Icon name={showPasswords ? "eye-off-outline" : "eye-outline"} size={ms(16)} color={MAROON} />
                  <Text style={[textStyles.link, { color: MAROON, fontSize: ms(13) }]}>
                    {showPasswords ? "Ocultar contraseñas" : "Mostrar contraseñas"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>

          <View style={[styles.footer, { paddingHorizontal: gutter, paddingTop: ms(12), paddingBottom: keyboard > 0 ? ms(10) : Math.max(insets.bottom, ms(14)) }]}>
            <TouchableOpacity
              onPress={submit}
              disabled={tab === "contact" ? !canSaveContact : !canSavePassword}
              activeOpacity={0.9}
              style={[
                styles.row,
                {
                  justifyContent: "center",
                  height: ms(52),
                  borderRadius: ms(14),
                  gap: ms(8),
                  backgroundColor: "#C9402F",
                  opacity: (tab === "contact" ? canSaveContact : canSavePassword) ? 1 : 0.45,
                },
              ]}
              accessibilityRole="button"
            >
              {saving ? (
                <ActivityIndicator color={c.white} />
              ) : (
                <Text style={[textStyles.button, { color: c.white, fontSize: ms(15.5) }]}>
                  {tab === "contact" ? "Guardar cambios" : "Cambiar contraseña"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Field({ label, icon, error, ms, multiline, ...input }) {
  return (
    <View style={{ gap: ms(6) }}>
      <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10) }]}>{label}</Text>
      <View
        style={[
          styles.row,
          styles.input,
          {
            alignItems: multiline ? "flex-start" : "center",
            borderRadius: ms(12),
            paddingHorizontal: ms(12),
            gap: ms(10),
            borderColor: error ? c.error : c.border,
          },
        ]}
      >
        <Icon name={icon} size={ms(17)} color={MAROON} style={multiline ? { marginTop: ms(13) } : null} />
        <TextInput
          style={[textStyles.body, { flex: 1, color: c.textDark, fontSize: ms(14.5), paddingVertical: ms(12), minHeight: multiline ? ms(70) : undefined }]}
          placeholderTextColor={c.textLight}
          autoCapitalize="none"
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          {...input}
        />
      </View>
      {error ? <Text style={[textStyles.body, { color: c.error, fontSize: ms(12) }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: c.background,
  },
  handle: {
    alignSelf: "center",
    height: 4,
    borderRadius: 2,
    backgroundColor: c.borderStrong,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  circle: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  segmented: {
    backgroundColor: c.surfaceMuted,
  },
  card: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  input: {
    backgroundColor: c.surface,
    borderWidth: 1,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: c.border,
    backgroundColor: c.background,
  },
});
