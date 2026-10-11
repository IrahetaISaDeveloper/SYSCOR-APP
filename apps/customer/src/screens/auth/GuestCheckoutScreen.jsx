import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAuthTheme } from '@syscor/shared/src/styles/authTheme';
import { textStyles } from '@syscor/shared/src/styles/typography';
import AuthScreenLayout from '@syscor/shared/src/components/auth/AuthScreenLayout';
import AuthHeader from '@syscor/shared/src/components/auth/AuthHeader';
import AuthField from '@syscor/shared/src/components/auth/AuthField';
import AuthButton from '@syscor/shared/src/components/auth/AuthButton';
import useGuestCheckout from '../../hooks/useGuestCheckout';

// Pedir sin cuenta: solo se piden nombre y apellidos (a nombre de quién va el
// pedido). Al continuar se abre la sesión de invitado y la app pasa al menú,
// con el producto que se estaba agregando ya en la bolsa (ver guestCart).
export default function GuestCheckoutScreen({ navigation }) {
  const { isDark, t, m } = useAuthTheme();
  const ms = m.ms;
  const { name, setName, lastname, setLastname, errors, apiError, isLoading, start } = useGuestCheckout();

  const header = (
    <AuthHeader
      tokens={t}
      metrics={m}
      label="PEDIR SIN CUENTA"
      onBack={() => navigation.goBack()}
      showBack={navigation.canGoBack()}
    />
  );

  const footer = (
    <View style={{ gap: ms(14) }}>
      <AuthButton
        tokens={t}
        metrics={m}
        title="Continuar con mi pedido"
        onPress={start}
        loading={isLoading}
        disabled={!name.trim() || !lastname.trim()}
      />
      <TouchableOpacity
        onPress={() => navigation.navigate('Login')}
        style={{ alignSelf: 'center' }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
      >
        <Text style={[styles.body, { color: t.textSecondary, fontSize: ms(13.5) }]}>
          ¿Ya tienes cuenta? <Text style={[styles.link, { color: t.accent }]}>Inicia sesión</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <AuthScreenLayout tokens={t} metrics={m} isDark={isDark} header={header} footer={footer}>
      <View
        style={[
          styles.badge,
          { backgroundColor: t.accentSoft, width: ms(52), height: ms(52), borderRadius: ms(14), marginBottom: ms(18) },
        ]}
      >
        <Icon name="bag-handle-outline" size={ms(26)} color={t.accent} />
      </View>

      <Text style={[styles.title, { color: t.textPrimary, fontSize: ms(26) }]}>¿A nombre de quién va tu pedido?</Text>
      <Text
        style={[
          styles.body,
          { color: t.textSecondary, fontSize: ms(14), lineHeight: ms(20), marginTop: ms(6), marginBottom: ms(22) },
        ]}
      >
        No necesitas crear una cuenta. Con tu nombre sabremos de quién es el pedido al prepararlo y al entregarlo.
      </Text>

      {apiError ? (
        <View
          style={[
            styles.errorBox,
            {
              backgroundColor: t.accentSoft,
              borderColor: t.danger,
              borderRadius: ms(12),
              padding: ms(13),
              gap: ms(10),
              marginBottom: ms(16),
            },
          ]}
        >
          <Icon name="alert-circle-outline" size={ms(18)} color={t.danger} />
          <View style={styles.flex}>
            <Text style={[styles.link, { color: t.danger, fontSize: ms(13.5) }]}>{apiError.title}</Text>
            <Text style={[styles.body, { color: t.textSecondary, fontSize: ms(13), lineHeight: ms(18) }]}>
              {apiError.message}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={{ gap: ms(16) }}>
        <AuthField
          tokens={t}
          metrics={m}
          label="NOMBRES"
          icon="person-outline"
          placeholder="Ej. María José"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoComplete="given-name"
          textContentType="givenName"
          maxLength={40}
          returnKeyType="next"
          error={errors.name || null}
        />
        <AuthField
          tokens={t}
          metrics={m}
          label="APELLIDOS"
          icon="people-outline"
          placeholder="Ej. Hernández López"
          value={lastname}
          onChangeText={setLastname}
          autoCapitalize="words"
          autoComplete="family-name"
          textContentType="familyName"
          maxLength={40}
          returnKeyType="done"
          onSubmitEditing={start}
          error={errors.lastname || null}
        />
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  badge: { alignItems: 'center', justifyContent: 'center' },
  title: { ...textStyles.title },
  body: { ...textStyles.body },
  link: { ...textStyles.link },
  errorBox: { flexDirection: 'row', borderWidth: 1 },
});
