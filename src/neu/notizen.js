// Erinnerungen: ein kleines eigenes To-do-Widget auf der Übersicht. Der Schüler
// legt seine Erinnerungen direkt dort an, hakt sie ab und wischt sie weg. Startet
// bewusst leer (kein Demo-Seed): erst was eingetragen ist, steht hier. Reload-fest
// in localStorage.
const KEY = "neu.notizen"; // [{ text, kontext?, erledigt? }]

export function ladeNotizen() {
  try {
    const r = localStorage.getItem(KEY);
    if (r == null) return [];
    const a = JSON.parse(r);
    if (!Array.isArray(a)) return [];
    // Alt-Format (reine Strings) auf das Objekt-Format heben.
    return a
      .map((n) => (typeof n === "string" ? { text: n } : n))
      .filter((n) => n && n.text);
  } catch {
    return [];
  }
}

// Notiz ab-/anhaken (erledigt umschalten). Bleibt in der Liste, nur durchgestrichen.
export function toggleNotiz(index) {
  const arr = ladeNotizen().map((n, i) =>
    i === index ? { ...n, erledigt: !n.erledigt } : n
  );
  speichere(arr);
  return arr;
}

function speichere(arr) {
  try {
    localStorage.setItem(KEY, JSON.stringify(arr));
  } catch {
    /* localStorage blockiert: dann nur diese Sitzung */
  }
  // Heute hängt am Notizzettel: gleich benachrichtigen, damit es live mitläuft.
  try {
    window.dispatchEvent(new Event("neu:planung"));
  } catch {
    /* kein window (z.B. Tests): dann egal */
  }
}

// kbId bindet eine Notiz an genau eine Aufgabe: im Fokus wird sie nur dort
// gezeigt, die Übersicht zeigt trotzdem alle. Ohne kbId (z.B. direkt in der
// Übersicht angelegt) gehört sie nirgends in einen Fokus.
export function addNotiz(text, kontext, kbId) {
  const t = (text || "").trim();
  if (!t) return ladeNotizen();
  const eintrag = { text: t };
  if (kontext) eintrag.kontext = kontext;
  if (kbId) eintrag.kbId = kbId;
  const arr = [...ladeNotizen(), eintrag];
  speichere(arr);
  return arr;
}

export function entferneNotiz(index) {
  const arr = ladeNotizen().filter((_, i) => i !== index);
  speichere(arr);
  return arr;
}
