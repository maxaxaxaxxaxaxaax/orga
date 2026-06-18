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
  // Landkarten-Themen (kbId "MAP-...") werden im neu-Flow nie abgehakt, daher
  // greift erledigt[kbId] hier praktisch nur fuer echte KBs. Falls Landkarten-KBs
  // spaeter abhakbar werden, hier wie in Ablage gegen echte KBs absichern.
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

const RADIUS = { 1: 24, 2: 17, 3: 12 };

// Baut Knoten und Kanten fuer EINE Ebene des Netzes (Drill-down gegen Ueberladung).
// pfad = { kategorie, sub }:
//   kategorie == null            -> Ebene 1: alle Kategorien + baut-auf-Pfeile.
//   kategorie gesetzt, sub null  -> Ebene 2: Kategorie (Anker) + ihre Subkategorien.
//   sub gesetzt                  -> Ebene 3: Subkategorie (Anker) + ihre Lernwege.
// Knoten tragen eine aktion: "drillKat"/"drillSub" gehen eine Ebene tiefer,
// "hoch" (Anker) eine Ebene zurueck, "lernweg" oeffnet den Detail (themaId).
export function baueNetz(fach, struktur, erledigt, voraussetzungen, pfad) {
  const nodes = [];
  const links = [];
  const subId = (kat, s) => "sub:" + kat + "||" + s;
  const katId = (kat) => "kat:" + kat;
  const themenVon = (kat, s) =>
    fach.themen.filter((t) => t.kategorie === kat && (!s || t.subkategorie === s));

  const kategorie = pfad?.kategorie || null;
  const sub = pfad?.sub || null;

  if (!kategorie) {
    // Ebene 1: Kategorien mit ihren baut-auf-Pfeilen.
    for (const kat of struktur.kategorien) {
      const katThemen = themenVon(kat);
      if (!katThemen.length) continue;
      nodes.push({
        id: katId(kat), label: kat, ebene: 1, kategorie: kat,
        color: farbeFuerKategorie(struktur, kat), r: RADIUS[1],
        status: aggregatStatus(katThemen, erledigt), aktion: "drillKat",
      });
    }
    const vorhanden = new Set(nodes.map((n) => n.id));
    for (const [a, b] of voraussetzungen || []) {
      if (vorhanden.has(katId(a)) && vorhanden.has(katId(b)))
        links.push({ from: katId(a), to: katId(b), art: "baut" });
    }
    return { nodes, links };
  }

  const color = farbeFuerKategorie(struktur, kategorie);

  if (!sub) {
    // Ebene 2: Anker-Kategorie in der Mitte, ihre Subkategorien aussen herum.
    nodes.push({
      id: katId(kategorie), label: kategorie, ebene: 1, kategorie, color,
      r: RADIUS[1], status: aggregatStatus(themenVon(kategorie), erledigt),
      aktion: "hoch",
    });
    for (const s of struktur.subkategorien[kategorie] || []) {
      const subThemen = themenVon(kategorie, s);
      if (!subThemen.length) continue;
      nodes.push({
        id: subId(kategorie, s), label: s, ebene: 2, kategorie, color,
        r: RADIUS[2], status: aggregatStatus(subThemen, erledigt),
        aktion: "drillSub", sub: s,
      });
      links.push({ from: katId(kategorie), to: subId(kategorie, s), art: "gehoert" });
    }
    return { nodes, links };
  }

  // Ebene 3: Anker-Subkategorie in der Mitte, ihre Lernwege aussen herum.
  nodes.push({
    id: subId(kategorie, sub), label: sub, ebene: 2, kategorie, color,
    r: RADIUS[2], status: aggregatStatus(themenVon(kategorie, sub), erledigt),
    aktion: "hoch",
  });
  for (const t of themenVon(kategorie, sub)) {
    nodes.push({
      id: t.id, label: t.label, ebene: 3, kategorie, color, r: RADIUS[3],
      status: lernwegStatus(t, erledigt), aktion: "lernweg", themaId: t.id,
    });
    links.push({ from: subId(kategorie, sub), to: t.id, art: "gehoert" });
  }
  return { nodes, links };
}
