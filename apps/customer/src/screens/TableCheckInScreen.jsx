import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Linking, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { getMenuColors } from '../styles/CustomerMenu';
import { checkIn } from '../services/reservationsApi';

// Al llegar al local, el cliente escanea el QR pegado en su mesa. El backend
// revisa que sea su mesa y su hora, y la pasa a "Ocupada": así el personal
// sabe que llegó y le lleva su pedido.
export default function TableCheckInScreen({ navigation }) {
  const isDark = useColorScheme() === 'dark';
  const c = getMenuColors(isDark);
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  // idle | sending | done | error
  const [state, setState] = useState('idle');
  const [result, setResult] = useState(null);
  // La cámara lee el mismo código varias veces por segundo: solo se manda uno.
  const lockRef = useRef(false);

  const onScanned = async ({ data }) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setState('sending');
    const res = await checkIn(data);
    if (res.success) {
      setResult({ title: `¡Bienvenido a la mesa ${res.data.table?.number}!`, message: 'Ya avisamos que llegaste. En un momento te llevamos tu pedido. ¡Buen provecho!' });
      setState('done');
    } else {
      setResult({ title: res.title || 'No se pudo', message: res.error });
      setState('error');
    }
  };

  const retry = () => {
    setResult(null);
    setState('idle');
    lockRef.current = false;
  };

  const goOrders = () => navigation.navigate('CustomerTabs', { screen: 'Orders' });

  const button = (label, onPress, primary = true) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: c.primary,
        backgroundColor: primary ? c.primary : 'transparent',
      }}
      accessibilityRole="button"
    >
      <Text style={[textStyles.bodyMedium, { fontSize: 15, color: primary ? '#FFFFFF' : c.primary }]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderBody = () => {
    if (!permission) return <ActivityIndicator color={c.primary} />;

    if (!permission.granted) {
      return (
        <View style={{ gap: 14, padding: 24 }}>
          <Icon name="camera-outline" size={42} color={c.primary} style={{ alignSelf: 'center' }} />
          <Text style={[textStyles.body, { color: c.textDark, fontSize: 15, textAlign: 'center' }]}>
            Necesitamos la cámara para leer el código QR de tu mesa.
          </Text>
          {permission.canAskAgain
            ? button('Permitir la cámara', requestPermission)
            : button('Abrir ajustes', () => Linking.openSettings())}
        </View>
      );
    }

    if (state === 'done' || state === 'error') {
      const ok = state === 'done';
      return (
        <View style={{ gap: 14, padding: 24 }}>
          <Icon name={ok ? 'checkmark-circle' : 'alert-circle'} size={56} color={ok ? '#1FC47A' : c.error} style={{ alignSelf: 'center' }} />
          <Text style={[textStyles.title, { color: c.textDark, fontSize: 20, textAlign: 'center' }]}>{result.title}</Text>
          <Text style={[textStyles.body, { color: c.textGray, fontSize: 14.5, textAlign: 'center' }]}>{result.message}</Text>
          {ok ? button('Ver mi pedido', goOrders) : button('Escanear otra vez', retry)}
          {!ok ? button('Ver mis pedidos', goOrders, false) : null}
        </View>
      );
    }

    return (
      <View style={{ flex: 1, alignSelf: 'stretch' }}>
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={state === 'idle' ? onScanned : undefined}
        />
        {/* Marco de guía encima de la cámara */}
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 230, height: 230, borderRadius: 24, borderWidth: 3, borderColor: '#FFFFFF' }} />
          <Text style={[textStyles.bodyMedium, { color: '#FFFFFF', fontSize: 14, marginTop: 18, textAlign: 'center', paddingHorizontal: 32 }]}>
            {state === 'sending' ? 'Registrando tu llegada…' : 'Apunta al código QR que está en tu mesa'}
          </Text>
          {state === 'sending' ? <ActivityIndicator color="#FFFFFF" style={{ marginTop: 10 }} /> : null}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={{ height: insets.top }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: c.border,
            backgroundColor: c.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Icon name="chevron-back" size={20} color={c.textDark} />
        </TouchableOpacity>
        <Text style={[textStyles.title, { color: c.textDark, fontSize: 18 }]}>Llegué a mi mesa</Text>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: insets.bottom }}>{renderBody()}</View>
    </View>
  );
}
