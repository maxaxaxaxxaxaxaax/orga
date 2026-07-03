// Persistente Markierungen (Stift-Werkzeug) pro Material-Stelle. Ein Strich ist
// eine Folge normalisierter Punkte {x, y} im Bereich 0..1, bezogen auf die
// Material-Fläche. So bleiben sie bei jeder Größe deckungsgleich und lassen sich
// als Overlay über dem Material in der Mitte zeigen. Reload-fest in localStorage.
const KEY = "neu.markierungen";
export const MARKIER_EVENT = "neu:markierungen";

function lies() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    return v && typeof v === "object" && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}

export function markierungenFuer(schluessel) {
  if (!schluessel) return [];
  const s = lies()[schluessel];
  return Array.isArray(s) ? s : [];
}

// Striche für eine Stelle speichern (leer löscht den Eintrag). schluessel
// identifiziert die Mitte (Material-id bzw. Fach+Schritt).
export function speichereMarkierungen(schluessel, striche) {
  if (!schluessel) return;
  const alle = lies();
  if (!striche || !striche.length) delete alle[schluessel];
  else alle[schluessel] = striche;
  try {
    localStorage.setItem(KEY, JSON.stringify(alle));
  } catch {
    /* Speicher voll/gesperrt: Demo läuft ohne Persistenz weiter */
  }
  window.dispatchEvent(new Event(MARKIER_EVENT));
}
