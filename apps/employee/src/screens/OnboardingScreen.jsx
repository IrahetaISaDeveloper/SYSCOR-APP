import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { useAuthTheme } from '@syscor/shared/src/styles/authTheme';

// Cómo funciona la app de empleados: una sola app que se adapta al puesto de
// quien inicia sesión (mesero, cocina o repartidor).
const SLIDES = [
  {
    key: 'shift',
    image: require('../../assets/welcome-tacos.jpg'),
    icon: 'id-card-outline',
    kicker: 'TU TURNO',
    title: 'Una app para todo\nel equipo de El Corral',
    description:
      'Entra con el correo y la contraseña que te dio administración. La app te muestra solo lo que necesitas según tu puesto.',
  },
  {
    key: 'waiter',
    image: require('../../assets/promo-tacos-pastor.jpg'),
    icon: 'restaurant-outline',
    kicker: 'MESEROS',
    title: 'Tus mesas y comandas\nen un vistazo',
    description:
      'Mira qué mesas están libres u ocupadas, toma pedidos desde la mesa y cobra la cuenta sin ir a caja.',
  },
  {
    key: 'kitchen',
    image: require('../../assets/quesadilla-birria.jpg'),
    icon: 'flame-outline',
    kicker: 'COCINA',
    title: 'Las comandas llegan\nsolas a la cocina',
    description:
      'Cada pedido aparece al instante. Márcalo en preparación o listo y consulta el historial del día.',
  },
  {
    key: 'delivery',
    image: require('../../assets/torta-milanesa.jpg'),
    icon: 'bicycle-outline',
    kicker: 'REPARTO',
    title: 'Toma la entrega\ny sigue la ruta',
    description:
      'Acepta pedidos disponibles, abre la ruta al domicilio, contacta al cliente y confirma la entrega con una foto.',
  },
];

// Introducción a la app de empleados. Solo se muestra la primera vez que se
// abre (ver EmployeeBootGate). Cada paso es una foto a sangre con una hoja
// inferior que lleva el texto; el pie con el progreso y el botón queda fijo.
export default function OnboardingScreen({ onFinish }) {
  const { t, m } = useAuthTheme();
  const ms = m.ms;
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);

  const isLast = index === SLIDES.length - 1;
  // La foto ocupa la parte de arriba; la hoja se monta un poco sobre ella. En
  // pantallas bajas la foto cede espacio para que el texto no choque con el pie.
  const imageHeight = Math.round(height * (m.isCompact ? 0.5 : 0.58));
  const sheetTop = imageHeight - ms(32);

  const goTo = (next) => {
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
    setIndex(next);
  };

  const handleNext = () => (isLast ? onFinish?.() : goTo(index + 1));

  const handleScrollEnd = (event) => {
    setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      {/* La barra de estado queda sobre la foto, que es oscura en ambos temas */}
      <StatusBar style="light" />

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
      >
        {SLIDES.map((slide, i) => (
          <View key={slide.key} style={{ width, height }}>
            <Image source={slide.image} style={{ width, height: imageHeight }} resizeMode="cover" />
            {/* Oscurece el borde superior para que el logo y "Saltar" se lean */}
            <View style={[styles.topShade, { height: insets.top + ms(90) }]} />

            <View
              style={[
                styles.sheet,
                {
                  top: sheetTop,
                  backgroundColor: t.background,
                  borderTopLeftRadius: ms(30),
                  borderTopRightRadius: ms(30),
                  paddingHorizontal: m.gutter,
                  paddingTop: ms(26),
                },
              ]}
            >
              <View style={[styles.row, { gap: ms(10), marginBottom: ms(14) }]}>
                <View
                  style={[
                    styles.iconBadge,
                    { width: ms(34), height: ms(34), borderRadius: ms(10), backgroundColor: t.accentSoft },
                  ]}
                >
                  <Icon name={slide.icon} size={ms(17)} color={t.accent} />
                </View>
                <Text style={[textStyles.kicker, { color: t.accent, fontSize: ms(11) }]}>
                  {String(i + 1).padStart(2, '0')} — {slide.kicker}
                </Text>
              </View>
              <Text style={[textStyles.title, { color: t.textPrimary, fontSize: ms(29), lineHeight: ms(34) }]}>
                {slide.title}
              </Text>
              <Text
                style={[
                  textStyles.body,
                  { color: t.textSecondary, fontSize: ms(15), lineHeight: ms(22), marginTop: ms(12) },
                ]}
              >
                {slide.description}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* ── ENCABEZADO FIJO ── */}
      <View style={[styles.header, { top: insets.top + ms(12), paddingHorizontal: m.gutter }]}>
        <Image
          source={require('../../assets/logo-horizontal-blanco.png')}
          style={{ width: ms(118), height: ms(34) }}
          resizeMode="contain"
          accessibilityLabel="El Corral"
        />
        {!isLast ? (
          <TouchableOpacity
            onPress={onFinish}
            hitSlop={12}
            style={[styles.skip, { paddingHorizontal: ms(14), height: ms(32), borderRadius: ms(16) }]}
            accessibilityRole="button"
          >
            <Text style={[textStyles.link, { color: '#FFFFFF', fontSize: ms(13) }]}>Saltar</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* ── PIE FIJO: progreso y botón ── */}
      <View
        style={[
          styles.footer,
          { paddingHorizontal: m.gutter, paddingBottom: Math.max(insets.bottom, ms(16)) + ms(8), gap: ms(18) },
        ]}
      >
        <View style={[styles.row, { gap: ms(6) }]}>
          {SLIDES.map((slide, i) => (
            <TouchableOpacity
              key={slide.key}
              onPress={() => goTo(i)}
              hitSlop={8}
              style={{
                flex: i === index ? 2 : 1,
                height: ms(4),
                borderRadius: ms(2),
                backgroundColor: i <= index ? t.accent : t.borderStrong,
              }}
              accessibilityRole="button"
              accessibilityLabel={`Paso ${i + 1} de ${SLIDES.length}`}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.9}
          style={[styles.button, { backgroundColor: t.accent, height: ms(54), borderRadius: ms(16), gap: ms(8) }]}
          accessibilityRole="button"
        >
          <Text style={[textStyles.button, { color: '#FFFFFF', fontSize: ms(16) }]}>
            {isLast ? 'Comenzar mi turno' : 'Siguiente'}
          </Text>
          <Icon name="arrow-forward" size={ms(18)} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topShade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  iconBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skip: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
