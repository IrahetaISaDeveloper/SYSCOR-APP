import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import InputText from '../../components/commons/InputText';
import Button from '../../components/commons/Button';
import Toast from '../../components/commons/Toast';
import { LoginEmployees } from '../../hooks/LoginEmployees';
import { colors, radius } from '../../styles/theme';

export default function LoginEmployeeScreen() {
  const { email, setEmail, password, setPassword, loading, error, handleLogin } = LoginEmployees();
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });

  const onPressLogin = async () => {
    await handleLogin();
    if (!error) {
      setToast({ visible: true, message: '¡Bienvenido de nuevo!' });
    }
  };

  return (
    <View style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type="success"
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />

      {/* Fondo con círculos difuminados (opcional) */}
      <View style={styles.circleLeft} />
      <View style={styles.circleRight} />

      {/* Tarjeta de login */}
      <View style={styles.card}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/logo png horizontal claro.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Título y subtítulo */}
        <Text style={styles.title}>Portal de Empleados</Text>
        <Text style={styles.subtitle}>Ingresa tus credenciales</Text>

        {/* Campos */}
        <View style={styles.form}>
          <InputText
            label="Correo"
            value={email}
            onChangeText={setEmail}
            placeholder="empleado@elcorral.com"
            keyboardType="email-address"
          />
          <InputText
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            rightIcon={
              <Icon
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.textLight}
              />
            }
            onRightIconPress={() => setShowPassword((prev) => !prev)}
          />

          {/* Mensaje de error con título y mensaje */}
          {error && (
            <View style={styles.errorContainer}>
              {error.title ? (
                <>
                  <Text style={styles.errorTitle}>{error.title}</Text>
                  {error.message ? <Text style={styles.errorMessage}>{error.message}</Text> : null}
                </>
              ) : (
                <Text style={styles.errorTitle}>{error}</Text>
              )}
            </View>
          )}

          {/* Botón de inicio de sesión */}
          <Button
            title={loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            onPress={onPressLogin}
            loading={loading}
            disabled={!email || !password}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  circleLeft: {
    position: 'absolute',
    left: -100,
    top: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(198, 40, 40, 0.05)',
  },
  circleRight: {
    position: 'absolute',
    right: -100,
    bottom: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(198, 40, 40, 0.03)',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 160,
    height: 90,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.textDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textGray,
    textAlign: 'center',
    marginBottom: 25,
  },
  form: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: colors.errorLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  errorTitle: {
    fontWeight: 'bold',
    color: colors.error,
    fontSize: 14,
  },
  errorMessage: {
    color: colors.error,
    fontSize: 13,
    marginTop: 4,
  },
});
