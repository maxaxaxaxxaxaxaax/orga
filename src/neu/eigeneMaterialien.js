// Selbst hochgeladene Materialien (Demo: nur Beschreibung, kein echter
// Upload). Persistiert in localStorage, gemischt mit den Seed-Materialien.

const KEY = "neu.eigeneMaterialien";

export function ladeEigene() {
  try {
    const r = localStorage.getItem(KEY);
    const v = r ? JSON.parse(r) : [];
    // Gegen beschaedigte/handeditierte Daten absichern: muss eine Liste sein,
    // sonst wuerde .filter/.push spaeter abstuerzen (Silent Repair).
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function speichereEigenes({ titel, fachId, thema, art, inhalt, bereich }) {
  const alle = ladeEigene();
  const neu = {
    id: "eigen-" + Date.now(),
    fachId,
    thema: thema || null, // Lernweg-Label oder null = nur im Fach
    titel,
    art,
    // Woher das Material kommt (für die Bereich-Unterregister in der Ablage).
    // Eigenes Material ist im Zweifel selbst gelernt.
    bereich: bereich || "selbstlernen",
    inhalt: inhalt || null, // Volltext (z. B. Lernzettel), sonst null
    datum: new Date().toISOString().slice(0, 10),
    eigen: true,
  };
  alle.push(neu);
  localStorage.setItem(KEY, JSON.stringify(alle));
  return neu;
}

export function eigeneFuerFach(fachId) {
  return ladeEigene().filter((m) => m.fachId === fachId);
}

export function eigeneFuerThema(fachId, themaLabel) {
  return eigeneFuerFach(fachId).filter((m) => m.thema === themaLabel);
}
