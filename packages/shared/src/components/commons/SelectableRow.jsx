import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { darkPalette as d } from '../../styles/darkPalette';

// Fila de texto plano (sin imagen) con botón de agregar/seleccionar, usada en listas
// "requeridas" tipo PedidosYa (ej. "Seleccione salsas", elige N opciones).
const SelectableRow = ({ label, selected, onPress, isLast }) => {
  const isDark = useColorScheme() === 'dark';
  return (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.rowDivider, !isLast && isDark && darkStyles.rowDivider]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, isDark && darkStyles.text]}>{label}</Text>
      <View style={[styles.button, isDark && darkStyles.button, selected && styles.buttonSelected]}>
        <Icon name={selected ? 'checkmark' : 'add'} size={15} color={selected || isDark ? '#FFFFFF' : '#3F3F46'} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0EDE7',
  },
  label: {
    fontSize: 14,
    color: '#1E1E1E',
    fontWeight: '500',
  },
  button: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#D4D4D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSelected: {
    backgroundColor: '#C62828',
    borderColor: '#C62828',
  },
  icon: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3F3F46',
    marginTop: -1,
  },
  iconSelected: {
    color: '#FFFFFF',
  },
});

// Capa para modo oscuro: solo cambia colores.
const darkStyles = StyleSheet.create({
  rowDivider: { borderBottomColor: d.border },
  button: { borderColor: d.borderStrong },
  text: { color: d.textDark },
});

export default SelectableRow;
