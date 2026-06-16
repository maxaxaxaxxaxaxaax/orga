import { koennensbeweise } from "../data/koennensbeweise";

// Geteilter Planungs-Stand: localStorage-Keys, Platzhalter für "jetzt" und die
// Frage, mit welchem Screen die App sinnvoll startet.

export const WOCHEN_KEY = "neu.etappenplan.zuordnung"; // kbId -> Woche (0-basiert)
export const TAGE_KEY = "neu.wochenplan.tage"; // kbId -> Wochentag (0=Mo..4=Fr)
export const STUNDEN_KEY = "neu.wochenplan.stunden"; // kbId -> Stunden-ID (Tag-Startzeit), optional
export const ERLEDIGT_KEY = "neu.erledigt"; // kbId -> true

// Vorerst fest: Woche 1. Sobald die Datums-Ebene steht, folgt sie dem echten Datum.
export const AKTUELLE_WOCHE = 0;

// Simulierter "heutiger" Wochentag (0=Mo .. 4=Fr) als Demo-/Test-Steuerung: die
// Pfeile bzw. Pfeiltasten auf Heute verschieben den ganzen App-Tag, damit man
// sieht, was an einem anderen Tag passiert. Liegt in localStorage, der
// Hard-Refresh-Reset setzt auf Montag zurück.
const HEUTE_TAG_KEY = "neu.demo.tag";
export function heuteTag() {
  try {
    const r = localStorage.getItem(HEUTE_TAG_KEY);
    const n = r == null ? 0 : parseInt(r, 10);
    return Number.isFinite(n) ? Math.max(0, Math.min(4, n)) : 0;
  } catch {
    return 0;
  }
}
export function setzeHeuteTag(n) {
  const c = Math.max(0, Math.min(4, n));
  try {
    localStorage.setItem(HEUTE_TAG_KEY, String(c));
  } catch {
    /* localStorage blockiert: dann nur diese Sitzung */
  }
  meldeAenderung();
  return c;
}

export function lade(key) {
  try {
    const r = localStorage.getItem(key);
    return r ? JSON.parse(r) : {};
  } catch {
    return {};
  }
}

// Aus einer Stunden-ID ("Tag-Startzeit", z. B. "0-09:50") den Wochentag lesen.
export function slotTag(slotId) {
  return Number(String(slotId).split("-")[0]);
}

// Stunden-Zuordnung laden und robust gegen Altformat machen: Werte sind immer
// eine Liste von Stunden-IDs (eine frühere Version speicherte eine einzelne ID
// als String). Verhindert einen harten Absturz bei alten Daten.
export function ladeStunden() {
  const roh = lade(STUNDEN_KEY);
  const out = {};
  for (const [id, wert] of Object.entries(roh)) {
    if (Array.isArray(wert)) out[id] = wert;
    else if (typeof wert === "string" && wert) out[id] = [wert];
  }
  return out;
}

// Ein KB ist eingeplant, wenn alle seine Uhren (cluster) auf Stunden verteilt
// sind. stunden[kbId] ist eine Liste von Stunden-IDs, je eine Uhr.
export function kbVollVerteilt(kb, stunden) {
  return (stunden[kb.id]?.length || 0) >= kb.cluster;
}

// Wo steht die Planung? Für den Nav-Punkt "Plan": solange Etappenziele ohne
// Woche sind, in den Etappenplan, sonst in die Wochenplanung.
export function planungsScreen() {
  const zuordnung = lade(WOCHEN_KEY);
  const offen = koennensbeweise.some((k) => zuordnung[k.id] == null);
  return offen ? "etappenplan" : "wochenplan";
}

// Ist die Planung komplett (alle Ziele auf Wochen, diese Woche auf Tage)?
export function planungFertig(woche = AKTUELLE_WOCHE) {
  return startScreen(woche) === "heute";
}

// Smart-Start: wer fertig geplant hat, landet direkt auf Heute. Wer mitten in
// der Planung steckt, genau dort, wo er weitermachen muss.
export function startScreen(woche = AKTUELLE_WOCHE) {
  const zuordnung = lade(WOCHEN_KEY);
  const offen = koennensbeweise.some((k) => zuordnung[k.id] == null);
  if (offen) return "etappenplan";

  const stunden = lade(STUNDEN_KEY);
  const wocheKbs = koennensbeweise.filter((k) => zuordnung[k.id] === woche);
  const unverteilt = wocheKbs.some((k) => !kbVollVerteilt(k, stunden));
  if (wocheKbs.length === 0 || unverteilt) return "wochenplan";

  return "heute";
}

// Kleiner Melder: Screens rufen ihn nach einer Planungs- oder Erledigt-Änderung,
// damit die "Mein Weg"-Leiste sich sofort aktualisiert (gleiche-Tab-Update, das
// das storage-Event nicht liefert).
export function meldeAenderung() {
  try {
    window.dispatchEvent(new Event("neu:planung"));
  } catch {
    /* kein window (z.B. Tests): dann egal */
  }
}
