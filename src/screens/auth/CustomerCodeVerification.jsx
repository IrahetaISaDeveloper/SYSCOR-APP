import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/CustomerCodeVerification'; // Importo los estilos

// Pantalla para validar el código de 6 dígitos que cae al correo
export default function CustomerCodeVerification() {
  // State para guardar cada dígito del código por separado en un array
  const [code, setCode] = useState(['', '', '', '', '', '']);

  return (
    <View style={styles.container}>
      {/* Encabezado explicativo de la verificación */}
      <View style={styles.header}>
        <Text style={styles.title}>Ingresa el código</Text>
        <Text style={styles.subtitle}>
          Hemos enviado un código de 6 dígitos a tu correo electrónico.
        </Text>
      </View>

      {/* Contenedor de los 6 inputs para meter el código */}
      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.codeInput}
            maxLength={1}
            keyboardType="number-pad"
            value={digit}
            onChangeText={(text) => {
              const newCode = [...code];
              newCode[index] = text;
              setCode(newCode);
            }}
          />
        ))}
      </View>

      {/* Botón para mandar a verificar el código */}
      <TouchableOpacity style={styles.button} onPress={() => console.log('Verificar código')}>
        <Text style={styles.buttonText}>VERIFICAR</Text>
      </TouchableOpacity>

      {/* Opción por si no cayó el correo para pedirlo otra vez */}
      <TouchableOpacity style={styles.resendContainer} onPress={() => console.log('Reenviar código')}>
        <Text style={styles.resendText}>
          ¿No recibiste el código? <Text style={styles.resendLink}>Reenviar</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}