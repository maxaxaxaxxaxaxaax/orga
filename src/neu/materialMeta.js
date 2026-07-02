// Nutzer-Metadaten zu Materialien: Favoriten-Stern und ein verschobener
// Ablageort (falls etwas im falschen Fach gelandet ist). Gilt über die
// Material-id für Seed- wie eigene Materialien, reload-fest in localStorage.
// META_EVENT lässt offene Ansichten (Ablage, Fokus) live nachziehen, wie
// EIGENE_EVENT bei den eigenen Materialien.

const FAV_KEY = "neu.materialFavoriten";
const ORT_KEY = "neu.materialOrte";
export const META_EVENT = "neu:materialMeta";

function lies(key) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    // Gegen beschädigte/handeditierte Daten absichern (Silent Repair).
    return v && typeof v === "object" && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}
function schreibe(key, wert) {
  try {
    localStorage.setItem(key, JSON.stringify(wert));
  } catch {
    /* Speicher voll/gesperrt: Demo läuft ohne Persistenz weiter */
  }
  window.dispatchEvent(new Event(META_EVENT));
}

// Favoriten: { [materialId]: true }
export function ladeFavoriten() {
  return lies(FAV_KEY);
}
export function toggleFavorit(id) {
  const favs = lies(FAV_KEY);
  if (favs[id]) delete favs[id];
  else favs[id] = true;
  schreibe(FAV_KEY, favs);
}

// Verschobene Ablageorte: { [materialId]: fachId }. Nur echte Verschiebungen
// werden gespeichert; zurück ins Heimat-Fach löscht den Eintrag.
export function ladeOrte() {
  return lies(ORT_KEY);
}
export function verschiebeMaterial(id, fachId, heimatFachId) {
  const orte = lies(ORT_KEY);
  if (!fachId || fachId === heimatFachId) delete orte[id];
  else orte[id] = fachId;
  schreibe(ORT_KEY, orte);
}
