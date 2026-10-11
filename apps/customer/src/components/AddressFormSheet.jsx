import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { textStyles } from '@syscor/shared/src/styles/typography';
import ordersStyles from '../styles/Orders';
import Sheet from './Sheet';

const TAG_PRESETS = ['Casa', 'Oficina'];

// Formulario para agregar o editar una dirección. Lo usan la libreta de
// direcciones y la pantalla de pago (para agregar una sin salir del pago).
const AddressFormSheet = ({ value, saving, onClose, onSave, colors: c, ms, bottomInset }) => {
  const [form, setForm] = useState(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!value) {
      setForm(null);
      return;
    }
    const preset = TAG_PRESETS.includes(value.tag);
    setForm({ ...value, custom: !preset && value.index != null, isDefault: !!value.isDefault });
  }, [value]);

  if (!form) return <Sheet visible={false} onClose={onClose} colors={c} ms={ms} bottomInset={bottomInset} />;

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const valid = form.tag.trim().length > 0 && form.details.trim().length >= 5;

  // Llena la dirección con la ubicación actual del teléfono.
  const fillWithCurrentLocation = async () => {
    setLocating(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Sin permiso', 'Activa la ubicación para llenar la dirección automáticamente.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [place] = await Location.reverseGeocodeAsync(pos.coords);
      if (place) {
        const text = [place.name, place.street, place.district, place.city, place.region]
          .filter(Boolean)
          .filter((part, i, arr) => arr.indexOf(part) === i)
          .join(', ');
        set({ details: text });
      }
    } catch {
      Alert.alert('No se pudo ubicar', 'Escribe la dirección a mano o inténtalo de nuevo.');
    } finally {
      setLocating(false);
    }
  };

  const inputStyle = [
    textStyles.body,
    {
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
      borderRadius: ms(12),
      paddingHorizontal: ms(14),
      paddingVertical: ms(12),
      fontSize: ms(14),
      color: c.textDark,
    },
  ];

  return (
    <Sheet visible onClose={onClose} colors={c} ms={ms} bottomInset={bottomInset}>
      <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(18), marginBottom: ms(14) }]}>
        {form.index == null ? 'Nueva dirección' : 'Editar dirección'}
      </Text>

      <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10), marginBottom: ms(8) }]}>NOMBRE</Text>
      <View style={[ordersStyles.row, { gap: ms(8), marginBottom: form.custom ? ms(10) : ms(16) }]}>
        {[...TAG_PRESETS, 'Otro'].map((tag) => {
          const selected = tag === 'Otro' ? form.custom : !form.custom && form.tag === tag;
          return (
            <TouchableOpacity
              key={tag}
              onPress={() => set(tag === 'Otro' ? { custom: true, tag: '' } : { custom: false, tag })}
              style={[
                ordersStyles.pill,
                {
                  backgroundColor: selected ? c.primary : c.surface,
                  borderColor: selected ? c.primary : c.border,
                  borderRadius: ms(18),
                  paddingHorizontal: ms(14),
                  height: ms(34),
                },
              ]}
            >
              <Text style={[textStyles.body, { color: selected ? c.white : c.textGray, fontSize: ms(13) }]}>{tag}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {form.custom ? (
        <TextInput
          value={form.tag}
          onChangeText={(tag) => set({ tag })}
          placeholder="Ej. Casa de mamá"
          placeholderTextColor={c.textLight}
          maxLength={30}
          style={[inputStyle, { marginBottom: ms(16) }]}
        />
      ) : null}

      <View style={[ordersStyles.spaceBetween, { alignItems: 'center', marginBottom: ms(8) }]}>
        <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10) }]}>DIRECCIÓN</Text>
        <TouchableOpacity
          onPress={fillWithCurrentLocation}
          disabled={locating}
          style={[ordersStyles.row, { gap: ms(4) }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {locating ? (
            <ActivityIndicator size="small" color={c.primary} />
          ) : (
            <Icon name="locate-outline" size={ms(14)} color={c.primary} />
          )}
          <Text style={[textStyles.link, { color: c.primary, fontSize: ms(12) }]}>Usar mi ubicación</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        value={form.details}
        onChangeText={(details) => set({ details })}
        placeholder="Colonia, calle, número de casa y un punto de referencia"
        placeholderTextColor={c.textLight}
        multiline
        maxLength={200}
        style={[inputStyle, { minHeight: ms(80), textAlignVertical: 'top' }]}
      />

      <TouchableOpacity
        onPress={() => set({ isDefault: !form.isDefault })}
        style={[ordersStyles.row, { gap: ms(10), marginTop: ms(14) }]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: form.isDefault }}
      >
        <Icon name={form.isDefault ? 'checkbox' : 'square-outline'} size={ms(20)} color={form.isDefault ? c.primary : c.textGray} />
        <Text style={[textStyles.body, { color: c.textDark, fontSize: ms(13.5) }]}>Usar como predeterminada</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onSave(form)}
        disabled={!valid || saving}
        activeOpacity={0.9}
        style={[
          ordersStyles.outlineButton,
          {
            backgroundColor: c.primary,
            borderColor: c.primary,
            borderRadius: ms(14),
            height: ms(50),
            marginTop: ms(18),
            opacity: !valid || saving ? 0.5 : 1,
          },
        ]}
        accessibilityRole="button"
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={[textStyles.title, { color: '#FFFFFF', fontSize: ms(15) }]}>Guardar dirección</Text>
        )}
      </TouchableOpacity>
    </Sheet>
  );
};

export default AddressFormSheet;
