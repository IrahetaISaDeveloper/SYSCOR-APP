import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAuthTheme } from '@syscor/shared/src/styles/authTheme';
import { textStyles } from '@syscor/shared/src/styles/typography';
import AuthScreenLayout from '@syscor/shared/src/components/auth/AuthScreenLayout';
import AuthHeader from '@syscor/shared/src/components/auth/AuthHeader';
import AuthField from '@syscor/shared/src/components/auth/AuthField';
import AuthButton from '@syscor/shared/src/components/auth/AuthButton';
import PanchitaBubble from '@syscor/shared/src/components/panchita/PanchitaBubble';
import PanchitaChatSheet from '@syscor/shared/src/components/panchita/PanchitaChatSheet';
import { useCustomerLogin } from '../../hooks/useCustomerLogin';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Login del cliente: el formulario vive centrado en la pantalla, con las dos
// vías alternativas (explorar sin cuenta y crear cuenta) justo debajo del
// botón de entrar. Chef Panchita flota encima en una burbuja arrastrable.
export default function LoginCustomerScreen({ navigation }) {
  const { isDark, t, m } = useAuthTheme();
  const ms = m.ms;

  const { email, setEmail, password, setPassword, loading, error, handleLogin } =
    useCustomerLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const emailIsValid = EMAIL_REGEX.test(email.trim());
  const canSubmit = email.trim().length > 0 && password.length > 0;

  const header = (
    <AuthHeader
      tokens={t}
      metrics={m}
      onBack={() => navigation.goBack()}
      showBack={navigation.canGoBack()}
    />
  );

  // Solo el remate legal queda al pie; las acciones subieron junto al botón.
  const footer = (
    <Text style={[styles.legal, { color: t.textMuted, fontSize: ms(10.5) }]}>
      © TAQUERÍA EL CORRAL · SYSCOR
    </Text>
  );

  return (
    <>
      <AuthScreenLayout
        tokens={t}
        metrics={m}
        isDark={isDark}
        header={header}
        footer={footer}
        centerContent
      >
        {/* Marca y saludo */}
        <View style={{ alignItems: 'center', marginBottom: ms(m.isCompact ? 14 : 22) }}>
          <Image
            source={
              isDark
                ? require('../../../assets/logo-horizontal-blanco.png')
                : require('../../../assets/logo-horizontal-negro.png')
            }
            // El PNG es cuadrado con la marca en su franja central: los
            // márgenes negativos recortan el espacio transparente sobrante.
            style={{
              width: ms(250),
              height: ms(250),
              marginVertical: -ms(88),
            }}
            resizeMode="contain"
          />

          <Text
            style={[
              styles.title,
              { color: t.textPrimary, fontSize: ms(27), marginTop: ms(14) },
            ]}
          >
            Bienvenido de vuelta
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: t.textSecondary,
                fontSize: ms(14),
                lineHeight: ms(20),
                marginTop: ms(6),
              },
            ]}
          >
            Inicia sesión para continuar con tu pedido
          </Text>
        </View>

        {/* Error devuelto por el backend */}
        {error ? (
          <View
            style={[
              styles.errorBox,
              {
                backgroundColor: t.accentSoft,
                borderColor: t.danger,
                borderRadius: ms(12),
                padding: ms(13),
                gap: ms(10),
                marginBottom: ms(16),
              },
            ]}
          >
            <Icon name="alert-circle-outline" size={ms(18)} color={t.danger} />
            <View style={styles.flex}>
              {error.title ? (
                <Text style={[styles.errorTitle, { color: t.danger, fontSize: ms(13.5) }]}>
                  {error.title}
                </Text>
              ) : null}
              <Text
                style={[
                  styles.errorMessage,
                  { color: t.textSecondary, fontSize: ms(13), lineHeight: ms(18) },
                ]}
              >
                {error.message || String(error)}
              </Text>
            </View>
          </View>
        ) : null}

        <AuthField
          tokens={t}
          metrics={m}
          label="CORREO ELECTRÓNICO"
          icon="mail-outline"
          placeholder="tucorreo@ejemplo.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          rightIcon={
            emailIsValid ? (
              <Icon name="checkmark-circle-outline" size={ms(20)} color={t.success} />
            ) : null
          }
        />

        <AuthField
          tokens={t}
          metrics={m}
          label="CONTRASEÑA"
          icon="lock-closed-outline"
          placeholder="••••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoComplete="password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={canSubmit ? handleLogin : undefined}
          rightIcon={
            <Icon
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={ms(20)}
              color={t.textMuted}
            />
          }
          onRightIconPress={() => setShowPassword((prev) => !prev)}
        />

        <TouchableOpacity
          style={{ alignSelf: 'flex-end', paddingVertical: ms(4), marginBottom: ms(18) }}
          onPress={() => navigation.navigate('ForgotPassword')}
          activeOpacity={0.7}
        >
          <Text style={[styles.forgotText, { color: t.accent, fontSize: ms(13.5) }]}>
            ¿Olvidaste tu contraseña?
          </Text>
        </TouchableOpacity>

        <AuthButton
          tokens={t}
          metrics={m}
          title="Iniciar sesión"
          onPress={handleLogin}
          loading={loading}
          disabled={!canSubmit}
        />

        {/* Las dos salidas alternativas, justo debajo de entrar */}
        <TouchableOpacity
          style={{ alignItems: 'center', paddingVertical: ms(12) }}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('GuestMenu')}
        >
          <Text style={[styles.guestText, { color: t.textSecondary, fontSize: ms(13.5) }]}>
            Explorar el menú sin cuenta
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ alignItems: 'center', paddingVertical: ms(4) }}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('RegisterCustomer')}
        >
          <Text style={[styles.registerText, { color: t.textSecondary, fontSize: ms(14) }]}>
            ¿Aún no tienes cuenta?{' '}
            <Text style={[styles.registerLink, { color: t.accent }]}>Crear cuenta</Text>
          </Text>
        </TouchableOpacity>
      </AuthScreenLayout>

      {/* Chef Panchita: burbuja arrastrable + panel de ayuda */}
      <PanchitaBubble
        tokens={t}
        isDark={isDark}
        hidden={helpOpen}
        onPress={() => setHelpOpen(true)}
      />

      <PanchitaChatSheet
        visible={helpOpen}
        onClose={() => setHelpOpen(false)}
        tokens={t}
        metrics={m}
        isDark={isDark}
        onStartRecovery={() => navigation.navigate('ForgotPassword')}
      />
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  title: {
    ...textStyles.title,
    textAlign: 'center',
  },
  subtitle: {
    ...textStyles.body,
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    borderWidth: 1,
  },
  errorTitle: {
    ...textStyles.link,
    marginBottom: 2,
  },
  errorMessage: {
    ...textStyles.body,
  },
  forgotText: {
    ...textStyles.link,
  },
  guestText: {
    ...textStyles.link,
  },
  registerText: {
    ...textStyles.body,
  },
  registerLink: {
    ...textStyles.link,
  },
  legal: {
    ...textStyles.kicker,
    textAlign: 'center',
  },
});
