import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Pressable,
  ScrollView,
  Animated,
  Easing,
  KeyboardAvoidingView,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import waiterSheetStyles from "../../styles/waiterSheetStyles";

const HIDDEN_OFFSET = 600;

export default function WaiterSheet({ visible, onClose, children }) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(HIDDEN_OFFSET)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(translateY, {
          toValue: HIDDEN_OFFSET,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => setMounted(false));
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView behavior="padding" style={waiterSheetStyles.root}>
        <Animated.View style={[waiterSheetStyles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            waiterSheetStyles.sheet,
            {
              maxHeight: height - insets.top - 24,
              paddingBottom: 24 + insets.bottom,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={waiterSheetStyles.handle} />
          <ScrollView
            style={waiterSheetStyles.scroll}
            contentContainerStyle={[
              waiterSheetStyles.content,
              { paddingLeft: 20 + insets.left, paddingRight: 20 + insets.right },
            ]}
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
