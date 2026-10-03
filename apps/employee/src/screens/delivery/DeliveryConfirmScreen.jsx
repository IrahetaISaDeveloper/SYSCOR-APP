import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import SymbolIcon from "../../components/commons/SymbolIcon";
import DeliveryTopBar from "../../components/delivery/DeliveryTopBar";
import DeliveryFooter from "../../components/delivery/DeliveryFooter";
import { formatMoney } from "../../constants/deliveryStatus";
import useDelivery from "../../hooks/useDelivery";
import commonStyles from "../../styles/deliveryCommonStyles";
import styles from "../../styles/deliveryConfirmStyles";

const DELIVERY_METHODS = [
  { key: "hand", icon: "person", label: "En mano" },
  { key: "reception", icon: "meeting_room", label: "Recepción" },
];

export default function DeliveryConfirmScreen({ navigation, route }) {
  const { getDeliveryById, confirm } = useDelivery();
  const delivery = getDeliveryById(route.params?.deliveryId);

  const [selectedMethod, setSelectedMethod] = useState("hand");
  const [proofUri, setProofUri] = useState(null);
  const [driverNote, setDriverNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!delivery) {
    return (
      <SafeAreaView style={commonStyles.screen} edges={["top", "left", "right"]}>
        <DeliveryTopBar title="Confirmar entrega" onBack={() => navigation.goBack()} />
        <View style={[commonStyles.emptyBox, { marginTop: 40 }]}>
          <Text style={commonStyles.emptyText}>Entrega no encontrada.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleTakePhoto = () => {
    // Si ya hay foto, permite quitarla o reemplazarla
    if (proofUri) {
      Alert.alert("Foto adjunta", "¿Deseas cambiar o eliminar la foto?", [
        { text: "Eliminar", style: "destructive", onPress: () => setProofUri(null) },
        { text: "Cancelar", style: "cancel" },
      ]);
      return;
    }

    Alert.alert(
      "Prueba de entrega",
      "Selecciona una opción para simular o tomar la foto de entrega.",
      [
        {
          text: "Foto de prueba",
          onPress: () =>
            setProofUri(
              "https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=600&q=80"
            ),
        },
        { text: "Cancelar", style: "cancel" },
      ]
    );
  };

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      await confirm(delivery.id, {
        deliveryMethod: selectedMethod,
        driverNote: driverNote.trim() || undefined,
      });

      Alert.alert(
        "Entrega confirmada",
        `La entrega ${delivery.code} fue marcada como entregada con éxito.`,
        [{ text: "Aceptar", onPress: () => navigation.popToTop() }]
      );
    } catch {
      // Error handled in hook
    } finally {
      setSubmitting(false);
    }
  };

  const isCard = delivery.paymentMethod === "card" || delivery.paymentMethod === "online";
  const changeNote = isCard
    ? null
    : delivery.cashGiven
    ? `$${delivery.cashGiven.toFixed(2)}`
    : null;

  return (
    <SafeAreaView style={commonStyles.screen} edges={["top", "left", "right"]}>
      <DeliveryTopBar
        title="Confirmar entrega"
        subtitle={`${delivery.code} · ${(delivery.customer?.name || "CLIENTE").toUpperCase()}`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.collectCard}>
          <View style={styles.collectRow}>
            <Text style={styles.collectTitle}>Cobrar al cliente</Text>
            <Text style={styles.collectAmount}>{formatMoney(delivery.total)}</Text>
          </View>
          <View style={styles.collectDivider} />
          <View style={styles.collectDetails}>
            <SymbolIcon name="payments" size={16} color={employeePalette.muted} />
            <Text style={styles.collectDetailText}>
              {isCard ? "Pago con tarjeta · ya cobrado" : "Pago en efectivo · cobrar al entregar"}
            </Text>
            {changeNote ? <Text style={styles.collectChange}>{changeNote}</Text> : null}
          </View>
        </View>

        <View style={{ gap: 9 }}>
          <Text style={styles.sectionLabel}>CÓMO SE ENTREGÓ</Text>
          <View style={styles.methodGrid}>
            {DELIVERY_METHODS.map((m) => {
              const active = selectedMethod === m.key;
              return (
                <TouchableOpacity
                  key={m.key}
                  style={[styles.methodOption, active && styles.methodOptionSelected]}
                  onPress={() => setSelectedMethod(m.key)}
                  activeOpacity={0.8}
                >
                  <SymbolIcon
                    name={m.icon}
                    size={17}
                    color={active ? employeePalette.accent : employeePalette.muted}
                  />
                  <Text style={[styles.methodLabel, active && styles.methodLabelSelected]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.proofSection}>
          <Text style={styles.sectionLabel}>PRUEBA DE ENTREGA</Text>
          <TouchableOpacity
            style={[styles.proofSlot, proofUri && styles.proofSlotFilled]}
            onPress={handleTakePhoto}
            activeOpacity={0.85}
          >
            {proofUri ? (
              <Image source={{ uri: proofUri }} style={styles.proofImage} />
            ) : (
              <>
                <SymbolIcon name="photo_camera" size={22} color={employeePalette.muted} />
                <Text style={styles.proofPlaceholderText}>Foto de la entrega (opcional)</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraButton} onPress={handleTakePhoto} activeOpacity={0.8}>
            <SymbolIcon name="photo_camera" size={17} color={employeePalette.accent} />
            <Text style={styles.cameraLabel}>{proofUri ? "Cambiar foto" : "Tomar foto"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.noteCard}>
          <View style={styles.noteHeader}>
            <SymbolIcon name="edit_note" size={15} color={employeePalette.muted} />
            <Text style={styles.noteHeaderLabel}>NOTA PARA EL LOCAL</Text>
          </View>
          <TextInput
            style={styles.noteInput}
            placeholder="Opcional · algo que deba saber la sucursal"
            placeholderTextColor={employeePalette.muted}
            value={driverNote}
            onChangeText={setDriverNote}
            multiline
          />
        </View>
      </ScrollView>

      <DeliveryFooter>
        <TouchableOpacity
          style={[commonStyles.primaryButton, submitting && { opacity: 0.7 }]}
          onPress={handleConfirm}
          activeOpacity={0.85}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <SymbolIcon name="check_circle" size={17} color="#FFFFFF" />
              <Text style={commonStyles.primaryButtonLabel}>Marcar como entregada</Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.footerNote}>SE NOTIFICA AL CLIENTE Y A LA SUCURSAL</Text>
      </DeliveryFooter>
    </SafeAreaView>
  );
}
