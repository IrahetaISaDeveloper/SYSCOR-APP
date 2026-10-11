import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Image, useColorScheme } from 'react-native';
import { AppAlert } from '@syscor/shared/src/components/commons/AppAlert';
import { Ionicons as Icon } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { textStyles } from '@syscor/shared/src/styles/typography';
import ordersStyles from '../styles/Orders';
import Sheet from './Sheet';
import LocationPickerModal from './LocationPickerModal';
import { getStaticMapUrl, hasMapboxToken } from '@syscor/shared/src/config/mapbox';
import { reverseGeocode, toPoint } from '../utils/geocode';

const TAG_PRESETS = ['Casa', 'Oficina'];

// Formulario para agregar o editar una dirección. Lo usan la libreta de
// direcciones y la pantalla de pago (para agregar una sin salir del pago).
//
// Además del texto, la dirección puede llevar el punto exacto en el mapa
// (`latitude`/`longitude`): con eso el repartidor llega directo, sin depender
// de que el texto se encuentre bien en el mapa.
const AddressFormSheet = ({ value, saving, onClose, onSave, colors: c, ms, bottomInset }) => {
  const isDark = useColorScheme() === 'dark';
  const [form, setForm] = useState(null);
  const [locating, setLocating] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  // Último texto que se llenó solo desde el mapa: si el cliente no lo cambió,
  // se reemplaza al mover el pin; si lo escribió él, se respeta.
  const autoDetails = useRef(null);

  useEffect(() => {
    autoDetails.current = null;
    setPickerOpen(false);
    if (!value) {
      setForm(null);
      return;
    }
    const preset = TAG_PRESETS.includes(value.tag);
    const point = toPoint(value);
    setForm({
      ...value,
      latitude: point?.latitude ?? null,
      longitude: point?.longitude ?? null,
      custom: !preset && value.index != null,
      isDefault: !!value.isDefault,
    });
  }, [value]);

  if (!form) return <Sheet visible={false} onClose={onClose} colors={c} ms={ms} bottomInset={bottomInset} />;

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const valid = form.tag.trim().length > 0 && form.details.trim().length >= 5;
  const point = toPoint(form);

  // Guarda el punto y, si el texto está vacío o lo había llenado el mapa,
  // también la dirección aproximada de ese punto.
  const applyPoint = ({ latitude, longitude, text }, { forceText = false } = {}) => {
    const replace = !!text && (forceText || !form.details.trim() || form.details === autoDetails.current);
    if (replace) autoDetails.current = text;
    set({ latitude, longitude, ...(replace ? { details: text } : {}) });
  };

  // Llena la dirección (texto y punto) con la ubicación actual del teléfono.
  const fillWithCurrentLocation = async () => {
    setLocating(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        AppAlert.alert('Sin permiso', 'Activa la ubicación para llenar la dirección automáticamente.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const here = toPoint(pos.coords);
      const found = await reverseGeocode(here).catch(() => null);
      applyPoint({ ...here, text: found?.text }, { forceText: true });
    } catch {
      AppAlert.alert('No se pudo ubicar', 'Escribe la dirección a mano o inténtalo de nuevo.');
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

      <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10), marginBottom: ms(8) }]}>UBICACIÓN EN EL MAPA</Text>
      <MapPointCard point={point} onPress={() => setPickerOpen(true)} colors={c} ms={ms} isDark={isDark} />

      <View style={[ordersStyles.spaceBetween, { alignItems: 'center', marginBottom: ms(8), marginTop: ms(16) }]}>
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

      {/* Va dentro de la hoja para que en iOS se presente encima de ella. */}
      <LocationPickerModal
        visible={pickerOpen}
        initial={point}
        onClose={() => setPickerOpen(false)}
        onConfirm={(picked) => {
          setPickerOpen(false);
          applyPoint(picked);
        }}
      />
    </Sheet>
  );
};

// Vista previa del punto marcado, o la invitación a marcarlo. Toda la tarjeta
// abre el mapa.
const MapPointCard = ({ point, onPress, colors: c, ms, isDark }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    accessibilityRole="button"
    accessibilityLabel={point ? 'Mover el pin en el mapa' : 'Marcar la dirección en el mapa'}
    style={{
      borderWidth: 1,
      borderStyle: point ? 'solid' : 'dashed',
      borderColor: point ? c.border : c.primary,
      backgroundColor: point ? c.surface : c.primaryTint,
      borderRadius: ms(12),
      overflow: 'hidden',
    }}
  >
    {point && hasMapboxToken() ? (
      <Image
        source={{ uri: getStaticMapUrl(point, { dark: isDark, color: c.primary.replace('#', '') }) }}
        style={{ width: '100%', height: ms(110), backgroundColor: c.surfaceMuted }}
        resizeMode="cover"
      />
    ) : null}
    <View style={[ordersStyles.row, { gap: ms(10), paddingHorizontal: ms(14), paddingVertical: ms(11) }]}>
      <Icon name={point ? 'checkmark-circle' : 'map-outline'} size={ms(18)} color={c.primary} />
      <View style={{ flex: 1 }}>
        <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(13.5) }]}>
          {point ? 'Ubicación marcada' : 'Marcar en el mapa'}
        </Text>
        <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12) }]}>
          {point ? 'Toca para mover el pin' : 'Así el repartidor llega directo a tu puerta'}
        </Text>
      </View>
      <Icon name="chevron-forward" size={ms(16)} color={c.textGray} />
    </View>
  </TouchableOpacity>
);

export default AddressFormSheet;
