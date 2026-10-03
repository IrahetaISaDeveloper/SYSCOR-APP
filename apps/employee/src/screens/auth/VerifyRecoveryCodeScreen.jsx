import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAuthTheme } from '@syscor/shared/src/styles/authTheme';
import { textStyles } from '@syscor/shared/src/styles/typography';
import AuthScreenLayout from '@syscor/shared/src/components/auth/AuthScreenLayout';
import AuthHeader from '@syscor/shared/src/components/auth/AuthHeader';
import StepProgress from '@syscor/shared/src/components/auth/StepProgress';
import useRecoveryPassword from '../../hooks/useRecoveryPassword';

const CODE_LENGTH = 6;

const formatTime = (totalSeconds) => {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
};

// Paso 2 de recuperar contraseña: las seis casillas del código. Se verifica
// solo al completarse, sin botón.
export default function VerifyRecoveryCodeScreen({ navigation, route }) {
  const { isDark, t, m } = useAuthTheme();
  const ms = m.ms;

  const { email } = route.params || {};

  const {
    digits,
    setEmail,
    inputError,
    apiError,
    isLoading,
    isLoadingResend,
    resendSuccess,
    timer,
    success,
    handleDigitChange,
    handleDigitKeyPress,
    handleVerifyCode,
    handleResendCode,
  } = useRecoveryPassword();

  const inputRefs = useRef([]);
  const hasSubmittedRef = useRef(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // El backend identifica el código por correo; el email se pasa además
  // explícitamente a handleVerifyCode para evitar closures obsoletas.
  useEffect(() => {
    if (email) setEmail(email);
  }, [email, setEmail]);

  // Se verifica en cuanto están los 6 dígitos.
  useEffect(() => {
    const code = digits.join('');
    if (code.length === CODE_LENGTH && !hasSubmittedRef.current && !success) {
      hasSubmittedRef.current = true;
      handleVerifyCode(code, email).then((result) => {
        if (result.ok) {
          setTimeout(() => {
            navigation.replace('ResetPassword', { email });
          }, 700);
        } else {
          // Solo se reintenta si borra y vuelve a completar.
          hasSubmittedRef.current = false;
        }
      });
    }
  }, [digits, success, navigation, email, handleVerifyCode]);

  const canResend = timer <= 0 && !isLoadingResend;

  const header = (
    <View style={{ gap: ms(14) }}>
      <AuthHeader
        tokens={t}
        metrics={m}
        label="PASO 2 DE 3"
        onBack={() => navigation.goBack()}
        showBack={navigation.canGoBack()}
      />
      <StepProgress tokens={t} total={3} current={2} />
    </View>
  );

  const footer = (
    <TouchableOpacity
      style={{ alignItems: 'center', paddingVertical: ms(6) }}
      onPress={() => handleResendCode(email)}
      disabled={!canResend}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.resendText,
          { color: t.textSecondary, fontSize: ms(14) },
          !canResend && { opacity: 0.5 },
        ]}
      >
        {timer > 0 ? (
          <>Puedes pedir otro código en {formatTime(timer)}</>
        ) : (
          <>
            ¿No recibiste el código?{' '}
            <Text style={[styles.resendLink, { color: t.accent }]}>Reenviar</Text>
          </>
        )}
      </Text>
    </TouchableOpacity>
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
        <Icon name="shield-checkmark" size={ms(26)} color={t.accent} />
      </View>

      <Text style={[styles.title, { color: t.textPrimary, fontSize: ms(26) }]}>
        Ingresa el código
      </Text>
      <Text
        style={[
          styles.subtitle,
          {
            color: t.textSecondary,
            fontSize: ms(14),
            lineHeight: ms(21),
            marginTop: ms(6),
            marginBottom: ms(22),
          },
        ]}
      >
        Enviamos un código de 6 dígitos a{'\n'}
        <Text style={[styles.email, { color: t.textPrimary }]}>{email}</Text>
      </Text>

      {/* Casillas del código */}
      <View style={[styles.codeRow, { gap: ms(8), marginBottom: ms(18) }]}>
        {Array.from({ length: CODE_LENGTH }).map((_, index) => {
          const filled = Boolean(digits[index]);
          const isFocused = focusedIndex === index;
          return (
            <TextInput
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              style={[
                styles.codeInput,
                {
                  backgroundColor: t.surface,
                  borderColor: isFocused || filled ? t.accent : t.border,
                  color: t.textPrimary,
                  height: ms(58),
                  borderRadius: ms(12),
                  fontSize: ms(21),
                },
              ]}
              maxLength={1}
              keyboardType="default"
              autoCapitalize="characters"
              autoCorrect={false}
              value={digits[index] || ''}
              onChangeText={(text) => handleDigitChange(text, index, inputRefs)}
              onKeyPress={(event) => handleDigitKeyPress(event, index, inputRefs)}
              onFocus={() => setFocusedIndex(index)}
              editable={!isLoading}
              selectTextOnFocus
            />
          );
        })}
      </View>

      {/* Estado: verificando, error o reenvío */}
      {isLoading ? (
        <View style={[styles.noticeRow, { gap: ms(9), marginBottom: ms(14) }]}>
          <Icon name="hourglass-outline" size={ms(16)} color={t.textMuted} />
          <Text style={[styles.noticeText, { color: t.textSecondary, fontSize: ms(13) }]}>
            Verificando tu código…
          </Text>
        </View>
      ) : null}

      {success ? (
        <View
          style={[
            styles.noticeBox,
            {
              backgroundColor: t.accentSoft,
              borderColor: t.success,
              borderRadius: ms(12),
              padding: ms(13),
              gap: ms(10),
              marginBottom: ms(14),
            },
          ]}
        >
          <Icon name="checkmark-circle-outline" size={ms(18)} color={t.success} />
          <Text
            style={[
              styles.noticeText,
              styles.flex,
              { color: t.textSecondary, fontSize: ms(13), lineHeight: ms(18) },
            ]}
          >
            Código correcto. Un momento…
          </Text>
        </View>
      ) : null}

      {apiError || inputError ? (
        <View
          style={[
            styles.noticeBox,
            {
              backgroundColor: t.accentSoft,
              borderColor: t.danger,
              borderRadius: ms(12),
              padding: ms(13),
              gap: ms(10),
              marginBottom: ms(14),
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
                styles.noticeText,
                { color: t.textSecondary, fontSize: ms(13), lineHeight: ms(18) },
              ]}
            >
              {apiError ? apiError.message : inputError}
            </Text>
          </View>
        </View>
      ) : null}

      {resendSuccess ? (
        <View
          style={[
            styles.noticeBox,
            {
              backgroundColor: t.surfaceMuted,
              borderColor: t.success,
              borderRadius: ms(12),
              padding: ms(13),
              gap: ms(10),
              marginBottom: ms(14),
            },
          ]}
        >
          <Icon name="mail-outline" size={ms(18)} color={t.success} />
          <Text
            style={[
              styles.noticeText,
              styles.flex,
              { color: t.textSecondary, fontSize: ms(13) },
            ]}
          >
            {resendSuccess}
          </Text>
        </View>
      ) : null}

      <View
        style={[
          styles.hint,
          {
            backgroundColor: t.surface,
            borderColor: t.border,
            borderRadius: ms(12),
            paddingHorizontal: ms(14),
            paddingVertical: ms(13),
            gap: ms(9),
          },
        ]}
      >
        <Icon name="help-circle-outline" size={ms(17)} color={t.textMuted} />
        <Text
          style={[
            styles.noticeText,
            styles.flex,
            { color: t.textSecondary, fontSize: ms(13), lineHeight: ms(18) },
          ]}
        >
          Revisa tu carpeta de spam si no aparece.
        </Text>
      </View>
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
  email: {
    ...textStyles.link,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  codeInput: {
    ...textStyles.num,
    flex: 1,
    // Las 6 casillas reparten el ancho: en pantallas angostas se encogen en
    // vez de desbordarse.
    minWidth: 0,
    borderWidth: 1.5,
    textAlign: 'center',
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
  },
  noticeText: {
    ...textStyles.body,
  },
  errorTitle: {
    ...textStyles.link,
    marginBottom: 2,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  resendText: {
    ...textStyles.body,
    textAlign: 'center',
  },
  resendLink: {
    ...textStyles.link,
  },
});
