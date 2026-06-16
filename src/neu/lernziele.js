// Eigenes Lernziel pro Könnensbeweis: was der Schüler selbst erreichen will,
// in seinen Worten (z.B. "sicher genug für die Abnahme" oder "auch die schweren
// Teile verstehen"). Selbstbestimmung über Qualität, nicht nur Zeit. Reload-fest.
const KEY = "neu.lernziele"; // { [kbId]: "text" }

function ladeAlle() {
  try {
    const r = localStorage.getItem(KEY);
    const v = r ? JSON.parse(r) : {};
    return v && typeof v === "object" && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}

export function ladeZiel(kbId) {
  const z = ladeAlle()[kbId];
  return typeof z === "string" ? z : "";
}

export function setzeZiel(kbId, text) {
  const alle = ladeAlle();
  const t = (text || "").trim();
  if (t) alle[kbId] = t;
  else delete alle[kbId];
  try {
    localStorage.setItem(KEY, JSON.stringify(alle));
  } catch {
    /* localStorage blockiert: dann nur diese Sitzung */
  }
}
