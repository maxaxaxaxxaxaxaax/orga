// Abgehakte Lernweg-Schritte pro Könnensbeweis: das Selbst-Tracking des Weges
// zum KB. Pro Schritt-Index ein Override; fehlt es, gilt der Vorgabe-Wert aus
// wissen.js (manche Schritte sind dort schon als erledigt markiert). Reload-fest.
const KEY = "neu.lernschritte"; // { [kbId]: { [index]: bool } }

function ladeAlle() {
  try {
    const r = localStorage.getItem(KEY);
    const v = r ? JSON.parse(r) : {};
    // Muss ein Objekt sein (kein null/Array/String), sonst kracht der Zugriff.
    return v && typeof v === "object" && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}

export function ladeSchritte(kbId) {
  return ladeAlle()[kbId] || {};
}

export function speichereSchritte(kbId, stand) {
  const alle = ladeAlle();
  alle[kbId] = stand;
  try {
    localStorage.setItem(KEY, JSON.stringify(alle));
  } catch {
    /* localStorage blockiert: dann nur diese Sitzung */
  }
  // Die "Mein Weg"-Leiste zeigt den Schritt-Fortschritt des aktuellen Ziels:
  // bei jeder Schritt-Änderung gleich benachrichtigen, damit sie live mitläuft.
  try {
    window.dispatchEvent(new Event("neu:planung"));
  } catch {
    /* kein window (z.B. Tests): dann egal */
  }
}
