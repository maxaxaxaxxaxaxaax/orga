// Könnensbeweise (KB) der Etappe – nach dem analogen Planungsblatt des Theresianum.
// Einheit: Clusterstunden (Uhr-Symbole). Ziel: 10 Clusterstunden pro Woche.
// cluster = Anzahl Clusterstunden, die ein KB kostet.

export const wochenZielCluster = 10;
// Die Etappe (Ostern → Pfingsten) umfasst mehrere Wochen, auf die man die KBs verteilt.
export const etappeWochen = 6;

export const kbFaecher = ["Latein", "Englisch", "Deutsch", "Mathematik", "Griechisch"];

export const kbFarbe = {
  Latein: "#7048e8",
  Englisch: "#f59f00",
  Deutsch: "#e8590c",
  Mathematik: "#3b5bdb",
  Griechisch: "#0c8599",
};

export const kbThemen = {
  Latein: "Lektion 14/15",
  Englisch: "Unit 5 / Band 2",
  Deutsch: "Sachtexte „Reise um die Welt“",
  Mathematik: "Lineare Funktionen",
  Griechisch: "Lektion 1/2",
};

export const koennensbeweise = [
  // Latein
  { id: "7LA1", fach: "Latein", code: "7 L A1", titel: "Vokabeln L14", cluster: 1 },
  { id: "7LA2", fach: "Latein", code: "7 L A2", titel: "ACI mit Übersetzung", cluster: 4 },
  { id: "7LA3", fach: "Latein", code: "7 L A3", titel: "Adj. kons. Deklination (Wdh.)", cluster: 2 },
  { id: "7LA4", fach: "Latein", code: "7 L A4", titel: "Vokabeln L15 / Pronomen", cluster: 2 },
  { id: "7LA5", fach: "Latein", code: "7 L A5", titel: "Lektionstext 15", cluster: 2 },

  // Englisch
  { id: "7EA1", fach: "Englisch", code: "7 E A1", titel: "Revision: simple past", cluster: 2 },
  { id: "7EA2", fach: "Englisch", code: "7 E A2", titel: "Vocabulary Unit 5, S. 84–93", cluster: 1 },
  { id: "7EA3", fach: "Englisch", code: "7 E A3", titel: "will-future, question tags, if-clause I", cluster: 4 },
  { id: "7EA4", fach: "Englisch", code: "7 E A4", titel: "Vocabulary Unit 5, S. 94–99", cluster: 1 },
  { id: "7EA5", fach: "Englisch", code: "7 E A5", titel: "Everyday English: Dialog am Info-Center", cluster: 4 },

  // Deutsch
  { id: "7DA1", fach: "Deutsch", code: "7 D A1", titel: "Mini-Vortrag", cluster: 3 },
  { id: "7DA2", fach: "Deutsch", code: "7 D A2", titel: "Lernplakat", cluster: 4 },
  { id: "7DA3", fach: "Deutsch", code: "7 D A3/A4", titel: "Lapbook", cluster: 5 },

  // Mathematik
  { id: "7MA1", fach: "Mathematik", code: "7 M A1", titel: "Wertetabelle & Graph zeichnen", cluster: 3 },
  { id: "7MA2", fach: "Mathematik", code: "7 M A2", titel: "Steigung m bestimmen", cluster: 2 },
  { id: "7MA3", fach: "Mathematik", code: "7 M A3", titel: "y-Achsenabschnitt ablesen", cluster: 2 },
  { id: "7MA4", fach: "Mathematik", code: "7 M A4", titel: "Geradengleichung aufstellen", cluster: 5 },
  { id: "7MA5", fach: "Mathematik", code: "7 M A5", titel: "Anwendungsaufgaben & Check", cluster: 4 },

  // Griechisch
  { id: "7GA1", fach: "Griechisch", code: "7 G A1", titel: "Griechische Buchstaben & Lautlehre", cluster: 2 },
  { id: "7GA2", fach: "Griechisch", code: "7 G A2", titel: "Vokabeln L1", cluster: 1 },
  { id: "7GA3", fach: "Griechisch", code: "7 G A3", titel: "o-Deklination (Singular)", cluster: 2 },
  { id: "7GA4", fach: "Griechisch", code: "7 G A4", titel: "Vokabeln L2", cluster: 1 },
  { id: "7GA5", fach: "Griechisch", code: "7 G A5", titel: "Übersetzung L2", cluster: 2 },
];

// Aufhol-Hilfe: zugeteilter Pflicht-KB + gesperrtes Fach bis zum Aufholen.
export const systemHinweis = {
  text: "Du hast zuletzt vor allem Deutsch bearbeitet. Mathe ist zurückgefallen: erledige zuerst den zugeteilten Mathe-Könnensbeweis, dann wird Deutsch wieder freigeschaltet.",
  pflichtId: "7MA1",
  gesperrtesFach: "Deutsch",
};

// Vorab zugeordnet ist nur der zugeteilte Pflicht-KB (in Woche 1 = Index 0).
export const startZuordnung = { "7MA1": 0 };
