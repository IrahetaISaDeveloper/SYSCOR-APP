import React from 'react';
import { TouchableOpacity, Text, View, Image, StyleSheet } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';

// Fila de "otras personas lo combinaron con": foto circular, nombre, precio
// y un botón para agregar o quitar el extra del pedido.
const CheckRow = ({ label, price, checked, onPress, image }) => {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={{ uri: image || 'https://via.placeholder.com/60' }}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.label} numberOfLines={1}>{label}</Text>
        {price != null ? (
          <Text style={styles.price}>${Number(price).toFixed(2)}</Text>
        ) : null}
      </View>
      <View style={[styles.addButton, checked && styles.addButtonChecked]}>
        <Icon name={checked ? 'checkmark' : 'add'} size={18} color={checked ? '#FFFFFF' : '#3F3F46'} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F4F4F5',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E1E1E',
  },
  price: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#D4D4D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonChecked: {
    backgroundColor: '#C62828',
    borderColor: '#C62828',
  },
  addIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3F3F46',
    marginTop: -1,
  },
  addIconChecked: {
    color: '#FFFFFF',
  },
});

export default CheckRow;
