// Gedanken-Parkplatz / Brain-Dump (SCHULE.md Cluster 5: abdriftende Gedanken
// während der Fokus-Session kurz parken, ohne den Fokus zu verlieren). Ein
// kleiner persönlicher Zettel, den der Schüler selbst wieder leert: kein
// To-do-Verwalter, nur ein Kopf-frei-Machen. Reload-fest in localStorage.
const KEY = "neu.notizen"; // [{ text, kontext? }]

export function ladeNotizen() {
  try {
    const r = localStorage.getItem(KEY);
    const a = r ? JSON.parse(r) : [];
    if (!Array.isArray(a)) return [];
    // Alt-Format (reine Strings) auf das Objekt-Format heben.
    return a
      .map((n) => (typeof n === "string" ? { text: n } : n))
      .filter((n) => n && n.text);
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

export function addNotiz(text, kontext) {
  const t = (text || "").trim();
  if (!t) return ladeNotizen();
  const eintrag = kontext ? { text: t, kontext } : { text: t };
  const arr = [...ladeNotizen(), eintrag];
  speichere(arr);
  return arr;
}

export function entferneNotiz(index) {
  const arr = ladeNotizen().filter((_, i) => i !== index);
  speichere(arr);
  return arr;
}
