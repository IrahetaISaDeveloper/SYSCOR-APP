import React from 'react';
import { TouchableOpacity, Text, View, Image, StyleSheet } from 'react-native';

// Chip seleccionable simple (sin imagen): se usa para salsas y otras
// opciones de solo texto, selección única o múltiple con "dotColor".
const OptionChip = ({ label, selected, onPress, dotColor, style, image, price }) => {
  // Si viene una imagen, mostramos una tarjeta ancha estilo "PedidosYa"
  // con foto, nombre, precio y un indicador de selección (radio).
  if (image !== undefined) {
    return (
      <TouchableOpacity
        style={[cardStyles.card, selected && cardStyles.cardSelected, style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: image || 'https://via.placeholder.com/80' }}
          style={cardStyles.image}
        />
        <View style={cardStyles.info}>
          <Text style={cardStyles.label} numberOfLines={1}>{label}</Text>
          {price ? (
            <Text style={cardStyles.price}>+${Number(price).toFixed(2)}</Text>
          ) : null}
        </View>
        <View style={[cardStyles.radio, selected && cardStyles.radioSelected]}>
          {selected ? <View style={cardStyles.radioDot} /> : null}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {dotColor ? (
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
      ) : null}
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8E4DD',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  chipSelected: {
    backgroundColor: '#9CE37D',
    borderColor: '#5DBB46',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E1E1E',
  },
  labelSelected: {
    color: '#14421B',
  },
});

const cardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8E4DD',
    borderRadius: 14,
    padding: 8,
    marginBottom: 10,
  },
  cardSelected: {
    borderColor: '#C62828',
    backgroundColor: '#FDF1F0',
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 10,
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
    fontWeight: '700',
    color: '#C62828',
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#CFCBC4',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  radioSelected: {
    borderColor: '#C62828',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#C62828',
  },
});

export default OptionChip;
