import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import PanchitaImage from '@syscor/shared/src/components/panchita/PanchitaImage';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { getMenuColors } from '../styles/CustomerMenu';
import FloorPlan from '../components/FloorPlan';
import { getReservationByOrder, getReservationOptions, assignTable } from '../services/reservationsApi';
import { formatReservation, formatClock } from '../utils/reservationSlots';

const FLOOR_CHOICES = {
  1: { label: 'Planta baja', hint: 'Junto al ventanal o en el salón central' },
  2: { label: 'Planta alta', hint: 'En la terraza' },
};

const tableSummary = (t) => `mesa ${t.number} · ${t.zoneLabel} (${t.floorLabel.toLowerCase()}), para ${t.capacity} personas`;

// Chef Panchita busca mesa para un pedido "Comer en el local", justo después
// de pagar (o al volver desde "Pedidos"). Es una conversación guiada, sin
// escribir: si hay lugar en las dos plantas pregunta cuál prefiere, enseña en
// el croquis la mesa que le aparta y pregunta si le parece. Si no, el cliente
// toca la que quiera en el croquis.
export default function TableReservationScreen({ navigation, route }) {
  const isDark = useColorScheme() === 'dark';
  const c = getMenuColors(isDark);
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const nextId = useRef(0);

  const orderId = route?.params?.orderId;
  const [messages, setMessages] = useState([]);
  // loading | choose_floor | confirm | pick | done | none | error
  const [step, setStep] = useState('loading');
  const [busy, setBusy] = useState(false);
  const [reservation, setReservation] = useState(null);
  const [options, setOptions] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [pickFloor, setPickFloor] = useState(1);
  const [picked, setPicked] = useState(null);

  const say = useCallback((text, extra = {}) => {
    // El id se toma aquí y no dentro de setMessages: React corre esa función
    // después, y dos mensajes seguidos leerían el mismo valor (clave repetida).
    nextId.current += 1;
    const id = nextId.current;
    setMessages((prev) => [...prev, { id, role: 'panchita', text, ...extra }]);
  }, []);
  const answer = useCallback((text) => {
    nextId.current += 1;
    const id = nextId.current;
    setMessages((prev) => [...prev, { id, role: 'user', text }]);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
    return () => clearTimeout(t);
  }, [messages.length, step]);

  const tablesOf = (opts, floor) => opts?.floors.find((f) => f.floor === floor)?.tables || [];

  // Enseña la mesa sugerida de esa planta y pregunta si le parece.
  const propose = useCallback(
    (opts, floor) => {
      const floorData = opts.floors.find((f) => f.floor === floor);
      const suggested = floorData?.tables.find((t) => t.id === floorData.suggestedId);
      if (!suggested) {
        say('En esa planta ya no queda una mesa donde quepan. Elige en el croquis la que prefieras.');
        setPickFloor(opts.floorsWithRoom[0] || 1);
        setStep('pick');
        return;
      }
      setProposal(suggested);
      say(`Te aparto la ${tableSummary(suggested)}. ¿Te parece bien?`, { plan: { floor, tableId: suggested.id } });
      setStep('confirm');
    },
    [say],
  );

  const loadOptions = useCallback(async (res) => {
    const opts = await getReservationOptions(res.id);
    if (!opts.success) {
      say(opts.error);
      setStep('error');
      return null;
    }
    setOptions(opts.data);
    return opts.data;
  }, [say]);

  // Arranque: la reserva del pedido y qué mesas hay.
  useEffect(() => {
    let active = true;
    (async () => {
      const res = await getReservationByOrder(orderId);
      if (!active) return;
      if (!res.success) {
        say(res.error || 'No encontré la reserva de este pedido.');
        setStep('error');
        return;
      }
      const r = res.data;
      setReservation(r);
      const when = formatReservation(r.reservedFor);

      if (r.status === 'checked_in') {
        say(`Ya estás en tu mesa ${r.table?.number}. ¡Buen provecho!`);
        setStep('done');
        return;
      }
      if (r.status === 'expired' || r.status === 'cancelled') {
        say(
          r.status === 'expired'
            ? 'Esta reserva ya venció: pasaron más de 30 minutos de la hora. Si ya estás aquí, avísale a un mesero.'
            : 'Esta reserva se canceló junto con tu pedido.',
        );
        setStep('error');
        return;
      }

      const opts = await loadOptions(r);
      if (!active || !opts) return;

      if (r.status === 'reserved' && r.table) {
        say(`Tu mesa para ${when} es la ${tableSummary(r.table)}.`, { plan: { floor: r.table.floor, tableId: r.table.id } });
        say(`Te la guardo hasta las ${formatClock(r.expiresAt)}. Al llegar, escanea el código QR de la mesa.`);
        setStep('done');
        return;
      }

      say(`¡Gracias por tu pedido! Voy a buscarte una mesa para ${r.partySize} ${r.partySize === 1 ? 'persona' : 'personas'}, ${when.toLowerCase()}.`);
      const floors = opts.floorsWithRoom;
      if (floors.length === 0) {
        say('Uy, ahora mismo no encontré una mesa libre para esa hora. Tu pedido sigue en pie: al llegar, un mesero te acomoda en la primera que se desocupe.');
        setStep('none');
      } else if (floors.length === 2) {
        say('¡Hay lugar en las dos plantas! ¿Dónde te gustaría sentarte?');
        setStep('choose_floor');
      } else {
        say(`Encontré lugar en la ${FLOOR_CHOICES[floors[0]].label.toLowerCase()}.`);
        propose(opts, floors[0]);
      }
    })();
    return () => {
      active = false;
    };
  }, [orderId, say, loadOptions, propose]);

  const chooseFloor = (floor) => {
    answer(`${FLOOR_CHOICES[floor].label}, por favor.`);
    propose(options, floor);
  };

  const reserve = async (table) => {
    setBusy(true);
    const res = await assignTable(reservation.id, table.id);
    setBusy(false);
    if (!res.success) {
      say(res.error);
      if (res.status === 409) {
        const opts = await loadOptions(reservation);
        if (opts) {
          setPicked(null);
          setPickFloor(opts.floorsWithRoom[0] || table.floor);
          say('Te enseño las que siguen libres.');
          setStep(opts.floorsWithRoom.length ? 'pick' : 'none');
        }
      }
      return;
    }
    const r = res.data;
    setReservation(r);
    say(
      `¡Listo! La mesa ${r.table.number} es tuya, ${formatReservation(r.reservedFor).toLowerCase()}. ` +
        `Te la guardo hasta las ${formatClock(r.expiresAt)}.`,
    );
    say('Cuando llegues, escanea el código QR que está en la mesa: así sabemos que ya estás y te llevamos tu pedido.');
    setStep('done');
  };

  const acceptProposal = () => {
    answer('Sí, esa está bien.');
    reserve(proposal);
  };

  const chooseOther = () => {
    answer('Prefiero elegir otra.');
    say('Claro. Toca en el croquis la mesa que quieras; las que tienen borde de color están libres para ti.');
    setPicked(null);
    setPickFloor(proposal?.floor || reservation?.table?.floor || options.floorsWithRoom[0] || 1);
    setStep('pick');
  };

  const confirmPicked = () => {
    answer(`Quiero la mesa ${picked.number}.`);
    reserve(picked);
  };

  const goOrders = () => navigation.navigate('CustomerTabs', { screen: 'Orders' });

  const replyButton = (label, onPress, { primary = false, icon } = {}) => (
    <TouchableOpacity
      key={label}
      onPress={onPress}
      disabled={busy}
      activeOpacity={0.85}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 13,
        paddingHorizontal: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: c.primary,
        backgroundColor: primary ? c.primary : c.surface,
        opacity: busy ? 0.6 : 1,
      }}
      accessibilityRole="button"
    >
      {icon ? <Icon name={icon} size={17} color={primary ? '#FFFFFF' : c.primary} /> : null}
      <Text style={[textStyles.bodyMedium, { fontSize: 14, color: primary ? '#FFFFFF' : c.primary }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={{ height: insets.top }} />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10 }}>
        <TouchableOpacity
          onPress={goOrders}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: c.border,
            backgroundColor: c.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityRole="button"
          accessibilityLabel="Ir a mis pedidos"
        >
          <Icon name="chevron-back" size={20} color={c.textDark} />
        </TouchableOpacity>
        <View style={{ width: 42, height: 42, borderRadius: 21, overflow: 'hidden', backgroundColor: c.surfaceMuted }}>
          <PanchitaImage variant="icon" isDark={isDark} style={{ width: 42, height: 42 }} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[textStyles.title, { color: c.textDark, fontSize: 18 }]}>Chef Panchita</Text>
          <Text style={[textStyles.kicker, { color: c.textGray, fontSize: 9.5 }]}>TU MESA EN EL CORRAL</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: Math.max(insets.bottom, 16) + 8 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View key={message.id} style={{ gap: 8 }}>
            <View
              style={{
                alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 18,
                borderBottomRightRadius: message.role === 'user' ? 4 : 18,
                borderBottomLeftRadius: message.role === 'user' ? 18 : 4,
                backgroundColor: message.role === 'user' ? c.primary : c.surface,
                borderWidth: message.role === 'user' ? 0 : 1,
                borderColor: c.border,
              }}
            >
              <Text style={[textStyles.body, { fontSize: 14.5, lineHeight: 20, color: message.role === 'user' ? '#FFFFFF' : c.textDark }]}>
                {message.text}
              </Text>
            </View>
            {message.plan && options ? (
              <View style={{ padding: 12, borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface }}>
                <Text style={[textStyles.kicker, { color: c.textGray, fontSize: 9.5, marginBottom: 6 }]}>
                  {FLOOR_CHOICES[message.plan.floor].label.toUpperCase()}
                </Text>
                <FloorPlan floor={message.plan.floor} tables={tablesOf(options, message.plan.floor)} selectedId={message.plan.tableId} colors={c} />
              </View>
            ) : null}
          </View>
        ))}

        {step === 'loading' || busy ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 4 }}>
            <ActivityIndicator size="small" color={c.primary} />
            <Text style={[textStyles.body, { color: c.textGray, fontSize: 13 }]}>Panchita está buscando…</Text>
          </View>
        ) : null}

        {step === 'choose_floor' ? (
          <View style={{ gap: 8, marginTop: 4 }}>
            {[1, 2].map((floor) => (
              <TouchableOpacity
                key={floor}
                onPress={() => chooseFloor(floor)}
                activeOpacity={0.85}
                style={{ padding: 14, borderRadius: 14, borderWidth: 1, borderColor: c.primary, backgroundColor: c.surface }}
                accessibilityRole="button"
              >
                <Text style={[textStyles.bodyMedium, { fontSize: 14.5, color: c.primary }]}>{FLOOR_CHOICES[floor].label}</Text>
                <Text style={[textStyles.body, { fontSize: 12.5, color: c.textGray }]}>{FLOOR_CHOICES[floor].hint}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {step === 'confirm' && !busy ? (
          <View style={{ gap: 8, marginTop: 4 }}>
            {replyButton('Sí, esa está bien', acceptProposal, { primary: true, icon: 'checkmark' })}
            {replyButton('Prefiero elegir otra', chooseOther, { icon: 'grid-outline' })}
          </View>
        ) : null}

        {step === 'pick' && options ? (
          <View style={{ gap: 10, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[1, 2].map((floor) => {
                const selected = floor === pickFloor;
                return (
                  <TouchableOpacity
                    key={floor}
                    onPress={() => setPickFloor(floor)}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      paddingVertical: 9,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: selected ? c.primary : c.border,
                      backgroundColor: selected ? c.primaryTint : 'transparent',
                    }}
                    accessibilityRole="tab"
                    accessibilityState={{ selected }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: selected ? c.primary : c.textGray }}>
                      {FLOOR_CHOICES[floor].label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <FloorPlan floor={pickFloor} tables={tablesOf(options, pickFloor)} selectedId={picked?.id} onSelect={setPicked} colors={c} />
            <Text style={[textStyles.body, { fontSize: 12.5, color: c.textGray, textAlign: 'center' }]}>
              {picked ? tableSummary(picked) : `Solo puedes elegir mesas donde quepan ${reservation?.partySize} personas.`}
            </Text>
            {!busy ? replyButton(picked ? `Reservar la mesa ${picked.number}` : 'Toca una mesa', picked ? confirmPicked : () => {}, { primary: !!picked }) : null}
          </View>
        ) : null}

        {step === 'done' || step === 'none' || step === 'error' ? (
          <View style={{ gap: 8, marginTop: 4 }}>
            {step === 'done' && reservation?.status === 'reserved'
              ? replyButton('Escanear el QR de mi mesa', () => navigation.navigate('TableCheckIn'), { primary: true, icon: 'qr-code-outline' })
              : null}
            {step === 'done' && reservation?.status === 'reserved' ? replyButton('Cambiar de mesa', chooseOther, { icon: 'swap-horizontal' }) : null}
            {replyButton('Ver mis pedidos', goOrders, { icon: 'receipt-outline' })}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
