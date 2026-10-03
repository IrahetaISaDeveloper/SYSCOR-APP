const PICKUP = {
  name: "El Corral · Centro",
  address: "Av. Cuscatlán #218",
  detail: "Av. Cuscatlán #218 · mostrador de reparto",
};

export const MOCK_STATS = {
  delivered: 6,
  toCollect: 18.4,
  distanceKm: 14,
};

export const MOCK_ACTIVE_DELIVERY = {
  id: "d072",
  code: "#D-072",
  status: "on_route",
  customer: { name: "Ana Martínez", phone: "+503 7845 1290" },
  items: [
    { id: "i1", quantity: 1, name: "Orden de 5 al pastor" },
    { id: "i2", quantity: 1, name: "Quesabirria" },
    { id: "i3", quantity: 1, name: "Torta de milanesa" },
  ],
  note: null,
  total: 16.75,
  paymentMethod: "cash",
  cashGiven: 20,
  pickup: PICKUP,
  dropoff: {
    address: "Col. Escalón, Calle 3 #45",
    shortDetail: "Apto 2B · portón negro",
    detail: "Apto 2B · portón negro, timbre de la derecha",
  },
  distanceKm: 3.2,
  etaMinutes: 12,
  arrivalClock: "18:41",
  navigation: {
    icon: "turn_right",
    instruction: "Gira a la derecha",
    street: "sobre Paseo General Escalón",
    distance: "450 m",
  },
};

export const MOCK_AVAILABLE_DELIVERIES = [
  {
    id: "d073",
    code: "#D-073",
    status: "available",
    customer: { name: "Rodrigo Castillo", phone: "+503 7712 4408" },
    items: [
      { id: "i1", quantity: 2, name: "Orden de 5 al pastor" },
      { id: "i2", quantity: 1, name: "Quesabirria" },
    ],
    note: "Bolsa sellada · no abrir. Consomé va aparte en vaso térmico.",
    total: 9.5,
    paymentMethod: "card",
    pickup: PICKUP,
    dropoff: {
      address: "Torre Futura, nivel 9",
      shortDetail: "Recepción pide identificación",
      detail: "Recepción pide identificación",
    },
    distanceKm: 2.1,
    etaMinutes: 9,
  },
  {
    id: "d074",
    code: "#D-074",
    status: "available",
    customer: { name: "Mariela Rivas", phone: "+503 7021 5563" },
    items: [
      { id: "i1", quantity: 3, name: "Combo familiar de birria" },
      { id: "i2", quantity: 2, name: "Agua de jamaica" },
    ],
    note: null,
    total: 22.8,
    paymentMethod: "cash",
    pickup: PICKUP,
    dropoff: {
      address: "Col. San Benito, Pje. 2",
      shortDetail: "Casa esquinera, portón blanco",
      detail: "Casa esquinera, portón blanco",
    },
    distanceKm: 4.6,
    etaMinutes: 17,
  },
];

export const MOCK_HISTORY = [
  { id: "h071", code: "#D-071", deliveredAt: "18:02", address: "Col. Flor Blanca, Calle 41", paymentMethod: "cash", total: 12.25, method: "hand" },
  { id: "h070", code: "#D-070", deliveredAt: "17:31", address: "Torre Pedregal, nivel 4", paymentMethod: "card", total: 8.5, method: "reception" },
  { id: "h069", code: "#D-069", deliveredAt: "16:48", address: "Res. Los Héroes, Pje. 7", paymentMethod: "online", total: 15, method: "hand" },
  { id: "h068", code: "#D-068", deliveredAt: "16:05", address: "Col. Miramonte, Av. Toluca", paymentMethod: "cash", total: 6.15, method: "hand" },
  { id: "h067", code: "#D-067", deliveredAt: "15:22", address: "Plaza Merliot, local 12", paymentMethod: "card", total: 19.9, method: "reception" },
  { id: "h066", code: "#D-066", deliveredAt: "14:40", address: "Col. Escalón, 79 Av. Norte", paymentMethod: "cash", total: 10.75, method: "hand" },
];

export const findMockDelivery = (id) =>
  [MOCK_ACTIVE_DELIVERY, ...MOCK_AVAILABLE_DELIVERIES].find((d) => d.id === id) || MOCK_ACTIVE_DELIVERY;
