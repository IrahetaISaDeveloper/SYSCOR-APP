import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import InputText from '../../components/commons/InputText';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import styles from '../../styles/RegisterCustomer';
import { colors } from '../../styles/theme';

export default function RegisterCustomerScreen({ navigation }) {
  const {
    name, setName,
    email, setEmail,
    phone, setPhone,
    password, setPassword,
    loading, error,
    handleRegister,
  } = useCustomerAuth();
  const [showPassword, setShowPassword] = useState(false);

  const onPressRegister = async () => {
    await handleRegister(navigation);
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
          placeholder="Ej. 7123 4567"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>Contraseña</Text>
        <InputText
          placeholder="• • • • • • • •"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          rightIcon={
            <Icon
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textLight}
            />
          }
          onRightIconPress={() => setShowPassword((prev) => !prev)}
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