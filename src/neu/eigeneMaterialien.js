// Selbst hochgeladene Materialien (Demo: nur Beschreibung, kein echter
// Upload). Persistiert in localStorage, gemischt mit den Seed-Materialien.

import { faecher } from "../data/wissen";

const KEY = "neu.eigeneMaterialien";
// Wird nach jedem Speichern gefeuert, damit offene Ansichten (Ablage) live
// nachladen, auch wenn im Hintergrund gespeichert wird (z. B. Discord-Import).
export const EIGENE_EVENT = "neu:eigene";

function fachLabelVon(fachId) {
  return faecher.find((f) => f.id === fachId)?.fach || null;
}

// Auto-Tags "was es ist" beim Einsortieren: Fach + Thema (aus der Erkennung, sonst
// dem Lernweg) plus optional ein Inhalts-Stichwort. Kurz halten (max 3), damit man
// grob weiß, worum es geht, ohne die Zeile zu überladen.
export function baueTags({ fachId, thema, erkannt, stichwort } = {}) {
  const roh = [
    erkannt?.fach || fachLabelVon(fachId),
    erkannt?.thema || thema,
    stichwort,
  ];
  const normTag = (s) => (s || "").toLowerCase().replace(/[^a-zäöüß]/g, "");
  const tags = [];
  const gesehen = [];
  for (const t of roh) {
    if (!t) continue;
    const n = normTag(t);
    // Fuzzy-Dedup: kein Tag, der in einem schon vorhandenen steckt (oder umgekehrt),
    // z.B. "Negative zahl" neben "Negative Zahlen".
    if (gesehen.some((g) => g.includes(n) || n.includes(g))) continue;
    gesehen.push(n);
    tags.push(t);
  }
  return tags.slice(0, 3);
}

export function ladeEigene() {
  try {
    const r = localStorage.getItem(KEY);
    const v = r ? JSON.parse(r) : [];
    // Gegen beschaedigte/handeditierte Daten absichern: muss eine Liste sein,
    // sonst wuerde .filter/.push spaeter abstuerzen (Silent Repair).
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function speichereEigenes({
  titel,
  fachId,
  thema,
  art,
  inhalt,
  bereich,
  schritt,
  quelle,
  kanal,
  dauer,
  videoId,
  embedUrl,
  bild,
  url,
  tags,
}) {
  const alle = ladeEigene();
  const neu = {
    id: "eigen-" + Date.now(),
    fachId,
    thema: thema || null, // Lernweg-Label oder null = nur im Fach
    titel,
    art,
    // Woher das Material kommt (für die Bereich-Unterregister in der Ablage).
    // Eigenes Material ist im Zweifel selbst gelernt.
    bereich: bereich || "selbstlernen",
    inhalt: inhalt || null, // Volltext (z. B. Lernzettel), sonst null
    // Optionaler Bezug zum Lernweg-Schritt (Aufschrieb gehoert zu DIESER Aufgabe).
    schritt: schritt == null ? null : schritt,
    // Herkunfts-Dienst (z. B. "youtube") + Video-Metadaten, für den Quell-Badge und
    // die Video-Ansicht in der Ablage.
    quelle: quelle || null,
    kanal: kanal || null,
    dauer: dauer || null,
    videoId: videoId || null,
    // Embed-iframe (TikTok/Instagram) und optionales Vorschaubild.
    embedUrl: embedUrl || null,
    bild: bild || null,
    url: url || null,
    // Schlagwörter "was es ist" (Auto-Erkennung beim Einsortieren), für die Ablage
    // und als KI-Kontext.
    tags: Array.isArray(tags) ? tags : [],
    datum: new Date().toISOString().slice(0, 10),
    eigen: true,
  };
  alle.push(neu);
  localStorage.setItem(KEY, JSON.stringify(alle));
  try {
    window.dispatchEvent(new Event(EIGENE_EVENT));
  } catch {
    /* kein window (Tests): dann egal */
  }
  return neu;
}

export function eigeneFuerFach(fachId) {
  return ladeEigene().filter((m) => m.fachId === fachId);
}

export function eigeneFuerThema(fachId, themaLabel) {
  return eigeneFuerFach(fachId).filter((m) => m.thema === themaLabel);
}
