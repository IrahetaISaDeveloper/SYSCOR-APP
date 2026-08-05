import { useMemo, useState } from 'react';
import {
  detectCardBrand,
  isValidLuhn,
  sanitizeDigits,
  formatCardNumber,
  formatExpiry,
} from '../utils/cardUtils';

// Toda la lógica de la pantalla de Pago: formulario de tarjeta, detección
// de marca, validaciones (Luhn, CVV, vencimiento) y el modal de éxito.
export const usePayment = ({ cartItems = [], subtotal = 0, tip = 0, total = 0, onConfirmPayment, onGoHome } = {}) => {
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
      saveCard,
    };

    // Si la API/Wompi responde OK, ejecutamos el callback y mostramos el modal
    if (onConfirmPayment) {
      await onConfirmPayment(wompiPaymentData);
    }

    setShowSuccessModal(true);
  };

  const closeSuccessModal = () => setShowSuccessModal(false);

  const handleGoHomePress = () => {
    setShowSuccessModal(false);
    onGoHome?.();
  };

  return {
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
  };
};

export default usePayment;
