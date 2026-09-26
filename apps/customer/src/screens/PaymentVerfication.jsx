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

// Métricas fijas para las tarjetas guardadas (esta pantalla no escala).
const ms = (size) => size;

export const PaymentScreen = (props) => {
  const isDark = useColorScheme() === 'dark';
  const styles = getPaymentStyles(isDark);
  const colors = getMenuColors(isDark);
  const insets = useSafeAreaInsets();
  const { cartItems = [], onBack } = props;
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
    deliveryMode,
    setDeliveryMode,
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
    handlePay,
    closeSuccessModal,
    handleGoHomePress,
  } = usePayment(props);

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
        <Text style={styles.headerTitle}>Pago</Text>
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

        {/* Entrega */}
        <View style={styles.methodTitleSection}>
          <Icon name="bicycle-outline" size={18} color={colors.textDark} />
          <Text style={styles.methodTitle}>¿Cómo lo recibes?</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
          {[
            { key: 'delivery', label: 'A domicilio', icon: 'home-outline' },
            { key: 'pickup', label: 'Recoger en el local', icon: 'storefront-outline' },
          ].map((option) => {
            const selected = deliveryMode === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                onPress={() => setDeliveryMode(option.key)}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: selected ? 'rgba(226,61,40,0.10)' : 'transparent',
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
              >
                <Icon name={option.icon} size={16} color={selected ? colors.primary : colors.textGray} />
                <Text style={{ fontSize: 13, fontWeight: '600', color: selected ? colors.primary : colors.textGray }}>
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
              Aún no tienes direcciones. Agrega una en la pestaña "Dirección" o elige recoger en el local.
            </Text>
          )
        ) : (
          <View style={{ marginBottom: 12 }} />
        )}

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
                    : `Se descuentan $${creditToApply.toFixed(2)}; pagas $${amountToCharge.toFixed(2)} con tarjeta.`
                  : 'Guárdalo para otra ocasión.'}
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}

        {!coveredByCredit ? (
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
              dark={isDark}
              label="Vencimiento"
              placeholder="MM/YY"
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
        <View style={styles.wompiBadgeContainer}>
          <Text style={styles.wompiText}>Procesado de forma segura por <Text style={{ fontWeight: '800', color: colors.textDark }}>Wompi</Text></Text>
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
              <Icon name="lock-closed" size={16} color={colors.white} />
              <Text style={styles.payButtonText}>
                {coveredByCredit ? 'Pagar con mi saldo' : `Pagar $${amountToCharge.toFixed(2)}`}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

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
