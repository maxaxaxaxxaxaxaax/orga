import {
  koennensbeweise,
  etappeWochen,
  kbFaecher,
  kbFarbe,
} from "../data/koennensbeweise";
import { lernwegFuerKb } from "../data/wissen";
import { ladeSchritte } from "./lernschritte";
import { NEUTRAL_FARBE } from "./farbe";

// Geteilter Planungs-Stand: localStorage-Keys, Platzhalter für "jetzt" und die
// Frage, mit welchem Screen die App sinnvoll startet.

export const WOCHEN_KEY = "neu.etappenplan.zuordnung"; // kbId -> Woche (0-basiert)
export const TAGE_KEY = "neu.wochenplan.tage"; // kbId -> Wochentag (0=Mo..4=Fr)
export const STUNDEN_KEY = "neu.wochenplan.stunden"; // kbId -> Stunden-ID (Tag-Startzeit), optional
export const ERLEDIGT_KEY = "neu.erledigt"; // kbId -> true

// Erledigt-Stand laden: ausschließlich, was wirklich abgenommen wurde. Die
// Übersicht startet ehrlich bei null und wächst mit jedem geschafften
// Könnensbeweis (kein vorab gesetzter Demo-Stand).
export function ladeErledigt() {
  try {
    const r = localStorage.getItem(ERLEDIGT_KEY);
    const v = r == null ? {} : JSON.parse(r);
    return v && typeof v === "object" && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}

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
    const v = r ? JSON.parse(r) : {};
    // Alle Planungs-Keys sind Objekt-Maps; gegen beschaedigte Daten absichern.
    return v && typeof v === "object" && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}

// Anteiliger Fortschritt eines KB (0..1): voll abgenommen = 1, sonst der Anteil
// der erledigten Lernweg-Schritte. So zeigt der Ring auch den Zwischenstand,
// während man an einer Aufgabe arbeitet (nicht erst beim Abschluss).
function kbFortschritt(kbId, erledigt) {
  if (erledigt[kbId]) return 1;
  const schritte = lernwegFuerKb(kbId)?.thema?.schritte || [];
  if (schritte.length === 0) return 0;
  const stand = ladeSchritte(kbId);
  const fertige = schritte.filter((st, i) =>
    stand[i] != null ? stand[i] : !!st.fertig
  ).length;
  return fertige / schritte.length;
}

// Fortschritt je Fach und geplanter Woche. Speist den konzentrischen Wochen-Ring:
// ein Ring pro Fach (Fachfarbe), geteilt in gemeinsame Wochen-Stücke (Größe nach
// Aufgabenzahl). "done" ist der anteilige Stand (auch in Arbeit), "fertig" zählt
// die voll abgenommenen KBs (für den "noch offen"-Text). Leere Wochen fallen raus.
export function fachWochenFortschritt(erledigt) {
  const zuordnung = lade(WOCHEN_KEY);
  return kbFaecher
    .map((fach) => {
      const wochen = [];
      for (let w = 0; w < etappeWochen; w++) {
        const kbs = koennensbeweise.filter(
          (k) => k.fach === fach && zuordnung[k.id] === w
        );
        if (kbs.length === 0) continue;
        wochen.push({
          woche: w,
          total: kbs.length,
          done: kbs.reduce((s, k) => s + kbFortschritt(k.id, erledigt), 0),
          fertig: kbs.filter((k) => erledigt[k.id]).length,
          istAktuell: w === AKTUELLE_WOCHE,
        });
      }
      return { fach, color: kbFarbe[fach] || NEUTRAL_FARBE, wochen };
    })
    .filter((f) => f.wochen.length > 0);
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
