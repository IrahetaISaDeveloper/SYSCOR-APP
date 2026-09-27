import React from "react";
import { Text } from "react-native";
import { fonts } from "../../styles/fonts";

const GLYPHS = {
  account_circle: 0xf20b,
  add: 0xe145,
  bookmark: 0xe8e7,
  check: 0xe668,
  check_circle: 0xf0be,
  chevron_right: 0xe5cc,
  cleaning_services: 0xf0ff,
  close: 0xe5cd,
  cloud_off: 0xe2c1,
  credit_card: 0xe8a1,
  delivery_dining: 0xeb28,
  done_all: 0xe877,
  edit: 0xf097,
  edit_note: 0xe745,
  error: 0xf8b6,
  grid_view: 0xe9b0,
  group: 0xea21,
  history: 0xe8b3,
  local_fire_department: 0xef55,
  notifications: 0xe7f5,
  payments: 0xef63,
  person: 0xf0d3,
  receipt_long: 0xef6e,
  refresh: 0xe5d5,
  remove: 0xe15b,
  restaurant: 0xe56c,
  schedule: 0xefd6,
  send: 0xe163,
  shopping_bag: 0xf1cc,
  table_restaurant: 0xeac6,
  task_alt: 0xe2e6,
  timer: 0xe425,
  warning: 0xf083,
};

export default function SymbolIcon({ name, size = 24, color = "#1B1613", style }) {
  const code = GLYPHS[name];
  if (!code) return null;

  return (
    <Text
      allowFontScaling={false}
      style={[
        {
          fontFamily: fonts.symbols,
          fontSize: size,
          lineHeight: size,
          width: size,
          height: size,
          color,
          textAlign: "center",
          includeFontPadding: false,
        },
        style,
      ]}
    >
      {String.fromCodePoint(code)}
    </Text>
  );
}
