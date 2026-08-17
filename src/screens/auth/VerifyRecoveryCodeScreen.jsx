import React, { useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import AuthCard from "../../components/commons/AuthCard";
import Button from "../../components/commons/Button";
import DigitInput from "../../components/auth/DigitInput";
import useRecoveryPassword from "../../hooks/useRecoveryPassword";
import authCardStyles from "../../styles/authCardStyles";
import verifyRecoveryCodeScreenStyles from "../../styles/verifyRecoveryCodeScreenStyles";

export default function VerifyRecoveryCodeScreen({ navigation, route }) {
  const { email } = route.params || {};

  const {
    digits,
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

  const onSubmit = async () => {
    const result = await handleVerifyCode();
    if (result.ok) {
      setTimeout(() => {
        navigation.replace("ResetPassword");
      }, 800);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <AuthCard>
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

          {resendSuccess ? (
            <View style={authCardStyles.successContainer}>
              <Text style={authCardStyles.successTitle}>{resendSuccess}</Text>
            </View>
          ) : null}

          {inputError ? <Text style={{ color: "#EF4444", fontSize: 13, textAlign: "center", marginBottom: 10 }}>{inputError}</Text> : null}

          {apiError && (
            <View style={authCardStyles.errorContainer}>
              <Text style={authCardStyles.errorTitle}>{apiError.title}</Text>
              {apiError.message ? <Text style={authCardStyles.errorMessage}>{apiError.message}</Text> : null}
            </View>
          )}

          <Button
            title={isLoading ? "Verificando..." : "Verificar"}
            onPress={onSubmit}
            loading={isLoading}
          />

          <View style={{ alignItems: "center", gap: 10, marginTop: 6 }}>
            <TouchableOpacity onPress={handleResendCode} disabled={timer > 0 || isLoadingResend}>
              <Text style={[authCardStyles.linkText, (timer > 0 || isLoadingResend) && { color: "#9CA3AF" }]}>
                {isLoadingResend
                  ? "Reenviando..."
                  : timer > 0
                  ? `Reenviar en (${formatTime(timer)})`
                  : "¿No recibiste el código? Reenviar"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={[authCardStyles.linkText, { color: "#6B7280", textDecorationLine: "underline" }]}>
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