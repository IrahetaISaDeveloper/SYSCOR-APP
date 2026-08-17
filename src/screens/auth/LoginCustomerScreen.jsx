import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useCustomerLogin } from '../../hooks/useCustomerLogin';
import styles from '../../styles/loginCustomer';

// Componentes comunes del proyecto
import InputText from '../../components/commons/InputText';
import Button from '../../components/commons/Button';

export default function LoginCustomerScreen({ navigation }) {
  const { email, setEmail, password, setPassword, loading, error, handleLogin } = useCustomerLogin();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      
      {/* Logo / Título de marca — mantener presionado da acceso al login de empleados */}
      <TouchableOpacity
        style={styles.logoContainer}
        activeOpacity={1}
        onLongPress={() => navigation.navigate('EmployeeLogin')}
        delayLongPress={1800}
      >
        <Image
          source={require('../../../assets/logo png horizontal claro.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Text style={styles.title}>Bienvenido, Cliente</Text>

      {/* Alerta de Error si ocurre un fallo en el backend */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      )}

      {/* Campo de Correo con componente común */}
      <InputText
        label="CORREO"
        placeholder="name@elcorral.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Campo de Contraseña con componente común y soporte de visibilidad */}
      <InputText
        label="CONTRASEÑA"
        placeholder="••••••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
      />

      {/* Botón de Iniciar Sesión con componente común */}
      <Button
        title="Iniciar sesión →"
        onPress={handleLogin}
        loading={loading}
        style={styles.button}
      />

      {/* Enlaces inferiores */}
      <View style={styles.linksContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('RegisterCustomer')}>
          <Text style={styles.linkRegister}>Registrarse</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.linkForgot}>¿Olvidó su contraseña?</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}
