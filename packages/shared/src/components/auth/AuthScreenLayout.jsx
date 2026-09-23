import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useScrollToFocusedInput from '../../hooks/useScrollToFocusedInput';
import useKeyboardHeight from '../../hooks/useKeyboardHeight';
import AuthBackdrop from './AuthBackdrop';

// Armazón común de las pantallas de acceso.
//
// Resuelve en un solo sitio los tres problemas que se repetían en cada
// pantalla:
//   1. El área segura. Con `edgeToEdgeEnabled` el `SafeAreaView` de React
//      Native no hace nada en Android, así que el contenido quedaba debajo de
//      la barra de estado. Aquí se usan los insets reales.
//   2. El teclado. Ese mismo `edgeToEdgeEnabled` hace que Android tampoco
//      redimensione la ventana, así que `KeyboardAvoidingView` no sirve:
//      medimos el teclado y apartamos el contenido a mano (ver
//      useKeyboardHeight). El pie sube con él y el scroll gana debajo el
//      espacio que hace falta para que el campo enfocado pueda subir.
//   3. El ancho: gutter proporcional y contenido centrado en tablets.
//
// `header` y `footer` quedan fijos fuera del scroll; `children` es el cuerpo
// desplazable.
export default function AuthScreenLayout({
  tokens,
  metrics,
  isDark,
  header = null,
  footer = null,
  children,
  // Centra verticalmente el cuerpo cuando sobra espacio (login).
  centerContent = false,
  scrollEnabled = true,
  statusBarStyle,
  // Los halos del fondo. Se pueden apagar en pantallas de solo lectura
  // (términos) donde el texto largo manda.
  backdrop = true,
}) {
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardHeight();
  const { scrollRef, onScroll } = useScrollToFocusedInput();

  const keyboardOpen = keyboard > 0;

  const horizontal = {
    paddingHorizontal: metrics.gutter,
  };

  const contentWrapper = metrics.maxContentWidth
    ? { width: '100%', maxWidth: metrics.maxContentWidth, alignSelf: 'center' }
    : null;

  // Con el teclado abierto el pie se apoya sobre él; si no, sobre el borde
  // inferior seguro.
  const footerBottomInset = keyboardOpen
    ? keyboard
    : Math.max(insets.bottom, metrics.ms(12));

  // El scroll necesita espacio libre al final para poder subir el último
  // campo por encima del teclado. Sin esto no hay a dónde desplazarse y el
  // campo se queda tapado.
  const scrollBottomPadding =
    metrics.ms(24) +
    (footer ? 0 : keyboardOpen ? keyboard : insets.bottom) +
    (keyboardOpen ? metrics.ms(120) : 0);

  return (
    <View style={[styles.root, { backgroundColor: tokens.background }]}>
      <StatusBar style={statusBarStyle || (isDark ? 'light' : 'dark')} />

      {backdrop ? <AuthBackdrop isDark={isDark} /> : null}

      {/* Espacio de la barra de estado / notch */}
      <View style={{ height: insets.top }} />

      {header ? (
        <View style={[horizontal, contentWrapper, { paddingTop: metrics.ms(8) }]}>
          {header}
        </View>
      ) : null}

      <ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        scrollEnabled={scrollEnabled}
        style={styles.flex}
        contentContainerStyle={[
          horizontal,
          styles.scrollContent,
          // Centrar y tener el teclado abierto se estorban: al abrirse, el
          // contenido vuelve a fluir desde arriba para poder desplazarse.
          centerContent && !keyboardOpen && styles.centered,
          {
            paddingTop: metrics.ms(header ? 18 : 12),
            paddingBottom: scrollBottomPadding,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
      >
        <View style={contentWrapper}>{children}</View>
      </ScrollView>

      {footer ? (
        <View
          style={[
            horizontal,
            {
              paddingTop: metrics.ms(10),
              paddingBottom: footerBottomInset,
              // Sin fondo propio: taparía los halos. Lo que va debajo es el
              // fondo de la pantalla, que ya es opaco.
            },
          ]}
        >
          <View style={contentWrapper}>{footer}</View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centered: {
    justifyContent: 'center',
  },
});
