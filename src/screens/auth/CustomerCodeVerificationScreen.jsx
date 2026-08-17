import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import styles from '../../styles/CustomerCodeVerification';

export default function CustomerCodeVerificationScreen({ navigation, route }) {
  const { email } = route.params;
  const {
    code, setCode,
    loading, error,
    handleVerifyCode,
    handleResendCode,
  } = useCustomerAuth();

  const onPressVerify = async () => {
    const success = await handleVerifyCode(navigation);
    if (success) {
      Alert.alert('¡Listo!', '¡Tu correo fue verificado!');
    }
  };

  const onPressResend = () => {
    handleResendCode();
    Alert.alert('Reenviado', 'Se ha enviado un nuevo código a tu correo.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.shieldContainer}>
          <Icon name="shield-checkmark" size={40} color="#C62828" />
        </View>
        <Text style={styles.title}>Ingresa el código</Text>
        <Text style={styles.subtitle}>
          Hemos enviado un código de 6 dígitos a tu correo electrónico.
        </Text>
      </View>

      <View style={styles.codeContainer}>
        {code.split('').map((digit, index) => (
          <TextInput
            key={index}
            style={styles.codeInput}
            maxLength={1}
            keyboardType="number-pad"
            value={digit}
            onChangeText={(text) => {
              const newCode = code.split('');
              newCode[index] = text;
              setCode(newCode.join(''));
            }}
          />
        ))}
      </View>

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

      <TouchableOpacity style={styles.button} onPress={onPressVerify} disabled={loading || code.length < 6}>
        <Text style={styles.buttonText}>{loading ? 'VERIFICANDO...' : 'VERIFICAR'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resendContainer} onPress={onPressResend}>
        <Text style={styles.resendText}>
          ¿No recibiste el código? <Text style={styles.resendLink}>Reenviar</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}