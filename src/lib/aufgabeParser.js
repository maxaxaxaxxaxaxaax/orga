// Wandelt eine freie Eingabe wie "Bio Steckbrief bis Freitag" in eine Aufgabe um.
// Erkennt Fach (Name/Synonym) und Frist (heute/morgen/Wochentag/Datum).

const synonyme = {
  Mathematik: ["mathe", "mathematik"],
  Deutsch: ["deutsch"],
  Englisch: ["englisch", "english"],
  Latein: ["latein"],
  Griechisch: ["griechisch", "griech"],
  Biologie: ["bio", "biologie"],
  Geschichte: ["geschichte", "gesch"],
  Erdkunde: ["erdkunde", "geo"],
  Religion: ["religion", "reli"],
  Sport: ["sport"],
  Musik: ["musik"],
  Kunst: ["kunst"],
};

const wochentage = [
  "sonntag",
  "montag",
  "dienstag",
  "mittwoch",
  "donnerstag",
  "freitag",
  "samstag",
];

const iso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const plusTage = (von, n) => {
  const d = new Date(von.getFullYear(), von.getMonth(), von.getDate());
  d.setDate(d.getDate() + n);
  return d;
};
function naechsterWochentag(von, ziel) {
  const heute = von.getDay();
  let diff = (ziel - heute + 7) % 7;
  if (diff === 0) diff = 7; // "bis Montag" am Montag = nächster Montag
  return plusTage(von, diff);
}

export function parseAufgabe(text, jetzt = new Date()) {
  const roh = (text || "").trim();
  if (!roh) return null;
  const lower = roh.toLowerCase();

  let fach = "Allgemein";
  for (const [f, syns] of Object.entries(synonyme)) {
    if (syns.some((s) => lower.includes(s))) {
      fach = f;
      break;
    }
  }

  let faellig = null;
  let fristWort = null;
  const bis = lower.match(/bis\s+([a-zäöü0-9.]+)/);
  if (bis) {
    const w = bis[1];
    const tageMap = { heute: 0, morgen: 1, übermorgen: 2, uebermorgen: 2 };
    if (w in tageMap) {
      faellig = iso(plusTage(jetzt, tageMap[w]));
      fristWort = bis[0];
    } else {
      const wd = wochentage.indexOf(w.replace(/[^a-zäöü]/g, ""));
      if (wd >= 0) {
        faellig = iso(naechsterWochentag(jetzt, wd));
        fristWort = bis[0];
      } else {
        const d = w.match(/^(\d{1,2})\.(\d{1,2})\.?$/);
        if (d) {
          const tag = +d[1];
          const monat = +d[2];
          let jahr = jetzt.getFullYear();
          if (monat - 1 < jetzt.getMonth()) jahr += 1;
          faellig = iso(new Date(jahr, monat - 1, tag));
          fristWort = bis[0];
        }
      }
    }
  }
  if (!faellig) faellig = iso(plusTage(jetzt, 1)); // Standard: morgen

  let titel = roh;
  if (fristWort) titel = titel.replace(new RegExp(fristWort, "i"), "");
  // Führendes Fach-Wort entfernen (Chip zeigt das Fach bereits).
  const ersteWort = titel.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-zäöü]/g, "");
  const alleSyns = Object.values(synonyme).flat();
  if (ersteWort && (alleSyns.includes(ersteWort) || ersteWort === fach.toLowerCase())) {
    titel = titel.trim().replace(/^\S+\s*/, "");
  }
  titel = titel.replace(/\s{2,}/g, " ").replace(/[\s,]+$/, "").trim();
  if (!titel) titel = "Neue Aufgabe";

  return {
    id: "u-" + Date.now(),
    fach,
    titel,
    faellig,
    dauer: 20,
    prio: "normal",
    typ: "hausaufgabe",
    eigen: true,
  };
}
