// Mitteilungen: ein schlichtes Postfach hinter dem Chat-Icon der Topbar. Hier
// landen Hinweise (neu geteiltes Material, hochgeladener Content) und ruhige
// Nachrichten der Lerncoach Fr. Berg. Kein Verlauf-Backend: ein localStorage-
// Eintrag plus ein Event, damit die Topbar live mitzählt. Reload setzt zurück
// (siehe main.jsx), darum dient der Seed als ruhiger Startzustand der Demo.
const KEY = "neu.mitteilungen";
export const MITTEILUNG_EVENT = "neu:mitteilung";

// art steuert nur das Icon: "coach" (Lerncoach), "material" (geteilt/hochgeladen).
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
    titel: "Neu geteilt",
    text: "Fr. Berg hat „Übungsblatt: Vorzeichen-Memo“ zu Mathematik gelegt.",
    zeit: "7:40",
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
export function addMitteilung({ titel, text, art }) {
  const liste = ladeMitteilungen();
  liste.unshift({
    id: "m" + Date.now(),
    art: art || "material",
    titel,
    text,
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
