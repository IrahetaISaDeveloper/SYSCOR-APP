import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../../styles/VerifiedSuccess';

export default function VerifiedSuccessScreen({ navigation }) {
  const handleGoToLogin = () => {
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>¡Código{'\n'}Verificado!</Text>
        
        <Text style={styles.subtitle}>
          Tu identidad ha sido confirmada con éxito. Ahora puedes proceder a iniciar sesión
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleGoToLogin}>
          <Text style={styles.buttonText}>INICIAR SESIÓN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}