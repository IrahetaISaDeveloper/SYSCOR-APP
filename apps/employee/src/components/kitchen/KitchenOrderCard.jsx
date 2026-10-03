import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import SymbolIcon from "../commons/SymbolIcon";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import { KITCHEN_STATUS, ITEM_TYPE_DOT, ACTIVE_KITCHEN_STATUSES } from "../../constants/kitchenStatus";
import styles from "../../styles/kitchenOrderCardStyles";

function NotesBox({ label, text, standalone = false }) {
  return (
    <View style={[styles.notes, standalone && styles.notesStandalone]}>
      <SymbolIcon name="edit" size={14} color={employeePalette.warnInk} />
      <View style={styles.notesTexts}>
        <Text style={styles.notesLabel}>{label}</Text>
        <Text style={styles.notesText}>{text}</Text>
      </View>
    </View>
  );
}

function ActionButton({ variant, icon, label, onPress, disabled, loading }) {
  const variantStyle =
    variant === "accent" ? styles.buttonAccent : variant === "ink" ? styles.buttonInk : styles.buttonOutline;
  const labelStyle =
    variant === "outline" ? styles.buttonLabelMuted : variant === "ink" ? styles.buttonLabelInk : null;
  const iconColor = variant === "ink" ? employeePalette.bg : "#FFFFFF";

  return (
    <TouchableOpacity
      style={[styles.button, variantStyle, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === "outline" ? employeePalette.muted : iconColor} />
      ) : (
        <>
          {icon ? <SymbolIcon name={icon} size={16} color={iconColor} /> : null}
          <Text style={[styles.buttonLabel, labelStyle]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export default function KitchenOrderCard({ order, updating, onAdvance, onResume }) {
  const meta = KITCHEN_STATUS[order.status] || KITCHEN_STATUS.pending;
  const isLate = order.status === "late";
  const isActive = ACTIVE_KITCHEN_STATUSES.includes(order.status);

  const renderActions = () => {
    if (order.status === "pending") {
      return (
        <ActionButton
          variant="ink"
          icon="local_fire_department"
          label="Empezar a preparar"
          onPress={() => onAdvance(order)}
          disabled={updating}
          loading={updating}
        />
      );
    }
    if (isLate) {
      return (
        <>
          <ActionButton variant="outline" label="Continuar" onPress={() => onResume(order)} disabled={updating} />
          <ActionButton
            variant="accent"
            icon="check"
            label="Lista"
            onPress={() => onAdvance(order)}
            disabled={updating}
            loading={updating}
          />
        </>
      );
    }
    return (
      <ActionButton
        variant="accent"
        icon="check"
        label="Marcar como lista"
        onPress={() => onAdvance(order)}
        disabled={updating}
        loading={updating}
      />
    );
  };

  return (
    <View style={[styles.card, isLate && styles.cardLate, order.status === "cancelled" && styles.cardCancelled]}>
      <View style={styles.top}>
        <View style={styles.topLeft}>
          <View style={styles.idRow}>
            <Text style={styles.displayId}>{order.displayId}</Text>
            <View style={[styles.badge, { backgroundColor: meta.badge }]}>
              <Text style={styles.badgeText}>{meta.label}</Text>
            </View>
          </View>
          <View style={styles.contextRow}>
            <SymbolIcon name={order.context.icon} size={13} color={employeePalette.muted} />
            <Text style={styles.contextText} numberOfLines={1}>{order.context.text}</Text>
          </View>
        </View>

        <View style={styles.topRight}>
          <View style={styles.clockRow}>
            <SymbolIcon name="schedule" size={15} color={isLate ? employeePalette.price : employeePalette.ink} />
            <Text style={[styles.clock, isLate && styles.clockLate]}>{order.clock}</Text>
          </View>
          <Text style={styles.ago}>{order.agoLabel}</Text>
        </View>
      </View>

      <View style={styles.assigneeRow}>
        <SymbolIcon name="account_circle" size={15} color={employeePalette.muted} />
        <Text style={styles.assigneeLabel}>{order.assignee.label}</Text>
        <Text style={styles.assigneeName} numberOfLines={1}>{order.assignee.name}</Text>
      </View>

      <View style={styles.sectionHeader}>
        <SymbolIcon name="restaurant" size={14} color={employeePalette.muted} />
        <Text style={styles.sectionLabel}>QUÉ COCINAR</Text>
      </View>

      <View style={styles.items}>
        {order.items.map((item) => (
          <View key={item.id} style={styles.itemBox}>
            <View style={styles.itemRow}>
              <View style={[styles.itemDot, { backgroundColor: ITEM_TYPE_DOT[item.itemType] || employeePalette.accent }]} />
              <Text style={styles.itemName}>{item.label}</Text>
              {item.notes ? <SymbolIcon name="error" size={16} color={employeePalette.warnInk} /> : null}
            </View>
            {item.notes ? <NotesBox label="ESPECIFICACIONES" text={item.notes} /> : null}
          </View>
        ))}
        {order.notes ? <NotesBox label="ESPECIFICACIONES DE LA COMANDA" text={order.notes} standalone /> : null}
      </View>

      {order.status === "waiting" ? (
        <View style={styles.actions}>
          <View style={styles.waitingBox}>
            <SymbolIcon name="schedule" size={16} color="#5B6B8C" />
            <Text style={styles.waitingText}>
              Segundo tiempo: espera a que el mesero lo marche. Aparecerá como pendiente.
            </Text>
          </View>
        </View>
      ) : isActive ? (
        <View style={styles.actions}>{renderActions()}</View>
      ) : (
        <View style={styles.bottomSpacer} />
      )}
    </View>
  );
}
