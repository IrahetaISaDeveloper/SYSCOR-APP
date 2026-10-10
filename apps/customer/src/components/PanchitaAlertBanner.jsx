import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import PanchitaImage from '@syscor/shared/src/components/panchita/PanchitaImage';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { getMenuColors } from '../styles/CustomerMenu';
import { usePanchita } from '../context/PanchitaContext';
import { navigate } from '../navigation/navigationRef';

const AUTO_HIDE_MS = 9000;

// Aviso que Panchita da por su cuenta ("tu pedido va con retraso por la
// lluvia", "ya está listo"). Baja desde arriba, se va solo a los pocos
// segundos y al tocarlo abre la conversación con ella.
export default function PanchitaAlertBanner() {
  const isDark = useColorScheme() === 'dark';
  const c = getMenuColors(isDark);
  const insets = useSafeAreaInsets();
  const { currentAlert, dismissAlert } = usePanchita();
  const offset = useRef(new Animated.Value(-160)).current;

  useEffect(() => {
    if (!currentAlert) return undefined;
    offset.setValue(-160);
    Animated.spring(offset, { toValue: 0, useNativeDriver: true, friction: 8 }).start();
    const timer = setTimeout(() => close(), AUTO_HIDE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAlert?.key]);

  if (!currentAlert) return null;

  function close(then) {
    const key = currentAlert.key;
    Animated.timing(offset, { toValue: -160, duration: 200, useNativeDriver: true }).start(() => {
      dismissAlert(key);
      then?.();
    });
  }

  const warning = currentAlert.level === 'warning';

  return (
    <Animated.View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        top: insets.top + 8,
        left: 12,
        right: 12,
        transform: [{ translateY: offset }],
        zIndex: 100,
        elevation: 12,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => close(() => navigate('Panchita'))}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          padding: 12,
          borderRadius: 18,
          backgroundColor: c.surface,
          borderWidth: 1,
          borderColor: warning ? '#F2A33A' : c.border,
          shadowColor: '#000',
          shadowOpacity: 0.18,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
        }}
        accessibilityRole="button"
        accessibilityLabel={`Aviso de Panchita: ${currentAlert.text}`}
      >
        <View style={{ width: 40, height: 40, borderRadius: 20, overflow: 'hidden', backgroundColor: c.surfaceMuted }}>
          <PanchitaImage variant="icon" isDark={isDark} style={{ width: 40, height: 40 }} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[textStyles.kicker, { color: warning ? '#F2A33A' : c.primary, fontSize: 9.5 }]}>
            CHEF PANCHITA
          </Text>
          <Text style={[textStyles.body, { color: c.textDark, fontSize: 13.5 }]} numberOfLines={3}>
            {currentAlert.text}
          </Text>
        </View>
        <TouchableOpacity onPress={() => close()} hitSlop={10} accessibilityLabel="Cerrar aviso">
          <Icon name="close" size={18} color={c.textGray} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}
