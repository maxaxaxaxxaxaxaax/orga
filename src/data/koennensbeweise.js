// Könnensbeweise (KB) der Etappe – nach dem analogen Planungsblatt des Theresianum.
// Einheit: Clusterstunden (Uhr-Symbole). Ziel: 10 Clusterstunden pro Woche.
// cluster = Anzahl Clusterstunden, die ein KB kostet.

export const wochenZielCluster = 10;
// Die Etappe (Ostern → Pfingsten) umfasst mehrere Wochen, auf die man die KBs verteilt.
export const etappeWochen = 6;

// Reihenfolge wie auf dem Schulplaner-Blatt.
export const kbFaecher = ["Mathematik", "Deutsch", "Englisch", "Französisch"];

export const kbFarbe = {
  Latein: "#7048e8",
  Englisch: "#FF7DA9",
  Deutsch: "#61DA85",
  Mathematik: "#7DC0FE",
  Griechisch: "#0c8599",
  Französisch: "#FFE37D",
};

export const kbThemen = {
  Mathematik: "Negative Zahlen und Rechendiplom",
  Deutsch: "Sachtexte „Reise um die Welt“",
  Englisch: "Unit 5/Band 2",
  Französisch: "Unité 3 / Les loisirs",
};

// Quelle: Foto des Theresianum-Schulplaner-Blatts „Meine Könnensbeweise (KB) in der
// Etappe 7 A". Titel, Cluster-Anzahl und Themen 1:1 vom Blatt übernommen.
export const koennensbeweise = [
  // Mathematik - Negative Zahlen und Rechendiplom
  { id: "7MA1", fach: "Mathematik", code: "7 M A1", titel: "Grundlagen negative Zahlen", cluster: 3 },
  { id: "7MA2", fach: "Mathematik", code: "7 M A2", titel: "Addieren & Subtrahieren negativer Zahlen", cluster: 2 },
  { id: "7MA3", fach: "Mathematik", code: "7 M A3", titel: "Multiplikation & Division negativer Zahlen", cluster: 2 },
  { id: "7MA4", fach: "Mathematik", code: "7 M A4", titel: "Rechengesetze mit negativen Zahlen", cluster: 5 },
  { id: "7MA5", fach: "Mathematik", code: "7 M A5", titel: "Rechendiplom", cluster: 4 },

  // Deutsch - Sachtexte
  { id: "7DA1", fach: "Deutsch", code: "7 D A1", titel: "Mini-Vortrag", cluster: 3 },
  { id: "7DA2", fach: "Deutsch", code: "7 D A2", titel: "Lernplakat", cluster: 4 },
  { id: "7DA3", fach: "Deutsch", code: "7 D A3/A4", titel: "Lapbook", cluster: 5 },

  // Englisch - Unit 5/Band 2
  { id: "7EA1", fach: "Englisch", code: "7 E A1", titel: "Revision simple past", cluster: 2 },
  { id: "7EA2", fach: "Englisch", code: "7 E A2", titel: "Vocabulary unit 5, pp. 84–93", cluster: 1 },
  { id: "7EA3", fach: "Englisch", code: "7 E A3", titel: "will-future · question tags · if-clause I", cluster: 4 },
  { id: "7EA4", fach: "Englisch", code: "7 E A4", titel: "Vocabulary unit 5, pp. 94–99", cluster: 1 },
  { id: "7EA5", fach: "Englisch", code: "7 E A5", titel: "Everyday English: Dialog am Info-Center", cluster: 4 },

  // Französisch - Unité 3 / Les loisirs
  { id: "7FA1", fach: "Französisch", code: "7 F A1", titel: "Vocabulaire Unité 3", cluster: 1 },
  { id: "7FA2", fach: "Französisch", code: "7 F A2", titel: "Présent: verbes en -ir", cluster: 2 },
  { id: "7FA3", fach: "Französisch", code: "7 F A3", titel: "Le passé composé avec avoir", cluster: 3 },
  { id: "7FA4", fach: "Französisch", code: "7 F A4", titel: "Vocabulaire: les loisirs", cluster: 1 },
  { id: "7FA5", fach: "Französisch", code: "7 F A5", titel: "Lektüre & Dialog: Au café", cluster: 3 },
];

// Aufhol-Hilfe: zugeteilter Pflicht-KB. gesperrtesFach optional (null = nichts gesperrt).
export const systemHinweis = {
  text: "Starte die Etappe mit dem zugeteilten Mathe-Könnensbeweis. Alles andere kannst du frei verteilen.",
  pflichtId: "7MA1",
  gesperrtesFach: null,
};

// Vorab zugeordnet ist nur der zugeteilte Pflicht-KB (in Woche 1 = Index 0).
export const startZuordnung = { "7MA1": 0 };
