import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import InputText from '../../components/commons/InputText';
import { useForm } from '../../hooks/useForm'; // Importo el custom hook que me pediste
import { styles } from '../../styles/RegisterCustomer'; // Importo los estilos

// Pantalla para que los clientes se registren en la app
export default function RegisterCustomer({ navigation }) {
  // Uso mi custom hook para manejar los campos del registro
  const { fullName, email, phone, password, form, onChange } = useForm({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });

  // Aquí tiro la lógica cuando le den al botón de registrarse
  const handleRegister = () => {
    console.log('Registrando cliente con hook:', form);
    // TODO: Conectar con el backend cuando toque la defensa, por ahora solo la interfaz
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Cabecera con el título y el subtítulo de la marca */}
      <View style={styles.header}>
        <Text style={styles.title}>Crea tu cuenta</Text>
        <Text style={styles.subtitle}>
          Únete a la familia El Corral y disfruta del auténtico sabor de la brasa.
        </Text>
      </View>

      {/* Formulario de registro usando los inputs y el custom hook */}
      <View style={styles.form}>
        <Text style={styles.label}>Nombre Completo</Text>
        <InputText
          placeholder="Ej. Juan Pérez"
          value={fullName}
          onChangeText={(value) => onChange(value, 'fullName')}
        />

        <Text style={styles.label}>Correo Electrónico</Text>
        <InputText
          placeholder="tu@email.com"
          keyboardType="email-address"
          value={email}
          onChangeText={(value) => onChange(value, 'email')}
        />

        <Text style={styles.label}>Teléfono</Text>
        <InputText
          placeholder="+503 0000 0000"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={(value) => onChange(value, 'phone')}
        />

        <Text style={styles.label}>Contraseña</Text>
        <InputText
          placeholder="********"
          secureTextEntry
          value={password}
          onChangeText={(value) => onChange(value, 'password')}
        />

        {/* Botón principal para mandar el registro */}
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>REGISTRARSE</Text>
        </TouchableOpacity>

        {/* Enlace por si ya tiene cuenta y quiere ir al login */}
        <TouchableOpacity style={styles.footerLink} onPress={() => console.log('Ir a login')}>
          <Text style={styles.footerText}>
            ¿Ya tengo cuenta? <Text style={styles.linkText}>Iniciar sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}