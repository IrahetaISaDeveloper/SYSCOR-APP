import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { InputText } from '@syscor/shared/src/components/commons/InputText';
import { PaymentSuccessModal } from '@syscor/shared/src/components/commons/PaymentSuccessModal';
import Toast from '@syscor/shared/src/components/commons/Toast';
import { usePayment } from '../hooks/usePayment';
import { getPaymentStyles } from '../styles/PaymentVerification';
import { getMenuColors } from '../styles/CustomerMenu';
import SavedCardTile from '../components/SavedCardTile';
import PaymentVerificationModal from '../components/PaymentVerificationModal';
import { cvvLengthOf } from '../services/cardsApi';
import DineInForm from '../components/DineInForm';
import CardScanner from '../components/CardScanner';
import { cardNumberInputLength } from '../utils/cardUtils';

// Las tres formas de recibir el pedido.
const FULFILLMENT_OPTIONS = [
  { key: 'dine_in', label: 'Comer en el local', icon: 'restaurant-outline' },
  { key: 'delivery', label: 'A domicilio', icon: 'home-outline' },
  { key: 'pickup', label: 'Pasar a traer', icon: 'bag-handle-outline' },
];

// Formas de pago. "Al recibir" se paga a quien entrega: repartidor, caja o mesero.
const PAY_METHOD_OPTIONS = [
  { key: 'online', label: 'Tarjeta ahora', icon: 'card-outline' },
  { key: 'cash', label: 'Efectivo al recibir', icon: 'cash-outline' },
  { key: 'card_on_delivery', label: 'Tarjeta al recibir', icon: 'wallet-outline' },
];

// A quién se le paga al recibir, según cómo llega el pedido.
const PAY_ON_DELIVERY_WHO = {
  delivery: 'al repartidor cuando llegue',
  pickup: 'en caja cuando pases por él',
  dine_in: 'en tu mesa',
};

// Métricas fijas para las tarjetas guardadas (esta pantalla no escala).
const ms = (size) => size;

export const PaymentScreen = (props) => {
  const isDark = useColorScheme() === 'dark';
  const styles = getPaymentStyles(isDark);
  const colors = getMenuColors(isDark);
  const insets = useSafeAreaInsets();
  const { cartItems = [], onBack, addMode = null } = props;
  const {
    safeSubtotal,
    safeTotal,
    cardName,
    cardNumber,
    expiry,
    cvv,
    saveCard,
    setSaveCard,
    savedCards,
    loadingCards,
    selectedCard,
    selectCard,
    savedCvv,
    handleSavedCvvChange,
    paying,
    walletBalance,
    useCredit,
    setUseCredit,
    creditToApply,
    amountToCharge,
    coveredByCredit,
    payMethod,
    setPayMethod,
    payOnDelivery,
    deliveryMode,
    setDeliveryMode,
    reservationDays,
    dineDayKey,
    setDineDayKey,
    dineSlot,
    setDineSlot,
    partySize,
    setPartySize,
    tableAlias,
    setTableAlias,
    availability,
    addresses,
    selectedAddressIndex,
    setSelectedAddressIndex,
    verification,
    handleVerificationFinished,
    handleVerificationCancel,
    showSuccessModal,
    toast,
    hideToast,
    fieldError,
    cardBrand,
    handleCardNameChange,
    handleCardNumberChange,
    handleExpiryChange,
    handleCvvChange,
    applyCardScan,
    handlePay,
    closeSuccessModal,
    handleGoHomePress,
  } = usePayment(props);
  const [scannerOpen, setScannerOpen] = React.useState(false);

  return (
    // El SafeAreaView de react-native no hace nada en Android: el encabezado
    // quedaba debajo de la cámara. Se usan los insets reales, y con
    // edge-to-edge el teclado solo deja espacio si se le da padding.
    <KeyboardAvoidingView behavior="padding" style={[styles.safeArea, { paddingTop: insets.top }]}>
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
        <Text style={styles.headerTitle}>{addMode ? `Agregar a ${addMode.code}` : 'Pago'}</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Encabezado Total */}
        <Text style={styles.sectionSubtitle}>RESUMEN DE PEDIDO</Text>
        <View style={styles.totalHeaderContainer}>
          <Text style={styles.totalTitle}>Total a Pagar</Text>
          <Text style={styles.totalPriceHeader}>${safeTotal.toFixed(2)}</Text>
        </View>

        {/* Resumen Card */}
        <View style={styles.summaryCard}>
          <View style={[styles.summaryRow, { marginBottom: 0 }]}>
            <Text style={styles.summaryLabel}>Subtotal comida</Text>
            <Text style={styles.summaryValue}>${safeSubtotal.toFixed(2)}</Text>
          </View>
        </View>

        {addMode ? (
          <Text style={{ fontSize: 13, color: colors.textGray, marginBottom: 20 }}>
            Estos productos se suman a tu pedido {addMode.code}, con la misma forma de entrega. Solo pagas lo que agregaste.
          </Text>
        ) : null}

        {/* Entrega (no aplica al agregar productos: es la del pedido original) */}
        {!addMode ? (
        <>
        <View style={styles.methodTitleSection}>
          <Icon name="bicycle-outline" size={18} color={colors.textDark} />
          <Text style={styles.methodTitle}>¿Cómo lo recibes?</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          {FULFILLMENT_OPTIONS.map((option) => {
            const selected = deliveryMode === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                onPress={() => setDeliveryMode(option.key)}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  paddingVertical: 12,
                  paddingHorizontal: 4,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: selected ? colors.primaryTint : 'transparent',
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
              >
                <Icon name={option.icon} size={18} color={selected ? colors.primary : colors.textGray} />
                <Text
                  style={{ fontSize: 12, fontWeight: '600', textAlign: 'center', color: selected ? colors.primary : colors.textGray }}
                  numberOfLines={2}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {deliveryMode === 'delivery' ? (
          addresses.length > 0 ? (
            <View style={{ gap: 8, marginBottom: 20 }}>
              {addresses.map((address) => {
                const selected = address.index === selectedAddressIndex;
                return (
                  <TouchableOpacity
                    key={address.index}
                    onPress={() => setSelectedAddressIndex(address.index)}
                    activeOpacity={0.8}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      padding: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: selected ? colors.primary : colors.border,
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                  >
                    <Icon
                      name={selected ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={selected ? colors.primary : colors.textGray}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textDark }}>{address.tag}</Text>
                      <Text style={{ fontSize: 12.5, color: colors.textGray }} numberOfLines={2}>
                        {address.details}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <Text style={{ fontSize: 13, color: colors.textGray, marginBottom: 20 }}>
              Aún no tienes direcciones. Agrega una en la pestaña "Dirección" o elige pasar a traer.
            </Text>
          )
        ) : deliveryMode === 'dine_in' ? (
          <DineInForm
            colors={colors}
            isDark={isDark}
            days={reservationDays}
            dayKey={dineDayKey}
            onDayChange={setDineDayKey}
            slot={dineSlot}
            onSlotChange={setDineSlot}
            partySize={partySize}
            onPartySizeChange={setPartySize}
            alias={tableAlias}
            onAliasChange={setTableAlias}
            availability={availability}
          />
        ) : (
          <View style={{ marginBottom: 12 }} />
        )}
        </>
        ) : null}

        {/* Saldo a favor (de reclamos resueltos por Panchita) */}
        {walletBalance > 0 ? (
          <TouchableOpacity
            onPress={() => setUseCredit(!useCredit)}
            activeOpacity={0.85}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              padding: 14,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: useCredit ? '#1FC47A' : colors.border,
              backgroundColor: useCredit ? 'rgba(31,196,122,0.10)' : 'transparent',
              marginBottom: 20,
            }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: useCredit }}
          >
            <Icon name={useCredit ? 'checkbox' : 'square-outline'} size={20} color={useCredit ? '#1FC47A' : colors.textGray} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textDark }}>
                Usar mi saldo a favor (${walletBalance.toFixed(2)})
              </Text>
              <Text style={{ fontSize: 12.5, color: colors.textGray }}>
                {useCredit
                  ? coveredByCredit
                    ? 'Tu saldo cubre todo el pedido.'
                    : `Se descuentan $${creditToApply.toFixed(2)}; pagas $${amountToCharge.toFixed(2)} ${payOnDelivery ? 'al recibir' : 'con tarjeta'}.`
                  : 'Guárdalo para otra ocasión.'}
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}

        {/* Forma de pago (lo agregado a un pedido siempre se paga en línea) */}
        {!addMode && !coveredByCredit ? (
          <>
            <View style={styles.methodTitleSection}>
              <Icon name="wallet-outline" size={18} color={colors.textDark} />
              <Text style={styles.methodTitle}>¿Cómo pagas?</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: payOnDelivery ? 10 : 20 }}>
              {PAY_METHOD_OPTIONS.map((option) => {
                const selected = payMethod === option.key;
                return (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() => setPayMethod(option.key)}
                    activeOpacity={0.8}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      paddingVertical: 12,
                      paddingHorizontal: 4,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected ? colors.primaryTint : 'transparent',
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                  >
                    <Icon name={option.icon} size={18} color={selected ? colors.primary : colors.textGray} />
                    <Text
                      style={{ fontSize: 12, fontWeight: '600', textAlign: 'center', color: selected ? colors.primary : colors.textGray }}
                      numberOfLines={2}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {payOnDelivery ? (
              <View
                style={{
                  flexDirection: 'row',
                  gap: 10,
                  padding: 14,
                  borderRadius: 14,
                  backgroundColor: colors.primaryTint,
                  marginBottom: 20,
                }}
              >
                <Icon name="information-circle-outline" size={18} color={colors.primary} />
                <Text style={{ flex: 1, fontSize: 13, color: colors.textDark, lineHeight: 18 }}>
                  Pagas ${amountToCharge.toFixed(2)} {payMethod === 'cash' ? 'en efectivo' : 'con tarjeta'}{' '}
                  {PAY_ON_DELIVERY_WHO[deliveryMode] || 'al recibir'}.
                  {payMethod === 'cash' ? ' Si puedes, lleva el monto exacto.' : ''}
                </Text>
              </View>
            ) : null}
          </>
        ) : null}

        {!coveredByCredit && !payOnDelivery ? (
        <>
        {/* Método de Pago */}
        <View style={styles.methodTitleSection}>
          <Icon name="card-outline" size={18} color={colors.textDark} />
          <Text style={styles.methodTitle}>Tarjeta de Crédito / Débito</Text>
        </View>

        {/* Tarjetas guardadas: con una elegida solo se pide el CVV */}
        {loadingCards ? <ActivityIndicator color={colors.primary} style={{ marginBottom: 16 }} /> : null}

        {savedCards.length > 0 ? (
          <View style={{ gap: 10, marginBottom: 16 }}>
            {savedCards.map((card) => (
              <SavedCardTile
                key={`${card.index}-${card.lastFour}`}
                card={card}
                ms={ms}
                compact
                selected={selectedCard?.index === card.index}
                onPress={() => selectCard(card.index)}
              />
            ))}
            <TouchableOpacity
              onPress={() => selectCard(null)}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                padding: 14,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: selectedCard ? colors.border : colors.primary,
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: !selectedCard }}
            >
              <Icon
                name={selectedCard ? 'radio-button-off' : 'radio-button-on'}
                size={20}
                color={selectedCard ? colors.textGray : colors.primary}
              />
              <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: colors.textDark }}>
                Usar otra tarjeta
              </Text>
              <Icon name="add" size={18} color={colors.textGray} />
            </TouchableOpacity>
          </View>
        ) : null}

        {selectedCard ? (
          <InputText
            dark={isDark}
            label={`CVV de tu tarjeta terminada en ${selectedCard.lastFour}`}
            placeholder={cvvLengthOf(selectedCard.brand) === 4 ? '****' : '***'}
            keyboardType="numeric"
            maxLength={cvvLengthOf(selectedCard.brand)}
            secureTextEntry
            value={savedCvv}
            onChangeText={handleSavedCvvChange}
            error={fieldError === 'savedCvv'}
            rightIcon={<Icon name="lock-closed-outline" size={16} color={colors.textLight} />}
          />
        ) : null}

        {/* Formulario Wompi (tarjeta nueva) */}
        {!selectedCard ? (
          <>
          <TouchableOpacity
            onPress={() => setScannerOpen(true)}
            activeOpacity={0.85}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              height: 44,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.primary,
              backgroundColor: colors.primaryTint,
              marginBottom: 14,
            }}
            accessibilityRole="button"
          >
            <Icon name="scan-outline" size={18} color={colors.primary} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>Escanear tarjeta</Text>
          </TouchableOpacity>
          <InputText
              dark={isDark}
            label="Nombre en la tarjeta"
            placeholder="Juan Pérez"
            value={cardName}
            onChangeText={handleCardNameChange}
            error={fieldError === 'cardName'}
          />

          <InputText
              dark={isDark}
            label="Número de tarjeta"
            placeholder="0000 0000 0000 0000"
            keyboardType="number-pad"
            maxLength={cardNumberInputLength(cardNumber)}
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
              dark={isDark}
              label="Vencimiento"
              placeholder="MM/AA"
              maxLength={5}
              value={expiry}
              onChangeText={handleExpiryChange}
              error={fieldError === 'expiry'}
              containerStyle={styles.flex1}
            />
            <InputText
              dark={isDark}
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
            <Text style={styles.checkboxLabel}>Guardar tarjeta para futuros pedidos (sin el CVV)</Text>
          </TouchableOpacity>
          </>
        ) : null}

        </>
        ) : null}

        {/* Badge Wompi */}
        {!payOnDelivery ? (
          <View style={styles.wompiBadgeContainer}>
            <Text style={styles.wompiText}>Procesado de forma segura por <Text style={{ fontWeight: '800', color: colors.textDark }}>Wompi</Text></Text>
          </View>
        ) : null}

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
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity
          style={[styles.payButton, paying && { opacity: 0.7 }]}
          onPress={handlePay}
          disabled={paying}
          activeOpacity={0.9}
        >
          {paying ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Icon name={payOnDelivery ? 'checkmark-circle' : 'lock-closed'} size={16} color={colors.white} />
              <Text style={styles.payButtonText}>
                {coveredByCredit
                  ? 'Pagar con mi saldo'
                  : payOnDelivery
                    ? `Hacer pedido · $${amountToCharge.toFixed(2)} al recibir`
                    : `Pagar $${amountToCharge.toFixed(2)}`}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Escanear el frente de la tarjeta (se lee en el teléfono) */}
      <CardScanner visible={scannerOpen} onClose={() => setScannerOpen(false)} onResult={applyCardScan} colors={colors} />

      {/* Verificación 3D Secure del banco */}
      <PaymentVerificationModal
        url={verification?.paymentUrl}
        returnUrlPrefix={verification?.returnUrlPrefix}
        onFinished={handleVerificationFinished}
        onCancel={handleVerificationCancel}
        colors={colors}
      />

      {/* Modal de Éxito al confirmarse el pago */}
      <PaymentSuccessModal
        visible={showSuccessModal}
        items={cartItems}
        total={safeTotal}
        estimatedTime="25–35 min"
        onClose={closeSuccessModal}
        onGoHome={handleGoHomePress}
      />
    </KeyboardAvoidingView>
  );
};

export default PaymentScreen;
