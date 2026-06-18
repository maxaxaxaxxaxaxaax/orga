import { koennensbeweise } from "../data/koennensbeweise";
import { ladeSchritte } from "./lernschritte";

// Kategoriale Farbpalette (mittlere Ton-Stufen, lesbar in hell und dunkel).
// Zuordnung ueber den Index der Kategorie in FACH_STRUKTUR.kategorien.
// Reicht fuer bis zu 9 Kategorien; danach wiederholen sich die Farben (modulo).
export const KATEGORIE_PALETTE = [
  "#888780", "#E24B4A", "#639922", "#378ADD", "#D4537E",
  "#BA7517", "#1D9E75", "#7F77DD", "#D85A30",
];

export function farbeFuerKategorie(struktur, kategorie) {
  const i = struktur.kategorien.indexOf(kategorie);
  return KATEGORIE_PALETTE[(i < 0 ? 0 : i) % KATEGORIE_PALETTE.length];
}

// Lernstand eines einzelnen Lernwegs: erledigt > aktuell > offen.
// "aktuell" = aktiver KB der laufenden Etappe: koennensbeweise ist das
// Planungsblatt der aktuellen Etappe, daher ist die Mitgliedschaft hier gleich
// "in dieser Etappe aktiv" (gleiche Bedingung wie der aktiv-Chip in Ablage.jsx).
export function lernwegStatus(thema, erledigt) {
  if (erledigt[thema.kbId]) return "erledigt";
  const aktiverKb =
    !thema.landkarte && koennensbeweise.some((k) => k.id === thema.kbId);
  if (aktiverKb) return "aktuell";
  const schritte = thema.schritte || [];
  if (schritte.length) {
    const stand = ladeSchritte(thema.kbId);
    const fertig = schritte.filter((st, i) =>
      stand[i] != null ? stand[i] : !!st.fertig
    ).length;
    if (fertig > 0) return "aktuell";
  }
  return "offen";
}

// Status einer Gruppe (Kategorie/Subkategorie): alle erledigt = erledigt,
// sonst wenn etwas begonnen/aktiv = aktuell, sonst offen.
export function aggregatStatus(themen, erledigt) {
  if (!themen.length) return "offen";
  const stati = themen.map((t) => lernwegStatus(t, erledigt));
  if (stati.every((s) => s === "erledigt")) return "erledigt";
  if (stati.some((s) => s !== "offen")) return "aktuell";
  return "offen";
}

const RADIUS = { 1: 22, 2: 14, 3: 9 };

// Baut Knoten und Kanten fuer ein Fach. `offeneSubs` ist ein Set der
// Subkategorie-ids, deren Lernwege sichtbar sein sollen (progressive
// Offenlegung gegen Dichte). Kategorie- und Subkategorie-Knoten sind immer da.
export function baueNetz(fach, struktur, erledigt, voraussetzungen, offeneSubs) {
  const nodes = [];
  const links = [];
  const subId = (kat, sub) => "sub:" + kat + "||" + sub;
  const katId = (kat) => "kat:" + kat;

  for (const kat of struktur.kategorien) {
    const katThemen = fach.themen.filter((t) => t.kategorie === kat);
    if (!katThemen.length) continue;
    const color = farbeFuerKategorie(struktur, kat);
    nodes.push({
      id: katId(kat), label: kat, ebene: 1, kategorie: kat, color,
      r: RADIUS[1], status: aggregatStatus(katThemen, erledigt),
    });
    for (const sub of struktur.subkategorien[kat] || []) {
      const subThemen = katThemen.filter((t) => t.subkategorie === sub);
      if (!subThemen.length) continue;
      const sid = subId(kat, sub);
      nodes.push({
        id: sid, label: sub, ebene: 2, kategorie: kat, color,
        r: RADIUS[2], status: aggregatStatus(subThemen, erledigt),
      });
      links.push({ from: katId(kat), to: sid, art: "gehoert" });
      if (offeneSubs.has(sid)) {
        for (const t of subThemen) {
          // themaId markiert anklickbare Lernweg-Knoten: Netz.jsx oeffnet damit
          // den Lernweg-Detail. Nur Ebene-3-Knoten tragen dieses Feld.
          nodes.push({
            id: t.id, label: t.label, ebene: 3, kategorie: kat, color,
            r: RADIUS[3], status: lernwegStatus(t, erledigt), themaId: t.id,
          });
          links.push({ from: sid, to: t.id, art: "gehoert" });
        }
      }
    }
  }

  const vorhanden = new Set(nodes.map((n) => n.id));
  for (const [a, b] of voraussetzungen || []) {
    const fa = katId(a), fb = katId(b);
    if (vorhanden.has(fa) && vorhanden.has(fb)) {
      links.push({ from: fa, to: fb, art: "baut" });
    }
  }
  return { nodes, links };
}
