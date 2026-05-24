// Automatisches Einsortieren hochgeladener Dokumente (einfache Heuristik,
// würde später eine KI übernehmen). Rät Fach, Register, Art und Thema.
import { faecher } from "../data/wissen";

// Nur Fächer mit Lernwegen im Wissen-Tab. Stundenplan-Fächer ohne Lernweg
// (z. B. Bio, Geschichte) werden hier bewusst nicht erkannt, sonst landet
// hochgeladenes Material in einem Fach, das es im Wissen gar nicht gibt.
const fachSynonyme = {
  Mathematik: ["mathe", "mathematik", "math"],
  Deutsch: ["deutsch"],
  Englisch: ["englisch", "english"],
  Latein: ["latein", "lat", "lektion", "aci"],
  Griechisch: ["griech", "griechisch"],
};

export function rateFach(dateiname, fallback) {
  const n = dateiname.toLowerCase();
  for (const [fach, syns] of Object.entries(fachSynonyme)) {
    if (syns.some((s) => n.includes(s))) return fach;
  }
  return fallback;
}

export function rateBereich(dateiname) {
  const n = dateiname.toLowerCase();
  if (/(mitschrift|tafel|arbeitsblatt|\bab\b|unterricht|hefteintrag|folie)/.test(n)) {
    return "unterricht";
  }
  if (/(notiz|zusammenfassung|zsf|aufgabe|hausaufgabe|\bha\b|lernen|spick|merk)/.test(n)) {
    return "selbstlernen";
  }
  return "selbstlernen";
}

export function artVonDatei(dateiname) {
  const ext = (dateiname.split(".").pop() || "").toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "gif", "webp", "heic"].includes(ext)) return "bild";
  if (["doc", "docx", "odt", "pages"].includes(ext)) return "dokument";
  if (["txt", "md", "rtf"].includes(ext)) return "notiz";
  return "datei";
}

// Stopwords + Wort-Score, damit „Vokabelliste_L15" auf „Vokabeln L15 / Pronomen"
// trifft (Stamm-Match) und „7MA1" direkt auf den KB-Lernweg zielt.
const THEMA_STOPWORDS = new Set([
  "und", "mit", "die", "der", "das", "von", "im", "in", "auf", "zu", "ist",
  "wdh", "übung", "übungen",
]);

function themaScore(label, normalisiert) {
  const woerter = label
    .toLowerCase()
    .replace(/[(),./:&]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !THEMA_STOPWORDS.has(w));
  let score = 0;
  for (const w of woerter) {
    if (normalisiert.includes(w)) {
      score += w.length;
    } else if (w.length >= 5) {
      // Stamm: ersten ~70% des Worts. „vokabeln" → „vokabel" -> matched auch „vokabelliste".
      const stamm = w.slice(0, Math.max(4, Math.ceil(w.length * 0.7)));
      if (stamm.length >= 4 && normalisiert.includes(stamm)) score += stamm.length / 2;
    }
  }
  return score;
}

export function rateThema(dateiname, fachName) {
  const fachObj = faecher.find((f) => f.fach === fachName);
  if (!fachObj) return "Eingang";
  // Dateiname normalisieren: Trenner zu Leerzeichen, Lowercase.
  const n = dateiname.toLowerCase().replace(/[._-]+/g, " ");
  const kompakt = n.replace(/\s+/g, "");
  // 1) Direkter KB-Code-Treffer („7MA1" o. „7 MA 1" im Dateinamen) ist eindeutig.
  for (const t of fachObj.themen) {
    if (!t.kbId) continue;
    const kb = t.kbId.toLowerCase();
    if (kompakt.includes(kb) || n.includes(kb.replace(/(\d)([a-z]+)(\d)/, "$1 $2 $3"))) {
      return t.label;
    }
  }
  // 2) Wort-Score über das Label, mit Stamm-Match.
  let bester = null;
  let besterScore = 0;
  for (const t of fachObj.themen) {
    const s = themaScore(t.label, n);
    if (s > besterScore) {
      besterScore = s;
      bester = t.label;
    }
  }
  return besterScore >= 4 ? bester : "Eingang";
}

// Liefert ein vollständiges Dokument-Objekt für eine Datei.
let zaehler = 0;
export function dokumentAusDatei(file, { zielFach, fallbackFach } = {}) {
  const name = file.name || "Dokument";
  const fach = zielFach || rateFach(name, fallbackFach);
  const titel = name.replace(/\.[^.]+$/, "");
  return {
    id: "up-" + Date.now() + "-" + zaehler++,
    fach,
    bereich: rateBereich(name),
    thema: rateThema(name, fach),
    titel,
    art: artVonDatei(name),
    datum: new Date().toISOString().slice(0, 10),
    ts: Date.now(),
    uploaded: true,
    fachErkannt: !!zielFach || rateFach(name, null) !== null,
  };
}

// Schnellnotiz als Dokument (landet im Register Selbstlernen).
export function notizDokument(text, zielFach) {
  const sauber = text.trim();
  const fach = zielFach || rateFach(sauber, "Allgemein");
  return {
    id: "note-" + Date.now() + "-" + zaehler++,
    fach,
    bereich: "selbstlernen",
    thema: rateThema(sauber, fach),
    titel: sauber.length > 60 ? sauber.slice(0, 60) + "…" : sauber,
    art: "notiz",
    datum: new Date().toISOString().slice(0, 10),
    ts: Date.now(),
    uploaded: true,
    fachErkannt: !!zielFach,
  };
}
