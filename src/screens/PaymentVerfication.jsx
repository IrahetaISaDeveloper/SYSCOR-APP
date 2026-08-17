import React, { useMemo, useState } from 'react';
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
import {
  detectCardBrand,
  isValidLuhn,
  sanitizeDigits,
  formatCardNumber,
  formatExpiry,
} from '../utils/cardUtils';
import { styles } from '../styles/PaymentVerification';

export const PaymentScreen = ({ 
  cartItems = [],
  subtotal = 0, 
  tip = 0, 
  total = 0, 
  onBack, 
  onConfirmPayment,
  onGoHome
}) => {
  const safeSubtotal = Number(subtotal) || 0;
  const safeTip = Number(tip) || 0;
  const safeTotal = Number(total) || safeSubtotal + safeTip;

  // Estado local para los campos de Wompi
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  // Estado del Modal de Éxito
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Notificación amigable + campo resaltado cuando falta o falla un dato
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [fieldError, setFieldError] = useState(null);

  // Detecta la marca de la tarjeta en vivo mientras el usuario escribe
  const cardBrand = useMemo(() => detectCardBrand(cardNumber), [cardNumber]);

  // Envuelve cada setter para limpiar el error de ese campo apenas el
  // usuario empieza a corregirlo, y aplica un formateador opcional
  // (solo dígitos, agrupado en tarjeta, "/" automático en la fecha).
  const onChangeField = (field, setter, formatter) => (text) => {
    if (fieldError === field) setFieldError(null);
    setter(formatter ? formatter(text) : text);
  };

  // Valida los campos de la tarjeta antes de enviar el pago a Wompi.
  // Devuelve qué campo falló para poder resaltarlo en el formulario.
  const validatePaymentForm = () => {
    const trimmedName = cardName.trim();
    const digitsOnly = cardNumber.replace(/\s/g, '');
    const [expiryMonth, expiryYear] = expiry.split('/');

    if (cartItems.length === 0) {
      return { field: null, message: 'Tu carrito está vacío. Agrega productos antes de pagar.' };
    }
    if (trimmedName.length < 3) {
      return { field: 'cardName', message: 'Ingresa el nombre completo tal como aparece en la tarjeta.' };
    }
    if (digitsOnly.length < 15 || digitsOnly.length > 19 || !/^\d+$/.test(digitsOnly)) {
      return { field: 'cardNumber', message: 'El número de tarjeta no es válido.' };
    }
    if (!cardBrand.brand) {
      return { field: 'cardNumber', message: 'No reconocemos esa tarjeta. Revisa el número ingresado.' };
    }
    if (!isValidLuhn(digitsOnly)) {
      return { field: 'cardNumber', message: 'El número de tarjeta parece incorrecto. Revísalo.' };
    }
    if (!/^\d{2}$/.test(expiryMonth || '') || !/^\d{2}$/.test(expiryYear || '')) {
      return { field: 'expiry', message: 'La fecha de vencimiento debe tener el formato MM/YY.' };
    }
    const month = Number(expiryMonth);
    if (month < 1 || month > 12) {
      return { field: 'expiry', message: 'El mes de vencimiento no es válido.' };
    }
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    const year = Number(expiryYear);
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return { field: 'expiry', message: 'La tarjeta está vencida.' };
    }
    if (!new RegExp(`^\\d{${cardBrand.cvvLength}}$`).test(cvv)) {
      return { field: 'cvv', message: `El CVV de ${cardBrand.brand} debe tener ${cardBrand.cvvLength} dígitos.` };
    }
    return null;
  };

  const handlePay = async () => {
    const validation = validatePaymentForm();
    if (validation) {
      setFieldError(validation.field);
      setToast({ visible: true, message: validation.message });
      return;
    }

    const wompiPaymentData = {
      cardName,
      cardNumber: cardNumber.replace(/\s/g, ''),
      expiryMonth: expiry.split('/')[0],
      expiryYear: expiry.split('/')[1],
      cvv,
      saveCard
    };
    
    // Si la API/Wompi responde OK, ejecutamos el callback y mostramos el modal
    if (onConfirmPayment) {
      await onConfirmPayment(wompiPaymentData);
    }
    
    setShowSuccessModal(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type="error"
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
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
          onChangeText={onChangeField('cardName', setCardName)}
          error={fieldError === 'cardName'}
        />

        <InputText
          label="Número de tarjeta"
          placeholder="0000 0000 0000 0000"
          keyboardType="numeric"
          maxLength={23}
          value={cardNumber}
          onChangeText={onChangeField('cardNumber', setCardNumber, formatCardNumber)}
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
            onChangeText={onChangeField('expiry', setExpiry, formatExpiry)}
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
            onChangeText={onChangeField('cvv', setCvv, sanitizeDigits)}
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
        onClose={() => setShowSuccessModal(false)}
        onGoHome={() => {
          setShowSuccessModal(false);
          if (onGoHome) onGoHome();
        }}
      />
    </SafeAreaView>
  );
};
export default PaymentScreen;
