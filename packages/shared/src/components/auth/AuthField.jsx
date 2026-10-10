import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { textStyles } from '../../styles/typography';

const noScale = { ms: (size) => size };

// Campo de texto de las pantallas de acceso: etiqueta en versalitas, icono a la
// izquierda y, opcionalmente, un icono accionable a la derecha (ver contraseña,
// marca de validación). El borde se tiñe cuando el campo tiene error o cuando
// está enfocado.
export default function AuthField({
  tokens,
  metrics = noScale,
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  error,
  hint,
  rightIcon,
  onRightIconPress,
  prefix,
  editable = true,
  onFocus,
  onBlur,
  ...inputProps
}) {
  const [focused, setFocused] = React.useState(false);
  const ms = metrics.ms;

  const borderColor = error
    ? tokens.danger
    : focused
      ? tokens.accent
      : tokens.border;

  return (
    <View style={{ marginBottom: ms(14) }}>
      {label ? (
        <Text
          style={[
            styles.label,
            { color: tokens.textMuted, fontSize: ms(11), marginBottom: ms(7) },
          ]}
        >
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.field,
          {
            backgroundColor: tokens.surface,
            borderColor,
            // Un campo enfocado se resalta sin mover el layout.
            borderWidth: focused || error ? 1.5 : 1,
            borderRadius: ms(12),
            paddingHorizontal: ms(14),
            minHeight: ms(52),
          },
        ]}
      >
        {icon ? (
          <Icon
            name={icon}
            size={ms(18)}
            color={error ? tokens.danger : focused ? tokens.accent : tokens.textMuted}
            style={{ marginRight: ms(10) }}
          />
        ) : null}

        {prefix ? (
          <Text
            style={[
              styles.prefix,
              {
                color: tokens.textSecondary,
                borderRightColor: tokens.border,
                fontSize: ms(15),
                paddingRight: ms(10),
                marginRight: ms(10),
              },
            ]}
          >
            {prefix}
          </Text>
        ) : null}

        <TextInput
          style={[styles.input, { color: tokens.textPrimary, fontSize: ms(15) }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={tokens.textMuted}
          editable={editable}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...inputProps}
        />

        {rightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {rightIcon}
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <Text style={[styles.helper, { color: tokens.danger, fontSize: ms(12), marginTop: ms(6) }]}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={[styles.helper, { color: tokens.textMuted, fontSize: ms(12), marginTop: ms(6) }]}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...textStyles.kicker,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefix: {
    ...textStyles.num,
    borderRightWidth: 1,
  },
  input: {
    ...textStyles.body,
    flex: 1,
    padding: 0,
  },
  helper: {
    ...textStyles.body,
    lineHeight: 16,
  },
});
