import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { textStyles } from '@syscor/shared/src/styles/typography';
import Sheet from './Sheet';
import { rateMyOrder, RATING_TAGS } from '../services/api';

const STAR_LABELS = ['', 'Muy mal', 'Mal', 'Regular', 'Bien', '¡Excelente!'];

// Calificar un pedido entregado: estrellas, qué salió bien o mal y un
// comentario opcional. Con 4-5 estrellas se ofrecen las etiquetas buenas; con
// menos, las de lo que falló.
const RateOrderSheet = ({ order, onClose, onRated, colors: c, ms, bottomInset }) => {
  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState([]);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // Cada pedido que se abre arranca vacío.
  useEffect(() => {
    setStars(0);
    setTags([]);
    setComment('');
    setError(null);
  }, [order?.id]);

  const tagOptions = stars >= 4 ? RATING_TAGS.good : stars > 0 ? RATING_TAGS.bad : [];

  const pickStars = (value) => {
    // Al cruzar de "bien" a "mal" las etiquetas ya no aplican.
    if ((value >= 4) !== (stars >= 4)) setTags([]);
    setStars(value);
  };

  const toggleTag = (tag) =>
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  const submit = async () => {
    if (!stars || sending) return;
    setSending(true);
    setError(null);
    const res = await rateMyOrder(order.id, { stars, tags, comment: comment.trim() });
    setSending(false);
    if (!res.success) {
      setError(res.error);
      return;
    }
    onRated?.(order.id, res.rating);
    onClose();
  };

  return (
    <Sheet visible={!!order} onClose={onClose} colors={c} ms={ms} bottomInset={bottomInset}>
      {order ? (
        <View style={{ gap: ms(16) }}>
          <View style={{ gap: ms(4) }}>
            <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(19) }]}>¿Qué tal tu pedido?</Text>
            <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13) }]}>
              Pedido {order.code}. Tu opinión llega directo a la cocina.
            </Text>
          </View>

          {/* Estrellas */}
          <View style={{ alignItems: 'center', gap: ms(6) }}>
            <View style={{ flexDirection: 'row', gap: ms(10) }}>
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity
                  key={value}
                  onPress={() => pickStars(value)}
                  hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                  accessibilityRole="button"
                  accessibilityLabel={`${value} ${value === 1 ? 'estrella' : 'estrellas'}`}
                  accessibilityState={{ selected: value <= stars }}
                >
                  <Icon name={value <= stars ? 'star' : 'star-outline'} size={ms(38)} color={value <= stars ? '#F2A33A' : c.textLight} />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[textStyles.link, { color: stars ? c.textDark : c.textLight, fontSize: ms(13.5) }]}>
              {stars ? STAR_LABELS[stars] : 'Toca las estrellas'}
            </Text>
          </View>

          {/* Qué salió bien o mal */}
          {tagOptions.length > 0 ? (
            <View style={{ gap: ms(8) }}>
              <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10) }]}>
                {stars >= 4 ? '¿QUÉ TE GUSTÓ?' : '¿QUÉ FALLÓ?'}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: ms(8) }}>
                {tagOptions.map((tag) => {
                  const active = tags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      onPress={() => toggleTag(tag)}
                      activeOpacity={0.8}
                      style={{
                        paddingHorizontal: ms(12),
                        paddingVertical: ms(7),
                        borderRadius: ms(16),
                        borderWidth: 1,
                        borderColor: active ? c.primary : c.border,
                        backgroundColor: active ? c.primaryTint : 'transparent',
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                    >
                      <Text style={[active ? textStyles.link : textStyles.body, { color: active ? c.primary : c.textGray, fontSize: ms(12.5) }]}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}

          {stars > 0 ? (
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Cuéntanos más (opcional)"
              placeholderTextColor={c.textLight}
              maxLength={500}
              multiline
              style={[
                textStyles.body,
                {
                  minHeight: ms(70),
                  textAlignVertical: 'top',
                  borderWidth: 1,
                  borderColor: c.border,
                  borderRadius: ms(12),
                  padding: ms(12),
                  color: c.textDark,
                  fontSize: ms(13.5),
                },
              ]}
            />
          ) : null}

          {error ? <Text style={[textStyles.body, { color: c.error, fontSize: ms(12.5) }]}>{error}</Text> : null}

          <TouchableOpacity
            onPress={submit}
            disabled={!stars || sending}
            activeOpacity={0.9}
            style={{
              height: ms(50),
              borderRadius: ms(25),
              backgroundColor: c.primary,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: stars ? 1 : 0.5,
            }}
            accessibilityRole="button"
          >
            {sending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={[textStyles.title, { color: '#FFFFFF', fontSize: ms(15) }]}>Enviar calificación</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}
    </Sheet>
  );
};

export default RateOrderSheet;
