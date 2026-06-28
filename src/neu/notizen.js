// Gedanken-Parkplatz / Brain-Dump (SCHULE.md Cluster 5: abdriftende Gedanken
// während der Fokus-Session kurz parken, ohne den Fokus zu verlieren). Ein
// kleiner persönlicher Zettel, den der Schüler selbst wieder leert: kein
// To-do-Verwalter, nur ein Kopf-frei-Machen. Reload-fest in localStorage.
const KEY = "neu.notizen"; // [{ text, kontext?, erledigt? }]

// Ein paar Demo-Notizen für die Übersicht, damit der Zettel nicht leer ist
// (Max, 7a). Werden beim ersten Laden gesetzt; danach gehört der Zettel dem
// Schüler (selbst hinzufügen/abhaken).
const SEED = [
  { text: "Eltern-Erlaubnis abgeben", kontext: "Fr. Berg", erledigt: true },
  { text: "Buch für Deutsch mitbringen", erledigt: false },
];

export function ladeNotizen() {
  try {
    const r = localStorage.getItem(KEY);
    if (r == null) {
      speichere(SEED);
      return SEED;
    }
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
