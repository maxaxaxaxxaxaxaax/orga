// Die sieben Kategorien der Schulmathematik (Reihenfolge = Anzeige-Reihenfolge
// in der Ablage). Quelle: Standard-Lehrplan-Gliederung.
export const MATHE_KATEGORIEN = [
  "Mathematische Grundlagen",
  "Algebra",
  "Funktionen",
  "Geometrie",
  "Analysis",
  "Stochastik",
  "Angewandte Mathematik",
];

// Subkategorien je Kategorie (Anzeige-Reihenfolge). Jeder Lernweg traegt eine
// subkategorie aus dieser Liste; die Ablage gruppiert Kategorie -> Subkategorie.
export const MATHE_SUBKATEGORIEN = {
  "Mathematische Grundlagen": [
    "Mengen und Logik",
    "Zahlen und Zahlbereiche",
    "Negative Zahlen",
    "Brüche und Dezimalzahlen",
    "Prozent und Zins",
    "Verhältnisse und Größen",
    "Potenzen und Wurzeln",
  ],
  Algebra: [
    "Terme",
    "Gleichungen und Ungleichungen",
    "Potenzen, Wurzeln, Logarithmen",
    "Komplexe Zahlen",
    "Matrizen",
  ],
  Funktionen: [
    "Grundlagen der Funktionen",
    "Elementare Funktionen",
    "Exponential- und trigonometrische Funktionen",
  ],
  Geometrie: [
    "Grundlagen und Figuren",
    "Dreieck und Kreis",
    "Flächen, Körper und Raum",
    "Analytische Geometrie",
  ],
  Analysis: [
    "Folgen und Grenzwerte",
    "Differentialrechnung",
    "Integralrechnung",
    "Anwendungen",
  ],
  Stochastik: [
    "Beschreibende Statistik",
    "Wahrscheinlichkeit",
    "Verteilungen und Tests",
  ],
  "Angewandte Mathematik": [
    "Daten im Alltag",
    "Finanzen und Verhältnisse",
    "Wachstum und Zerfall",
    "Modellieren und Optimieren",
  ],
};

// Prüft das Mathe-Netz auf Integrität. Reine Funktion, im Browser/Node nutzbar.
// Gibt eine Liste von Fehlern zurück (leer = alles ok).
export function pruefeMatheNetz(faecher) {
  const fehler = [];
  const mathe = faecher.find((f) => f.id === "mathe");
  if (!mathe) return ["Fach 'mathe' fehlt"];
  const kbIds = new Set();
  const ids = new Set();
  for (const t of mathe.themen) {
    if (!t.id) fehler.push(`Thema ohne id: ${t.label}`);
    if (ids.has(t.id)) fehler.push(`Doppelte Thema-id: ${t.id}`);
    ids.add(t.id);
    if (!t.kbId) fehler.push(`Thema ohne kbId: ${t.id}`);
    if (kbIds.has(t.kbId)) fehler.push(`Doppelte kbId: ${t.kbId}`);
    kbIds.add(t.kbId);
    if (!t.kategorie) fehler.push(`Thema ohne kategorie: ${t.id}`);
    else if (!MATHE_KATEGORIEN.includes(t.kategorie))
      fehler.push(`Unbekannte kategorie '${t.kategorie}' bei ${t.id}`);
    if (!t.subkategorie) fehler.push(`Thema ohne subkategorie: ${t.id}`);
    else if (!(MATHE_SUBKATEGORIEN[t.kategorie] || []).includes(t.subkategorie))
      fehler.push(
        `Unbekannte subkategorie '${t.subkategorie}' (Kategorie '${t.kategorie}') bei ${t.id}`
      );
    if (!Array.isArray(t.schritte) || t.schritte.length === 0)
      fehler.push(`Thema ohne schritte: ${t.id}`);
  }
  return fehler;
}
