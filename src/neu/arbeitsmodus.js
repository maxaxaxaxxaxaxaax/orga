// Arbeitsmodus im Fokus: "digital" (am Gerät) oder "tisch" (analog am
// Schreibtisch, Stift und Papier). Eine bewusste Schüler-Wahl (Self-Signal,
// kein Tracking), sitzungsweit gemerkt. Reload setzt via Demo-Reset (main.jsx)
// wieder auf "digital" zurück: das ist konsistent.
const KEY = "neu.arbeitsmodus";

export function ladeArbeitsmodus() {
  try {
    const v = localStorage.getItem(KEY);
    return v === "tisch" ? "tisch" : "digital";
  } catch {
    return "digital";
  }
}

export function speichereArbeitsmodus(modus) {
  try {
    localStorage.setItem(KEY, modus === "tisch" ? "tisch" : "digital");
  } catch {
    /* localStorage blockiert: dann nur diese Sitzung */
  }
}
