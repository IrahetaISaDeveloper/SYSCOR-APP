import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { getOrderBandColor } from '../styles/Orders';
import CartContext from '../context/CartContext';
import Sheet from './Sheet';
import PillStepper from './PillStepper';

// Detalle de una promoción del carrusel: qué incluye, cuánto cuesta y el
// botón para meterla a la bolsa. En la bolsa va como una sola línea; al pagar
// el backend la convierte en sus productos con el precio de la promo.
const PromotionSheet = ({ promotion, timeLeft, onClose, colors: c, ms, bottomInset }) => {
  const cart = useContext(CartContext);
  const bandColor = getOrderBandColor(useColorScheme() === 'dark');
  const [quantity, setQuantity] = useState(1);

  // Cada promo que se abre arranca en 1.
  useEffect(() => {
    if (promotion) setQuantity(1);
  }, [promotion]);

  if (!promotion) return <Sheet visible={false} onClose={onClose} colors={c} ms={ms} bottomInset={bottomInset} />;

  const add = () => {
    cart?.addItem({
      productType: 'promotion',
      productId: promotion.id,
      name: promotion.name,
      imageUrl: promotion.imageUrl,
      promoSummary: promotion.includes,
      quantity,
      unitPrice: promotion.price,
      totalPrice: promotion.price * quantity,
      selectedDrinkId: null,
      selectedSauces: [],
      selectedSelectiveItems: [],
      removedIngredients: [],
      selectedExtras: [],
    });
    onClose();
  };

  return (
    <Sheet visible onClose={onClose} colors={c} ms={ms} bottomInset={bottomInset}>
      <ScrollView style={{ maxHeight: ms(520) }} showsVerticalScrollIndicator={false}>
        <View style={{ gap: ms(14) }}>
          {promotion.imageUrl ? (
            <Image
              source={{ uri: promotion.imageUrl }}
              style={{ width: '100%', height: ms(170), borderRadius: ms(16) }}
              resizeMode="cover"
            />
          ) : null}

          <View style={{ gap: ms(6) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: ms(8) }}>
              {promotion.discountPercent > 0 ? (
                <View
                  style={{
                    backgroundColor: c.primary,
                    borderRadius: ms(8),
                    paddingHorizontal: ms(8),
                    paddingVertical: ms(3),
                  }}
                >
                  <Text style={[textStyles.link, { color: '#FFFFFF', fontSize: ms(11.5) }]}>
                    -{promotion.discountPercent}%
                  </Text>
                </View>
              ) : null}
              {timeLeft ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: ms(4) }}>
                  <Icon name="time-outline" size={ms(13)} color={c.textGray} />
                  <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12) }]}>{timeLeft}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(21) }]}>{promotion.name}</Text>
            {promotion.description ? (
              <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13.5), lineHeight: ms(19) }]}>
                {promotion.description}
              </Text>
            ) : null}
          </View>

          {/* Qué incluye */}
          <View
            style={{
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.surface,
              borderRadius: ms(14),
              padding: ms(14),
              gap: ms(10),
            }}
          >
            <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10) }]}>INCLUYE</Text>
            {promotion.products.map((product) => (
              <View key={product.key} style={{ flexDirection: 'row', gap: ms(10) }}>
                <Text style={[textStyles.num, { color: c.primary, fontSize: ms(13.5) }]}>{product.quantity}×</Text>
                <View style={{ flex: 1, gap: ms(2) }}>
                  <Text style={[textStyles.bodyMedium, { color: c.textDark, fontSize: ms(13.5) }]}>{product.name}</Text>
                  {product.removed.length > 0 ? (
                    <Text style={[textStyles.body, { color: c.textLight, fontSize: ms(12) }]}>
                      Sin {product.removed.map((name) => name.toLowerCase()).join(', ')}
                    </Text>
                  ) : null}
                  {product.added.length > 0 ? (
                    <Text style={[textStyles.body, { color: c.textLight, fontSize: ms(12) }]}>
                      Con {product.added.join(', ')}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: ms(8) }}>
              <Text style={[textStyles.num, { color: c.primary, fontSize: ms(22) }]}>{promotion.priceLabel}</Text>
              {promotion.originalPriceLabel ? (
                <Text
                  style={[
                    textStyles.num,
                    { color: c.textLight, fontSize: ms(14), textDecorationLine: 'line-through' },
                  ]}
                >
                  {promotion.originalPriceLabel}
                </Text>
              ) : null}
            </View>
            <PillStepper
              value={quantity}
              onIncrement={() => setQuantity((q) => Math.min(q + 1, 50))}
              onDecrement={() => setQuantity((q) => Math.max(q - 1, 1))}
              colors={c}
              bandColor={bandColor}
              ms={ms}
            />
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={add}
        disabled={!cart}
        activeOpacity={0.9}
        style={{
          marginTop: ms(16),
          height: ms(52),
          borderRadius: ms(26),
          backgroundColor: c.primary,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: ms(8),
          opacity: cart ? 1 : 0.5,
        }}
        accessibilityRole="button"
        accessibilityLabel={`Agregar ${quantity} ${promotion.name} a la bolsa`}
      >
        <Icon name="bag-add-outline" size={ms(19)} color="#FFFFFF" />
        <Text style={[textStyles.title, { color: '#FFFFFF', fontSize: ms(15.5) }]}>
          Agregar a la bolsa · ${(promotion.price * quantity).toFixed(2)}
        </Text>
      </TouchableOpacity>
    </Sheet>
  );
};

export default PromotionSheet;
