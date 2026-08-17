import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { InputText } from '../components/commons/InputText';
import { PaymentSuccessModal } from '../components/commons/PaymentSuccessModal';
import Toast from '../components/commons/Toast';
import { usePayment } from '../hooks/usePayment';
import { styles } from '../styles/PaymentVerification';
import { colors } from '../styles/theme';

export const PaymentScreen = (props) => {
  const { cartItems = [], onBack } = props;
  const {
    safeSubtotal,
    safeTip,
    safeTotal,
    cardName,
    cardNumber,
    expiry,
    cvv,
    saveCard,
    setSaveCard,
    showSuccessModal,
    toast,
    hideToast,
    fieldError,
    cardBrand,
    handleCardNameChange,
    handleCardNumberChange,
    handleExpiryChange,
    handleCvvChange,
    handlePay,
    closeSuccessModal,
    handleGoHomePress,
  } = usePayment(props);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type="error"
        onHide={hideToast}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
          <Icon name="arrow-back" size={20} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pago</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Encabezado Total */}
        <Text style={styles.sectionSubtitle}>RESUMEN DE PEDIDO</Text>
        <View style={styles.totalHeaderContainer}>
          <Text style={styles.totalTitle}>Total a Pagar</Text>
          <Text style={styles.totalPriceHeader}>${safeTotal.toFixed(2)}</Text>
        </View>

        {/* Resumen Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal comida</Text>
            <Text style={styles.summaryValue}>${safeSubtotal.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, { marginBottom: 0 }]}>
            <Text style={styles.summaryLabel}>Propina +5%</Text>
            <Text style={styles.summaryValue}>${safeTip.toFixed(2)}</Text>
          </View>
        </View>

        {/* Método de Pago */}
        <View style={styles.methodTitleSection}>
          <Icon name="card-outline" size={18} color={colors.textDark} />
          <Text style={styles.methodTitle}>Tarjeta de Crédito / Débito</Text>
        </View>

        {/* Formulario Wompi */}
        <InputText
          label="Nombre en la tarjeta"
          placeholder="Juan Pérez"
          value={cardName}
          onChangeText={handleCardNameChange}
          error={fieldError === 'cardName'}
        />

        <InputText
          label="Número de tarjeta"
          placeholder="0000 0000 0000 0000"
          keyboardType="numeric"
          maxLength={23}
          value={cardNumber}
          onChangeText={handleCardNumberChange}
          error={fieldError === 'cardNumber'}
          rightIcon={
            cardBrand.brand ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name={cardBrand.icon} size={16} color={colors.textDark} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textDark }}>
                  {cardBrand.brand}
                </Text>
              </View>
            ) : (
              <Icon name="card-outline" size={16} color={colors.textLight} />
            )
          }
        />

        <View style={styles.rowInputs}>
          <InputText
            label="Vencimiento"
            placeholder="MM/YY"
            maxLength={5}
            value={expiry}
            onChangeText={handleExpiryChange}
            error={fieldError === 'expiry'}
            containerStyle={styles.flex1}
          />
          <InputText
            label="CVV"
            placeholder={cardBrand.cvvLength === 4 ? '****' : '***'}
            keyboardType="numeric"
            maxLength={cardBrand.cvvLength}
            secureTextEntry
            value={cvv}
            onChangeText={handleCvvChange}
            error={fieldError === 'cvv'}
            containerStyle={styles.flex1}
            rightIcon={<Icon name="information-circle-outline" size={16} color={colors.textLight} />}
          />
        </View>

        {/* Guardar tarjeta */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setSaveCard(!saveCard)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, saveCard && styles.checkboxActive]}>
            {saveCard && <Icon name="checkmark" size={12} color={colors.white} />}
          </View>
          <Text style={styles.checkboxLabel}>Guardar tarjeta para futuros pedidos</Text>
        </TouchableOpacity>

        {/* Badge Wompi */}
        <View style={styles.wompiBadgeContainer}>
          <Text style={styles.wompiText}>Procesado de forma segura por <Text style={{ fontWeight: '800', color: '#111827' }}>Wompi</Text></Text>
        </View>

        {/* Badges Seguridad */}
        <View style={styles.badgesContainer}>
          <View style={styles.badgeItem}>
            <Icon name="shield-checkmark-outline" size={14} color={colors.textGray} />
            <Text style={styles.badgeText}>SSL SECURE</Text>
          </View>
          <View style={styles.badgeItem}>
            <Icon name="lock-closed-outline" size={14} color={colors.textGray} />
            <Text style={styles.badgeText}>SAFE PAY</Text>
          </View>
        </View>
      </ScrollView>

      {/* Botón Pagar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.payButton}
          onPress={handlePay}
          activeOpacity={0.9}
        >
          <Icon name="lock-closed" size={16} color={colors.white} />
          <Text style={styles.payButtonText}>Pagar ${safeTotal.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Éxito al confirmarse el pago */}
      <PaymentSuccessModal
        visible={showSuccessModal}
        items={cartItems}
        total={safeTotal}
        estimatedTime="25–35 min"
        onClose={closeSuccessModal}
        onGoHome={handleGoHomePress}
      />
    </SafeAreaView>
  );
};

export default PaymentScreen;
