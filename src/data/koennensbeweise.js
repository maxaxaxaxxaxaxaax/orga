// Könnensbeweise (KB) der Etappe – nach dem analogen Planungsblatt des Theresianum.
// Einheit: Clusterstunden (Uhr-Symbole). Ziel: 10 Clusterstunden pro Woche.
// cluster = Anzahl Clusterstunden, die ein KB kostet.

export const wochenZielCluster = 10;
// Die Etappe (Ostern → Pfingsten) umfasst mehrere Wochen, auf die man die KBs verteilt.
export const etappeWochen = 6;

// Reihenfolge wie auf dem Schulplaner-Blatt.
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
  Englisch: "Unit 5/Band 2",
  Deutsch: "Sachtexte „Reise um die Welt“",
  Mathematik: "Negative Zahlen und Rechendiplom",
  Griechisch: "Lektion 1/2",
};

// Quelle: Foto des Theresianum-Schulplaner-Blatts „Meine Könnensbeweise (KB) in der
// Etappe 7 A". Titel, Cluster-Anzahl und Themen 1:1 vom Blatt übernommen.
export const koennensbeweise = [
  // Latein - Lektion 14/15
  { id: "7LA1", fach: "Latein", code: "7 L A1", titel: "Vokabeln L14", cluster: 1 },
  { id: "7LA2", fach: "Latein", code: "7 L A2", titel: "ACI mit Übersetzung", cluster: 4 },
  { id: "7LA3", fach: "Latein", code: "7 L A3", titel: "Adj. kons. Dekl. (Wdh. Dekl.)", cluster: 2 },
  { id: "7LA4", fach: "Latein", code: "7 L A4", titel: "Vokabeln L15 / Pronomen", cluster: 2 },
  { id: "7LA5", fach: "Latein", code: "7 L A5", titel: "Lektionstext 15", cluster: 2 },

  // Englisch - Unit 5/Band 2
  { id: "7EA1", fach: "Englisch", code: "7 E A1", titel: "Revision simple past", cluster: 2 },
  { id: "7EA2", fach: "Englisch", code: "7 E A2", titel: "Vocabulary unit 5, pp. 84–93", cluster: 1 },
  { id: "7EA3", fach: "Englisch", code: "7 E A3", titel: "will-future · question tags · if-clause I", cluster: 4 },
  { id: "7EA4", fach: "Englisch", code: "7 E A4", titel: "Vocabulary unit 5, pp. 94–99", cluster: 1 },
  { id: "7EA5", fach: "Englisch", code: "7 E A5", titel: "Everyday English: Dialog am Info-Center", cluster: 4 },

  // Deutsch - Sachtexte
  { id: "7DA1", fach: "Deutsch", code: "7 D A1", titel: "Mini-Vortrag", cluster: 3 },
  { id: "7DA2", fach: "Deutsch", code: "7 D A2", titel: "Lernplakat", cluster: 4 },
  { id: "7DA3", fach: "Deutsch", code: "7 D A3/A4", titel: "Lapbook", cluster: 5 },

  // Mathematik - Negative Zahlen und Rechendiplom
  { id: "7MA1", fach: "Mathematik", code: "7 M A1", titel: "Grundlagen negative Zahlen", cluster: 3 },
  { id: "7MA2", fach: "Mathematik", code: "7 M A2", titel: "Addieren & Subtrahieren negativer Zahlen", cluster: 2 },
  { id: "7MA3", fach: "Mathematik", code: "7 M A3", titel: "Multiplikation & Division negativer Zahlen", cluster: 2 },
  { id: "7MA4", fach: "Mathematik", code: "7 M A4", titel: "Rechengesetze mit negativen Zahlen", cluster: 5 },
  { id: "7MA5", fach: "Mathematik", code: "7 M A5", titel: "Rechendiplom", cluster: 4 },

  // Griechisch - Lektion 1/2
  { id: "7GA1", fach: "Griechisch", code: "7 G A1", titel: "Griechische Buchstaben und Lautlehre", cluster: 2 },
  { id: "7GA2", fach: "Griechisch", code: "7 G A2", titel: "Vokabeln L 1", cluster: 1 },
  { id: "7GA3", fach: "Griechisch", code: "7 G A3", titel: "a-Deklination im Singular", cluster: 2 },
  { id: "7GA4", fach: "Griechisch", code: "7 G A4", titel: "Vokabeln L 2", cluster: 1 },
  { id: "7GA5", fach: "Griechisch", code: "7 G A5", titel: "Übersetzung L 2", cluster: 2 },
];

// Aufhol-Hilfe: zugeteilter Pflicht-KB. gesperrtesFach optional (null = nichts gesperrt).
export const systemHinweis = {
  text: "Starte die Etappe mit dem zugeteilten Mathe-Könnensbeweis. Alles andere kannst du frei verteilen.",
  pflichtId: "7MA1",
  gesperrtesFach: null,
};

// Vorab zugeordnet ist nur der zugeteilte Pflicht-KB (in Woche 1 = Index 0).
export const startZuordnung = { "7MA1": 0 };
