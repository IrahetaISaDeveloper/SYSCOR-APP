import React from "react";
import { Text } from "react-native";
import { fonts } from "../../styles/fonts";

const GLYPHS = {
  add: 0xe145,
  bookmark: 0xe8e7,
  check: 0xe668,
  check_circle: 0xf0be,
  chevron_right: 0xe5cc,
  cleaning_services: 0xf0ff,
  close: 0xe5cd,
  credit_card: 0xe8a1,
  done_all: 0xe877,
  edit_note: 0xe745,
  group: 0xea21,
  local_fire_department: 0xef55,
  payments: 0xef63,
  person: 0xf0d3,
  receipt_long: 0xef6e,
  remove: 0xe15b,
  restaurant: 0xe56c,
  schedule: 0xefd6,
  send: 0xe163,
  table_restaurant: 0xeac6,
  task_alt: 0xe2e6,
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
