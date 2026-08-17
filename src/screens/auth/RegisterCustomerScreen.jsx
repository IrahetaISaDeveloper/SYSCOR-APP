import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import InputText from '../../components/commons/InputText';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import styles from '../../styles/RegisterCustomer';

export default function RegisterCustomerScreen({ navigation }) {
  const {
    name, setName,
    email, setEmail,
    phone, setPhone,
    password, setPassword,
    loading, error,
    handleRegister,
  } = useCustomerAuth();

  const onPressRegister = async () => {
    const success = await handleRegister(navigation);
    if (success) {
      Alert.alert('Código enviado', 'Te enviamos un código de verificación a tu correo.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Crea tu cuenta</Text>
        <Text style={styles.subtitle}>
          Únete a la familia El Corral y disfruta del auténtico sabor de la brasa.
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Nombre Completo</Text>
        <InputText
          placeholder="Ej. Juan Pérez"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Correo Electrónico</Text>
        <InputText
          placeholder="tu@email.com"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Teléfono</Text>
        <InputText
          placeholder="+57 300 000 0000"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>Contraseña</Text>
        <InputText
          placeholder="• • • • • • • •"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
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

        <TouchableOpacity style={styles.button} onPress={onPressRegister} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'REGISTRANDO...' : 'REGISTRARSE'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerLink} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.footerText}>
            ¿Ya tengo cuenta? <Text style={styles.linkText}>Iniciar sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}