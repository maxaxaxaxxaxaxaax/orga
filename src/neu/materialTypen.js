// Typ-Zuordnung für Materialien: Filter-Chips und das passende Icon je Material.
// Geteilt von Ablage und Fokus. Die Icons kommen aus materialIcons.jsx (eine
// Quelle, gleiche visuelle Sprache).
import { interaktivFuerMaterial } from "./interaktiv";
import {
  IcLernweg,
  IcAufgabe,
  IcTafel,
  IcNotiz,
  IcBuch,
  IcKi,
  IcVideo,
  IcLink,
} from "./materialIcons";

// Material-Art -> Filter-Chip.
export const ART_CHIP = {
  tafelnotiz: "tafel",
  aufschrieb: "tafel",
  arbeitsblatt: "aufgaben",
  notiz: "notizen",
  lernzettel: "notizen",
  zusammenfassung: "notizen",
  pdf: "buch",
  bild: "buch",
  video: "video",
  link: "link",
};
export const CHIP_ICON = {
  lernwege: IcLernweg,
  tafel: IcTafel,
  aufgaben: IcAufgabe,
  notizen: IcNotiz,
  ki: IcKi,
  buch: IcBuch,
  video: IcVideo,
  link: IcLink,
};
// Kein "Alle"-Chip: ist kein Filter aktiv, wird alles gezeigt; ein Klick auf den
// aktiven Chip schaltet zurück auf alles (siehe Fokus/Ablage-Handler).
export const CHIPS = [
  { key: "tafel", label: "Tafelaufschriebe", Icon: IcTafel },
  { key: "aufgaben", label: "Aufgaben", Icon: IcAufgabe },
  { key: "lernwege", label: "Lernwege", Icon: IcLernweg },
  { key: "notizen", label: "Notizen", Icon: IcNotiz },
  { key: "ki", label: "KI", Icon: IcKi },
  { key: "buch", label: "Buchseiten", Icon: IcBuch },
  { key: "video", label: "Videos", Icon: IcVideo },
  { key: "link", label: "Links", Icon: IcLink },
];

// Welcher Filter-Chip gehört zu einem Material? Interaktive Übungen zählen als
// Aufgaben, Lernzettel aus dem KI-Chat als KI, sonst über die Art.
export function chipFuerMaterial(m) {
  const e = interaktivFuerMaterial(m.id);
  if (e) return "aufgaben";
  if (m.art === "lernzettel") return "ki";
  return ART_CHIP[m.art] || "notizen";
}

// Passendes Typ-Icon zu einem Material (für die Zeilen in Ablage und Fokus).
export function iconFuerMaterial(m) {
  return CHIP_ICON[chipFuerMaterial(m)] || IcNotiz;
}
