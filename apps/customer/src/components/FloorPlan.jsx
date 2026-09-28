import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// Croquis del comedor de una planta, a partir de los planos del local:
//
//   Planta baja: solo el comedor. Arriba queda la cocina y a la izquierda el
//   parqueo; las paredes izquierda y derecha son ventanales.
//   Planta alta: la terraza, con la escalera y el baño a la derecha.
//
// Cada mesa trae su lugar en `position` (porcentaje del plano, guardado en
// la base por scripts/setupTableLayout.js del backend). Con `onSelect` las
// mesas libres donde caben se pueden tocar; sin él, el croquis solo muestra.
const PLANS = {
  1: { aspectRatio: 248 / 223, top: 'COCINA', left: 'PARQUEO', windows: true, fixtures: [] },
  2: {
    aspectRatio: 1,
    top: 'TERRAZA',
    fixtures: [
      { label: 'ESCALERA', x: 63.5, y: 50.5, w: 18.25, h: 49.5 },
      { label: 'BAÑO', x: 81.75, y: 38, w: 18.25, h: 62 },
    ],
  },
};

export default function FloorPlan({ floor, tables, selectedId, onSelect, colors: c }) {
  const plan = PLANS[floor] || PLANS[1];
  const windowColor = 'rgba(96,165,250,0.55)';

  return (
    <View style={{ gap: 8 }}>
      <Text style={{ textAlign: 'center', fontSize: 10.5, fontWeight: '700', letterSpacing: 1.2, color: c.textLight }}>
        ↑ {plan.top}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {plan.left ? (
          <Text
            style={{
              width: 14,
              fontSize: 9.5,
              fontWeight: '700',
              letterSpacing: 1,
              color: c.textLight,
              textAlign: 'center',
            }}
          >
            {plan.left.split('').join('\n')}
          </Text>
        ) : null}
        <View
          style={{
            flex: 1,
            aspectRatio: plan.aspectRatio,
            borderWidth: 3,
            borderColor: c.textDark,
            borderRadius: 4,
            backgroundColor: c.surfaceMuted,
            overflow: 'hidden',
          }}
        >
          {plan.windows ? (
            <>
              <View style={{ position: 'absolute', left: 0, top: '20%', bottom: '4%', width: 4, backgroundColor: windowColor }} />
              <View style={{ position: 'absolute', right: 0, top: '20%', bottom: '4%', width: 4, backgroundColor: windowColor }} />
            </>
          ) : null}

          {plan.fixtures.map((f) => (
            <View
              key={f.label}
              style={{
                position: 'absolute',
                left: `${f.x}%`,
                top: `${f.y}%`,
                width: `${f.w}%`,
                height: `${f.h}%`,
                borderLeftWidth: 2,
                borderTopWidth: 2,
                borderColor: c.borderStrong,
                backgroundColor: c.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 8.5, fontWeight: '700', letterSpacing: 0.8, color: c.textGray, transform: [{ rotate: '-90deg' }] }}>
                {f.label}
              </Text>
            </View>
          ))}

          {tables
            .filter((t) => t.position)
            .map((t) => {
              const selected = t.id === selectedId;
              const selectable = !!onSelect && t.available && t.fits;
              const free = t.available && t.fits;
              const Wrapper = selectable ? TouchableOpacity : View;
              return (
                <Wrapper
                  key={t.id}
                  {...(selectable ? { onPress: () => onSelect(t), activeOpacity: 0.75 } : {})}
                  accessibilityRole={selectable ? 'button' : undefined}
                  accessibilityLabel={`Mesa ${t.number}, ${t.capacity} personas, ${
                    selected ? 'elegida' : free ? 'libre' : 'no disponible'
                  }`}
                  style={{
                    position: 'absolute',
                    left: `${t.position.x}%`,
                    top: `${t.position.y}%`,
                    width: `${t.position.w}%`,
                    height: `${t.position.h}%`,
                    borderRadius: 4,
                    borderWidth: selected ? 2 : 1,
                    borderColor: selected ? c.primary : free ? c.primary : c.borderStrong,
                    backgroundColor: selected ? c.primary : free ? c.surface : c.border,
                    opacity: free || selected ? 1 : 0.55,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 3,
                  }}
                >
                  <Text style={{ fontSize: 11.5, fontWeight: '800', color: selected ? '#FFFFFF' : free ? c.textDark : c.textGray }}>
                    {t.number}
                  </Text>
                  <Text style={{ fontSize: 9, fontWeight: '600', color: selected ? '#FFFFFF' : c.textGray }}>{t.capacity}p</Text>
                </Wrapper>
              );
            })}
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 14 }}>
        {[
          { label: 'Tu mesa', bg: c.primary, border: c.primary },
          { label: 'Libre', bg: c.surface, border: c.primary },
          { label: 'No disponible', bg: c.border, border: c.borderStrong },
          ...(plan.windows ? [{ label: 'Ventanal', bg: windowColor, border: windowColor }] : []),
        ].map((item) => (
          <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 12, height: 12, borderRadius: 3, borderWidth: 1, borderColor: item.border, backgroundColor: item.bg }} />
            <Text style={{ fontSize: 11, color: c.textGray }}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
