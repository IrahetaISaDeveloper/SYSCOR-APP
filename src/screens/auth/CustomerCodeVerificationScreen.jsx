import React from 'react';
import { View, Text, Image, Alert, TouchableOpacity } from 'react-native';
import InputText from '../../components/commons/InputText';
import Button from '../../components/commons/Button';
import { useCustomerVerification } from '../../hooks/useCustomerVerification';
import styles from '../../styles/CustomerCodeVerification'; // Importamos los estilos desde su carpeta correspondiente

export default function CustomerCodeVerificationScreen({ navigation, route }) {
  // Me traigo los estados y funciones del hook de verificación
  const {
    email,
    code,
    setCode,
    loading,
    error,
    timer,
    handleVerifyCode,
    handleResendCode,
  } = useCustomerVerification(route);

  // Función al presionar verificar para confirmar que el código es correcto
  const onPressVerify = async () => {
    const success = await handleVerifyCode(navigation);
    if (success) {
      Alert.alert('¡Listo!', '¡Cuenta verificada correctamente!');
    }
  };

  return (
    <View style={styles.container}>
      {/* Fondos decorativos */}
      <View style={styles.circleLeft} />
      <View style={styles.circleRight} />

      <View style={styles.card}>
        {/* Logo de la app */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/logo png horizontal claro.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Verificar código</Text>
        <Text style={styles.subtitle}>
          Ingresa el código de 6 dígitos que enviamos a{'\n'}
          <Text style={{ fontWeight: 'bold' }}>{email}</Text>
        </Text>

        {/* Formulario de código */}
        <View style={styles.form}>
          <InputText
            label="Código de verificación"
            value={code}
            onChangeText={setCode}
            placeholder="123456"
            keyboardType="numeric"
            maxLength={6}
          />

          {/* Contenedor de errores si el código falla */}
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

          {/* Botón principal para verificar */}
          <Button
            title={loading ? 'Verificando...' : 'Verificar código'}
            onPress={onPressVerify}
            loading={loading}
            disabled={!code || code.length < 6}
            style={{ backgroundColor: '#D32F2F' }}
          />

          {/* Opción para pedir otro código con el temporizador */}
          <TouchableOpacity
            onPress={handleResendCode}
            disabled={timer > 0}
            style={styles.resendContainer}
          >
            <Text style={[styles.resendText, timer > 0 && styles.disabledText]}>
              {timer > 0 ? `Reenviar código en ${timer}s` : '¿No recibiste el código? Reenviar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}