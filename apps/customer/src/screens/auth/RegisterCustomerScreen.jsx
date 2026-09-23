import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAuthTheme } from '@syscor/shared/src/styles/authTheme';
import { textStyles } from '@syscor/shared/src/styles/typography';
import AuthScreenLayout from '@syscor/shared/src/components/auth/AuthScreenLayout';
import AuthHeader from '@syscor/shared/src/components/auth/AuthHeader';
import AuthField from '@syscor/shared/src/components/auth/AuthField';
import AuthButton from '@syscor/shared/src/components/auth/AuthButton';
import StepProgress from '@syscor/shared/src/components/auth/StepProgress';
import { useCustomerAuth, getPasswordStrength } from '../../hooks/useCustomerAuth';

export default function RegisterCustomerScreen({ navigation }) {
  const { isDark, t, m } = useAuthTheme();
  const ms = m.ms;

  const {
    firstName, setFirstName,
    lastName, setLastName,
    email, setEmail,
    phone, setPhone,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    acceptedTerms, setAcceptedTerms,
    error,
    validateAccountStep,
  } = useCustomerAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  // Los datos viajan por la ruta: la cuenta se crea hasta verificar el código.
  const onContinue = () => {
    if (!validateAccountStep()) return;
    navigation.navigate('RegisterAddress', {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone,
      password,
    });
  };

  const strengthColors = [t.border, t.danger, '#D98324', t.success];

  const header = (
    <View style={{ gap: ms(14) }}>
      <AuthHeader
        tokens={t}
        metrics={m}
        label="PASO 1 DE 3"
        onBack={() => navigation.goBack()}
        showBack={navigation.canGoBack()}
      />
      <StepProgress tokens={t} total={3} current={1} />
    </View>
  );

  const footer = (
    <View style={{ gap: ms(10) }}>
      <AuthButton tokens={t} metrics={m} title="Continuar" onPress={onContinue} />

      <TouchableOpacity
        onPress={() => navigation.navigate('Login')}
        activeOpacity={0.7}
        style={{ alignItems: 'center', paddingVertical: ms(4) }}
      >
        <Text style={[styles.footerText, { color: t.textSecondary, fontSize: ms(14) }]}>
          ¿Ya tienes cuenta?{' '}
          <Text style={[styles.footerLink, { color: t.accent }]}>Iniciar sesión</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <AuthScreenLayout
      tokens={t}
      metrics={m}
      isDark={isDark}
      header={header}
      footer={footer}
    >
      <Text style={[styles.title, { color: t.textPrimary, fontSize: ms(26) }]}>
        Crea tu cuenta
      </Text>
      <Text
        style={[
          styles.subtitle,
          {
            color: t.textSecondary,
            fontSize: ms(14),
            lineHeight: ms(20),
            marginTop: ms(6),
            marginBottom: ms(20),
          },
        ]}
      >
        Únete a la familia El Corral y pide desde donde estés.
      </Text>

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
              {error.message}
            </Text>
          </View>
        </View>
      ) : null}

      <AuthField
        tokens={t}
        metrics={m}
        label="NOMBRES"
        icon="person-outline"
        placeholder="Ej. Juan Carlos"
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="words"
        textContentType="givenName"
      />

      <AuthField
        tokens={t}
        metrics={m}
        label="APELLIDOS"
        icon="person-outline"
        placeholder="Ej. Pérez López"
        value={lastName}
        onChangeText={setLastName}
        autoCapitalize="words"
        textContentType="familyName"
      />

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
      />

      <AuthField
        tokens={t}
        metrics={m}
        label="TELÉFONO"
        prefix="+503"
        placeholder="7845-1290"
        value={phone}
        onChangeText={setPhone}
        keyboardType="number-pad"
        maxLength={9}
        textContentType="telephoneNumber"
      />

      <AuthField
        tokens={t}
        metrics={m}
        label="CONTRASEÑA"
        icon="lock-closed-outline"
        placeholder="Mínimo 8 caracteres"
        value={password}
        onChangeText={setPassword}
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

      {/* Medidor de fuerza */}
      {password ? (
        <View
          style={[
            styles.strengthRow,
            { gap: ms(10), marginTop: -ms(6), marginBottom: ms(16) },
          ]}
        >
          <View style={[styles.strengthBars, { gap: ms(6) }]}>
            {[1, 2, 3].map((level) => (
              <View
                key={level}
                style={[
                  styles.strengthBar,
                  {
                    backgroundColor:
                      strength.level >= level ? strengthColors[strength.level] : t.border,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.strengthLabel, { color: t.textMuted, fontSize: ms(10.5) }]}>
            {strength.label}
          </Text>
        </View>
      ) : null}

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

      {/* Términos */}
      <TouchableOpacity
        style={[styles.termsRow, { gap: ms(11), marginTop: ms(4) }]}
        activeOpacity={0.7}
        onPress={() => setAcceptedTerms(!acceptedTerms)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: acceptedTerms }}
      >
        <View
          style={[
            styles.checkbox,
            {
              width: ms(21),
              height: ms(21),
              borderRadius: ms(6),
              backgroundColor: acceptedTerms ? t.accent : 'transparent',
              borderColor: acceptedTerms ? t.accent : t.borderStrong,
            },
          ]}
        >
          {acceptedTerms ? <Icon name="checkmark" size={ms(14)} color="#FFFFFF" /> : null}
        </View>

        <Text
          style={[
            styles.termsText,
            { color: t.textSecondary, fontSize: ms(13.5), lineHeight: ms(19) },
          ]}
        >
          Acepto los{' '}
          <Text
            style={[styles.termsLink, { color: t.accent }]}
            onPress={() => navigation.navigate('TermsAndConditions')}
          >
            términos de servicio
          </Text>{' '}
          y el aviso de privacidad de El Corral.
        </Text>
      </TouchableOpacity>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  title: {
    ...textStyles.title,
  },
  subtitle: {
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
  errorMessage: {
    ...textStyles.body,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strengthBars: {
    flex: 1,
    flexDirection: 'row',
  },
  strengthBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  strengthLabel: {
    ...textStyles.kicker,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: {
    ...textStyles.body,
    flex: 1,
  },
  termsLink: {
    ...textStyles.link,
  },
  footerText: {
    ...textStyles.body,
  },
  footerLink: {
    ...textStyles.link,
  },
});
