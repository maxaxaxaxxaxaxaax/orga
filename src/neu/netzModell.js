import { koennensbeweise, kbFarbe } from "../data/koennensbeweise";
import { NEUTRAL_FARBE } from "./farbe";
import { faecher } from "../data/wissen";
import { KOMPETENZBEREICHE, bereichFuer } from "../data/kompetenzbereiche";
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

// Kontinuierlicher Lernstand eines Lernwegs (0..1): erledigt = 1, sonst Anteil der
// abgehakten Schritte. Treibt den Abstand zur Mitte im Fokus-Ringe-Layout.
export function lernwegFortschritt(thema, erledigt) {
  if (erledigt[thema.kbId]) return 1;
  const schritte = thema.schritte || [];
  if (schritte.length) {
    const stand = ladeSchritte(thema.kbId);
    const fertig = schritte.filter((st, i) =>
      stand[i] != null ? stand[i] : !!st.fertig
    ).length;
    return fertig / schritte.length;
  }
  return 0;
}
// Fortschritt einer Gruppe = Mittel der Lernweg-Fortschritte darunter.
export function gruppeFortschritt(themen, erledigt) {
  if (!themen.length) return 0;
  return themen.reduce((s, t) => s + lernwegFortschritt(t, erledigt), 0) / themen.length;
}

// Mindestgroesse je Ebene; dazu waechst der Knoten mit der Zahl der in der
// aktuellen Etappe geplanten (aktiven) Lernwege darin, damit der aktuelle
// Lern-Schwerpunkt auf jeder Ebene am groessten ist.
const BASIS_R = { 1: 16, 2: 13, 3: 10 };
function istEtappenAktiv(thema) {
  return !thema.landkarte && koennensbeweise.some((k) => k.id === thema.kbId);
}
function radiusFuer(ebene, themen) {
  const aktiv = themen.filter(istEtappenAktiv).length;
  return BASIS_R[ebene] + Math.min(aktiv, 6) * 3.5;
}

// Fachuebergreifendes Karten-Netz: die 4 Faecher als Wurzel (Ebene 0), darunter
// je Fach die Kategorien (1), Subkategorien (2) und Lernwege (3). Jeder Teilbaum
// in der Fach-Farbe. Detail wird beim Rendern ueber den Zoom ein-/ausgeblendet.
export function baueFaecherNetz(erledigt) {
  const nodes = [];
  const links = [];
  for (const fach of faecher) {
    const themen = fach.themen || [];
    if (!themen.length) continue;
    const color = kbFarbe[fach.fach] || fach.farbe || NEUTRAL_FARBE;
    const fachNode = "fach:" + fach.id;
    const berId = (b) => fach.id + "|ber:" + b;
    const subId = (b, s) => fach.id + "|sub:" + b + "||" + s;
    const lwId = (t) => fach.id + "|lw:" + t.id;
    const lernweg = (t, ebene, parent) => {
      nodes.push({
        id: lwId(t), label: t.label, ebene, fachId: fach.id, parent, color,
        r: radiusFuer(3, [t]), status: lernwegStatus(t, erledigt),
        fortschritt: lernwegFortschritt(t, erledigt),
        aktion: "lernweg", themaId: t.id, kbId: t.kbId,
      });
      links.push({ from: parent, to: lwId(t), art: "gehoert" });
    };

    nodes.push({
      id: fachNode, label: fach.fach, ebene: 0, fachId: fach.id, parent: null,
      color, r: radiusFuer(1, themen) + 5,
      status: aggregatStatus(themen, erledigt),
      fortschritt: gruppeFortschritt(themen, erledigt), aktion: "fach",
    });

    // Lehrplantreue Gliederung: Themen über ihre subkategorie dem ECHTEN
    // Kompetenzbereich / der Leitidee zuordnen (bereichFuer), darunter nach
    // subkategorie, darunter die Lernwege. Es gibt KEINE "baut auf"-Kanten: die
    // Lehrpläne entwickeln die Bereiche spiralig/verzahnt, nicht als Voraussetzungs-
    // kette (belegt, siehe Memory schulhub-lehrplan-treue). Die Beziehung ist reine
    // Zugehörigkeit. Fächer ohne Bereichsmodell (Französisch) hängen flach am Fach.
    const bereiche = [];
    const proBereich = {};
    for (const t of themen) {
      if (!t.subkategorie) continue;
      const b = bereichFuer(fach.id, t);
      if (!b) continue;
      if (!proBereich[b]) {
        proBereich[b] = [];
        bereiche.push(b);
      }
      proBereich[b].push(t);
    }
    // Bereiche in der amtlichen Reihenfolge (KOMPETENZBEREICHE), Unbekanntes hinten.
    const ordnung = KOMPETENZBEREICHE[fach.id] || [];
    bereiche.sort((a, b) => {
      const ia = ordnung.indexOf(a), ib = ordnung.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    for (const b of bereiche) {
      const bThemen = proBereich[b];
      nodes.push({
        id: berId(b), label: b, ebene: 1, fachId: fach.id, parent: fachNode,
        color, r: radiusFuer(1, bThemen),
        status: aggregatStatus(bThemen, erledigt),
        fortschritt: gruppeFortschritt(bThemen, erledigt), aktion: "bereich",
      });
      links.push({ from: fachNode, to: berId(b), art: "gehoert" });
      const subs = [];
      const proSub = {};
      for (const t of bThemen) {
        if (!proSub[t.subkategorie]) {
          proSub[t.subkategorie] = [];
          subs.push(t.subkategorie);
        }
        proSub[t.subkategorie].push(t);
      }
      for (const s of subs) {
        const subThemen = proSub[s];
        nodes.push({
          id: subId(b, s), label: s, ebene: 2, fachId: fach.id, parent: berId(b),
          color, r: radiusFuer(2, subThemen),
          status: aggregatStatus(subThemen, erledigt),
          fortschritt: gruppeFortschritt(subThemen, erledigt), aktion: "sub",
        });
        links.push({ from: berId(b), to: subId(b, s), art: "gehoert" });
        for (const t of subThemen) lernweg(t, 3, subId(b, s));
      }
    }
    // Themen ohne subkategorie direkt unter dem Fach (flache Liste, z.B. Französisch).
    for (const t of themen) if (!t.subkategorie) lernweg(t, 1, fachNode);
  }
  return { nodes, links };
}

// Baut das GANZE Netz auf einmal (alle Ebenen) fuer die Karten-/Zoom-Ansicht:
// Kategorien (Ebene 1), ihre Subkategorien (2) und deren Lernwege (3) als ein
// zusammenhaengender Graph mit parent-Verweisen. Detail wird nicht weggelassen,
// sondern beim Rendern ueber den Zoom ein-/ausgeblendet (Level-of-Detail).
export function baueGesamtNetz(fach, struktur, erledigt, voraussetzungen) {
  const nodes = [];
  const links = [];
  const katId = (kat) => "kat:" + kat;
  const subId = (kat, s) => "sub:" + kat + "||" + s;
  const themenVon = (kat, s) =>
    fach.themen.filter((t) => t.kategorie === kat && (!s || t.subkategorie === s));

  for (const kat of struktur.kategorien) {
    const katThemen = themenVon(kat);
    if (!katThemen.length) continue;
    const color = farbeFuerKategorie(struktur, kat);
    nodes.push({
      id: katId(kat), label: kat, ebene: 1, kategorie: kat, parent: null, color,
      r: radiusFuer(1, katThemen), status: aggregatStatus(katThemen, erledigt),
      aktion: "kat",
    });
    const gesehen = new Set();
    for (const s of struktur.subkategorien[kat] || []) {
      const subThemen = themenVon(kat, s);
      if (!subThemen.length) continue;
      nodes.push({
        id: subId(kat, s), label: s, ebene: 2, kategorie: kat, sub: s,
        parent: katId(kat), color, r: radiusFuer(2, subThemen),
        status: aggregatStatus(subThemen, erledigt), aktion: "sub",
      });
      links.push({ from: katId(kat), to: subId(kat, s), art: "gehoert" });
      for (const t of subThemen) {
        gesehen.add(t.id);
        nodes.push({
          id: t.id, label: t.label, ebene: 3, kategorie: kat, sub: s,
          parent: subId(kat, s), color, r: radiusFuer(3, [t]),
          status: lernwegStatus(t, erledigt), aktion: "lernweg", themaId: t.id,
        });
        links.push({ from: subId(kat, s), to: t.id, art: "gehoert" });
      }
    }
    // Lernwege ohne (gerenderte) Subkategorie haengen direkt an der Kategorie.
    for (const t of katThemen) {
      if (gesehen.has(t.id)) continue;
      nodes.push({
        id: t.id, label: t.label, ebene: 3, kategorie: kat, sub: null,
        parent: katId(kat), color, r: radiusFuer(3, [t]),
        status: lernwegStatus(t, erledigt), aktion: "lernweg", themaId: t.id,
      });
      links.push({ from: katId(kat), to: t.id, art: "gehoert" });
    }
  }
  // baut-Kanten zwischen Kategorien (Ebene 1, "baut auf").
  const katVorhanden = new Set(
    nodes.filter((n) => n.ebene === 1).map((n) => n.id)
  );
  for (const [a, b] of voraussetzungen || []) {
    if (katVorhanden.has(katId(a)) && katVorhanden.has(katId(b)))
      links.push({ from: katId(a), to: katId(b), art: "baut" });
  }
  return { nodes, links };
}

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
        color: farbeFuerKategorie(struktur, kat), r: radiusFuer(1, katThemen),
        status: aggregatStatus(katThemen, erledigt), aktion: "drillKat",
      });
    }
    const vorhanden = new Set(nodes.map((n) => n.id));
    for (const [a, b] of voraussetzungen || []) {
      if (vorhanden.has(katId(a)) && vorhanden.has(katId(b)))
        links.push({ from: katId(a), to: katId(b), art: "baut" });
    }
    // Basis-Kategorie (keine eingehende baut-Kante, die meisten ausgehenden)
    // kommt ins Zentrum; das Layout ordnet die uebrigen radial darum an.
    const eingang = {};
    const ausgang = {};
    nodes.forEach((n) => {
      eingang[n.id] = 0;
      ausgang[n.id] = 0;
    });
    for (const l of links)
      if (l.art === "baut") {
        eingang[l.to]++;
        ausgang[l.from]++;
      }
    let zentrum = null;
    for (const n of nodes)
      if (eingang[n.id] === 0 && (!zentrum || ausgang[n.id] > ausgang[zentrum]))
        zentrum = n.id;
    const zNode = nodes.find((n) => n.id === zentrum);
    if (zNode) zNode.zentrum = true;
    return { nodes, links };
  }

  const color = farbeFuerKategorie(struktur, kategorie);

  if (!sub) {
    // Ebene 2: Anker-Kategorie in der Mitte, ihre Subkategorien aussen herum.
    nodes.push({
      id: katId(kategorie), label: kategorie, ebene: 1, kategorie, color,
      r: radiusFuer(1, themenVon(kategorie)),
      status: aggregatStatus(themenVon(kategorie), erledigt),
      aktion: "hoch", zentrum: true,
    });
    for (const s of struktur.subkategorien[kategorie] || []) {
      const subThemen = themenVon(kategorie, s);
      if (!subThemen.length) continue;
      nodes.push({
        id: subId(kategorie, s), label: s, ebene: 2, kategorie, color,
        r: radiusFuer(2, subThemen), status: aggregatStatus(subThemen, erledigt),
        aktion: "drillSub", sub: s,
      });
      links.push({ from: katId(kategorie), to: subId(kategorie, s), art: "gehoert" });
    }
    return { nodes, links };
  }

  // Ebene 3: Anker-Subkategorie in der Mitte, ihre Lernwege aussen herum.
  nodes.push({
    id: subId(kategorie, sub), label: sub, ebene: 2, kategorie, color,
    r: radiusFuer(2, themenVon(kategorie, sub)),
    status: aggregatStatus(themenVon(kategorie, sub), erledigt),
    aktion: "hoch", zentrum: true,
  });
  for (const t of themenVon(kategorie, sub)) {
    nodes.push({
      id: t.id, label: t.label, ebene: 3, kategorie, color, r: radiusFuer(3, [t]),
      status: lernwegStatus(t, erledigt), aktion: "lernweg", themaId: t.id,
    });
    links.push({ from: subId(kategorie, sub), to: t.id, art: "gehoert" });
  }
  return { nodes, links };
}
