import { useCallback, useEffect, useState } from 'react';
import { getTodayPromotions } from '../services/api';

// Promociones del día para el carrusel del menú.
//
// Las arma el admin en el panel web (máximo 3 días de vigencia) y el backend
// devuelve solo las que corren ahora. Si falla o no hay sesión (menú de
// invitado) la lista queda vacía y el carrusel no se muestra.
const usePromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPromotions = useCallback(async () => {
    const res = await getTodayPromotions();
    setPromotions(res.success && Array.isArray(res.data) ? res.data.map(normalizePromotion) : []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  return { promotions, isLoading, refetch: fetchPromotions };
};

// ── Helpers ───────────────────────────────────────────────────────

const normalizePromotion = (raw) => {
  const price = Number(raw.price) || 0;
  const originalPrice = Number(raw.originalPrice) || 0;
  const items = raw.items || [];
  // Lo que incluye, con los cambios de ingredientes que trae la promo.
  const products = items
    .filter((item) => item.refId?.name)
    .map((item) => ({
      key: `${item.itemType}-${item.refId._id || item.refId.id}`,
      name: item.refId.name,
      quantity: Number(item.quantity) || 1,
      removed: (item.removedIngredients || []).filter(Boolean),
      added: (item.addedIngredients || []).map((extra) => extra?.name).filter(Boolean),
    }));
  // "4 Taco al pastor · 1 Burrito".
  const includes = products.map((p) => `${p.quantity} ${p.name}`).join(' · ');

  return {
    id: String(raw._id || raw.id),
    name: raw.name || 'Promoción',
    description: raw.description || '',
    products,
    includes,
    summary: raw.description || includes,
    price,
    // Sin foto propia se usa la del primer producto incluido.
    imageUrl: raw.image || items.find((item) => item.refId?.image)?.refId.image || null,
    priceLabel: `$${price.toFixed(2)}`,
    // Solo se tacha el precio normal cuando de verdad hay ahorro.
    originalPriceLabel: originalPrice > price ? `$${originalPrice.toFixed(2)}` : null,
    discountPercent: Number(raw.discountPercent) || 0,
    endsAt: raw.endsAt ? new Date(raw.endsAt) : null,
  };
};

export default usePromotions;
