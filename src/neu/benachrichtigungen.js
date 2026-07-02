// Mitteilungen: ein schlichtes Postfach hinter dem Chat-Icon der Topbar. Hier
// landen Hinweise (neu geteiltes Material, hochgeladener Content) und ruhige
// Nachrichten der Lerncoach Fr. Berg. Kein Verlauf-Backend: ein localStorage-
// Eintrag plus ein Event, damit die Topbar live mitzählt. Reload setzt zurück
// (siehe main.jsx), darum dient der Seed als ruhiger Startzustand der Demo.
const KEY = "neu.mitteilungen";
export const MITTEILUNG_EVENT = "neu:mitteilung";

// art steuert Icon und Filter: "coach" (Nachricht der Lerncoach), "material"
// (geteiltes/hochgeladenes Material), "link" (geteilter Link).
const SEED = [
  {
    id: "seed-berg",
    art: "coach",
    titel: "Fr. Berg",
    text: "Schön, dass du dranbleibst, Max. Wenn die negativen Zahlen haken, schreib mir einfach hier.",
    zeit: "8:15",
    gelesen: false,
  },
  {
    id: "seed-material",
    art: "material",
    titel: "Übungsblatt: Vorzeichen-Memo",
    text: "Fr. Berg hat es zu Mathematik gelegt.",
    materialId: "m2",
    tags: ["Mathematik", "Vorzeichen"],
    zeit: "7:40",
    gelesen: false,
  },
  {
    id: "seed-link",
    art: "link",
    titel: "Zahlengerade erklärt",
    text: "In der Ablage bei Mathematik einsortiert.",
    materialId: "m1",
    quelle: "link",
    tags: ["Mathematik", "Zahlengerade"],
    zeit: "7:20",
    gelesen: false,
  },
];

function ladeRoh() {
  try {
    const r = localStorage.getItem(KEY);
    if (!r) return null;
    const v = JSON.parse(r);
    return Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

export function ladeMitteilungen() {
  return ladeRoh() || SEED.map((m) => ({ ...m }));
}

function speichere(liste) {
  try {
    localStorage.setItem(KEY, JSON.stringify(liste));
  } catch {
    /* localStorage blockiert: dann nur diese Sitzung */
  }
  try {
    window.dispatchEvent(new Event(MITTEILUNG_EVENT));
  } catch {
    /* kein window (z. B. Tests): dann egal */
  }
}

// Neue Mitteilung vorne einreihen (A2: wird beim Hochladen von Material gerufen).
export function addMitteilung({ titel, text, art, materialId, quelle, tags }) {
  const liste = ladeMitteilungen();
  liste.unshift({
    id: "m" + Date.now(),
    art: art || "material",
    titel,
    text,
    // Optionales Ziel: die id des Materials in der Ablage, damit ein Klick auf die
    // Benachrichtigung direkt dorthin springt (geteilte Links/Material).
    materialId: materialId || null,
    // Herkunft (youtube/tiktok/instagram/link) und Auto-Tags, damit die Box
    // dokumentiert, was und woher etwas in der Ablage gelandet ist.
    quelle: quelle || null,
    tags: Array.isArray(tags) ? tags : [],
    zeit: "gerade eben",
    gelesen: false,
  });
  speichere(liste);
}

export function markiereAlleGelesen() {
  const liste = ladeMitteilungen();
  if (liste.every((m) => m.gelesen)) return;
  speichere(liste.map((m) => ({ ...m, gelesen: true })));
}

// Eine einzelne Mitteilung als gelesen markieren (Klick auf einen Eintrag).
export function markiereGelesen(id) {
  const liste = ladeMitteilungen();
  const m = liste.find((x) => x.id === id);
  if (!m || m.gelesen) return;
  speichere(liste.map((x) => (x.id === id ? { ...x, gelesen: true } : x)));
}
