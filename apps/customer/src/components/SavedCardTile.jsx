import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { BRAND_LABELS, formatCardExpiry } from '../services/cardsApi';

// Colores fijos de la tarjeta: se ve igual en claro y oscuro, como una
// tarjeta física. La predeterminada va en el rojo de la marca.
const FACE = {
  default: { background: '#B3261E', accent: 'rgba(255,255,255,0.14)' },
  normal: { background: '#1C1C1E', accent: 'rgba(255,255,255,0.08)' },
};

// Tarjeta guardada dibujada como tarjeta física: marca, •••• 1234, titular y
// vencimiento. Con `compact` se usa en la lista de pago; con `onPress` y
// `selected` funciona como opción seleccionable.
const SavedCardTile = ({ card, ms, compact = false, selected = false, onPress }) => {
  const face = card.isDefault ? FACE.default : FACE.normal;
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        backgroundColor: face.background,
        borderRadius: ms(compact ? 14 : 18),
        padding: ms(compact ? 14 : 18),
        minHeight: ms(compact ? 0 : 150),
        justifyContent: 'space-between',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: selected ? '#FFFFFF' : 'transparent',
      }}
      {...(onPress ? { accessibilityRole: 'radio', accessibilityState: { selected } } : {})}
      accessibilityLabel={`${BRAND_LABELS[card.brand] || 'Tarjeta'} terminada en ${card.lastFour}`}
    >
      {/* Adorno: dos círculos, como el diseño de muchas tarjetas */}
      <View
        style={{
          position: 'absolute',
          right: -ms(40),
          top: -ms(50),
          width: ms(160),
          height: ms(160),
          borderRadius: ms(80),
          backgroundColor: face.accent,
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: ms(30),
          bottom: -ms(70),
          width: ms(140),
          height: ms(140),
          borderRadius: ms(70),
          backgroundColor: face.accent,
        }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={[textStyles.title, { color: '#FFFFFF', fontSize: ms(compact ? 14 : 16) }]}>
          {BRAND_LABELS[card.brand] || 'Tarjeta'}
        </Text>
        {onPress ? (
          <Icon name={selected ? 'radio-button-on' : 'radio-button-off'} size={ms(20)} color="#FFFFFF" />
        ) : card.isDefault ? (
          <Text style={[textStyles.kicker, { color: '#FFFFFF', fontSize: ms(9.5) }]}>PREDETERMINADA</Text>
        ) : null}
      </View>

      <Text
        style={[
          textStyles.num,
          { color: '#FFFFFF', fontSize: ms(compact ? 16 : 19), letterSpacing: 2, marginVertical: ms(compact ? 8 : 16) },
        ]}
      >
        ••••  ••••  ••••  {card.lastFour}
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <View style={{ flex: 1, gap: ms(2) }}>
          {!compact ? (
            <Text style={[textStyles.kicker, { color: 'rgba(255,255,255,0.6)', fontSize: ms(9) }]}>TITULAR</Text>
          ) : null}
          <Text style={[textStyles.bodyMedium, { color: '#FFFFFF', fontSize: ms(12.5) }]} numberOfLines={1}>
            {String(card.cardHolder || '').toUpperCase()}
          </Text>
        </View>
        {formatCardExpiry(card) ? (
          <View style={{ alignItems: 'flex-end', gap: ms(2) }}>
            {!compact ? (
              <Text style={[textStyles.kicker, { color: 'rgba(255,255,255,0.6)', fontSize: ms(9) }]}>VENCE</Text>
            ) : null}
            <Text style={[textStyles.num, { color: '#FFFFFF', fontSize: ms(12.5) }]}>{formatCardExpiry(card)}</Text>
          </View>
        ) : null}
      </View>
    </Wrapper>
  );
};

export default SavedCardTile;
