import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAuthTheme } from '@syscor/shared/src/styles/authTheme';
import { textStyles } from '@syscor/shared/src/styles/typography';
import AuthScreenLayout from '@syscor/shared/src/components/auth/AuthScreenLayout';
import AuthHeader from '@syscor/shared/src/components/auth/AuthHeader';
import AuthField from '@syscor/shared/src/components/auth/AuthField';
import AuthButton from '@syscor/shared/src/components/auth/AuthButton';
import StepProgress from '@syscor/shared/src/components/auth/StepProgress';
import useRecoveryPassword from '../../hooks/useRecoveryPassword';

// Paso 1 de recuperar contraseña: se pide el correo de la cuenta y el
// backend envía un código de un solo uso.
export default function RequestRecoveryCodeScreen({ navigation }) {
  const { isDark, t, m } = useAuthTheme();
  const ms = m.ms;

  const { email, setEmail, inputError, apiError, isLoading, handleRequestCode } =
    useRecoveryPassword();

  const onSubmit = async () => {
    const result = await handleRequestCode();
    if (result.ok) {
      navigation.navigate('VerifyRecoveryCode', { email: result.email });
    }
  };

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
    <AuthButton
      tokens={t}
      metrics={m}
      title="Enviar código"
      onPress={onSubmit}
      loading={isLoading}
      disabled={!email.trim()}
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
        <Icon name="lock-open-outline" size={ms(26)} color={t.accent} />
      </View>

      <Text style={[styles.title, { color: t.textPrimary, fontSize: ms(26) }]}>
        Recuperar contraseña
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
        Escribe el correo de tu cuenta y te enviaremos un código para crear una
        contraseña nueva.
      </Text>

      {apiError ? (
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
            <Text style={[styles.errorTitle, { color: t.danger, fontSize: ms(13.5) }]}>
              {apiError.title}
            </Text>
            <Text
              style={[
                styles.errorMessage,
                { color: t.textSecondary, fontSize: ms(13), lineHeight: ms(18) },
              ]}
            >
              {apiError.message}
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
        returnKeyType="send"
        onSubmitEditing={onSubmit}
        error={inputError || null}
      />
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
});
