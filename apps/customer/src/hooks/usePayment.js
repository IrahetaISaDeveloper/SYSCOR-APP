import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@syscor/shared/src/context/AuthContext';
import { getCards, cvvLengthOf, BRAND_LABELS } from '../services/cardsApi';
import { getAddresses, addAddress } from '../services/addressesApi';
import { createCheckout, cancelCheckout, waitForCheckout } from '../services/checkoutApi';
import { usePanchita } from '../context/PanchitaContext';
import { getAvailability } from '../services/reservationsApi';
import { getReservationDays, slotDate } from '../utils/reservationSlots';
import {
  detectCardBrand,
  sanitizeDigits,
  formatCardNumber,
  formatExpiry,
  cardNumberProblem,
  expiryProblem,
  sanitizeCardHolder,
} from '../utils/cardUtils';

// Toda la lógica de la pantalla de Pago: entrega o recogida, tarjetas
// guardadas, formulario de tarjeta nueva, validaciones (Luhn, CVV,
// vencimiento), el cobro real con Wompi 3DS y el modal de éxito.
//
// `rawItems` son los productos tal como están en el carrito (con extras,
// salsas, etc.); `cartItems` es la versión resumida que se muestra.
// `addMode`: { orderId, code } cuando se pagan productos agregados a un pedido.
export const usePayment = ({ cartItems = [], rawItems = [], subtotal = 0, total = 0, onPaid, onDineInPaid, onAddPaid, onAddWindowClosed, onPayingAdd, addMode = null, onGoHome } = {}) => {
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

  // Cómo paga: 'online' (tarjeta ahora, con Wompi), 'cash' (efectivo al
  // recibir) o 'card_on_delivery' (tarjeta al recibir, en el POS). Lo que se
  // agrega a un pedido ya hecho siempre se paga en línea.
  const [payMethod, setPayMethod] = useState('online');
  const payOnDelivery = !addMode && payMethod !== 'online';

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

  // Cómo lo recibe: 'dine_in' (comer en el local), 'delivery' (a domicilio,
  // a una dirección de su libreta) o 'pickup' (pasar a traer).
  const [deliveryMode, setDeliveryMode] = useState('delivery');

  // Comer en el local: día, hora, personas y un nombre para la mesa.
  const reservationDays = useMemo(() => getReservationDays(), []);
  const [dineDayKey, setDineDayKey] = useState(reservationDays[0]?.key || null);
  const [dineSlot, setDineSlot] = useState(null);
  const [partySize, setPartySize] = useState(2);
  const [tableAlias, setTableAlias] = useState('');
  // { loading, available, message, maxCapacity } de la hora elegida.
  const [availability, setAvailability] = useState(null);
  const dineDay = reservationDays.find((d) => d.key === dineDayKey) || null;
  const reservedFor = dineDay && dineSlot !== null ? slotDate(dineDay.start, dineSlot).toISOString() : null;

  // Al cambiar de día, la hora elegida puede no existir en el nuevo.
  useEffect(() => {
    if (dineDay && dineSlot !== null && !dineDay.slots.includes(dineSlot)) setDineSlot(null);
  }, [dineDay, dineSlot]);

  // Se revisa si hay mesa cada vez que cambia la hora o las personas.
  useEffect(() => {
    if (deliveryMode !== 'dine_in' || !reservedFor) {
      setAvailability(null);
      return;
    }
    let active = true;
    setAvailability((prev) => ({ ...prev, loading: true }));
    const timer = setTimeout(() => {
      getAvailability({ reservedFor, partySize }).then((res) => {
        if (!active) return;
        setAvailability(
          res.success
            ? { loading: false, ...res.data }
            : { loading: false, available: false, message: res.error },
        );
      });
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [deliveryMode, reservedFor, partySize]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);

  // Identificador del intento de pago (ver checkoutApi.createCheckout). Se
  // conserva si la respuesta no llegó, para que el reintento no cree otro
  // cobro; se renueva cuando el servidor contesta un error o el pago termina.
  const requestIdRef = useRef(null);
  const newRequestId = () =>
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;

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

  // Agregar una dirección sin salir del pago: se guarda en la libreta del
  // cliente y queda elegida para este pedido. Devuelve true si se guardó.
  const [savingAddress, setSavingAddress] = useState(false);
  const addNewAddress = async (form) => {
    if (!customerId || savingAddress) return false;
    setSavingAddress(true);
    const tag = form.tag.trim();
    const details = form.details.trim();
    const res = await addAddress(customerId, { tag, details, isDefault: form.isDefault });
    setSavingAddress(false);
    if (!res.success) {
      // Alert y no el toast: el toast quedaría detrás de la hoja del formulario.
      Alert.alert('No se pudo guardar', res.error);
      return false;
    }
    setAddresses(res.addresses);
    // La libreta vuelve completa: la nueva es la que no estaba antes.
    const known = new Set(addresses.map((a) => a.index));
    const added =
      res.addresses.find((a) => !known.has(a.index)) ||
      res.addresses.find((a) => a.tag === tag && a.details === details);
    if (added) setSelectedAddressIndex(added.index);
    setDeliveryMode('delivery');
    return true;
  };

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
  const handleCardNameChange = onChangeField('cardName', setCardName, sanitizeCardHolder);
  const handleCardNumberChange = onChangeField('cardNumber', setCardNumber, formatCardNumber);
  const handleExpiryChange = onChangeField('expiry', setExpiry, formatExpiry);
  const handleCvvChange = onChangeField('cvv', setCvv, sanitizeDigits);
  const handleSavedCvvChange = onChangeField('savedCvv', setSavedCvv, sanitizeDigits);

  // Datos leídos por el escáner de tarjetas: llenan el formulario de tarjeta
  // nueva (el CVV siempre se escribe a mano).
  const applyCardScan = (data) => {
    setFieldError(null);
    if (data.cardNumber) setCardNumber(formatCardNumber(data.cardNumber));
    if (data.expiry) setExpiry(data.expiry);
    if (data.cardHolder) setCardName(sanitizeCardHolder(data.cardHolder));
  };

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

    if (cartItems.length === 0) {
      return { field: null, message: 'Tu carrito está vacío. Agrega productos antes de pagar.' };
    }
    if (trimmedName.length < 3) {
      return { field: 'cardName', message: 'Ingresa el nombre completo tal como aparece en la tarjeta.' };
    }
    const numberError = cardNumberProblem(digitsOnly);
    if (numberError) return { field: 'cardNumber', message: numberError };
    const expiryError = expiryProblem(expiry);
    if (expiryError) return { field: 'expiry', message: expiryError };
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
    if (!addMode && deliveryMode === 'delivery' && !selectedAddress) {
      showError('Elige a dónde llevamos tu pedido, o cámbialo a "Pasar a traer".');
      return;
    }
    if (!addMode && deliveryMode === 'dine_in') {
      if (!reservedFor) {
        showError('Elige el día y la hora en que vienes a comer.');
        return;
      }
      if (!availability || availability.loading) {
        showError('Estamos revisando las mesas. Un momento.');
        return;
      }
      if (!availability.available) {
        showError(availability.message || 'No quedan mesas para esa hora. Prueba con otra.');
        return;
      }
    }
    // Si el saldo cubre todo o se paga al recibir, no hace falta tarjeta.
    const needsCard = !coveredByCredit && !payOnDelivery;
    const validation = !needsCard
      ? cartItems.length === 0
        ? { field: null, message: 'Tu carrito está vacío. Agrega productos antes de pagar.' }
        : null
      : selectedCard
        ? validateSavedCard()
        : validatePaymentForm();
    if (validation) {
      showError(validation.message, validation.field);
      return;
    }

    setPaying(true);
    onPayingAdd?.(true);
    if (!requestIdRef.current) requestIdRef.current = newRequestId();
    const requestId = requestIdRef.current;
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

    const res = await createCheckout(addMode ? {
      items: rawItems,
      addToOrder: addMode.orderId,
      requestId,
      card: coveredByCredit ? undefined : card,
      saveCard: !coveredByCredit && !selectedCard && saveCard,
      useCredit: useCredit && walletBalance > 0,
    } : {
      items: rawItems,
      requestId,
      fulfillment: deliveryMode,
      deliveryAddress: deliveryMode === 'delivery' ? selectedAddress.details : undefined,
      dineIn:
        deliveryMode === 'dine_in'
          ? { reservedFor, partySize, alias: tableAlias.trim() || undefined }
          : undefined,
      paymentMethod: payOnDelivery ? payMethod : 'online',
      card: needsCard ? card : undefined,
      saveCard: needsCard && !selectedCard && saveCard,
      useCredit: useCredit && walletBalance > 0,
    });

    if (!res.success) {
      setPaying(false);
      onPayingAdd?.(false);
      if (res.noResponse) {
        showError('No pudimos confirmar tu pago. Vuelve a tocar "Pagar": no se te cobrará dos veces.');
        return;
      }
      // El servidor contestó: el próximo intento es uno nuevo.
      requestIdRef.current = null;
      if (res.addWindowClosed) {
        onAddWindowClosed?.(res.error);
        return;
      }
      if (coveredByCredit && res.chargeAmount > 0) {
        setServerCharge(res.chargeAmount);
        refreshPanchita();
      }
      showError(res.error);
      return;
    }

    // Pagado todo con saldo (o un reintento de un pago que ya terminó): no
    // hay verificación del banco.
    if (!res.checkout.paymentUrl) {
      // Un reintento puede encontrar el primer cobro todavía en proceso: se
      // espera a que termine en vez de dar error.
      let checkout = res.checkout;
      if (['pending', 'processing'].includes(checkout.status)) {
        const settled = await waitForCheckout(checkout.id);
        if (settled?.success) checkout = settled.checkout;
      }
      if (checkout.status !== 'pending' && checkout.status !== 'processing') requestIdRef.current = null;
      setPaying(false);
      onPayingAdd?.(false);
      refreshPanchita();
      if (checkout.status === 'approved') {
        finishPaid(checkout);
      } else if (['pending', 'processing'].includes(checkout.status)) {
        showError('Tu pago sigue en proceso. Revisa "Pedidos" en un momento antes de volver a pagar.');
      } else {
        showError(checkout.message || 'No se pudo registrar tu pedido.');
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

  // Pago aprobado. Si viene a comer al local, Panchita le busca mesa en un
  // chat; si no, el modal de éxito de siempre.
  const finishPaid = (checkout) => {
    onPaid?.(checkout.orderId);
    // Productos agregados a un pedido: ya se sumaron al mismo pedido.
    if (checkout.addToOrder && onAddPaid) {
      onAddPaid(checkout.orderId);
      return;
    }
    if (checkout.fulfillment === 'dine_in' && onDineInPaid) {
      onDineInPaid(checkout.orderId);
      return;
    }
    setShowSuccessModal(true);
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
    // La verificación terminó: el próximo pago es un intento nuevo.
    requestIdRef.current = null;
    onPayingAdd?.(false);

    const status = res?.success ? res.checkout.status : null;
    // El saldo apartado vuelve si no se pagó: se actualiza lo que se muestra.
    refreshPanchita();
    if (status === 'approved') {
      finishPaid(res.checkout);
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
    payMethod,
    setPayMethod,
    payOnDelivery,
    creditToApply,
    amountToCharge,
    coveredByCredit,
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
    addNewAddress,
    savingAddress,
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
  };
};

export default usePayment;
