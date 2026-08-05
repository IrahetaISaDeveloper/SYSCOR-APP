import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { InputText } from '../components/commons/InputText';
import { PaymentSuccessModal } from '../components/commons/PaymentSuccessModal';
import Toast from '../components/commons/Toast';
import { usePayment } from '../hooks/usePayment';
import { styles } from '../styles/PaymentVerification';

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
          <Text style={{ fontSize: 20, color: '#B91C1C' }}>←</Text>
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
          <Text style={{ fontSize: 18 }}>💳</Text>
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
            <Text style={{ fontSize: 12, fontWeight: '700', color: cardBrand.brand ? '#111827' : '#A1A1AA' }}>
              {cardBrand.icon} {cardBrand.brand || ''}
            </Text>
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
            rightIcon={<Text style={{ color: '#A1A1AA', fontSize: 12 }}>ⓘ</Text>}
          />
        </View>

        {/* Guardar tarjeta */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setSaveCard(!saveCard)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, saveCard && styles.checkboxActive]}>
            {saveCard && <Text style={{ color: '#FFFFFF', fontSize: 12 }}>✓</Text>}
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
            <Text style={{ fontSize: 12 }}>🛡️</Text>
            <Text style={styles.badgeText}>SSL SECURE</Text>
          </View>
          <View style={styles.badgeItem}>
            <Text style={{ fontSize: 12 }}>🔒</Text>
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
          <Text style={{ fontSize: 16 }}>🔒</Text>
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
