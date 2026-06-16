// Wochenstundenplan als rhythmisierter Ganztag (Theresianum Mainz, Klasse 7a
// altsprachlich). Doppelstunden/Blöcke statt 45-Min-Takt, Mittagessen, betreute
// Studierzeit, Neigungsgruppe, FREI DAY und ZEuS-Projekt; Mittwoch endet früher.
// tag: 0=Mo … 4=Fr. Zeiten "HH:MM".
// art: "angeleitet" | "anker" | "selbst" | "studierzeit" | "pause" | "projekt" | "neigung"

export const fachFarbe = {
  Deutsch: "#e8590c",
  Mathematik: "#3b5bdb",
  Englisch: "#f59f00",
  Latein: "#7048e8",
  Griechisch: "#0c8599",
  Biologie: "#2f9e44",
  Geschichte: "#9c36b5",
  Erdkunde: "#2b8a3e",
  Religion: "#845ef7",
  Musik: "#e64980",
  Kunst: "#f08c00",
  Sport: "#fa5252",
  Studierzeit: "#868e96",
  Mittagessen: "#adb5bd",
  Neigungsgruppe: "#fab005",
  "FREI DAY": "#12b886",
  ZEuS: "#15aabf",
};

// Beschriftung der Lernform (Tag im Kalender / in der Agenda).
export const artLabel = {
  angeleitet: "Unterricht",
  anker: "Ankerstunde",
  selbst: "selbstreguliert",
  studierzeit: "betreut",
};

export const tageKurz = ["Mo", "Di", "Mi", "Do", "Fr"];
export const tageLang = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];

export const tagStart = "08:00";
export const tagEnde = "15:30";

const A = "angeleitet";

export const stundenWoche = [
  // Montag
  { tag: 0, von: "08:00", bis: "09:30", fach: "Deutsch", raum: "204", art: A },
  { tag: 0, von: "09:50", bis: "11:20", fach: "Mathematik", raum: "Cluster 7", art: "anker" },
  { tag: 0, von: "11:40", bis: "13:10", fach: "Latein", raum: "118", art: A },
  { tag: 0, von: "13:10", bis: "13:55", fach: "Mittagessen", raum: "Mensa", art: "pause" },
  { tag: 0, von: "14:00", bis: "15:30", fach: "Studierzeit", raum: "Cluster 7", art: "studierzeit" },

  // Dienstag
  { tag: 1, von: "08:00", bis: "09:30", fach: "Englisch", raum: "118", art: A },
  { tag: 1, von: "09:50", bis: "11:20", fach: "Mathematik", raum: "Cluster 7", art: "selbst" },
  { tag: 1, von: "11:40", bis: "13:10", fach: "Biologie", raum: "Bio 2", art: A },
  { tag: 1, von: "13:10", bis: "13:55", fach: "Mittagessen", raum: "Mensa", art: "pause" },
  { tag: 1, von: "14:00", bis: "15:30", fach: "ZEuS", raum: "Projektraum", art: "projekt" },

  // Mittwoch (kurzer Tag, endet ~13:15)
  { tag: 2, von: "08:00", bis: "09:30", fach: "Griechisch", raum: "120", art: A },
  { tag: 2, von: "09:50", bis: "11:20", fach: "Deutsch", raum: "204", art: A },
  { tag: 2, von: "11:40", bis: "13:10", fach: "Geschichte", raum: "203", art: A },

  // Donnerstag (heute)
  { tag: 3, von: "08:00", bis: "09:30", fach: "Mathematik", raum: "Cluster 7", art: "anker" },
  { tag: 3, von: "09:50", bis: "11:20", fach: "Latein", raum: "118", art: "anker" },
  { tag: 3, von: "11:40", bis: "13:10", fach: "Sport", raum: "Halle", art: A },
  { tag: 3, von: "13:10", bis: "13:55", fach: "Mittagessen", raum: "Mensa", art: "pause" },
  { tag: 3, von: "14:00", bis: "15:30", fach: "Studierzeit", raum: "Cluster 7", art: "studierzeit" },

  // Freitag
  { tag: 4, von: "08:00", bis: "09:30", fach: "Latein", raum: "118", art: "anker" },
  { tag: 4, von: "09:50", bis: "11:20", fach: "Erdkunde", raum: "201", art: A },
  { tag: 4, von: "11:40", bis: "13:10", fach: "Religion", raum: "Kapelle", art: A },
  { tag: 4, von: "13:10", bis: "13:55", fach: "Mittagessen", raum: "Mensa", art: "pause" },
  { tag: 4, von: "14:00", bis: "15:30", fach: "FREI DAY", raum: "Projektraum", art: "projekt" },
];

// Hauptfächer (Kernfächer der Schule). In diesen Fächern arbeitet der Schüler an
// Könnensbeweisen, daher sind alle Hauptfach-Stunden im Wochenplan mit einem KB
// belegbar, dazu die betreute Studierzeit. Nebenfächer, Projekte (ZEuS/FREI DAY),
// Neigungsgruppen und Pausen sind nicht belegbar.
export const hauptfaecher = [
  "Deutsch",
  "Mathematik",
  "Englisch",
  "Französisch",
  "Latein",
  "Griechisch",
];

export function istBelegbar(stunde) {
  if (stunde.art === "pause") return false;
  return stunde.fach === "Studierzeit" || hauptfaecher.includes(stunde.fach);
}

// Stabile ID einer Stunde im Wochenraster (Tag + Startzeit).
export function stundenId(stunde) {
  return stunde.tag + "-" + stunde.von;
}

// Heutiger Wochentag als Index (Mo=0..Fr=4), -1 am Wochenende.
export function heuteIndex(d = new Date()) {
  const js = d.getDay();
  return js === 0 || js === 6 ? -1 : js - 1;
}

// Heutige Stunden, sortiert.
export function stundenHeute(d = new Date()) {
  const idx = heuteIndex(d);
  if (idx < 0) return [];
  return stundenWoche.filter((s) => s.tag === idx);
}
