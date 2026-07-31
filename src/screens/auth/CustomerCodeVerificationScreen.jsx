import React from 'react';
import { View, Text, Image, Alert, TouchableOpacity } from 'react-native';
import InputText from '../../components/commons/InputText';
import Button from '../../components/commons/Button';
import { useCustomerAuth } from '../../hooks/useCustomerAuth'; // <-- CORREGIDO
import styles from '../../styles/CustomerCodeVerification';

export default function CustomerCodeVerificationScreen({ navigation, route }) {
  const {
    email,
    code,
    setCode,
    loading,
    error,
    timer,
    handleVerifyCode,
    handleResendCode,
  } = useCustomerAuth(route); // <-- CORREGIDO

  const onPressVerify = async () => {
    const success = await handleVerifyCode(navigation);
    if (success) {
      Alert.alert('¡Listo!', '¡Cuenta verificada correctamente!');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.circleLeft} />
      <View style={styles.circleRight} />

      <View style={styles.card}>
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

        <View style={styles.form}>
          <InputText
            label="Código de verificación"
            value={code}
            onChangeText={setCode}
            placeholder="123456"
            keyboardType="numeric"
            maxLength={6}
          />

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

          <Button
            title={loading ? 'Verificando...' : 'Verificar código'}
            onPress={onPressVerify}
            loading={loading}
            disabled={!code || code.length < 6}
            style={{ backgroundColor: '#D32F2F' }}
          />

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