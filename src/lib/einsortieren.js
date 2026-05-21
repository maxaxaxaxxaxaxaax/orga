// Automatisches Einsortieren hochgeladener Dokumente (einfache Heuristik,
// würde später eine KI übernehmen). Rät Fach, Register, Art und Thema.
import { faecher } from "../data/wissen";

const fachSynonyme = {
  Mathematik: ["mathe", "mathematik", "math"],
  Deutsch: ["deutsch"],
  Latein: ["latein", "lat", "lektion", "aci"],
  Griechisch: ["griech", "griechisch"],
  Biologie: ["bio", "biologie"],
  Geschichte: ["gesch", "geschichte", "history"],
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

export function rateThema(dateiname, fachName) {
  const fachObj = faecher.find((f) => f.fach === fachName);
  if (!fachObj) return "Eingang";
  const n = dateiname.toLowerCase();
  const treffer = fachObj.themen.find((t) => {
    const wort = t.label.toLowerCase().split(/[ :]/)[0];
    return wort.length > 2 && n.includes(wort);
  });
  return treffer ? treffer.label : "Eingang";
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
