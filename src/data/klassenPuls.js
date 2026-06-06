// Klassen-Puls: aggregierte Verbands-Information der 7a in der aktuellen Etappe.
// Bewusst anonym, ohne eigene Position des Schülers (keine Vergleichs-Logik).
// Demo-Daten leiten sich dynamisch aus der Etappen-Position ab, sodass
// Time-Travel über die DemoBar die Karte plausibel mitwandern lässt.

import { aktuelleEtappe } from "./etappen";

const SCHRITTE_GESAMT_PRO_ETAPPE = 110;

// Welche Fächer sind in welcher Etappen-Woche schwerpunktmäßig dran?
// Heuristik orientiert sich grob am 7a-Etappenplan (Ostern → Pfingsten):
// Pflicht-KB Mathe in W1, ACI Latein in der Mitte, Lapbook Deutsch + Übersetzung
// Latein im letzten Drittel. Wird in der UI als "Mehrheit arbeitet an X und Y"
// angezeigt.
const FAECHER_VERLAUF = [
  ["Mathematik", "Latein"],
  ["Mathematik", "Englisch"],
  ["Englisch", "Deutsch"],
  ["Latein", "Griechisch"],
  ["Deutsch", "Latein"],
  ["Latein", "Mathematik"],
];

const MS_PRO_TAG = 1000 * 60 * 60 * 24;

// Anzahl Wochen, die die Etappe umfasst. Volle Wochen werden aufgerundet,
// damit eine 5,4-Wochen-Etappe als 6 Wochen wahrgenommen wird.
function wochenInEtappe(etappe) {
  const start = new Date(etappe.von + "T00:00:00").getTime();
  const ende = new Date(etappe.bis + "T23:59:59").getTime();
  const tage = Math.ceil((ende - start) / MS_PRO_TAG);
  return Math.max(1, Math.ceil(tage / 7));
}

// Aktuelle Etappen-Woche (1-basiert). Vor Beginn → 1, nach Ende → wochenGesamt.
function aktuelleEtappenWoche(jetzt, etappe) {
  const start = new Date(etappe.von + "T00:00:00").getTime();
  const wochenGesamt = wochenInEtappe(etappe);
  const tageVerstrichen = Math.floor((jetzt.getTime() - start) / MS_PRO_TAG);
  const woche = Math.floor(tageVerstrichen / 7) + 1;
  return Math.max(1, Math.min(wochenGesamt, woche));
}

function aktiveFaecherFuerWoche(wocheVon) {
  const idx = Math.max(0, Math.min(FAECHER_VERLAUF.length - 1, wocheVon - 1));
  return FAECHER_VERLAUF[idx];
}

// Aggregierte Verbands-Daten der 7a für die aktuelle Etappe.
// Bewusst KEINE eigene Position des Schülers, damit kein Vergleich entsteht.
export function klassenPuls(jetzt, etappe = null) {
  const eff = etappe || aktuelleEtappe(jetzt);
  const wochenGesamt = wochenInEtappe(eff);
  const wocheVon = aktuelleEtappenWoche(jetzt, eff);
  const fortschritt = (wocheVon - 0.5) / wochenGesamt;
  const schritteErledigt = Math.max(
    0,
    Math.min(SCHRITTE_GESAMT_PRO_ETAPPE, Math.round(SCHRITTE_GESAMT_PRO_ETAPPE * fortschritt))
  );
  const aktiveFaecher = aktiveFaecherFuerWoche(wocheVon);
  return {
    schritteErledigt,
    schritteGesamt: SCHRITTE_GESAMT_PRO_ETAPPE,
    wocheVon,
    wochenGesamt,
    aktiveFaecher,
    etappe: eff,
  };
}
