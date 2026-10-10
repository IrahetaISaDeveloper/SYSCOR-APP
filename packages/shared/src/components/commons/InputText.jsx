import React from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../styles/theme';
import { darkPalette as d } from '../../styles/darkPalette';

const InputText = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  rightIcon,
  onRightIconPress,
  keyboardType,
  autoCapitalize = 'none',
  maxLength,
  containerStyle,
  // Opcional: la app de clientes lo pasa en modo oscuro. Sin él se ve como
  // siempre (la app de empleados no lo usa).
  dark = false,
}) => {
  const hasError = Boolean(error);
  const errorMessage = typeof error === 'string' ? error : null;

  const InputWrapper = onRightIconPress ? TouchableOpacity : View;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={[styles.label, dark && darkStyles.text]}>{label}</Text> : null}
      <View style={[styles.inputWrapper, dark && darkStyles.inputWrapper, hasError && styles.inputWrapperError]}>
        <TextInput
          style={[styles.input, dark && darkStyles.text]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={dark ? d.textLight : colors.textLight}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
        />
        {rightIcon ? (
          <InputWrapper
            onPress={onRightIconPress}
            hitSlop={10}
            style={styles.rightIcon}
            {...(onRightIconPress ? { activeOpacity: 0.7 } : {})}
          >
            {rightIcon}
          </InputWrapper>
        ) : null}
      </View>
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.xs + 2,
    color: colors.textDark,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
  },
  inputWrapperError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textDark,
  },
  rightIcon: {
    paddingLeft: spacing.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});

// Capa para modo oscuro (solo con `dark`): solo cambia colores.
const darkStyles = StyleSheet.create({
  inputWrapper: { backgroundColor: d.surface, borderColor: d.border },
  text: { color: d.textDark },
});

export default InputText;
export { InputText };
