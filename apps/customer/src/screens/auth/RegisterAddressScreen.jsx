import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAuthTheme } from '@syscor/shared/src/styles/authTheme';
import { textStyles } from '@syscor/shared/src/styles/typography';
import AuthScreenLayout from '@syscor/shared/src/components/auth/AuthScreenLayout';
import AuthHeader from '@syscor/shared/src/components/auth/AuthHeader';
import AuthField from '@syscor/shared/src/components/auth/AuthField';
import AuthSelect from '@syscor/shared/src/components/auth/AuthSelect';
import AuthButton from '@syscor/shared/src/components/auth/AuthButton';
import StepProgress from '@syscor/shared/src/components/auth/StepProgress';
import {
  DEPARTAMENTO_NAMES,
  getMunicipios,
  TIPOS_DIRECCION,
} from '../../constants/elSalvador';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';

export default function RegisterAddressScreen({ navigation, route }) {
  const { isDark, t, m } = useAuthTheme();
  const ms = m.ms;

  // Datos del paso 1, que viajan hasta la verificación.
  const accountData = route.params || {};

  const { error, validateAddress, sendVerificationCode, loading } = useCustomerAuth();

  const [departamento, setDepartamento] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [tipo, setTipo] = useState('');
  const [colonia, setColonia] = useState('');
  const [calle, setCalle] = useState('');
  const [numero, setNumero] = useState('');
  const [alias, setAlias] = useState('');

  const municipios = getMunicipios(departamento);

  // Al cambiar de departamento, el municipio anterior deja de ser válido.
  const onChangeDepartamento = (value) => {
    setDepartamento(value);
    setMunicipio('');
  };

  const onContinue = async () => {
    const address = {
      departamento,
      municipio,
      tipo,
      colonia: colonia.trim(),
      calle: calle.trim(),
      numero: numero.trim(),
      alias: alias.trim() || null,
    };

    if (!validateAddress(address)) return;

    // El código se envía ahora, para que el paso 3 solo lo verifique.
    const sent = await sendVerificationCode(accountData.email);
    if (!sent) return;

    navigation.navigate('CustomerCodeVerification', { ...accountData, address });
  };

  const header = (
    <View style={{ gap: ms(14) }}>
      <AuthHeader
        tokens={t}
        metrics={m}
        label="PASO 2 DE 3"
        onBack={() => navigation.goBack()}
      />
      <StepProgress tokens={t} total={3} current={2} />
    </View>
  );

  const footer = (
    <AuthButton
      tokens={t}
      metrics={m}
      title="Continuar"
      onPress={onContinue}
      loading={loading}
    />
  );

  return (
    <AuthScreenLayout
      tokens={t}
      metrics={m}
      isDark={isDark}
      header={header}
      footer={footer}
    >
      <Text style={[styles.title, { color: t.textPrimary, fontSize: ms(26) }]}>
        Tu dirección
      </Text>
      <Text
        style={[
          styles.subtitle,
          {
            color: t.textSecondary,
            fontSize: ms(14),
            lineHeight: ms(20),
            marginTop: ms(6),
            marginBottom: ms(20),
          },
        ]}
      >
        La usaremos para ubicar tus pedidos. Podrás agregar más direcciones
        después.
      </Text>

      {error ? (
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
          <View style={styles.errorTexts}>
            {error.title ? (
              <Text style={[styles.errorTitle, { color: t.danger, fontSize: ms(13.5) }]}>
                {error.title}
              </Text>
            ) : null}
            <Text
              style={[
                styles.errorMessage,
                { color: t.textSecondary, fontSize: ms(13), lineHeight: ms(18) },
              ]}
            >
              {error.message}
            </Text>
          </View>
        </View>
      ) : null}

      <AuthSelect
        tokens={t}
        metrics={m}
        label="DEPARTAMENTO"
        icon="map-outline"
        placeholder="Selecciona tu departamento"
        title="Departamento"
        value={departamento}
        options={DEPARTAMENTO_NAMES}
        onSelect={onChangeDepartamento}
      />

      <AuthSelect
        tokens={t}
        metrics={m}
        label="MUNICIPIO"
        icon="business-outline"
        placeholder={
          departamento ? 'Selecciona tu municipio' : 'Elige primero un departamento'
        }
        title="Municipio"
        value={municipio}
        options={municipios}
        onSelect={setMunicipio}
        disabled={!departamento}
      />

      <AuthSelect
        tokens={t}
        metrics={m}
        label="TIPO DE DIRECCIÓN"
        icon="home-outline"
        placeholder="¿Qué tipo de lugar es?"
        title="Tipo de dirección"
        value={tipo}
        options={TIPOS_DIRECCION}
        onSelect={setTipo}
      />

      <AuthField
        tokens={t}
        metrics={m}
        label="COLONIA / RESIDENCIAL"
        icon="location-outline"
        placeholder="Ej. Colonia Escalón"
        value={colonia}
        onChangeText={setColonia}
      />

      <AuthField
        tokens={t}
        metrics={m}
        label="DIRECCIÓN / CALLE"
        icon="navigate-outline"
        placeholder="Ej. Calle La Reforma, Pasaje 3"
        value={calle}
        onChangeText={setCalle}
      />

      <AuthField
        tokens={t}
        metrics={m}
        label="N.º DE CASA / APARTAMENTO"
        icon="keypad-outline"
        placeholder="Ej. Casa 15-B"
        value={numero}
        onChangeText={setNumero}
      />

      <AuthField
        tokens={t}
        metrics={m}
        label="NOMBRE DE LA DIRECCIÓN (OPCIONAL)"
        icon="bookmark-outline"
        placeholder="Ej. Casa, Trabajo"
        value={alias}
        onChangeText={setAlias}
      />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    ...textStyles.title,
  },
  subtitle: {
    ...textStyles.body,
  },
  errorBox: {
    flexDirection: 'row',
    borderWidth: 1,
  },
  errorTexts: {
    flex: 1,
  },
  errorTitle: {
    ...textStyles.link,
    marginBottom: 2,
  },
  errorMessage: {
    ...textStyles.body,
  },
});
