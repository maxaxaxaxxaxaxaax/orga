// Gedanken-Parkplatz / Brain-Dump (SCHULE.md Cluster 5: abdriftende Gedanken
// während der Fokus-Session kurz parken, ohne den Fokus zu verlieren). Ein
// kleiner persönlicher Zettel, den der Schüler selbst wieder leert: kein
// To-do-Verwalter, nur ein Kopf-frei-Machen. Reload-fest in localStorage.
const KEY = "neu.notizen"; // string[]

export function ladeNotizen() {
  try {
    const r = localStorage.getItem(KEY);
    const a = r ? JSON.parse(r) : [];
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
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

export function addNotiz(text) {
  const t = (text || "").trim();
  if (!t) return ladeNotizen();
  const arr = [...ladeNotizen(), t];
  speichere(arr);
  return arr;
}

export function entferneNotiz(index) {
  const arr = ladeNotizen().filter((_, i) => i !== index);
  speichere(arr);
  return arr;
}
