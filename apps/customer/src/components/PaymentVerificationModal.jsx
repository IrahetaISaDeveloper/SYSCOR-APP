import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';

// Verificación 3D Secure del banco, dentro de la app.
//
// Muestra la página de Wompi y, en cuanto navega a `returnUrlPrefix` (la URL
// de regreso de nuestro backend), avisa con `onFinished` sin cargarla: el
// resultado real se consulta aparte al backend. Cerrar con la X llama a
// `onCancel`.
const PaymentVerificationModal = ({ url, returnUrlPrefix, onFinished, onCancel, colors: c }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);

  const isReturn = (target) => !!returnUrlPrefix && String(target || '').startsWith(returnUrlPrefix);

  return (
    <Modal visible={!!url} animationType="slide" onRequestClose={onCancel}>
      <View style={{ flex: 1, backgroundColor: c.background, paddingTop: insets.top }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: c.border,
          }}
        >
          <Icon name="lock-closed" size={16} color={c.primary} />
          <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: c.textDark }}>Verificación de tu banco</Text>
          <TouchableOpacity onPress={onCancel} hitSlop={12} accessibilityRole="button" accessibilityLabel="Cancelar pago">
            <Icon name="close" size={22} color={c.textDark} />
          </TouchableOpacity>
        </View>

        {url ? (
          <WebView
            source={{ uri: url }}
            onLoadEnd={() => setLoading(false)}
            onShouldStartLoadWithRequest={(request) => {
              if (isReturn(request.url)) {
                onFinished();
                return false;
              }
              return true;
            }}
            // Android no siempre pasa por onShouldStartLoadWithRequest en redirecciones.
            onNavigationStateChange={(state) => {
              if (isReturn(state.url)) onFinished();
            }}
            startInLoadingState
            javaScriptEnabled
            domStorageEnabled
          />
        ) : null}

        {loading ? (
          <View style={{ position: 'absolute', top: '45%', left: 0, right: 0, alignItems: 'center' }}>
            <ActivityIndicator color={c.primary} />
          </View>
        ) : null}
      </View>
    </Modal>
  );
};

export default PaymentVerificationModal;
