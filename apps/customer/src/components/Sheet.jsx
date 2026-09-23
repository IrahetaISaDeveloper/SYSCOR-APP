import React from 'react';
import { Modal, View, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';

// Hoja inferior genérica: fondo oscuro, esquinas redondeadas y un asa arriba.
// Tocar fuera la cierra.
const Sheet = ({ visible, onClose, colors: c, ms, bottomInset, children }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}
    >
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      <View
        style={{
          backgroundColor: c.background,
          borderTopLeftRadius: ms(22),
          borderTopRightRadius: ms(22),
          paddingHorizontal: ms(20),
          paddingTop: ms(10),
          paddingBottom: Math.max(bottomInset, ms(16)),
        }}
      >
        <View
          style={{
            alignSelf: 'center',
            width: ms(40),
            height: 4,
            borderRadius: 2,
            backgroundColor: c.borderStrong,
            marginBottom: ms(16),
          }}
        />
        {children}
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

export default Sheet;
