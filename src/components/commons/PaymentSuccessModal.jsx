import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView 
} from 'react-native';

export const PaymentSuccessModal = ({ 
  visible = false, 
  estimatedTime = "25–35 min", 
  // 0: aún sin datos del backend (barra en gris), 1: Recibido, 2: En preparación, 3: En camino
  currentStep = 0,
  items = [], 
  total = 0, 
  onClose, 
  onGoHome 
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          
          {/* Botón Cerrar (X) */}
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>

          {/* Encabezado */}
          <Text style={styles.title}>¡Pago Exitoso!</Text>
          <Text style={styles.subtitle}>
            Tu pedido ha sido recibido correctamente
          </Text>

          {/* Tiempo Estimado (Estilo PedidosYa) */}
          <View style={styles.timeCard}>
            <View style={styles.timeIconContainer}>
              <Text style={styles.clockIcon}>🕒</Text>
            </View>
            <View>
              <Text style={styles.timeLabel}>TIEMPO ESTIMADO DE LLEGADA</Text>
              <Text style={styles.timeValue}>{estimatedTime}</Text>
            </View>
          </View>

          {/* Barra de Progreso de 3 Fases */}
          <View style={styles.trackerContainer}>
            {/* Línea conectora de fondo */}
            <View style={styles.trackerLineBackground} />
            
            {/* Línea conectora activa según la fase */}
            <View 
              style={[
                styles.trackerLineActive, 
                { width: currentStep <= 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }
              ]} 
            />

            {/* Fase 1: Recibido */}
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, currentStep >= 1 && styles.stepDotActive]}>
                {currentStep >= 1 && <Text style={styles.stepCheck}>✓</Text>}
              </View>
              <Text style={[styles.stepLabel, currentStep >= 1 && styles.stepLabelActive]}>
                Recibido
              </Text>
            </View>

            {/* Fase 2: Preparando */}
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, currentStep >= 2 && styles.stepDotActive]}>
                {currentStep >= 2 ? (
                  <Text style={styles.stepCheck}>✓</Text>
                ) : (
                  <View style={styles.stepDotInner} />
                )}
              </View>
              <Text style={[styles.stepLabel, currentStep >= 2 && styles.stepLabelActive]}>
                En preparación
              </Text>
            </View>

            {/* Fase 3: En camino */}
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, currentStep >= 3 && styles.stepDotActive]}>
                {currentStep >= 3 ? (
                  <Text style={styles.stepCheck}>✓</Text>
                ) : (
                  <View style={styles.stepDotInner} />
                )}
              </View>
              <Text style={[styles.stepLabel, currentStep >= 3 && styles.stepLabelActive]}>
                En camino
              </Text>
            </View>
          </View>

          {/* Resumen de Compra Dinámico */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumen de Compra</Text>

            <ScrollView style={{ maxHeight: 110 }} showsVerticalScrollIndicator={false}>
              {items.map((item, index) => (
                <View key={item.id || index} style={styles.itemRow}>
                  <Text style={styles.itemQuantityName} numberOfLines={1}>
                    {item.quantity}x {item.name || item.title}
                  </Text>
                  <Text style={styles.itemPrice}>
                    ${((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>${(Number(total) || 0).toFixed(2)}</Text>
            </View>
          </View>

          {/* Botón Volver al Inicio */}
          <TouchableOpacity 
            style={styles.homeButton} 
            onPress={onGoHome}
            activeOpacity={0.8}
          >
            <Text style={styles.homeButtonText}>Volver al Inicio</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
  },
  closeButton: {
    alignSelf: 'flex-start',
    padding: 4,
    marginBottom: 4,
  },
  closeIcon: {
    fontSize: 20,
    color: '#B91C1C',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#B91C1C',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  timeCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    gap: 12,
  },
  timeIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  timeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#15803D',
  },
  /* Barra de Estado (3 Fases) */
  trackerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
    paddingHorizontal: 10,
    marginBottom: 24,
  },
  trackerLineBackground: {
    position: 'absolute',
    top: 12,
    left: 25,
    right: 25,
    height: 3,
    backgroundColor: '#E5E7EB',
    zIndex: 1,
  },
  trackerLineActive: {
    position: 'absolute',
    top: 12,
    left: 25,
    height: 3,
    backgroundColor: '#16A34A',
    zIndex: 2,
  },
  stepItem: {
    alignItems: 'center',
    zIndex: 3,
    width: 70,
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepDotActive: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  stepDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  stepCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#111827',
    fontWeight: '700',
  },
  /* Resumen */
  summaryCard: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemQuantityName: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#B91C1C',
  },
  homeButton: {
    width: '100%',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  homeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
});