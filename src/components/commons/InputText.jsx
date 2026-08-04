import React, { useEffect, useRef } from 'react';
import { View, Text, TextInput, Animated, StyleSheet } from 'react-native';

export const InputText = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  secureTextEntry = false,
  maxLength,
  rightIcon,
  containerStyle,
  error = false,
  ...rest
}) => {
  const shakeX = useRef(new Animated.Value(0)).current;

  // Pequeño "sacudido" amigable para señalar el campo con error, sin
  // bloquear al usuario con un popup: se ve, se entiende y se sigue.
  useEffect(() => {
    if (!error) return;
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 4, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [error]);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={[styles.label, error && styles.labelError]}>{label}</Text> : null}

      <Animated.View style={{ transform: [{ translateX: shakeX }] }}>
        <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#A1A1AA"
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            maxLength={maxLength}
            autoCapitalize="none"
            {...rest}
          />
          {rightIcon ? <View style={styles.rightIcon}>{rightIcon}</View> : null}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3F3F46',
    marginBottom: 6,
  },
  labelError: {
    color: '#C62828',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputWrapperError: {
    borderColor: '#C62828',
    backgroundColor: '#FDF1F0',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#18181B',
  },
  rightIcon: {
    marginLeft: 8,
  },
});

export default InputText;
