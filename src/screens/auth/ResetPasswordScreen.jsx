import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons as Icon } from "@expo/vector-icons";
import AuthCard from "../../components/commons/AuthCard";
import InputText from "../../components/commons/InputText";
import Button from "../../components/commons/Button";
import Toast from "../../components/commons/Toast";
import useRecoveryPassword from "../../hooks/useRecoveryPassword";
import authCardStyles from "../../styles/authCardStyles";
import { colors } from "../../styles/theme";

export default function ResetPasswordScreen({ navigation, route }) {
  const { email } = route.params || {};
  const [showPassword, setShowPassword] = useState(false);
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
      <Toast
        visible={Boolean(apiError)}
        message={apiError ? `${apiError.title}${apiError.message ? `: ${apiError.message}` : ""}` : ""}
        type="error"
      />

      <Text style={authCardStyles.title}>Nueva contraseña</Text>
      <Text style={authCardStyles.subtitle}>Ingresa y confirma tu nueva clave de acceso</Text>

      {!success ? (
        <>
          <InputText
            label="Nueva contraseña"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            rightIcon={
              <Icon
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={colors.textLight}
              />
            }
            onRightIconPress={() => setShowPassword((prev) => !prev)}
          />
          <InputText
            label="Confirmar contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            rightIcon={
              <Icon
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={colors.textLight}
              />
            }
            onRightIconPress={() => setShowPassword((prev) => !prev)}
          />

          {inputError ? <Text style={{ color: colors.error, fontSize: 13, textAlign: "center", marginBottom: 10 }}>{inputError}</Text> : null}

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
