import React from 'react';
import { View, Text, StyleSheet, Image, Alert, TouchableOpacity } from 'react-native';
import InputText from '../../components/commons/InputText';
import Button from '../../components/commons/Button'; // o { Button } de RN si aún no lo creaste
import { LoginEmployees } from '../../hooks/LoginEmployees';

export default function LoginEmployeeScreen() {
  const { email, setEmail, password, setPassword, loading, error, handleLogin } = LoginEmployees();

  const onPressLogin = async () => {
    await handleLogin();
    // Opcional: alerta de éxito, aunque el cambio de pantalla ocurre automáticamente al actualizar el contexto
    if (!error) {
      Alert.alert('Success', 'Welcome back!');
    }
  };

  return (
    <View style={styles.container}>
      {/* Fondo con círculos difuminados (opcional) */}
      <View style={styles.circleLeft} />
      <View style={styles.circleRight} />

      {/* Tarjeta de login */}
      <View style={styles.card}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/logo png horizontal claro.png')} // ajusta la ruta a tu logo
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Título y subtítulo */}
        <Text style={styles.title}>Employee Portal</Text>
        <Text style={styles.subtitle}>Enter your credentials</Text>

        {/* Campos */}
        <View style={styles.form}>
          <InputText
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="employee@corral.com"
            keyboardType="email-address"
          />
          <InputText
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="********"
            secureTextEntry
          />

          {/* Enlace a recuperación (sin funcionalidad aún) */}
          <TouchableOpacity
            onPress={() => Alert.alert('Info', 'Password recovery will be available soon.')}
          >
            <Text style={styles.forgotPassword}>Forgot your password?</Text>
          </TouchableOpacity>

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
            title={loading ? 'Signing in...' : 'Sign In'}
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
    backgroundColor: '#F3F0EB', // mismo color de fondo que la web
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
    backgroundColor: 'rgba(255, 0, 0, 0.05)', // rojo muy suave
    blurRadius: 50, // en RN no existe blur directamente, pero se puede simular con opacidad
  },
  circleRight: {
    position: 'absolute',
    right: -100,
    bottom: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0, 200, 0, 0.03)', // verde muy suave
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
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
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 25,
  },
  form: {
    width: '100%',
  },
  forgotPassword: {
    color: '#EF4444',
    fontSize: 13,
    textAlign: 'right',
    marginBottom: 15,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  errorTitle: {
    fontWeight: 'bold',
    color: '#DC2626',
    fontSize: 14,
  },
  errorMessage: {
    color: '#DC2626',
    fontSize: 13,
    marginTop: 4,
  },
});