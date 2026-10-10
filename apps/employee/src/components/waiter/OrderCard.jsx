import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons as Icon } from "@expo/vector-icons";
import { textStyles } from "@syscor/shared/src/styles/typography";
import { useAuthMetrics } from "@syscor/shared/src/styles/authTheme";
import { formatElapsed, minutesSince, orderCode, orderStageLabel } from "../../constants/waiterStatus";
import { waiterColors as c, FLOORS } from "../../styles/waiterTheme";

// Más de estos productos y la tarjeta se recorta con "Ver más".
const VISIBLE_ITEMS = 3;

// Estado de la comanda: etiqueta, color del punto y fondo de la píldora.
const ORDER_STATE = {
  waiting: { label: "EN ESPERA", dot: "#5B6B8C", bg: "#E3E7EF" },
  pending: { label: "EN COCINA", dot: "#D98F2B", bg: "#FBEBD3" },
  preparing: { label: "EN COCINA", dot: "#D98F2B", bg: "#FBEBD3" },
  atrasado: { label: "ATRASADA", dot: "#C9402F", bg: "#F8DDD8" },
  ready: { label: "LISTA", dot: "#2E9D5B", bg: "#DDEFE1" },
  delivered: { label: "SERVIDA", dot: "#8E8578", bg: "#ECE6DB" },
  cancelled: { label: "CANCELADA", dot: "#C9402F", bg: "#F8DDD8" },
};

// "hoy 14:32" / "12 oct 14:32": cuándo se tomó una comanda del historial.
const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const historyStamp = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const clock = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay ? `hoy ${clock}` : `${d.getDate()} ${MONTHS[d.getMonth()]} ${clock}`;
};

export const stateOf = (order) => (order.waiting && order.status === "pending" ? "waiting" : order.status);

// "David G." a partir de "DAVID EDUARDO GUARDADO CASTRO".
const shortName = (full) => {
  const parts = String(full || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  const first = cap(parts[0]);
  const initial = parts.length > 2 ? parts[2].charAt(0) : parts[1]?.charAt(0);
  return initial ? `${first} ${initial.toUpperCase()}.` : first;
};

const floorLabel = (floor) => FLOORS.find((f) => f.floor === floor)?.label || "Planta baja";

// Línea punteada: en Android un borde punteado de un solo lado no se pinta,
// así que se recorta un recuadro punteado completo a 1 px de alto.
function DashedLine() {
  return (
    <View style={styles.dashClip}>
      <View style={styles.dash} />
    </View>
  );
}

// Tarjeta de una comanda con todo lo que el mesero necesita para atenderla:
// de qué mesa y ronda es, quién la tomó, qué lleva y qué sigue (marchar,
// llevarla o marcarla servida). `showTable` pinta el número de mesa (en la
// hoja de la mesa no hace falta).
// `history` es para el historial: muestra la hora en que se tomó, no "hace X".
export default function OrderCard({ order, myId, actions, showTable = true, history = false }) {
  const { ms } = useAuthMetrics();
  const [expanded, setExpanded] = useState(false);

  const stateKey = stateOf(order);
  const state = ORDER_STATE[stateKey] || ORDER_STATE.pending;
  const busy = actions?.busyId === order._id;
  const elapsed = formatElapsed(minutesSince(order.firedAt || order.createdAt));
  const items = order.items || [];
  const hidden = Math.max(0, items.length - VISIBLE_ITEMS);
  const shown = expanded ? items : items.slice(0, VISIBLE_ITEMS);

  const metaLine = [
    showTable ? floorLabel(order.tableFloor) : null,
    history ? historyStamp(order.createdAt) : elapsed ? `hace ${elapsed}` : null,
    orderStageLabel(order) || null,
  ]
    .filter(Boolean)
    .join(" · ");

  const takenBy = shortName(order.waiter);
  const mineTaken = myId && String(order.waiterId) === String(myId);
  const servingBy = order.servingBy;
  const servingMine = servingBy && String(servingBy.id) === String(myId);

  return (
    <View style={[styles.card, { borderRadius: ms(18), padding: ms(14), gap: ms(12) }]}>
      {/* ── MESA, CÓDIGO Y ESTADO ── */}
      <View style={[styles.row, { gap: ms(12) }]}>
        {showTable ? (
          <View style={[styles.tableBadge, { width: ms(46), height: ms(46), borderRadius: ms(12) }]}>
            <Text style={[textStyles.kicker, { color: "rgba(255,255,255,0.6)", fontSize: ms(7.5) }]}>MESA</Text>
            <Text style={[textStyles.title, { color: c.white, fontSize: ms(18), lineHeight: ms(20) }]}>
              {order.tableNumber}
            </Text>
          </View>
        ) : null}
        <View style={{ flex: 1, gap: ms(2) }}>
          <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(16) }]} numberOfLines={1}>
            {orderCode(order) ? `Comanda ${orderCode(order)}` : "Comanda"}
          </Text>
          {metaLine ? (
            <Text style={[textStyles.num, { color: c.textGray, fontSize: ms(11) }]} numberOfLines={1}>
              {metaLine}
            </Text>
          ) : null}
          {takenBy ? (
            <Text style={[textStyles.body, { color: c.textLight, fontSize: ms(11.5) }]} numberOfLines={1}>
              Tomó: {mineTaken ? "tú" : takenBy}
            </Text>
          ) : null}
        </View>
        <View style={[styles.row, { backgroundColor: state.bg, borderRadius: ms(12), paddingHorizontal: ms(9), paddingVertical: ms(4), gap: ms(5) }]}>
          <View style={{ width: ms(6), height: ms(6), borderRadius: ms(3), backgroundColor: state.dot }} />
          <Text style={[textStyles.kicker, { color: c.textDark, fontSize: ms(9.5) }]}>{state.label}</Text>
        </View>
      </View>

      {/* ── PRODUCTOS ── */}
      {items.length > 0 ? (
        <View style={{ gap: ms(8) }}>
          <DashedLine />
          {shown.map((item, index) => (
            <View key={item._id || index} style={[styles.row, { alignItems: "flex-start", gap: ms(10) }]}>
              <Text style={[textStyles.num, { color: c.textLight, fontSize: ms(13.5), minWidth: ms(22) }]}>
                {item.quantity}×
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={[textStyles.body, { color: c.textDark, fontSize: ms(14) }]}>{item.name}</Text>
                {item.notes ? (
                  <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12) }]}>{item.notes}</Text>
                ) : null}
              </View>
            </View>
          ))}
          {hidden > 0 ? (
            <TouchableOpacity
              onPress={() => setExpanded((v) => !v)}
              hitSlop={8}
              style={[styles.row, { gap: ms(4), alignSelf: "flex-start" }]}
              accessibilityRole="button"
            >
              <Text style={[textStyles.link, { color: c.primary, fontSize: ms(13) }]}>
                {expanded ? "Ver menos" : `Ver ${hidden} más`}
              </Text>
              <Icon name={expanded ? "chevron-up" : "chevron-down"} size={ms(14)} color={c.primary} />
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {order.notes ? (
        <View style={[styles.row, styles.note, { borderRadius: ms(10), padding: ms(10), gap: ms(8) }]}>
          <Icon name="chatbubble-ellipses-outline" size={ms(15)} color={c.textGray} />
          <Text style={[textStyles.body, { flex: 1, color: c.textGray, fontSize: ms(12.5) }]}>{order.notes}</Text>
        </View>
      ) : null}

      {/* ── EN ESPERA: marchar o cancelar ── */}
      {stateKey === "waiting" && actions ? (
        <View style={{ gap: ms(8) }}>
          <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12.5) }]}>
            Cocina lo prepara cuando lo marches (por ejemplo, al terminar las entradas).
          </Text>
          <View style={[styles.row, { gap: ms(8) }]}>
            <ActionButton
              icon="flame"
              label="Marchar a cocina"
              color={c.textDark}
              onPress={() => actions.fire(order)}
              busy={busy}
              ms={ms}
              style={{ flex: 1 }}
            />
            <ActionButton outline label="Cancelar" color={c.textGray} onPress={() => actions.cancel(order)} disabled={busy} ms={ms} />
          </View>
        </View>
      ) : null}

      {/* ── LISTA: quién la lleva y servir ── */}
      {stateKey === "ready" && actions ? (
        <View style={{ gap: ms(8) }}>
          {servingBy ? (
            <View style={[styles.row, styles.claimed, { borderRadius: ms(10), paddingHorizontal: ms(10), paddingVertical: ms(8), gap: ms(8) }]}>
              <Icon name="walk-outline" size={ms(16)} color={c.textDark} />
              <Text style={[textStyles.bodyMedium, { flex: 1, color: c.textDark, fontSize: ms(13) }]}>
                {servingMine ? "La llevas tú" : `La lleva ${shortName(servingBy.name) || "otro mesero"}`}
              </Text>
              {servingMine ? (
                <TouchableOpacity onPress={() => actions.claim(order, false)} disabled={busy} hitSlop={8}>
                  <Text style={[textStyles.link, { color: c.textGray, fontSize: ms(12.5) }]}>Soltar</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
          <View style={[styles.row, { gap: ms(8) }]}>
            {!servingBy ? (
              <ActionButton outline icon="hand-left-outline" label="Yo la llevo" color={c.textDark} onPress={() => actions.claim(order, true)} disabled={busy} ms={ms} />
            ) : null}
            <ActionButton
              icon="checkmark-done"
              label="Marcar como servida"
              color="#1E8E4E"
              onPress={() => actions.serve(order)}
              busy={busy}
              ms={ms}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      ) : null}

      {/* ── SERVIDA: por quién ── */}
      {stateKey === "delivered" && order.servedBy?.name ? (
        <View style={[styles.row, { gap: ms(6) }]}>
          <Icon name="checkmark-circle-outline" size={ms(15)} color={c.textGray} />
          <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12.5) }]}>
            Servida por {String(order.servedBy.id) === String(myId) ? "ti" : shortName(order.servedBy.name)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function ActionButton({ icon, label, color, outline, onPress, busy, disabled, ms, style }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={busy || disabled}
      activeOpacity={0.85}
      style={[
        styles.row,
        styles.button,
        {
          height: ms(46),
          borderRadius: ms(14),
          paddingHorizontal: ms(14),
          gap: ms(7),
          backgroundColor: outline ? c.surface : color,
          borderColor: color,
          borderWidth: outline ? 1.5 : 0,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      accessibilityRole="button"
    >
      {busy ? (
        <ActivityIndicator size="small" color={outline ? color : c.white} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={ms(17)} color={outline ? color : c.white} /> : null}
          <Text style={[textStyles.button, { color: outline ? color : c.white, fontSize: ms(14) }]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  tableBadge: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#211C18",
  },
  dashClip: {
    height: 1,
    overflow: "hidden",
    marginBottom: 4,
  },
  dash: {
    height: 2,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: c.borderStrong,
  },
  note: {
    alignItems: "flex-start",
    backgroundColor: c.surfaceMuted,
  },
  claimed: {
    backgroundColor: "#EEF2EA",
  },
  button: {
    justifyContent: "center",
  },
});
