import React from 'react';
import { Modal, View, Text, Image, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { useAuthMetrics } from '@syscor/shared/src/styles/authTheme';
import { getMenuColors } from '../styles/CustomerMenu';
import { getOrderBandColor } from '../styles/Orders';
import PillStepper from './PillStepper';

const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;

// "¿No quieres algo más?": al entrar a la bolsa se ofrecen unos antojos
// (bebidas de la casa y un postre). Cada "+" lo mete a la bolsa en el
// momento, sin pasar por el detalle; "−" lo quita.
//
// `offers`: platillos/bebidas ya normalizados por useMenu.
// `quantities`: { [id de la oferta]: cuántos hay ya en la bolsa }.
const UpsellModal = ({ visible, offers = [], quantities = {}, onChange, onClose }) => {
  const isDark = useColorScheme() === 'dark';
  const c = getMenuColors(isDark);
  const bandColor = getOrderBandColor(isDark);
  const { ms } = useAuthMetrics();

  const addedCount = offers.reduce((sum, offer) => sum + (quantities[offer.id] || 0), 0);
  const total = offers.reduce((sum, offer) => sum + offer.price * (quantities[offer.id] || 0), 0);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: ms(20) }}>
        <View style={{ maxHeight: '88%', backgroundColor: c.surface, borderRadius: ms(22), paddingTop: ms(18) }}>
          <TouchableOpacity
            onPress={onClose}
            style={{
              position: 'absolute',
              top: ms(12),
              right: ms(12),
              zIndex: 1,
              width: ms(34),
              height: ms(34),
              borderRadius: ms(17),
              backgroundColor: c.surfaceMuted,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
          >
            <Icon name="close" size={ms(18)} color={c.textDark} />
          </TouchableOpacity>

          <Text
            style={[
              textStyles.title,
              { color: c.textDark, fontSize: ms(21), textAlign: 'center', marginTop: ms(20), paddingHorizontal: ms(44) },
            ]}
            accessibilityRole="header"
          >
            ¿No quieres algo más?
          </Text>

          <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: ms(20), paddingVertical: ms(8) }}>
            {offers.map((offer, index) => (
              <View
                key={offer.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: ms(16),
                  paddingVertical: ms(16),
                  borderTopWidth: index > 0 ? 1 : 0,
                  borderTopColor: c.border,
                }}
              >
                <View
                  style={{
                    width: ms(84),
                    height: ms(84),
                    borderRadius: ms(14),
                    overflow: 'hidden',
                    backgroundColor: c.imagePlaceholder,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {offer.imageUrl ? (
                    <Image source={{ uri: offer.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : (
                    <Icon name={offer.itemType === 'drink' ? 'cafe-outline' : 'ice-cream-outline'} size={ms(30)} color={c.textLight} />
                  )}
                </View>
                <View style={{ flex: 1, gap: ms(4) }}>
                  <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(15.5) }]} numberOfLines={2}>
                    {offer.name}
                  </Text>
                  <Text style={[textStyles.num, { color: c.textGray, fontSize: ms(13) }]}>{money(offer.price)}</Text>
                  <View style={{ marginTop: ms(4) }}>
                    <PillStepper
                      value={quantities[offer.id] || 0}
                      min={0}
                      onIncrement={() => onChange(offer, 1)}
                      onDecrement={() => onChange(offer, -1)}
                      colors={c}
                      bandColor={bandColor}
                      ms={ms}
                      size="sm"
                    />
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Lo agregado ya está en la bolsa: el botón solo cierra. */}
          <View style={{ padding: ms(20), paddingTop: ms(12) }}>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.9}
              style={{
                height: ms(52),
                borderRadius: ms(26),
                borderWidth: 1.5,
                borderColor: c.primary,
                backgroundColor: addedCount ? c.primary : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityRole="button"
            >
              <Text style={[textStyles.button, { color: addedCount ? '#FFFFFF' : c.primary, fontSize: ms(16) }]}>
                {addedCount
                  ? `Listo · ${addedCount} ${addedCount === 1 ? 'agregado' : 'agregados'} (+${money(total)})`
                  : 'No, gracias'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default UpsellModal;
