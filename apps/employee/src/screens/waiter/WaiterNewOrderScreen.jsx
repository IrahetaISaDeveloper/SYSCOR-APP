import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { usePreventRemove } from "@react-navigation/native";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import useNewOrder, { MENU_CATEGORIES } from "../../hooks/useNewOrder";
import SymbolIcon from "../../components/commons/SymbolIcon";
import QuantityStepper from "../../components/waiter/QuantityStepper";
import { formatMoney, pluralize } from "../../constants/waiterStatus";
import styles from "../../styles/waiterNewOrderScreenStyles";

export default function WaiterNewOrderScreen({ navigation, route }) {
  const table = route.params?.table || {};
  const insets = useSafeAreaInsets();
  const [sent, setSent] = useState(false);

  const {
    menuLoading,
    menuError,
    reloadMenu,
    activeCategory,
    setActiveCategory,
    products,
    changeQuantity,
    notes,
    setNotes,
    summary,
    submitting,
    submit,
  } = useNewOrder(table);

  const hasChanges = summary.count > 0 || notes.trim().length > 0;

  usePreventRemove(hasChanges && !sent, ({ data }) => {
    Alert.alert("Descartar comanda", "Los productos seleccionados no se enviarán a cocina.", [
      { text: "Seguir editando", style: "cancel" },
      { text: "Descartar", style: "destructive", onPress: () => navigation.dispatch(data.action) },
    ]);
  });

  const handleSend = async () => {
    const ok = await submit();
    if (ok) setSent(true);
  };

  useEffect(() => {
    if (sent) navigation.goBack();
  }, [sent, navigation]);

  const subtitleParts = [`MESA ${table.number ?? ""}`.trim()];
  if (table.peopleCount) subtitleParts.push(pluralize(table.peopleCount, "PERSONA"));

  const renderProducts = () => {
    if (menuLoading) {
      return (
        <View style={styles.stateBox}>
          <ActivityIndicator color={employeePalette.accent} />
          <Text style={styles.stateText}>Cargando menú...</Text>
        </View>
      );
    }
    if (menuError) {
      return (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>{menuError}</Text>
          <TouchableOpacity onPress={reloadMenu} hitSlop={8}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (products.length === 0) {
      return (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>No hay productos disponibles en esta categoría.</Text>
        </View>
      );
    }
    return products.map((product) => {
      const selected = product.quantity > 0;
      return (
        <View key={product._id} style={[styles.productCard, selected && styles.productCardSelected]}>
          <View style={styles.productTexts}>
            <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
            <Text style={[styles.productPrice, selected && styles.productPriceSelected]}>
              {formatMoney(product.price)}
            </Text>
          </View>
          <QuantityStepper
            value={product.quantity}
            onDecrease={() => changeQuantity(product, -1)}
            onIncrease={() => changeQuantity(product, 1)}
          />
        </View>
      );
    });
  };

  const canSend = summary.count > 0 && !submitting;

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
            accessibilityLabel="Cerrar"
          >
            <SymbolIcon name="close" size={19} color={employeePalette.ink} />
          </TouchableOpacity>
          <View style={styles.headerTexts}>
            <Text style={styles.headerTitle}>Nueva comanda</Text>
            <Text style={styles.headerSubtitle}>{subtitleParts.join(" · ")}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.topSection}>
          <View style={styles.clientRow}>
            <SymbolIcon name="person" size={18} color={employeePalette.muted} />
            <Text style={[styles.clientName, !table.customerName && styles.clientNameEmpty]} numberOfLines={1}>
              {table.customerName || "Cliente sin nombre"}
            </Text>
            <Text style={styles.clientTag}>CLIENTE</Text>
          </View>

          <View style={styles.tabs}>
            {MENU_CATEGORIES.map((category) => {
              const active = activeCategory === category.key;
              return (
                <TouchableOpacity
                  key={category.key}
                  style={[styles.tab, active && styles.tabActive]}
                  onPress={() => setActiveCategory(category.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{category.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {renderProducts()}

          <View style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <SymbolIcon name="edit_note" size={15} color={employeePalette.muted} />
              <Text style={styles.notesLabel}>ESPECIFICACIONES PARA COCINA</Text>
            </View>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Ej. sin cebolla en un pastor · salsa aparte"
              placeholderTextColor={employeePalette.muted}
              multiline
              maxLength={300}
            />
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(22, insets.bottom + 10) }]}>
          <View style={styles.summaryBar}>
            <Text style={styles.summaryCount}>
              {summary.count} {summary.count === 1 ? "PRODUCTO SELECCIONADO" : "PRODUCTOS SELECCIONADOS"}
            </Text>
            <Text style={styles.summaryTotal}>{formatMoney(summary.total)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <SymbolIcon name="send" size={17} color="#FFFFFF" />
                <Text style={styles.sendButtonLabel}>Enviar a cocina</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
