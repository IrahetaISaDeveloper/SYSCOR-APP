import React from 'react';
import { View, Text, Image, Alert, TouchableOpacity } from 'react-native';
import InputText from '../../components/commons/InputText';
import Button from '../../components/commons/Button';
import { useRegisterCustomer } from '../../hooks/useRegisterCustomer';
import styles from '../../styles/RegisterCustomer'; // Importamos los estilos desde su carpeta correspondiente

export default function RegisterCustomerScreen({ navigation }) {
  // Me traigo toda la lógica del hook para manejar los estados del registro
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
  } = useRegisterCustomer();

  // Función al presionar registrarse para mostrar la alerta de éxito si todo sale bien
  const onPressRegister = async () => {
    const success = await handleRegister(navigation);
    if (success) {
      Alert.alert('Éxito', 'Te mandamos el código de verificación a tu correo.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Círculos decorativos de fondo */}
      <View style={styles.circleLeft} />
      <View style={styles.circleRight} />

      <View style={styles.card}>
        {/* Logo del proyecto */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/logo png horizontal claro.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Crea tu cuenta</Text>
        <Text style={styles.subtitle}>Regístrate para comenzar</Text>

        {/* Formulario con los inputs reutilizables */}
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

          {/* Sección para mostrar los errores si fallan las validaciones */}
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

          {/* Botón de registrarse con su color respectivo (sin disabled para que lance el mensaje de error al hacer clic si falta algo) */}
          <Button
            title={loading ? 'Registrando...' : 'Registrarse'}
            onPress={onPressRegister}
            loading={loading}
            style={{ backgroundColor: '#D32F2F' }}
          />

          {/* Enlace inferior para redirigir al login si ya tengo cuenta */}
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