import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import { waiterColors } from "../styles/waiterTheme";

// Versiones oscuras de las dos paletas de la app de empleados. Mantienen el
// tono cálido de la versión clara (café oscuro en vez de gris azulado) y
// aclaran los rojos para que se lean sobre fondo oscuro. Las claves son las
// mismas que las de la versión clara, así que los estilos no cambian.

// Paleta de cocina, reparto y hojas del mesero (`employeePalette`).
export const darkEmployeePalette = {
  bg: "#14110F",
  ink: "#F3EEE7",
  surface: "#1F1A17",
  surface2: "#2A2420",
  line: "#3A312B",
  muted: "#ADA397",
  accent: "#E5695B",
  accentSoft: "rgba(229,105,91,0.16)",
  price: "#F07A6A",
  warnInk: "#E5B65C",
  warnSoft: "rgba(229,182,92,0.14)",
  warnSurface: "#3A2F17",
  warnLine: "#5C4A20",
  warnText: "#EBC979",
  okInk: "#7BC96A",
  white: "#FFFFFF",
  libre: "#2ECC71",
  ocupada: "#E5484D",
  reservada: "#B57BD0",
};

// Paleta de las pantallas del mesero (`waiterColors`). `white` sigue siendo
// blanco: se usa para texto e iconos sobre el rojo de la marca.
export const darkWaiterColors = {
  primary: "#E8513C",
  primaryDark: "#D9432F",
  primaryTint: "rgba(232,81,60,0.16)",
  background: "#14110F",
  surface: "#1F1A17",
  surfaceMuted: "#2A2420",
  border: "#332B26",
  borderStrong: "#4A403A",
  textDark: "#F3EEE7",
  textGray: "#B3ABA1",
  textLight: "#7F776E",
  white: "#FFFFFF",
  navBackground: "#1F1A17",
  navBorder: "#2E2722",
  error: "#F0605A",
  success: "#4CC38A",
  warning: "#E2A336",
};

// Superficie invertida (tarjeta de navegación, botón "tinta"): oscura con
// texto claro en el tema claro. En el oscuro no se invierte del todo: queda una
// superficie algo más clara que el fondo, así los blancos translúcidos se ven.
const inverse = {
  light: { inverseBg: employeePalette.ink, inverseText: employeePalette.bg },
  dark: { inverseBg: "#2E2723", inverseText: "#F3EEE7" },
};

const light = { isDark: false, c: waiterColors, p: { ...employeePalette, ...inverse.light } };
const dark = { isDark: true, c: darkWaiterColors, p: { ...darkEmployeePalette, ...inverse.dark } };

export const getPalettes = (isDark) => (isDark ? dark : light);
