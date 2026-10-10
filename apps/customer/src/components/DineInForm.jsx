import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { InputText } from '@syscor/shared/src/components/commons/InputText';
import { formatSlotTime } from '../utils/reservationSlots';

// La mesa más grande del local. El backend manda la real en `maxCapacity`
// al revisar la disponibilidad; esto es solo hasta que responda.
const DEFAULT_MAX_PARTY = 8;

// Datos de la visita cuando el cliente elige "Comer en el local": día (hoy y
// hasta 3 días adelante), hora dentro del horario, personas y un nombre
// opcional para la mesa. Debajo, si hay mesa libre para esa combinación.
export default function DineInForm({
  colors: c,
  isDark,
  days,
  dayKey,
  onDayChange,
  slot,
  onSlotChange,
  partySize,
  onPartySizeChange,
  alias,
  onAliasChange,
  availability,
}) {
  const day = days.find((d) => d.key === dayKey) || null;
  const maxParty = availability?.maxCapacity || DEFAULT_MAX_PARTY;

  const chip = (selected) => ({
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: selected ? c.primary : c.border,
    backgroundColor: selected ? c.primaryTint : c.surface,
  });
  const label = { fontSize: 12.5, fontWeight: '700', color: c.textGray, marginBottom: 8, letterSpacing: 0.3 };

  if (days.length === 0) {
    return (
      <Text style={{ fontSize: 13, color: c.textGray, marginBottom: 20 }}>
        Por ahora no hay horarios para reservar. Elige "A domicilio" o "Pasar a traer".
      </Text>
    );
  }

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={label}>DÍA</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 14 }}>
        {days.map((d) => {
          const selected = d.key === dayKey;
          return (
            <TouchableOpacity
              key={d.key}
              onPress={() => onDayChange(d.key)}
              activeOpacity={0.8}
              style={[chip(selected), { minWidth: 72 }]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <Text style={{ fontSize: 13.5, fontWeight: '700', color: selected ? c.primary : c.textDark }}>{d.label}</Text>
              <Text style={{ fontSize: 11.5, color: selected ? c.primary : c.textGray }}>{d.caption}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={label}>HORA</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {(day?.slots || []).map((minutes) => {
          const selected = minutes === slot;
          return (
            <TouchableOpacity
              key={minutes}
              onPress={() => onSlotChange(minutes)}
              activeOpacity={0.8}
              style={[chip(selected), { paddingHorizontal: 10 }]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <Text style={{ fontSize: 12.5, fontWeight: '600', color: selected ? c.primary : c.textDark }}>
                {formatSlotTime(minutes)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={label}>PERSONAS</Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 10,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: c.border,
          backgroundColor: c.surface,
          marginBottom: 14,
        }}
      >
        <Text style={{ fontSize: 14, color: c.textDark, fontWeight: '600', marginLeft: 4 }}>
          Mesa para {partySize} {partySize === 1 ? 'persona' : 'personas'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {[
            { icon: 'remove', delta: -1, disabled: partySize <= 1, label: 'Una persona menos' },
            { icon: 'add', delta: 1, disabled: partySize >= maxParty, label: 'Una persona más' },
          ].map((b) => (
            <TouchableOpacity
              key={b.icon}
              onPress={() => onPartySizeChange(partySize + b.delta)}
              disabled={b.disabled}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: b.delta > 0 ? c.primary : c.surfaceMuted,
                opacity: b.disabled ? 0.4 : 1,
              }}
              accessibilityRole="button"
              accessibilityLabel={b.label}
            >
              <Icon name={b.icon} size={18} color={b.delta > 0 ? '#FFFFFF' : c.textDark} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <InputText
        dark={isDark}
        label="Nombre para la mesa (opcional)"
        placeholder="Ej: Familia Martínez"
        maxLength={40}
        value={alias}
        onChangeText={onAliasChange}
      />

      {slot === null ? (
        <Text style={{ fontSize: 12.5, color: c.textGray }}>
          Elige la hora. Te guardamos la mesa hasta 30 minutos después.
        </Text>
      ) : availability?.loading || !availability ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ActivityIndicator size="small" color={c.primary} />
          <Text style={{ fontSize: 12.5, color: c.textGray }}>Revisando mesas…</Text>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <Icon
            name={availability.available ? 'checkmark-circle' : 'close-circle'}
            size={18}
            color={availability.available ? '#1FC47A' : c.error}
          />
          <Text style={{ flex: 1, fontSize: 12.5, color: availability.available ? c.textDark : c.error }}>
            {availability.available
              ? 'Hay mesas libres. Al pagar, Chef Panchita te ayuda a elegir la tuya. Te la guardamos hasta 30 minutos después de la hora.'
              : availability.message || 'No quedan mesas para esa hora.'}
          </Text>
        </View>
      )}
    </View>
  );
}
