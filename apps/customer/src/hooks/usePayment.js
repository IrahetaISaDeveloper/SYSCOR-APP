import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@syscor/shared/src/context/AuthContext';
import { getCards, cvvLengthOf, BRAND_LABELS } from '../services/cardsApi';
import { getAddresses } from '../services/addressesApi';
import { createCheckout, cancelCheckout, waitForCheckout } from '../services/checkoutApi';
import { usePanchita } from '../context/PanchitaContext';
import {
  detectCardBrand,
  isValidLuhn,
  sanitizeDigits,
  formatCardNumber,
  formatExpiry,
} from '../utils/cardUtils';

// Toda la lógica de la pantalla de Pago: entrega o recogida, tarjetas
// guardadas, formulario de tarjeta nueva, validaciones (Luhn, CVV,
// vencimiento), el cobro real con Wompi 3DS y el modal de éxito.
//
// `rawItems` son los productos tal como están en el carrito (con extras,
// salsas, etc.); `cartItems` es la versión resumida que se muestra.
export const usePayment = ({ cartItems = [], rawItems = [], subtotal = 0, total = 0, onPaid, onGoHome } = {}) => {
  const { user } = useAuth();
  const customerId = user?.id || user?._id;

  const safeSubtotal = Number(subtotal) || 0;
  const safeTotal = Number(total) || safeSubtotal;

  // Saldo a favor (reclamos que resolvió Panchita). El backend vuelve a
  // calcular cuánto se usa; esto es solo para mostrarlo.
  const { wallet, refresh: refreshPanchita } = usePanchita();
  const walletBalance = Math.round((Number(wallet?.balance) || 0) * 100) / 100;
  const [useCredit, setUseCredit] = useState(true);
  const creditToApply = useCredit ? Math.min(walletBalance, safeTotal) : 0;
  // Lo que el servidor dijo que falta cuando la app creyó que el saldo
  // alcanzaba (el servidor cobra con los precios de hoy). Se vuelve a pedir
  // tarjeta por ese monto.
  const [serverCharge, setServerCharge] = useState(null);
  // Si el saldo cambia (se recargó), se vuelve a calcular con el nuevo.
  useEffect(() => setServerCharge(null), [walletBalance]);
  const localCharge = Math.round((safeTotal - creditToApply) * 100) / 100;
  const amountToCharge = useCredit && serverCharge > 0 ? serverCharge : localCharge;
  const coveredByCredit = amountToCharge <= 0;

  // Estado local para los campos de Wompi
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  // Tarjetas guardadas del cliente. `selectedCardIndex` es el `index` de la
  // elegida, o null para pagar con una tarjeta nueva.
  const [savedCards, setSavedCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [savedCvv, setSavedCvv] = useState('');
  const [paying, setPaying] = useState(false);

  // Entrega: a domicilio (a una dirección de su libreta) o recoger en el local.
  const [deliveryMode, setDeliveryMode] = useState('delivery');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);

  // Verificación 3DS en curso: { id, paymentUrl, returnUrlPrefix }.
  const [verification, setVerification] = useState(null);
  const settlingRef = useRef(false);

  useEffect(() => {
    if (!customerId) return;
    getAddresses(customerId).then((res) => {
      if (!res.success) return;
      setAddresses(res.addresses);
      const preferred = res.addresses.find((a) => a.isDefault) || res.addresses[0];
      if (preferred) setSelectedAddressIndex(preferred.index);
      else setDeliveryMode('pickup');
    });
  }, [customerId]);

  const selectedAddress = addresses.find((a) => a.index === selectedAddressIndex) || null;

  // Al entrar se preselecciona la predeterminada: el cliente solo escribe el CVV.
  useEffect(() => {
    if (!customerId) {
      setLoadingCards(false);
      return;
    }
    let active = true;
    getCards(customerId).then((res) => {
      if (!active) return;
      if (res.success) {
        setSavedCards(res.cards);
        const preferred = res.cards.find((card) => card.isDefault) || res.cards[0];
        if (preferred) setSelectedCardIndex(preferred.index);
      }
      setLoadingCards(false);
    });
    return () => {
      active = false;
    };
  }, [customerId]);

  const selectedCard = savedCards.find((card) => card.index === selectedCardIndex) || null;

  const selectCard = (index) => {
    setFieldError(null);
    setSavedCvv('');
    setSelectedCardIndex(index);
  };

  // Estado del Modal de Éxito
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Notificación amigable + campo resaltado cuando falta o falla un dato
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [fieldError, setFieldError] = useState(null);
  const hideToast = () => setToast((t) => ({ ...t, visible: false }));

  // Detecta la marca de la tarjeta en vivo mientras el usuario escribe
  const cardBrand = useMemo(() => detectCardBrand(cardNumber), [cardNumber]);

  // Envuelve cada setter para limpiar el error de ese campo apenas el
  // usuario empieza a corregirlo, y aplica un formateador opcional
  // (solo dígitos, agrupado en tarjeta, "/" automático en la fecha).
  const onChangeField = (field, setter, formatter) => (text) => {
    if (fieldError === field) setFieldError(null);
    setter(formatter ? formatter(text) : text);
  };

  // Handlers ya conectados a su campo, listos para pasarle al onChangeText
  // del input (el componente no necesita conocer los setters internos).
  const handleCardNameChange = onChangeField('cardName', setCardName);
  const handleCardNumberChange = onChangeField('cardNumber', setCardNumber, formatCardNumber);
  const handleExpiryChange = onChangeField('expiry', setExpiry, formatExpiry);
  const handleCvvChange = onChangeField('cvv', setCvv, sanitizeDigits);
  const handleSavedCvvChange = onChangeField('savedCvv', setSavedCvv, sanitizeDigits);

  // Con una tarjeta guardada solo falta el CVV (no se guarda nunca).
  const validateSavedCard = () => {
    if (cartItems.length === 0) {
      return { field: null, message: 'Tu carrito está vacío. Agrega productos antes de pagar.' };
    }
    const length = cvvLengthOf(selectedCard.brand);
    if (!new RegExp(`^\\d{${length}}$`).test(savedCvv)) {
      return {
        field: 'savedCvv',
        message: `Escribe el CVV de tu ${BRAND_LABELS[selectedCard.brand] || 'tarjeta'} (${length} dígitos).`,
      };
    }
    return null;
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

  const showError = (message, field = null) => {
    setFieldError(field);
    setToast({ visible: true, message });
  };

  const handlePay = async () => {
    if (paying) return;
    if (deliveryMode === 'delivery' && !selectedAddress) {
      showError('Elige a dónde llevamos tu pedido, o cámbialo a "Recoger en el local".');
      return;
    }
    // Si el saldo cubre todo, no hace falta tarjeta.
    const validation = coveredByCredit ? null : selectedCard ? validateSavedCard() : validatePaymentForm();
    if (validation) {
      showError(validation.message, validation.field);
      return;
    }

    setPaying(true);
    // Con tarjeta guardada se manda cuál es y el CVV; el número lo tiene el
    // backend. Una tarjeta nueva se guarda (sin CVV) solo si el pago se aprueba.
    const card = selectedCard
      ? { savedCardIndex: selectedCard.index, cvv: savedCvv }
      : {
          cardHolder: cardName.trim(),
          cardNumber: cardNumber.replace(/\s/g, ''),
          expiryMonth: expiry.split('/')[0],
          expiryYear: expiry.split('/')[1],
          cvv,
        };

    const res = await createCheckout({
      items: rawItems,
      isDelivery: deliveryMode === 'delivery',
      deliveryAddress: deliveryMode === 'delivery' ? selectedAddress.details : undefined,
      card: coveredByCredit ? undefined : card,
      saveCard: !coveredByCredit && !selectedCard && saveCard,
      useCredit: useCredit && walletBalance > 0,
    });

    if (!res.success) {
      setPaying(false);
      if (coveredByCredit && res.chargeAmount > 0) {
        setServerCharge(res.chargeAmount);
        refreshPanchita();
      }
      showError(res.error);
      return;
    }

    // Pagado todo con saldo: no hay verificación del banco.
    if (!res.checkout.paymentUrl) {
      setPaying(false);
      refreshPanchita();
      if (res.checkout.status === 'approved') {
        setShowSuccessModal(true);
        onPaid?.(res.checkout.orderId);
      } else {
        showError(res.checkout.message || 'No se pudo registrar tu pedido.');
      }
      return;
    }

    settlingRef.current = false;
    setVerification({
      id: res.checkout.id,
      paymentUrl: res.checkout.paymentUrl,
      returnUrlPrefix: res.checkout.returnUrlPrefix,
    });
  };

  // Termina el pago después del 3DS (o cuando el cliente lo cierra): consulta
  // el resultado real al backend. Se protege para no correr dos veces.
  const settleVerification = async (cancelled) => {
    if (!verification || settlingRef.current) return;
    settlingRef.current = true;
    const { id } = verification;
    setVerification(null);

    const res = cancelled ? await cancelCheckout(id) : await waitForCheckout(id);
    setPaying(false);

    const status = res?.success ? res.checkout.status : null;
    // El saldo apartado vuelve si no se pagó: se actualiza lo que se muestra.
    refreshPanchita();
    if (status === 'approved') {
      setShowSuccessModal(true);
      onPaid?.(res.checkout.orderId);
      return;
    }
    if (status === 'pending') {
      showError('Tu banco aún no confirma el pago. Revisa "Pedidos" en unos minutos antes de volver a pagar.');
      return;
    }
    if (cancelled && status === 'rejected') {
      showError('Cancelaste el pago. No se hizo ningún cargo.');
      return;
    }
    showError(res?.checkout?.message || res?.error || 'El pago no se aprobó. Intenta con otra tarjeta.');
  };

  const handleVerificationFinished = () => settleVerification(false);
  const handleVerificationCancel = () => settleVerification(true);

  // El pedido ya está pagado: cerrar el modal también vacía el carrito, para
  // que no se pueda volver a pagar lo mismo por accidente.
  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    onGoHome?.();
  };

  const handleGoHomePress = () => {
    setShowSuccessModal(false);
    onGoHome?.();
  };

  return {
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
    selectedCardIndex,
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
  };
};

export default usePayment;
