import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { textStyles } from '../../styles/typography';

const noScale = { ms: (size) => size };

// Selector de una opción, con el mismo aspecto que AuthField. Abre una hoja
// inferior con la lista; se usa para departamento, municipio y tipo de dirección.
export default function AuthSelect({
  tokens,
  metrics = noScale,
  label,
  icon,
  value,
  options = [],
  onSelect,
  placeholder = 'Selecciona una opción',
  error,
  disabled = false,
  title,
}) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const ms = metrics.ms;

  // Acepta tanto ['A','B'] como [{ value, label }]
  const normalized = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt,
  );
  const selected = normalized.find((opt) => opt.value === value);
  const borderColor = error ? tokens.danger : tokens.border;

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

      <TouchableOpacity
        style={[
          styles.field,
          {
            backgroundColor: disabled ? tokens.surfaceMuted : tokens.surface,
            borderColor,
            borderRadius: ms(12),
            paddingHorizontal: ms(14),
            minHeight: ms(52),
          },
        ]}
        activeOpacity={0.7}
        disabled={disabled}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label || placeholder}
      >
        {icon ? (
          <Icon
            name={icon}
            size={ms(18)}
            color={error ? tokens.danger : tokens.textMuted}
            style={{ marginRight: ms(10) }}
          />
        ) : null}

        <Text
          style={[
            styles.valueText,
            {
              color: selected ? tokens.textPrimary : tokens.textMuted,
              fontSize: ms(15),
            },
          ]}
          numberOfLines={1}
        >
          {selected ? selected.label : placeholder}
        </Text>

        <Icon name="chevron-down" size={ms(18)} color={tokens.textMuted} />
      </TouchableOpacity>

      {error ? (
        <Text
          style={[
            styles.errorText,
            { color: tokens.danger, fontSize: ms(12), marginTop: ms(6) },
          ]}
        >
          {error}
        </Text>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.sheet,
              {
                backgroundColor: tokens.background,
                paddingBottom: Math.max(insets.bottom, ms(20)),
              },
            ]}
          >
            <View style={[styles.sheetHandle, { backgroundColor: tokens.borderStrong }]} />
            <Text style={[styles.sheetTitle, { color: tokens.textPrimary, fontSize: ms(17) }]}>
              {title || label || 'Selecciona'}
            </Text>

            <FlatList
              data={normalized}
              keyExtractor={(item) => String(item.value)}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    style={[styles.option, { borderBottomColor: tokens.border }]}
                    activeOpacity={0.7}
                    onPress={() => {
                      onSelect?.(item.value);
                      setOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: isSelected ? tokens.accent : tokens.textPrimary },
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected ? (
                      <Icon name="checkmark" size={18} color={tokens.accent} />
                    ) : null}
                  </TouchableOpacity>
                );
              }}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
    borderWidth: 1,
  },
  valueText: {
    ...textStyles.body,
    flex: 1,
  },
  errorText: {
    ...textStyles.body,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    ...textStyles.title,
    marginBottom: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  optionText: {
    ...textStyles.body,
    fontSize: 15,
    flex: 1,
  },
  optionTextSelected: {
    ...textStyles.link,
  },
});
