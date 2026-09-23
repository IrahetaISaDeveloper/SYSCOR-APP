import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAuthTheme } from '@syscor/shared/src/styles/authTheme';
import { textStyles } from '@syscor/shared/src/styles/typography';
import AuthScreenLayout from '@syscor/shared/src/components/auth/AuthScreenLayout';
import AuthHeader from '@syscor/shared/src/components/auth/AuthHeader';
import AuthField from '@syscor/shared/src/components/auth/AuthField';
import AuthButton from '@syscor/shared/src/components/auth/AuthButton';
import StepProgress from '@syscor/shared/src/components/auth/StepProgress';
import {
  checkPasswordRules,
  isPasswordValid,
} from '@syscor/shared/src/utils/passwordRules';
import useRecoveryPassword from '../../hooks/useRecoveryPassword';

// Paso 3 de recuperar contraseña: la clave nueva.
//
// Los requisitos se muestran en vivo porque son los que exige el backend
// (8 caracteres, mayúscula, minúscula, número y símbolo). Antes la app solo
// pedía 6 caracteres, así que el servidor rechazaba la contraseña y parecía
// que el cambio se había guardado cuando no era así.
export default function ResetPasswordScreen({ navigation, route }) {
  const { isDark, t, m } = useAuthTheme();
  const ms = m.ms;

  const { email } = route.params || {};
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    setEmail,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    inputError,
    apiError,
    isLoading,
    success,
    handleResetPassword,
  } = useRecoveryPassword();

  useEffect(() => {
    if (email) setEmail(email);
  }, [email, setEmail]);

  const rules = checkPasswordRules(newPassword);
  const strongEnough = isPasswordValid(newPassword);
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit = strongEnough && passwordsMatch && !isLoading;

  const onSubmit = async () => {
    const result = await handleResetPassword(email);
    if (result.ok) {
      setTimeout(() => {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }, 1800);
    }
  };

  const header = (
    <View style={{ gap: ms(14) }}>
      <AuthHeader
        tokens={t}
        metrics={m}
        label="PASO 3 DE 3"
        onBack={() => navigation.goBack()}
        showBack={navigation.canGoBack()}
      />
      <StepProgress tokens={t} total={3} current={3} />
    </View>
  );

  const footer = success ? null : (
    <AuthButton
      tokens={t}
      metrics={m}
      title="Guardar contraseña"
      onPress={onSubmit}
      loading={isLoading}
      disabled={!canSubmit}
    />
  );

  return (
    <AuthScreenLayout
      tokens={t}
      metrics={m}
      isDark={isDark}
      header={header}
      footer={footer}
    >
      <View
        style={[
          styles.badge,
          {
            backgroundColor: t.accentSoft,
            width: ms(52),
            height: ms(52),
            borderRadius: ms(14),
            marginBottom: ms(18),
          },
        ]}
      >
        <Icon
          name={success ? 'checkmark-circle' : 'key-outline'}
          size={ms(26)}
          color={success ? t.success : t.accent}
        />
      </View>

      <Text style={[styles.title, { color: t.textPrimary, fontSize: ms(26) }]}>
        {success ? '¡Contraseña actualizada!' : 'Nueva contraseña'}
      </Text>
      <Text
        style={[
          styles.subtitle,
          {
            color: t.textSecondary,
            fontSize: ms(14),
            lineHeight: ms(20),
            marginTop: ms(6),
            marginBottom: ms(22),
          },
        ]}
      >
        {success
          ? 'Ya puedes iniciar sesión con tu contraseña nueva. Te llevamos al inicio…'
          : 'Elige una contraseña segura. La usarás para entrar a tu cuenta.'}
      </Text>

      {success ? null : (
        <>
          {apiError || inputError ? (
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
                {apiError ? (
                  <Text style={[styles.errorTitle, { color: t.danger, fontSize: ms(13.5) }]}>
                    {apiError.title}
                  </Text>
                ) : null}
                <Text
                  style={[
                    styles.bodyText,
                    { color: t.textSecondary, fontSize: ms(13), lineHeight: ms(18) },
                  ]}
                >
                  {apiError ? apiError.message : inputError}
                </Text>
              </View>
            </View>
          ) : null}

          <AuthField
            tokens={t}
            metrics={m}
            label="NUEVA CONTRASEÑA"
            icon="lock-closed-outline"
            placeholder="Mínimo 8 caracteres"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            textContentType="newPassword"
            rightIcon={
              <Icon
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={ms(20)}
                color={t.textMuted}
              />
            }
            onRightIconPress={() => setShowPassword((prev) => !prev)}
          />

          {/* Requisitos del backend, en vivo */}
          <View
            style={[
              styles.rules,
              {
                backgroundColor: t.surface,
                borderColor: t.border,
                borderRadius: ms(12),
                padding: ms(13),
                gap: ms(7),
                marginBottom: ms(16),
              },
            ]}
          >
            {rules.map((rule) => (
              <View key={rule.id} style={[styles.ruleRow, { gap: ms(8) }]}>
                <Icon
                  name={rule.met ? 'checkmark-circle' : 'ellipse-outline'}
                  size={ms(15)}
                  color={rule.met ? t.success : t.textMuted}
                />
                <Text
                  style={[
                    styles.bodyText,
                    styles.flex,
                    {
                      color: rule.met ? t.textSecondary : t.textMuted,
                      fontSize: ms(12.5),
                    },
                  ]}
                >
                  {rule.label}
                </Text>
              </View>
            ))}
          </View>

          <AuthField
            tokens={t}
            metrics={m}
            label="CONFIRMAR CONTRASEÑA"
            icon="lock-closed-outline"
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirm}
            autoCapitalize="none"
            textContentType="newPassword"
            error={
              confirmPassword.length > 0 && !passwordsMatch
                ? 'Las contraseñas no coinciden'
                : null
            }
            rightIcon={
              passwordsMatch ? (
                <Icon name="checkmark-circle-outline" size={ms(20)} color={t.success} />
              ) : (
                <Icon
                  name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                  size={ms(20)}
                  color={t.textMuted}
                />
              )
            }
            onRightIconPress={
              passwordsMatch ? undefined : () => setShowConfirm((prev) => !prev)
            }
          />
        </>
      )}
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...textStyles.title,
  },
  subtitle: {
    ...textStyles.body,
  },
  bodyText: {
    ...textStyles.body,
  },
  errorBox: {
    flexDirection: 'row',
    borderWidth: 1,
  },
  errorTitle: {
    ...textStyles.link,
    marginBottom: 2,
  },
  rules: {
    borderWidth: 1,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
