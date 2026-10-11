import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuthTheme } from '../../styles/authTheme';
import { FONT } from '../../styles/typography';

// Reemplazo de Alert.alert con el diseño de la app (el diálogo nativo de
// Android no sigue colores, fuentes ni modo oscuro).
//
// Misma firma que Alert.alert, para que el cambio sea directo:
//   AppAlert.alert('Título', 'Mensaje', [
//     { text: 'Cancelar', style: 'cancel' },
//     { text: 'Eliminar', style: 'destructive', onPress: borrar },
//   ]);
//
// Se puede llamar desde cualquier lado (hooks, contextos, utils). Las alertas
// las dibuja <AppAlertHost />, montado una vez en el App.js de cada app; si no
// está montado se cae al Alert nativo.

let listener = null;

const alert = (title, message, buttons, options) => {
  if (!listener) {
    Alert.alert(title, message, buttons, options);
    return;
  }
  listener({
    id: Date.now() + Math.random(),
    title,
    message,
    buttons: buttons?.length ? buttons : [{ text: 'Aceptar' }],
    cancelable: options?.cancelable ?? false,
    onDismiss: options?.onDismiss,
  });
};

export const AppAlert = { alert };

export function AppAlertHost() {
  // Cola: si un botón abre otra alerta, se muestra al cerrar la actual.
  const [queue, setQueue] = useState([]);
  const { t } = useAuthTheme();

  useEffect(() => {
    listener = (item) => setQueue((q) => [...q, item]);
    return () => {
      listener = null;
    };
  }, []);

  const current = queue[0];
  const close = () => setQueue((q) => q.slice(1));

  const press = (button) => {
    close();
    button?.onPress?.();
  };

  const dismiss = () => {
    if (!current) return;
    const cancel = current.buttons.find((b) => b.style === 'cancel');
    if (cancel) return press(cancel);
    // Un solo botón ("Aceptar"): atrás equivale a presionarlo.
    if (current.buttons.length === 1) return press(current.buttons[0]);
    if (!current.cancelable) return;
    close();
    current.onDismiss?.();
  };

  const buttons = current?.buttons || [];
  // Con más de dos opciones (p. ej. motivos de un reporte) van apiladas y
  // "Cancelar" queda al final.
  const stacked = buttons.length > 2;
  const ordered = stacked
    ? [...buttons.filter((b) => b.style !== 'cancel'), ...buttons.filter((b) => b.style === 'cancel')]
    : buttons;

  // Fila: el último botón es la acción principal (como en el diálogo nativo);
  // los demás van en estilo secundario.
  const buttonColors = (button, index) => {
    if (button.style === 'cancel') {
      return { bg: t.surfaceMuted, border: t.border, ink: t.textPrimary };
    }
    if (button.style === 'destructive') return { bg: t.danger, border: t.danger, ink: '#FFFFFF' };
    if (stacked || index < ordered.length - 1) {
      return { bg: t.surface, border: t.borderStrong, ink: t.textPrimary };
    }
    return { bg: t.accent, border: t.accent, ink: '#FFFFFF' };
  };

  return (
    <Modal
      visible={Boolean(current)}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={dismiss}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />
        {current ? (
          <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
            {current.title ? (
              <Text style={[styles.title, { color: t.textPrimary }]}>{current.title}</Text>
            ) : null}
            {current.message ? (
              <Text style={[styles.message, { color: t.textSecondary }]}>{current.message}</Text>
            ) : null}

            <View style={[styles.actions, stacked ? styles.actionsStacked : styles.actionsRow]}>
              {ordered.map((button, index) => {
                const colors = buttonColors(button, index);
                return (
                  <TouchableOpacity
                    key={`${button.text}-${index}`}
                    style={[
                      styles.button,
                      !stacked && styles.buttonRow,
                      { backgroundColor: colors.bg, borderColor: colors.border },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => press(button)}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.buttonLabel, { color: colors.ink }]} numberOfLines={2}>
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  title: {
    fontFamily: FONT.display,
    fontSize: 19,
    letterSpacing: -0.3,
  },
  message: {
    fontFamily: FONT.sans,
    fontSize: 14.5,
    lineHeight: 21,
    marginTop: 8,
  },
  actions: {
    marginTop: 20,
    gap: 10,
  },
  actionsRow: {
    flexDirection: 'row',
  },
  actionsStacked: {
    flexDirection: 'column',
  },
  button: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRow: {
    flex: 1,
  },
  buttonLabel: {
    fontFamily: FONT.display,
    fontSize: 15,
    textAlign: 'center',
  },
});

export default AppAlert;
