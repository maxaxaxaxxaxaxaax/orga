// Schülergeführte Coach-Brücke (siehe VISION.md "zweite Säule / Domino-Effekt"
// und SCHULE.md Cluster 3 + 4). Der Schüler öffnet selbst eine Brücke zum
// Lerncoach, nie erhebt das System etwas über ihn (Leitplanke: Spiegeln statt
// Überwachen). Zwei Anlässe pro Ziel: ein stiller Hilferuf ("komme nicht
// weiter") und das Anmelden zur KB-Abnahme. Beides reload-fest in localStorage.

export const COACH = "Fr. Berg"; // fester Demo-Lerncoach (siehe SCHULE.md)

const HILFE_KEY = "neu.hilferufe"; // kbId -> true
const ABNAHME_KEY = "neu.abnahmen"; // kbId -> true
const FRAGE_KEY = "neu.fragen"; // kbId -> Fragetext (eine offene Frage pro Ziel)
const MATERIALWUNSCH_KEY = "neu.materialwuensche"; // kbId -> true

function lade(key) {
  try {
    const r = localStorage.getItem(key);
    return r ? JSON.parse(r) : {};
  } catch {
    return {};
  }
}
function setze(key, id, an) {
  const o = lade(key);
  if (an) o[id] = true;
  else delete o[id];
  localStorage.setItem(key, JSON.stringify(o));
  return o;
}

export const ladeHilferufe = () => lade(HILFE_KEY);
export const setzeHilferuf = (id, an) => setze(HILFE_KEY, id, an);
export const ladeAbnahmen = () => lade(ABNAHME_KEY);
export const setzeAbnahme = (id, an) => setze(ABNAHME_KEY, id, an);

// Schülergeführter Wunsch nach mehr Material zu einem Ziel: eine explizite
// Brücke zum Lerncoach (wie der Hilferuf), nicht an eine Antwort-KI. Sichtbar
// nur, wenn der Schüler den Knopf drückt; jederzeit zurücknehmbar.
export const ladeMaterialwuensche = () => lade(MATERIALWUNSCH_KEY);
export const setzeMaterialwunsch = (id, an) => setze(MATERIALWUNSCH_KEY, id, an);

// Stille, schülergeführte Frage an den Lerncoach (SCHULE.md Cluster 3: Fragen aus
// dem Schritt heraus merken, ohne sich laut melden zu müssen). Freitext, eine
// offene Frage pro Ziel, jederzeit zurücknehmbar. Geht an den Menschen, nicht an
// eine Antwort-KI (VISION).
export const ladeFragen = () => lade(FRAGE_KEY);
export function setzeFrage(id, text) {
  const o = lade(FRAGE_KEY);
  const t = (text || "").trim();
  if (t) o[id] = t;
  else delete o[id];
  try {
    localStorage.setItem(FRAGE_KEY, JSON.stringify(o));
  } catch {
    /* localStorage blockiert: dann nur diese Sitzung */
  }
  return o;
}
