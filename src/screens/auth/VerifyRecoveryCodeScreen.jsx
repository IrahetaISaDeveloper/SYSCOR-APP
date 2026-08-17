import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import AuthCard from "../../components/commons/AuthCard";
import DigitInput from "../../components/auth/DigitInput";
import Toast from "../../components/commons/Toast";
import useRecoveryPassword from "../../hooks/useRecoveryPassword";
import authCardStyles from "../../styles/authCardStyles";
import verifyRecoveryCodeScreenStyles from "../../styles/verifyRecoveryCodeScreenStyles";
import { colors } from "../../styles/theme";

export default function VerifyRecoveryCodeScreen({ navigation, route }) {
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

  // El backend identifica el código por correo — sin esto, la verificación
  // siempre falla porque cada pantalla usa su propia instancia del hook.
  useEffect(() => {
    if (email) setEmail(email);
  }, [email, setEmail]);

  // Auto-verifica en cuanto se completan los 6 dígitos (sin botón "Verificar").
  useEffect(() => {
    const code = digits.join("");
    if (code.length === 6 && !isLoading && !success && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      handleVerifyCode().then((result) => {
        if (result.ok) {
          setTimeout(() => {
            navigation.replace("ResetPassword", { email });
          }, 700);
        } else {
          hasSubmittedRef.current = false;
        }
      });
    }
  }, [digits, isLoading, success, handleVerifyCode, navigation, email]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <AuthCard>
      <Toast
        visible={Boolean(apiError)}
        message={apiError ? `${apiError.title}${apiError.message ? `: ${apiError.message}` : ""}` : ""}
        type="error"
      />

      <Text style={authCardStyles.title}>Ingresa el código</Text>
      <Text style={authCardStyles.subtitle}>
        {email
          ? `Escribe el código de 6 dígitos que enviamos a ${email}`
          : "Escribe el código de 6 dígitos que hemos enviado a tu correo"}
      </Text>

      {!success ? (
        <>
          <View style={verifyRecoveryCodeScreenStyles.digitsRow}>
            {digits.map((digit, index) => (
              <DigitInput
                key={index}
                value={digit}
                onChangeText={(val) => handleDigitChange(val, index, inputRefs)}
                onKeyPress={(e) => handleDigitKeyPress(e, index, inputRefs)}
                inputRef={(el) => (inputRefs.current[index] = el)}
              />
            ))}
          </View>

          {isLoading ? (
            <View style={{ alignItems: "center", marginBottom: 10 }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null}

          {resendSuccess ? (
            <View style={authCardStyles.successContainer}>
              <Text style={authCardStyles.successTitle}>{resendSuccess}</Text>
            </View>
          ) : null}

          {inputError ? <Text style={{ color: colors.error, fontSize: 13, textAlign: "center", marginBottom: 10 }}>{inputError}</Text> : null}

          <View style={{ alignItems: "center", gap: 10, marginTop: 6 }}>
            <TouchableOpacity onPress={handleResendCode} disabled={timer > 0 || isLoadingResend}>
              <Text style={[authCardStyles.linkText, (timer > 0 || isLoadingResend) && { color: colors.textLight }]}>
                {isLoadingResend
                  ? "Reenviando..."
                  : timer > 0
                  ? `Reenviar en (${formatTime(timer)})`
                  : "¿No recibiste el código? Reenviar"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={[authCardStyles.linkText, { color: colors.textGray, textDecorationLine: "underline" }]}>
                Volver al inicio de sesión
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={authCardStyles.successContainer}>
          <Text style={authCardStyles.successTitle}>Código verificado correctamente</Text>
          <Text style={authCardStyles.successMessage}>Tu identidad ha sido confirmada</Text>
        </View>
      )}

      <Text style={authCardStyles.footerText}>
        © Taquería El Corral. Acceso restringido a personal autorizado.
      </Text>
    </AuthCard>
  );
}
