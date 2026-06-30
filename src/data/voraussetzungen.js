import { FACH_STRUKTUR } from "./fachStruktur";

// Gerichtete "baut auf"-Kanten zwischen Themenbereichen eines Fachs.
// Konvention: [voraussetzung, baut-darauf-auf].
//
// BEWUSST LEER. Eine belegte Treue-Prüfung gegen die RLP-Lehrpläne (Sek I, 2022)
// und KMK-Bildungsstandards (Mathe/Deutsch/Englisch, Volltext gelesen) hat gezeigt:
// Die Lehrpläne entwickeln ihre Kompetenzbereiche/Leitideen SPIRALIG und VERZAHNT
// und benennen KEINE gerichteten Voraussetzungsketten zwischen Themenbereichen
// (KMK Mathe 2022 S.6; KMK Deutsch S.12 "in komplexer Weise verzahnt"; RLP Spiral-
// prinzip). Von den früher kodierten Kanten war nur eine wörtlich belegt (Mathe
// Funktionen→Analysis), die liegt im neuen Modell INNERHALB von "Funktionaler
// Zusammenhang". Mehrere Kanten waren sogar verdreht (z.B. Funktionen→Geometrie:
// Geometrie läuft ab Kl. 5/6, vor den Funktionen). Daher werden im Netz keine
// "baut auf"-Pfeile mehr behauptet; die wahrheitsgetreue Beziehung ist die
// ZUGEHÖRIGKEIT zum Kompetenzbereich (siehe kompetenzbereiche.js, Memory
// schulhub-lehrplan-treue). Diese Datei bleibt für mögliche, künftig BELEGTE
// Kanten erhalten; aktuell sind alle Fächer leer.
export const VORAUSSETZUNGEN = {
  mathe: [],
  deutsch: [],
  englisch: [],
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
    // Nur Kanten zwischen bekannten Kategorien in den Graphen aufnehmen, damit
    // der Zyklus-Check auf der gueltigen Struktur arbeitet.
    if (kats.has(a) && kats.has(b)) {
      if (!nachfolger[a]) nachfolger[a] = [];
      nachfolger[a].push(b);
    }
  }
  // Zyklus-Check per DFS (Dreifaerbung: 0 unbesucht, 1 aktiv, 2 fertig).
  // Meldet jede Kategorie, an der ein Zyklus beginnt.
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
    if (!farbe[k] && hatZyklus(k)) fehler.push("Zyklus ab Kategorie: " + k);
  }
  return fehler;
}
