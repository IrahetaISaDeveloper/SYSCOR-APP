import React from 'react';
import { View, Text, Image, Alert, TouchableOpacity } from 'react-native';
import InputText from '../../components/commons/InputText';
import Button from '../../components/commons/Button';
import { useCustomerAuth } from '../../hooks/useCustomerAuth'; // <-- CORREGIDO
import styles from '../../styles/RegisterCustomer';

export default function RegisterCustomerScreen({ navigation }) {
  const {
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    password,
    setPassword,
    loading,
    error,
    handleRegister,
  } = useCustomerAuth(); // <-- CORREGIDO

  const onPressRegister = async () => {
    const success = await handleRegister(navigation);
    if (success) {
      Alert.alert('Éxito', 'Te mandamos el código de verificación a tu correo.');
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

        <Text style={styles.title}>Crea tu cuenta</Text>
        <Text style={styles.subtitle}>Regístrate para comenzar</Text>

        <View style={styles.form}>
          <InputText
            label="Nombre"
            value={name}
            onChangeText={setName}
            placeholder="Tu nombre completo"
          />
          <InputText
            label="Correo"
            value={email}
            onChangeText={setEmail}
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
          />
          <InputText
            label="Teléfono"
            value={phone}
            onChangeText={setPhone}
            placeholder="00000000"
            keyboardType="phone-pad"
            maxLength={8}
          />
          <InputText
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="********"
            secureTextEntry
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
            title={loading ? 'Registrando...' : 'Registrarse'}
            onPress={onPressRegister}
            loading={loading}
            style={{ backgroundColor: '#D32F2F' }}
          />

          <TouchableOpacity
            style={styles.loginLinkContainer}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.textRegular}>¿Ya tengo cuenta?</Text>
            <Text style={styles.textAction}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}