import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import SymbolIcon from "../../components/commons/SymbolIcon";
import DeliveryTopBar from "../../components/delivery/DeliveryTopBar";
import DeliveryFooter from "../../components/delivery/DeliveryFooter";
import { COLLECT_DETAIL, HANDOFF_METHODS, collectsOnDelivery, formatMoney } from "../../constants/deliveryStatus";
import useDelivery from "../../hooks/useDelivery";
import commonStyles from "../../styles/deliveryCommonStyles";
import styles from "../../styles/deliveryConfirmStyles";

export default function DeliveryConfirmScreen({ navigation, route }) {
  const { getDeliveryById, confirm } = useDelivery();
  const delivery = getDeliveryById(route.params?.deliveryId);

  const [selectedMethod, setSelectedMethod] = useState("hand");
  const [proof, setProof] = useState(null);
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

  const collects = collectsOnDelivery(delivery);

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Sin permiso", "Permite el acceso a la cámara para tomar la foto de la entrega.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.6 });
    if (!result.canceled && result.assets?.[0]) setProof(result.assets[0]);
  };

  const handlePhoto = () => {
    if (submitting) return;
    if (!proof) {
      takePhoto();
      return;
    }
    Alert.alert("Foto de la entrega", "¿Qué deseas hacer con la foto?", [
      { text: "Tomar otra", onPress: takePhoto },
      { text: "Quitar", style: "destructive", onPress: () => setProof(null) },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const submit = async () => {
    try {
      setSubmitting(true);
      await confirm(delivery.id, {
        deliveryMethod: selectedMethod,
        driverNote: driverNote.trim() || undefined,
        proof,
      });
      Alert.alert("Entrega confirmada", `La entrega ${delivery.code} quedó marcada como entregada.`, [
        { text: "Aceptar", onPress: () => navigation.popToTop() },
      ]);
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = () => {
    if (!collects) {
      submit();
      return;
    }
    const how = delivery.paymentMethod === "card_on_delivery" ? "con el POS" : "en efectivo";
    Alert.alert("Confirmar cobro", `¿Cobraste ${formatMoney(delivery.amountToCollect)} ${how}?`, [
      { text: "Aún no", style: "cancel" },
      { text: "Sí, cobré", onPress: submit },
    ]);
  };

  return (
    <SafeAreaView style={commonStyles.screen} edges={["top", "left", "right"]}>
      <DeliveryTopBar
        title="Confirmar entrega"
        subtitle={`${delivery.code} · ${(delivery.customer?.name || "Cliente").toUpperCase()}`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.collectCard}>
          <View style={styles.collectRow}>
            <Text style={styles.collectTitle}>{collects ? "Cobrar al cliente" : "Pedido pagado"}</Text>
            <Text style={[styles.collectAmount, !collects && styles.collectAmountPaid]}>
              {formatMoney(collects ? delivery.amountToCollect : delivery.total)}
            </Text>
          </View>
          <View style={styles.collectDivider} />
          <View style={styles.collectDetails}>
            <SymbolIcon name="payments" size={16} color={employeePalette.muted} />
            <Text style={styles.collectDetailText}>
              {collects ? COLLECT_DETAIL[delivery.paymentMethod] : "Pagado en línea · no cobrar"}
            </Text>
          </View>
        </View>

        <View style={{ gap: 9 }}>
          <Text style={styles.sectionLabel}>CÓMO SE ENTREGÓ</Text>
          <View style={styles.methodGrid}>
            {HANDOFF_METHODS.map((m) => {
              const active = selectedMethod === m.key;
              return (
                <TouchableOpacity
                  key={m.key}
                  style={[styles.methodOption, active && styles.methodOptionSelected]}
                  onPress={() => setSelectedMethod(m.key)}
                  activeOpacity={0.8}
                >
                  <SymbolIcon name={m.icon} size={17} color={active ? employeePalette.accent : employeePalette.muted} />
                  <Text style={[styles.methodLabel, active && styles.methodLabelSelected]}>{m.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.proofSection}>
          <Text style={styles.sectionLabel}>PRUEBA DE ENTREGA</Text>
          <TouchableOpacity
            style={[styles.proofSlot, proof && styles.proofSlotFilled]}
            onPress={handlePhoto}
            activeOpacity={0.85}
          >
            {proof ? (
              <Image source={{ uri: proof.uri }} style={styles.proofImage} />
            ) : (
              <>
                <SymbolIcon name="photo_camera" size={22} color={employeePalette.muted} />
                <Text style={styles.proofPlaceholderText}>Foto de la entrega (opcional)</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraButton} onPress={handlePhoto} activeOpacity={0.8}>
            <SymbolIcon name="photo_camera" size={17} color={employeePalette.accent} />
            <Text style={styles.cameraLabel}>{proof ? "Cambiar foto" : "Tomar foto"}</Text>
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
            maxLength={300}
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
