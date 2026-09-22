import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import Button from '@syscor/shared/src/components/commons/Button';
import Toast from '@syscor/shared/src/components/commons/Toast';
import { LoginEmployees } from '../../hooks/LoginEmployees';
import { colors, radius, spacing } from '@syscor/shared/src/styles/theme';

// Paleta exacta del mockup de diseño (Login.dc.html) — distinta de la paleta
// genérica de la app, se mantiene local a esta pantalla.
const palette = {
  bg: '#F7F3E9',
  ink: '#1B1613',
  surface: '#FFFFFF',
  line: '#E3DACA',
  muted: '#6E665C',
  accent: '#8E2222',
  price: '#A8261C',
};

export default function LoginEmployeeScreen() {
  const { email, setEmail, password, setPassword, loading, error, handleLogin } = LoginEmployees();
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });

  const onPressLogin = async () => {
    await handleLogin();
    if (!error) {
      setToast({ visible: true, message: '¡Bienvenido de nuevo!' });
    }
  };

  return (
    <View style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type="success"
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.centeredColumn}>
          {/* Tag superior */}
          <View style={styles.topTag}>
            <Text style={styles.topTagText}>ACCESO EMPLEADO</Text>
          </View>

          {/* Encabezado con logo */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Image
                source={require('../../../assets/logo png horizontal claro.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.headerTextGroup}>
              <Text style={styles.title}>Bienvenido de vuelta</Text>
              <Text style={styles.subtitle}>Ingresa tus credenciales para continuar</Text>
            </View>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>CORREO</Text>
              <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
                <Icon
                  name="mail-outline"
                  size={18}
                  color={emailFocused ? palette.accent : palette.muted}
                  style={styles.leftIcon}
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="empleado@elcorral.com"
                  placeholderTextColor={palette.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
                {email ? (
                  <Icon name="checkmark-circle" size={18} color={palette.accent} />
                ) : null}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>CONTRASEÑA</Text>
              <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
                <Icon
                  name="lock-closed-outline"
                  size={18}
                  color={passwordFocused ? palette.accent : palette.muted}
                  style={styles.leftIcon}
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={palette.muted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                  hitSlop={10}
                >
                  <Icon
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={palette.muted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Mensaje de error */}
            {error && (
              <View style={styles.errorContainer}>
                {error.title ? (
                  <>
                    <Text style={styles.errorTitle}>{error.title}</Text>
                    {error.message ? <Text style={styles.errorMessage}>{error.message}</Text> : null}
                  </>
                ) : (
                  <Text style={styles.errorTitle}>{error}</Text>
                )}
              </View>
            )}

            {/* Botón de inicio de sesión */}
            <Button
              title={loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              onPress={onPressLogin}
              loading={loading}
              disabled={!email || !password}
              style={styles.loginButton}
              icon={!loading ? <Icon name="arrow-forward" size={17} color={colors.white} /> : null}
            />
          </View>

          {/* Pie de página */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© TAQUERÍA EL CORRAL · SYSCOR</Text>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  centeredColumn: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  topTag: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  topTagText: {
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
    fontSize: 11,
    letterSpacing: 1.5,
    color: palette.muted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  logoBadge: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: radius.lg,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 66,
    height: 46,
  },
  headerTextGroup: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.ink,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: palette.muted,
  },
  form: {
    width: '100%',
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
    fontSize: 10,
    letterSpacing: 1,
    color: palette.muted,
    marginBottom: spacing.xs + 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: radius.lg,
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  inputWrapperFocused: {
    borderWidth: 1.5,
    borderColor: palette.accent,
  },
  leftIcon: {
    marginRight: -2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: palette.ink,
    padding: 0,
  },
  errorContainer: {
    backgroundColor: colors.errorLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    borderRadius: 8,
    padding: 12,
    marginBottom: spacing.md,
  },
  errorTitle: {
    fontWeight: 'bold',
    color: colors.error,
    fontSize: 14,
  },
  errorMessage: {
    color: colors.error,
    fontSize: 13,
    marginTop: 4,
  },
  loginButton: {
    backgroundColor: palette.accent,
    borderRadius: radius.lg,
    paddingVertical: 16,
    marginTop: spacing.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
    fontSize: 10,
    letterSpacing: 0.5,
    color: palette.muted,
  },
});
