import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import AuthCard from "../../components/commons/AuthCard";
import InputText from "../../components/commons/InputText";
import Button from "../../components/commons/Button";
import Toast from "../../components/commons/Toast";
import useRecoveryPassword from "../../hooks/useRecoveryPassword";
import authCardStyles from "../../styles/authCardStyles";
import { colors } from "../../styles/theme";

export default function RequestRecoveryCodeScreen({ navigation }) {
  const {
    email,
    setEmail,
    inputError,
    apiError,
    isLoading,
    success,
    handleRequestCode,
  } = useRecoveryPassword();

  const onSubmit = async () => {
    const result = await handleRequestCode();
    if (result.ok) {
      setTimeout(() => {
        navigation.replace("VerifyRecoveryCode", { email: result.email });
      }, 1200);
    }
  };

  return (
    <AuthCard>
      <Toast
        visible={Boolean(apiError)}
        message={apiError ? `${apiError.title}${apiError.message ? `: ${apiError.message}` : ""}` : ""}
        type="error"
      />

      <Text style={authCardStyles.title}>Recuperar contraseña</Text>
      <Text style={authCardStyles.subtitle}>
        Ingresa tu correo para recibir un código de recuperación
      </Text>

      {!success ? (
        <>
          <InputText
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            placeholder="cliente@correo.com"
            keyboardType="email-address"
          />

          {inputError ? <Text style={{ color: colors.error, fontSize: 13, textAlign: "center", marginBottom: 10 }}>{inputError}</Text> : null}

          <Button
            title={isLoading ? "Enviando..." : "Enviar código"}
            onPress={onSubmit}
            loading={isLoading}
            disabled={!email}
          />

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={authCardStyles.linkText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={authCardStyles.successContainer}>
          <Text style={authCardStyles.successTitle}>Correo enviado correctamente</Text>
          <Text style={authCardStyles.successMessage}>
            Revisa tu bandeja de entrada para el código de recuperación
          </Text>
        </View>
      )}

      <Text style={authCardStyles.footerText}>
        © Taquería El Corral. Acceso restringido a personal autorizado.
      </Text>
    </AuthCard>
  );
}