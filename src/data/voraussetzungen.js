import { FACH_STRUKTUR } from "./fachStruktur";

// Gerichtete "baut auf"-Kanten GROB zwischen den Kategorien eines Fachs.
// Konvention: [voraussetzung, baut-darauf-auf] (Pfeil zeigt von der Grundlage
// zum darauf Aufbauenden). Nur Kategorie-Namen aus FACH_STRUKTUR. Einmalig am
// Lehrplan orientiert kuratiert, nicht aus Nutzerdaten erzeugt.
export const VORAUSSETZUNGEN = {
  mathe: [
    ["Mathematische Grundlagen", "Algebra"],
    ["Mathematische Grundlagen", "Funktionen"],
    ["Mathematische Grundlagen", "Geometrie"],
    ["Mathematische Grundlagen", "Stochastik"],
    ["Mathematische Grundlagen", "Angewandte Mathematik"],
    ["Algebra", "Funktionen"],
    ["Funktionen", "Analysis"],
    ["Funktionen", "Geometrie"],
    ["Funktionen", "Stochastik"],
    ["Analysis", "Stochastik"],
    ["Algebra", "Angewandte Mathematik"],
    ["Funktionen", "Angewandte Mathematik"],
  ],
  deutsch: [
    ["Grammatik", "Textarten und Schreiben"],
    ["Rechtschreibung", "Textarten und Schreiben"],
    ["Grammatik", "Sprache und Kommunikation"],
    ["Grammatik", "Stilmittel"],
    ["Stilmittel", "Lyrik"],
    ["Stilmittel", "Epik und Dramatik"],
    ["Lyrik", "Literaturepochen"],
    ["Epik und Dramatik", "Literaturepochen"],
    ["Literaturepochen", "Literarische Werke"],
    ["Epik und Dramatik", "Literarische Werke"],
  ],
  englisch: [
    ["Wortarten", "Satzbau"],
    ["Zeitformen", "Satzbau"],
    ["Zeitformen", "Verben"],
    ["Verben", "Satzbau"],
    ["Wortschatz und Rechtschreibung", "Schreiben und Textarten"],
    ["Satzbau", "Schreiben und Textarten"],
    ["Schreiben und Textarten", "Analyse und Interpretation"],
    ["Satzbau", "Sprachmittlung und Kommunikation"],
    ["Wortschatz und Rechtschreibung", "Sprachmittlung und Kommunikation"],
  ],
};

// Prueft die Kanten eines Fachs: existierende Kategorien, keine Selbstkante,
// keine Dublette, kein Zyklus. Gibt eine Fehlerliste zurueck (leer = ok).
export function pruefeVoraussetzungen(fachId) {
  const fehler = [];
  const struktur = FACH_STRUKTUR[fachId];
  const kanten = VORAUSSETZUNGEN[fachId] || [];
  if (!struktur) {
    if (kanten.length) fehler.push("Fach ohne Struktur hat Kanten: " + fachId);
    return fehler;
  }
  const kats = new Set(struktur.kategorien);
  const gesehen = new Set();
  const nachfolger = {};
  for (const [a, b] of kanten) {
    if (!kats.has(a)) fehler.push("Unbekannte Kategorie (von): " + a);
    if (!kats.has(b)) fehler.push("Unbekannte Kategorie (nach): " + b);
    if (a === b) fehler.push("Selbstkante: " + a);
    const key = a + "->" + b;
    if (gesehen.has(key)) fehler.push("Doppelte Kante: " + key);
    gesehen.add(key);
    (nachfolger[a] = nachfolger[a] || []).push(b);
  }
  const farbe = {};
  function hatZyklus(k) {
    farbe[k] = 1;
    for (const n of nachfolger[k] || []) {
      if (farbe[n] === 1) return true;
      if (!farbe[n] && hatZyklus(n)) return true;
    }
    farbe[k] = 2;
    return false;
  }
  for (const k of kats) {
    if (!farbe[k] && hatZyklus(k)) {
      fehler.push("Zyklus ab Kategorie: " + k);
      break;
    }
  }
  return fehler;
}
