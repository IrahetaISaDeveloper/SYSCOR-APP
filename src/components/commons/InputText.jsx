import React from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../styles/theme';

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
}) => {
  const hasError = Boolean(error);
  const errorMessage = typeof error === 'string' ? error : null;

  const InputWrapper = onRightIconPress ? TouchableOpacity : View;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrapper, hasError && styles.inputWrapperError]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
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

export default InputText;
export { InputText };
