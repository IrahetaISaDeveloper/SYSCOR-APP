import React from "react";
import { Modal, View, Text, TouchableOpacity, Pressable } from "react-native";
import bottomSheetModalStyles from "../../styles/bottomSheetModalStyles";

export default function BottomSheetModal({ visible, onClose, title, children }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={bottomSheetModalStyles.backdrop}>
        <Pressable style={bottomSheetModalStyles.backdropFill} onPress={onClose} />

        <View style={bottomSheetModalStyles.sheet}>
          <View style={bottomSheetModalStyles.handle} />

          <View style={bottomSheetModalStyles.header}>
            <Text style={bottomSheetModalStyles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={bottomSheetModalStyles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Área de contenido con altura garantizada: los hijos (ScrollView + footer)
              pueden usar flex:1 con total seguridad, sin colapsar. */}
          <View style={bottomSheetModalStyles.contentArea}>{children}</View>
        </View>
      </View>
    </Modal>
  );
}
