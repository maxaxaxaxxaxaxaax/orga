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
    if (!Array.isArray(t.schritte) || t.schritte.length === 0)
      fehler.push(`Thema ohne schritte: ${t.id}`);
  }
  return fehler;
}
