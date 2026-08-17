import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import Toast from '../../components/commons/Toast';
import styles from '../../styles/CustomerCodeVerification';

export default function CustomerCodeVerificationScreen({ navigation, route }) {
  const { name, email, phone, password } = route.params || {};
  const {
    setName,
    setEmail,
    setPhone,
    setPassword,
    code, setCode,
    loading, error,
    handleVerifyCode,
    handleResendCode,
  } = useCustomerAuth();
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const inputRefs = useRef([]);

  // El backend identifica el código por correo — sin esto, la verificación
  // y el reenvío siempre fallan porque esta pantalla usa su propia instancia del hook.
  useEffect(() => {
    if (name) setName(name);
    if (email) setEmail(email);
    if (phone) setPhone(phone);
    if (password) setPassword(password);
  }, [name, email, phone, password, setName, setEmail, setPhone, setPassword]);

  const updateDigit = (text, index) => {
    const nextCode = code.padEnd(6, ' ').split('');
    nextCode[index] = text.replace(/[^a-zA-Z0-9]/g, '').slice(-1).toUpperCase();
    const formattedCode = nextCode.join('').replace(/\s/g, '');
    setCode(formattedCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus?.();
    }
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus?.();
    }
  };

  const onPressVerify = async () => {
    const success = await handleVerifyCode(navigation);
    if (success) {
      setToast({ visible: true, message: '¡Tu correo fue verificado!', type: 'success' });
    }
  };

  const onPressResend = () => {
    handleResendCode();
    setToast({ visible: true, message: 'Se ha enviado un nuevo código a tu correo.', type: 'success' });
  };

  return (
    <View style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />

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
        {Array.from({ length: 6 }).map((_, index) => (
          <TextInput
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            style={styles.codeInput}
            maxLength={1}
            keyboardType="default"
            autoCapitalize="characters"
            autoCorrect={false}
            value={code[index] || ''}
            onChangeText={(text) => updateDigit(text, index)}
            onKeyPress={(event) => handleKeyPress(event, index)}
            selectTextOnFocus
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
