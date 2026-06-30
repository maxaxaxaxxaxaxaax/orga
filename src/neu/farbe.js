import { fachFarbe } from "../data/stundenplanWoche";

// Fach-Label als farbiger Text auf hellem/neutralem Grund (Pillen, Listen, Bars):
// die jeweilige Fachfarbe, aber zur Tinte abgedunkelt, damit auch helle Faecher
// (Gelb, Hellblau, Hellgruen) als kleiner Text lesbar bleiben. Der Farbton bleibt
// erkennbar. Geteilt von WegLeiste, Stundenplan (Heute) und Fokus.
export function fachTextFarbe(fach) {
  const farbe = fachFarbe[fach];
  if (!farbe) return "var(--text-2)";
  return `color-mix(in srgb, ${farbe} 70%, var(--text))`;
}

// Lesbare Textfarbe auf einer Vollton-Fachfarbe: helle Farbe -> dunkle Schrift,
// dunkle Farbe -> weisse Schrift. Geteilt von Etappenplan und Wochenplan, damit
// die bunten KB-Kacheln ueberall gleich aussehen.
export function textAuf(hex) {
  const h = String(hex).replace("#", "");
  if (h.length < 6) return "#ffffff";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? "#23201a" : "#ffffff";
}
