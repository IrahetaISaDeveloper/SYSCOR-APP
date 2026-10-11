import React from "react";
import { Text } from "react-native";
import { fonts } from "../../styles/fonts";
import { useTheme } from "../../theme/ThemeContext";

const GLYPHS = {
  account_circle: 0xf20b,
  add: 0xe145,
  arrow_back: 0xe5c4,
  bookmark: 0xe8e7,
  call: 0xf0d4,
  chat: 0xe0c9,
  check: 0xe668,
  check_circle: 0xf0be,
  chevron_right: 0xe5cc,
  cleaning_services: 0xf0ff,
  close: 0xe5cd,
  close_small: 0xf508,
  cloud_off: 0xe2c1,
  credit_card: 0xe8a1,
  delivery_dining: 0xeb28,
  done: 0xe876,
  done_all: 0xe877,
  edit: 0xf097,
  edit_note: 0xe745,
  error: 0xf8b6,
  flag: 0xf0c6,
  fork_left: 0xeba0,
  fork_right: 0xebac,
  grid_view: 0xe9b0,
  group: 0xea21,
  history: 0xe8b3,
  home: 0xe9b2,
  home_pin: 0xf14d,
  info: 0xe88e,
  local_fire_department: 0xef55,
  location_on: 0xf1db,
  map: 0xe55b,
  meeting_room: 0xeb4f,
  merge: 0xeb98,
  my_location: 0xe55c,
  navigation: 0xe55d,
  notifications: 0xe7f5,
  payments: 0xef63,
  person: 0xf0d3,
  photo_camera: 0xe412,
  receipt_long: 0xef6e,
  refresh: 0xe5d5,
  remove: 0xe15b,
  report: 0xf052,
  restaurant: 0xe56c,
  roundabout_left: 0xeb99,
  roundabout_right: 0xeba3,
  route: 0xeacd,
  schedule: 0xefd6,
  send: 0xe163,
  shopping_bag: 0xf1cc,
  storefront: 0xea12,
  straight: 0xeb95,
  table_restaurant: 0xeac6,
  task_alt: 0xe2e6,
  timer: 0xe425,
  turn_left: 0xeba6,
  turn_right: 0xebab,
  turn_sharp_left: 0xeba7,
  turn_sharp_right: 0xebaa,
  turn_slight_left: 0xeba4,
  turn_slight_right: 0xeb9a,
  two_wheeler: 0xe9f9,
  u_turn_left: 0xeba1,
  u_turn_right: 0xeba2,
  warning: 0xf083,
  where_to_vote: 0xe177,
};

// Sin `color`, toma el de la tinta del tema activo.
export default function SymbolIcon({ name, size = 24, color, style }) {
  const { p } = useTheme();
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
          color: color || p.ink,
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
