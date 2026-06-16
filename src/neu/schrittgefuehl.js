// Wie hat sich ein Lernweg-Schritt angefühlt: leicht, ging so oder schwer.
// Freiwillige Selbsteinschätzung (ein Tap), pro Schritt-Index eines KB. Spiegelt
// dem Schüler später, wo es hakte (kein Coach-Blick, keine Wertung). Reload-fest.
const KEY = "neu.schrittgefuehl"; // { [kbId]: { [index]: "leicht"|"ok"|"schwer" } }

export const GEFUEHLE = ["leicht", "ok", "schwer"];
export const GEFUEHL_LABEL = {
  leicht: "leicht",
  ok: "ging so",
  schwer: "schwer",
};

function ladeAlle() {
  try {
    const r = localStorage.getItem(KEY);
    const v = r ? JSON.parse(r) : {};
    return v && typeof v === "object" && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}

export function ladeGefuehl(kbId) {
  const g = ladeAlle()[kbId];
  return g && typeof g === "object" && !Array.isArray(g) ? g : {};
}

// Setzt das Gefühl für einen Schritt. Nochmal dasselbe tippen hebt es wieder
// auf (null), damit eine versehentliche Einschätzung leicht zu löschen ist.
export function setzeGefuehl(kbId, index, wert) {
  const alle = ladeAlle();
  const fuerKb = { ...(alle[kbId] || {}) };
  if (wert == null) delete fuerKb[index];
  else fuerKb[index] = wert;
  if (Object.keys(fuerKb).length === 0) delete alle[kbId];
  else alle[kbId] = fuerKb;
  try {
    localStorage.setItem(KEY, JSON.stringify(alle));
  } catch {
    /* localStorage blockiert: dann nur diese Sitzung */
  }
}
