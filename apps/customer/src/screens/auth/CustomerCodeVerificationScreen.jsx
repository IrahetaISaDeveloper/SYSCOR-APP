import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAuthTheme } from '@syscor/shared/src/styles/authTheme';
import { textStyles } from '@syscor/shared/src/styles/typography';
import AuthScreenLayout from '@syscor/shared/src/components/auth/AuthScreenLayout';
import AuthHeader from '@syscor/shared/src/components/auth/AuthHeader';
import AuthButton from '@syscor/shared/src/components/auth/AuthButton';
import StepProgress from '@syscor/shared/src/components/auth/StepProgress';
import Toast from '@syscor/shared/src/components/commons/Toast';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';

const CODE_LENGTH = 6;
const EXPIRY_SECONDS = 5 * 60;

const formatTime = (totalSeconds) => {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export default function CustomerCodeVerificationScreen({ navigation, route }) {
  const { isDark, t, m } = useAuthTheme();
  const ms = m.ms;

  // Datos acumulados en los pasos 1 y 2.
  const { firstName, lastName, email, phone, password, address } = route.params || {};

  const { code, setCode, loading, error, handleVerifyCode, handleResendCode } =
    useCustomerAuth();

  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [secondsLeft, setSecondsLeft] = useState(EXPIRY_SECONDS);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef([]);

  // Cuenta regresiva de validez del código.
  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const updateDigit = (text, index) => {
    const chars = code.padEnd(CODE_LENGTH, ' ').split('');
    chars[index] = text.replace(/[^a-zA-Z0-9]/g, '').slice(-1).toUpperCase();
    setCode(chars.join('').replace(/\s/g, ''));

    if (text && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus?.();
    }
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus?.();
    }
  };

  const onPressVerify = async () => {
    await handleVerifyCode(navigation, {
      firstName,
      lastName,
      email,
      phone,
      password,
      address,
      code,
    });
  };

  const onPressResend = () => {
    handleResendCode(email);
    setSecondsLeft(EXPIRY_SECONDS);
    setToast({
      visible: true,
      message: 'Se ha enviado un nuevo código a tu correo.',
      type: 'success',
    });
  };

  const expired = secondsLeft <= 0;

  const header = (
    <View style={{ gap: ms(14) }}>
      <AuthHeader
        tokens={t}
        metrics={m}
        label="PASO 3 DE 3"
        onBack={() => navigation.goBack()}
      />
      <StepProgress tokens={t} total={3} current={3} />
    </View>
  );

  // La nota del spam queda fija al pie, fuera del scroll.
  const footer = (
    <View
      style={[
        styles.hint,
        {
          backgroundColor: t.surface,
          borderColor: t.border,
          gap: ms(9),
          paddingHorizontal: ms(14),
          paddingVertical: ms(13),
          borderRadius: ms(12),
        },
      ]}
    >
      <Icon name="help-circle-outline" size={ms(17)} color={t.textMuted} />
      <Text style={[styles.hintText, { color: t.textSecondary, fontSize: ms(13) }]}>
        Revisa tu carpeta de spam si no aparece
      </Text>
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
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      <View
        style={[
          styles.shield,
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
          const filled = Boolean(code[index]);
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
              value={code[index] || ''}
              onChangeText={(text) => updateDigit(text, index)}
              onKeyPress={(event) => handleKeyPress(event, index)}
              onFocus={() => setFocusedIndex(index)}
              selectTextOnFocus
            />
          );
        })}
      </View>

      {/* Vigencia del código */}
      <View
        style={[
          styles.expiryBox,
          {
            backgroundColor: t.surfaceMuted,
            gap: ms(9),
            paddingHorizontal: ms(14),
            paddingVertical: ms(13),
            borderRadius: ms(12),
            marginBottom: ms(20),
          },
        ]}
      >
        <Icon name="time-outline" size={ms(17)} color={t.textMuted} />
        <Text
          style={[styles.expiryLabel, { color: t.textSecondary, fontSize: ms(13.5) }]}
        >
          {expired ? 'El código expiró' : 'El código expira en'}
        </Text>
        <Text
          style={[
            styles.expiryTime,
            { color: expired ? t.danger : t.accent, fontSize: ms(14) },
          ]}
        >
          {formatTime(Math.max(secondsLeft, 0))}
        </Text>
      </View>

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
          <View style={styles.errorTexts}>
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

      <AuthButton
        tokens={t}
        metrics={m}
        title="Verificar"
        onPress={onPressVerify}
        loading={loading}
        disabled={code.length < CODE_LENGTH}
        style={{ marginBottom: ms(14) }}
      />

      <TouchableOpacity
        style={styles.resend}
        onPress={onPressResend}
        activeOpacity={0.7}
      >
        <Text style={[styles.resendText, { color: t.textSecondary, fontSize: ms(14) }]}>
          ¿No recibiste el código?{' '}
          <Text style={[styles.resendLink, { color: t.accent }]}>Reenviar</Text>
        </Text>
      </TouchableOpacity>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  shield: {
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
    // Las 6 casillas reparten el ancho disponible: en pantallas angostas se
    // encogen en vez de desbordarse.
    minWidth: 0,
    borderWidth: 1.5,
    textAlign: 'center',
  },
  expiryBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryLabel: {
    ...textStyles.body,
    flex: 1,
  },
  expiryTime: {
    ...textStyles.num,
    letterSpacing: 0.5,
  },
  errorBox: {
    flexDirection: 'row',
    borderWidth: 1,
  },
  errorTexts: {
    flex: 1,
  },
  errorTitle: {
    ...textStyles.link,
    marginBottom: 2,
  },
  errorMessage: {
    ...textStyles.body,
  },
  resend: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  resendText: {
    ...textStyles.body,
  },
  resendLink: {
    ...textStyles.link,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  hintText: {
    ...textStyles.body,
    flex: 1,
  },
});
