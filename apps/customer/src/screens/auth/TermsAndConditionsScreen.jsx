import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAuthTheme } from '@syscor/shared/src/styles/authTheme';
import { textStyles } from '@syscor/shared/src/styles/typography';
import AuthScreenLayout from '@syscor/shared/src/components/auth/AuthScreenLayout';
import AuthHeader from '@syscor/shared/src/components/auth/AuthHeader';

// Texto de muestra: sirve para que el flujo de registro esté completo, pero no
// es un documento legal. Debe sustituirse por los términos definitivos del
// negocio antes de publicar la aplicación.
const SECTIONS = [
  {
    title: '1. Sobre este servicio',
    body: 'La aplicación de Taquería El Corral permite consultar el menú, armar un pedido y pagarlo en línea. El uso de la aplicación implica la aceptación de estas condiciones.',
  },
  {
    title: '2. Tu cuenta',
    body: 'Para realizar pedidos necesitas una cuenta con datos reales y vigentes. Eres responsable de la confidencialidad de tu contraseña y de la actividad que ocurra en tu cuenta.',
  },
  {
    title: '3. Pedidos y precios',
    body: 'Los precios y la disponibilidad de los productos pueden variar. Un pedido se considera confirmado cuando el local lo acepta y el pago ha sido procesado correctamente.',
  },
  {
    title: '4. Pagos',
    body: 'Los pagos en línea se procesan mediante un proveedor externo. La aplicación no almacena los datos completos de tu tarjeta.',
  },
  {
    title: '5. Cancelaciones',
    body: 'Un pedido puede cancelarse mientras el local no haya iniciado su preparación. Pasado ese momento, la cancelación queda sujeta a la política del establecimiento.',
  },
  {
    title: '6. Datos personales',
    body: 'Los datos que proporcionas (nombre, correo, teléfono y dirección) se utilizan para gestionar tu cuenta y entregar tus pedidos. No se comparten con terceros ajenos al servicio.',
  },
  {
    title: '7. Uso adecuado',
    body: 'No está permitido usar la aplicación para fines fraudulentos, realizar pedidos falsos ni interferir con su funcionamiento.',
  },
  {
    title: '8. Cambios en las condiciones',
    body: 'Estas condiciones pueden actualizarse. Si los cambios son relevantes, se informará dentro de la aplicación antes de su entrada en vigor.',
  },
  {
    title: '9. Contacto',
    body: 'Para cualquier consulta relacionada con tu cuenta o tus pedidos, puedes comunicarte directamente con el local.',
  },
];

export default function TermsAndConditionsScreen({ navigation }) {
  const { isDark, t, m } = useAuthTheme();
  const ms = m.ms;

  const header = (
    <AuthHeader
      tokens={t}
      metrics={m}
      label="TÉRMINOS DE SERVICIO"
      onBack={() => navigation.goBack()}
    />
  );

  return (
    <AuthScreenLayout
      tokens={t}
      metrics={m}
      isDark={isDark}
      header={header}
      // Es un texto largo de solo lectura: los halos solo estorban.
      backdrop={false}
    >
      <Text
        style={[
          styles.title,
          {
            color: t.textPrimary,
            fontSize: ms(24),
            lineHeight: ms(30),
            marginBottom: ms(18),
          },
        ]}
      >
        Términos de servicio y aviso de privacidad
      </Text>

      {/* El texto todavía no ha pasado por revisión legal */}
      <View
        style={[
          styles.notice,
          {
            backgroundColor: t.accentSoft,
            borderColor: t.borderStrong,
            gap: ms(10),
            borderRadius: ms(12),
            padding: ms(13),
            marginBottom: ms(24),
          },
        ]}
      >
        <Icon name="information-circle-outline" size={ms(18)} color={t.accent} />
        <Text
          style={[
            styles.noticeText,
            { color: t.textSecondary, fontSize: ms(13), lineHeight: ms(18) },
          ]}
        >
          Texto preliminar de muestra. Debe sustituirse por la versión definitiva
          antes de publicar la aplicación.
        </Text>
      </View>

      {SECTIONS.map((section) => (
        <View key={section.title} style={{ marginBottom: ms(20) }}>
          <Text
            style={[
              styles.sectionTitle,
              { color: t.textPrimary, fontSize: ms(15.5), marginBottom: ms(6) },
            ]}
          >
            {section.title}
          </Text>
          <Text
            style={[
              styles.sectionBody,
              { color: t.textSecondary, fontSize: ms(14), lineHeight: ms(21) },
            ]}
          >
            {section.body}
          </Text>
        </View>
      ))}

      <Text
        style={[
          styles.legal,
          { color: t.textMuted, fontSize: ms(10.5), marginTop: ms(12) },
        ]}
      >
        © TAQUERÍA EL CORRAL · SYSCOR
      </Text>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    ...textStyles.title,
  },
  notice: {
    flexDirection: 'row',
    borderWidth: 1,
  },
  noticeText: {
    ...textStyles.body,
    flex: 1,
  },
  sectionTitle: {
    ...textStyles.title,
  },
  sectionBody: {
    ...textStyles.body,
  },
  legal: {
    ...textStyles.kicker,
    textAlign: 'center',
  },
});
