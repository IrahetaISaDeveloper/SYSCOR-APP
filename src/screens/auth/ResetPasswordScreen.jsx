import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import AuthCard from "../../components/commons/AuthCard";
import InputText from "../../components/commons/InputText";
import Button from "../../components/commons/Button";
import useRecoveryPassword from "../../hooks/useRecoveryPassword";
import authCardStyles from "../../styles/authCardStyles";

export default function ResetPasswordScreen({ navigation }) {
  const {
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

  const onSubmit = async () => {
    const result = await handleResetPassword();
    if (result.ok) {
      setTimeout(() => {
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      }, 2000);
    }
  };

  return (
    <AuthCard>
      <Text style={authCardStyles.title}>Nueva contraseña</Text>
      <Text style={authCardStyles.subtitle}>Ingresa y confirma tu nueva clave de acceso</Text>

      {!success ? (
        <>
          <InputText
            label="Nueva contraseña"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="••••••••"
            secureTextEntry
          />
          <InputText
            label="Confirmar contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          {inputError ? <Text style={{ color: "#EF4444", fontSize: 13, textAlign: "center", marginBottom: 10 }}>{inputError}</Text> : null}

          {apiError && (
            <View style={authCardStyles.errorContainer}>
              <Text style={authCardStyles.errorTitle}>{apiError.title}</Text>
              {apiError.message ? <Text style={authCardStyles.errorMessage}>{apiError.message}</Text> : null}
            </View>
          )}

          <Button
            title={isLoading ? "Guardando..." : "Restablecer contraseña"}
            onPress={onSubmit}
            loading={isLoading}
            disabled={!newPassword || !confirmPassword}
          />

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={authCardStyles.linkText}>Cancelar y volver al login</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={authCardStyles.successContainer}>
          <Text style={authCardStyles.successTitle}>¡Contraseña actualizada!</Text>
          <Text style={authCardStyles.successMessage}>
            Tu contraseña se cambió correctamente. Redirigiéndote al inicio de sesión...
          </Text>
        </View>
      )}

      <Text style={authCardStyles.footerText}>
        © Taquería El Corral. Acceso restringido a personal autorizado.
      </Text>
    </AuthCard>
  );
}