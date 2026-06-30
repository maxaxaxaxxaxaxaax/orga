// Wochenstundenplan als realistischer Gymnasium-Plan (Klasse 7a) mit 45-Minuten-
// Einzelstunden in Blöcken (Doppelstunden-Paare), zwei großen Pausen, Mittagessen
// und betreuter Studierzeit (LZ). Mittwoch endet früher. Vorbild: ein echter
// altsprachlicher Stundenplan; in der Demo bleibt Französisch das 4. Hauptfach
// (dort liegen die Könnensbeweise), die übrigen sind feste Nebenfächer.
// tag: 0=Mo … 4=Fr. Zeiten "HH:MM".
// art: "angeleitet" | "anker" | "selbst" | "studierzeit" | "pause"

export const fachFarbe = {
  Deutsch: "#61DA85",
  Mathematik: "#7DC0FE",
  Englisch: "#FF7DA9",
  Französisch: "#FFE37D",
  Latein: "#7048e8",
  Griechisch: "#0c8599",
  Biologie: "#2f9e44",
  Chemie: "#0ca678",
  Physik: "#4263eb",
  Geschichte: "#9c36b5",
  Erdkunde: "#2b8a3e",
  Sozialkunde: "#e8590c",
  Religion: "#845ef7",
  Musik: "#e64980",
  Kunst: "#f08c00",
  Sport: "#fa5252",
  KS: "#495057",
  Studierzeit: "#868e96",
  Mittagessen: "#adb5bd",
};

// Fachlehrkräfte (Kürzel) für die Stundenplan-Anzeige. Pro Fach eine feste
// Lehrkraft. Die betreute Studierzeit übernimmt der Lerncoach (Fr. Berg).
// Pausen, Projekte (ZEuS/FREI DAY) und Neigungsgruppen haben keine feste Lehrkraft.
export const lehrkraefte = {
  Deutsch: "Hofer",
  Mathematik: "Brandt",
  Französisch: "Mercier",
  Englisch: "Walsh",
  Biologie: "Krüger",
  Chemie: "Lang",
  Physik: "Roth",
  Latein: "Gerber",
  Griechisch: "Gerber",
  Geschichte: "Seidel",
  Erdkunde: "Vogt",
  Sozialkunde: "Frey",
  Religion: "Adler",
  Musik: "Wieland",
  Sport: "Kern",
  Studierzeit: "Fr. Berg",
};

// Beschriftung der Lernform (Tag im Kalender / in der Agenda).
export const artLabel = {
  angeleitet: "Unterricht",
  anker: "Ankerstunde",
  selbst: "Selbstreguliert",
  studierzeit: "Betreut",
};

export const tageKurz = ["Mo", "Di", "Mi", "Do", "Fr"];
export const tageLang = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];

export const tagStart = "08:00";
export const tagEnde = "16:00";

const A = "angeleitet";

// 45-Minuten-Takt in drei Blöcken (1./2., 3./4., 5./6.) mit zwei großen Pausen,
// danach Mittagspause und Nachmittagsblock (7./8./9.). Mittwoch und Freitag sind
// kurze Tage (enden nach der 6. Stunde). Fächer 1:1 nach dem Vorbild-Stundenplan
// (altsprachlich: Latein + Griechisch). Hauptfächer (Mathe, Deutsch, Englisch,
// Französisch) und Studierzeit (LZ) sind frei beplanbar (istBelegbar); alle
// übrigen Fächer (auch Latein/Griechisch, da ohne Könnensbeweis-Inhalt) liegen
// fest. Lehrkraft-/Raum-Namen sind frei gewählt (im Vorbild nur Kürzel).
export const stundenWoche = [
  // Montag
  { tag: 0, von: "08:00", bis: "08:45", fach: "Musik", raum: "Musiksaal", art: A },
  { tag: 0, von: "08:45", bis: "09:30", fach: "Musik", raum: "Musiksaal", art: A },
  { tag: 0, von: "09:50", bis: "10:35", fach: "Erdkunde", raum: "201", art: A },
  { tag: 0, von: "10:35", bis: "11:20", fach: "Deutsch", raum: "204", art: "anker" },
  { tag: 0, von: "11:40", bis: "12:25", fach: "Sport", raum: "Sporthalle", art: A },
  { tag: 0, von: "12:25", bis: "13:10", fach: "Sport", raum: "Sporthalle", art: A },
  { tag: 0, von: "13:45", bis: "14:30", fach: "Studierzeit", raum: "Cluster 7", art: "studierzeit" },
  { tag: 0, von: "14:30", bis: "15:15", fach: "Mathematik", raum: "Cluster 7", art: "anker" },
  { tag: 0, von: "15:15", bis: "16:00", fach: "Mathematik", raum: "Cluster 7", art: A },

  // Dienstag
  { tag: 1, von: "08:00", bis: "08:45", fach: "Geschichte", raum: "203", art: A },
  { tag: 1, von: "08:45", bis: "09:30", fach: "Englisch", raum: "118", art: "anker" },
  { tag: 1, von: "09:50", bis: "10:35", fach: "Chemie", raum: "Chemie 2", art: A },
  { tag: 1, von: "10:35", bis: "11:20", fach: "Chemie", raum: "Chemie 2", art: A },
  { tag: 1, von: "11:40", bis: "12:25", fach: "Biologie", raum: "Bio 1", art: A },
  { tag: 1, von: "12:25", bis: "13:10", fach: "Griechisch", raum: "119", art: A },
  { tag: 1, von: "13:45", bis: "14:30", fach: "Studierzeit", raum: "Cluster 7", art: "studierzeit" },
  { tag: 1, von: "14:30", bis: "15:15", fach: "Latein", raum: "117", art: A },
  { tag: 1, von: "15:15", bis: "16:00", fach: "Latein", raum: "117", art: A },

  // Mittwoch (kurzer Tag, endet nach der 6. Stunde)
  { tag: 2, von: "08:00", bis: "08:45", fach: "Erdkunde", raum: "201", art: A },
  { tag: 2, von: "08:45", bis: "09:30", fach: "Biologie", raum: "Bio 1", art: A },
  { tag: 2, von: "09:50", bis: "10:35", fach: "Griechisch", raum: "119", art: A },
  { tag: 2, von: "10:35", bis: "11:20", fach: "Griechisch", raum: "119", art: A },
  { tag: 2, von: "11:40", bis: "12:25", fach: "Religion", raum: "Kapelle", art: A },
  { tag: 2, von: "12:25", bis: "13:10", fach: "Latein", raum: "117", art: A },

  // Donnerstag
  { tag: 3, von: "08:00", bis: "08:45", fach: "Religion", raum: "Kapelle", art: A },
  { tag: 3, von: "08:45", bis: "09:30", fach: "Deutsch", raum: "204", art: "anker" },
  { tag: 3, von: "09:50", bis: "10:35", fach: "KS", raum: "211", art: A },
  { tag: 3, von: "10:35", bis: "11:20", fach: "Sozialkunde", raum: "202", art: A },
  { tag: 3, von: "11:40", bis: "12:25", fach: "Deutsch", raum: "204", art: A },
  { tag: 3, von: "12:25", bis: "13:10", fach: "Englisch", raum: "118", art: A },
  { tag: 3, von: "13:45", bis: "14:30", fach: "Studierzeit", raum: "Cluster 7", art: "studierzeit" },
  { tag: 3, von: "14:30", bis: "15:15", fach: "Englisch", raum: "118", art: A },
  { tag: 3, von: "15:15", bis: "16:00", fach: "Latein", raum: "117", art: A },

  // Freitag (kurzer Tag, endet nach der 6. Stunde)
  { tag: 4, von: "08:00", bis: "08:45", fach: "Mathematik", raum: "Cluster 7", art: A },
  { tag: 4, von: "08:45", bis: "09:30", fach: "Geschichte", raum: "203", art: A },
  { tag: 4, von: "09:50", bis: "10:35", fach: "Mathematik", raum: "Cluster 7", art: A },
  { tag: 4, von: "10:35", bis: "11:20", fach: "Sozialkunde", raum: "202", art: A },
  { tag: 4, von: "11:40", bis: "12:25", fach: "Physik", raum: "Physik 1", art: A },
  { tag: 4, von: "12:25", bis: "13:10", fach: "Physik", raum: "Physik 1", art: A },
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
