import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

// Fila de texto plano (sin imagen) con botón +/✓, usada en listas
// "requeridas" tipo PedidosYa (ej. "Seleccione salsas", elige N opciones).
const SelectableRow = ({ label, selected, onPress, isLast }) => {
  return (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.rowDivider]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.button, selected && styles.buttonSelected]}>
        <Text style={[styles.icon, selected && styles.iconSelected]}>
          {selected ? '✓' : '+'}
        </Text>
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

export default SelectableRow;
