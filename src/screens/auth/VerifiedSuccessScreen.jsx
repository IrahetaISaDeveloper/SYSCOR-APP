import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../styles/VerifiedSuccess'; // Me traigo los estilos de su respectiva carpeta

export default function VerifiedSuccessScreen({ navigation }) {
  
  // Función para regresar por si acaso quieren volver atrás
  const handleGoBack = () => {
    navigation.goBack();
  };

  // Función al presionar el botón para mandar al login ya con la cuenta verificada
  const handleGoToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      {/* Botón de retroceso arriba a la izquierda */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={handleGoBack}
      >
        <Ionicons name="arrow-back" size={24.5} color="#AF101A" />
      </TouchableOpacity>

      {/* Contenedor central del mensaje de éxito */}
      <View style={styles.content}>
        <Text style={styles.title}>¡Código{'\n'}Verificado!</Text>
        
        <Text style={styles.subtitle}>
          Tu identidad ha sido confirmada con éxito. Ahora puedes proceder a iniciar sesión
        </Text>

        {/* Botón principal para ir al login */}
        <TouchableOpacity 
          style={styles.button}
          onPress={handleGoToLogin}
        >
          <Text style={styles.buttonText}>INICIAR SESIÓN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}