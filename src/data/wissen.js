// Wissen pro Fach: jeder Lernweg gehört zu einem Etappenziel (Könnensbeweis, kbId).
// Schritte = die kleinen To-dos auf dem Weg zum KB. Materialien hängen über
// `thema === themen[].label` an einem Lernweg. So findet der Schüler im
// Wissen-Tab alles, was er für seinen aktuellen KB braucht.
// Im Wissen liegen nur Fächer mit echten Etappenzielen (Schulplaner Klasse 7).
// Stundenplan-Fächer ohne aktuellen KB (z. B. Bio, Geschichte) tauchen hier
// bewusst nicht auf, damit nichts „ohne Lernweg" angezeigt wird.

import { MATHE_LANDKARTE } from "./matheLandkarte";
import { DEUTSCH_LANDKARTE } from "./deutschLandkarte";
import { ENGLISCH_LANDKARTE } from "./englischLandkarte";
import { LERNZETTEL } from "./lernzettel";

export const faecher = [
  {
    id: "mathe",
    fach: "Mathematik",
    farbe: "#7DC0FE",
    themen: [
      { id: "grundlagen", label: "Grundlagen negative Zahlen", etappe: 4, kbId: "7MA1", kategorie: "Mathematische Grundlagen", subkategorie: "Negative Zahlen", schritte: [
        { text: "Lernzettel lesen: negative Zahlen", material: "lz-ma-1", fertig: false },
        { text: "Am Zahlenstrahl ablesen und vergleichen", material: "m1", fertig: false },
        { text: "Plus und Minus am Zahlenstrahl rechnen", material: "m2", fertig: false },
      ] },
      { id: "addsub", label: "Addieren & Subtrahieren", etappe: 4, kbId: "7MA2", kategorie: "Mathematische Grundlagen", subkategorie: "Negative Zahlen", schritte: [
        { text: "Lernzettel lesen: Plus und Minus mit Vorzeichen", material: "lz-ma-2", fertig: false },
        { text: "Plus und Minus mit Vorzeichen üben", material: "m7", fertig: false },
      ] },
      { id: "muldiv", label: "Multiplikation & Division", etappe: 4, kbId: "7MA3", kategorie: "Mathematische Grundlagen", subkategorie: "Negative Zahlen", schritte: [
        { text: "Lernzettel lesen: Mal und Geteilt mit Vorzeichen", material: "lz-ma-3", fertig: false },
        { text: "Mal und Geteilt üben", material: "m8", fertig: false },
      ] },
      { id: "rechengesetze", label: "Rechengesetze mit Vorzeichen", etappe: 4, kbId: "7MA4", kategorie: "Mathematische Grundlagen", subkategorie: "Negative Zahlen", schritte: [
        { text: "Lernzettel lesen: Klammern und Rechengesetze", material: "lz-ma-4", fertig: false },
        { text: "Rechenschritte in die richtige Reihenfolge bringen", material: "m5", fertig: false },
      ] },
      { id: "rechendiplom", label: "Rechendiplom", etappe: 4, kbId: "7MA5", kategorie: "Mathematische Grundlagen", subkategorie: "Negative Zahlen", schritte: [
        { text: "Spickzettel lesen: so bestehe ich das Diplom", material: "lz-ma-5", fertig: false },
        { text: "Gemischtes Probe-Diplom rechnen", material: "m6", fertig: false },
      ] },
      // Landkarte der ganzen Schulmathematik (7 Kategorien, nur Ueberblick/Fortschritt).
      ...MATHE_LANDKARTE,
    ],
    verknuepfungen: [
      ["grundlagen", "addsub"],
      ["addsub", "muldiv"],
      ["muldiv", "rechengesetze"],
      ["rechengesetze", "rechendiplom"],
    ],
    materialien: [
      ...LERNZETTEL.mathe,
      { id: "m1", thema: "Grundlagen negative Zahlen", titel: "Mitschrift: Zahlengerade", art: "notiz", bereich: "unterricht", datum: "2026-04-21" },
      { id: "m2", thema: "Grundlagen negative Zahlen", titel: "Arbeitsblatt: Vorzeichen-Memo", art: "arbeitsblatt", bereich: "unterricht", datum: "2026-04-22" },
      { id: "m3", thema: "Addieren & Subtrahieren", titel: "Spickzettel: Plus- und Minus-Regeln", art: "notiz", bereich: "selbstlernen", datum: "2026-04-28" },
      { id: "m4", thema: "Multiplikation & Division", titel: "Übersicht: Vorzeichen bei Mal & Geteilt", art: "zusammenfassung", bereich: "selbstlernen", datum: "2026-05-05" },
      { id: "m5", thema: "Rechengesetze mit Vorzeichen", titel: "Arbeitsblatt: Klammern auflösen", art: "arbeitsblatt", bereich: "unterricht", datum: "2026-05-12" },
      { id: "m6", thema: "Rechendiplom", titel: "Probe-Rechendiplom (Vorlage)", art: "pdf", bereich: "selbstlernen", datum: "2026-05-19" },
      { id: "m7", thema: "Addieren & Subtrahieren", titel: "Übung: Plus und Minus rechnen", art: "arbeitsblatt", bereich: "selbstlernen", datum: "2026-04-29" },
      { id: "m8", thema: "Multiplikation & Division", titel: "Übung: Mal und Geteilt rechnen", art: "arbeitsblatt", bereich: "selbstlernen", datum: "2026-05-06" },
    ],
  },
  {
    id: "deutsch",
    fach: "Deutsch",
    farbe: "#75E0A0",
    themen: [
      { id: "mini-vortrag", label: "Mini-Vortrag", etappe: 4, kbId: "7DA1", kategorie: "Textarten und Schreiben", subkategorie: "Präsentieren und Gestalten", schritte: [
        { text: "Lernzettel lesen: Mini-Vortrag halten", material: "lz-de-1", fertig: false },
        { text: "Aufbau eines Vortrags zuordnen", material: "d1", fertig: false },
        { text: "Vortrags-Tipps zuordnen", material: "d2", fertig: false },
        { text: "Mini-Vortrag: Situationen entscheiden", material: "d6", fertig: false },
      ] },
      { id: "lernplakat", label: "Lernplakat", etappe: 4, kbId: "7DA2", kategorie: "Textarten und Schreiben", subkategorie: "Präsentieren und Gestalten", schritte: [
        { text: "Lernzettel lesen: Lernplakat gestalten", material: "lz-de-2", fertig: false },
        { text: "Lernplakat gestalten: Quiz", material: "d7", fertig: false },
      ] },
      { id: "lapbook", label: "Lapbook", etappe: 4, kbId: "7DA3", kategorie: "Textarten und Schreiben", subkategorie: "Präsentieren und Gestalten", schritte: [
        { text: "Lernzettel lesen: Lapbook erstellen", material: "lz-de-3", fertig: false },
        { text: "Stationen der Weltreise ordnen", material: "d5", fertig: false },
      ] },
      ...DEUTSCH_LANDKARTE,
    ],
    verknuepfungen: [
      ["mini-vortrag", "lernplakat"],
      ["lernplakat", "lapbook"],
    ],
    materialien: [
      ...LERNZETTEL.deutsch,
      { id: "d6", thema: "Mini-Vortrag", titel: "Übung: Mini-Vortrag", art: "arbeitsblatt", bereich: "selbstlernen", datum: "2026-05-18" },
      { id: "d7", thema: "Lernplakat", titel: "Übung: Lernplakat gestalten", art: "arbeitsblatt", bereich: "selbstlernen", datum: "2026-05-19" },
      { id: "d1", thema: "Mini-Vortrag", titel: "Mitschrift: Aufbau eines Mini-Vortrags", art: "notiz", bereich: "unterricht", datum: "2026-04-21" },
      { id: "d2", thema: "Mini-Vortrag", titel: "Checkliste: Laut sprechen, Blickkontakt", art: "zusammenfassung", bereich: "selbstlernen", datum: "2026-04-22" },
      { id: "d3", thema: "Lernplakat", titel: "Arbeitsblatt: Lernplakat-Vorlage", art: "arbeitsblatt", bereich: "unterricht", datum: "2026-04-28" },
      { id: "d4", thema: "Lapbook", titel: "Bastelvorlage: Lapbook-Klappen", art: "pdf", bereich: "selbstlernen", datum: "2026-05-05" },
      { id: "d5", thema: "Lapbook", titel: "Mitschrift: Sachtexte „Reise um die Welt“", art: "notiz", bereich: "unterricht", datum: "2026-05-12" },
    ],
  },
  {
    id: "englisch",
    fach: "Englisch",
    farbe: "#FF7DA9",
    themen: [
      { id: "simple-past", label: "Revision simple past", etappe: 4, kbId: "7EA1", kategorie: "Zeitformen", subkategorie: "Vergangenheit", schritte: [
        { text: "Lernzettel lesen: Simple Past", material: "lz-en-1", fertig: false },
        { text: "Unregelmäßige Verben mit Karteikarten üben", material: "e1", fertig: false },
        { text: "Simple Past im Quiz testen", material: "e11", fertig: false },
      ] },
      { id: "vok-pp84", label: "Vocabulary Unit 5 (pp. 84-93)", etappe: 4, kbId: "7EA2", kategorie: "Wortschatz und Rechtschreibung", subkategorie: "Grundwortschatz", schritte: [
        { text: "Spickzettel lesen: so lerne ich Vokabeln", material: "lz-en-2", fertig: false },
        { text: "Vokabeln Unit 5 (S. 84-93) mit Karteikarten", material: "e2", fertig: false },
      ] },
      { id: "will-future", label: "will-future · question tags · if-clause I", etappe: 4, kbId: "7EA3", kategorie: "Zeitformen", subkategorie: "Zukunft", schritte: [
        { text: "Lernzettel lesen: will-future und if-clause", material: "lz-en-3", fertig: false },
        { text: "if-clause im Lückentext üben", material: "e4", fertig: false },
        { text: "Sätze bauen (will-future)", material: "e7", fertig: false },
        { text: "will oder going-to: Quiz", material: "e10", fertig: false },
      ] },
      { id: "vok-pp94", label: "Vocabulary Unit 5 (pp. 94-99)", etappe: 4, kbId: "7EA4", kategorie: "Wortschatz und Rechtschreibung", subkategorie: "Grundwortschatz", schritte: [
        { text: "Spickzettel lesen: Vokabeln clever wiederholen", material: "lz-en-4", fertig: false },
        { text: "Vokabeln Unit 5 (S. 94-99) mit Karteikarten", material: "e5", fertig: false },
      ] },
      { id: "everyday", label: "Everyday English: Dialog", etappe: 4, kbId: "7EA5", kategorie: "Sprachmittlung und Kommunikation", subkategorie: "Muendliche Kommunikation", schritte: [
        { text: "Lernzettel lesen: Dialog an der Information", material: "lz-en-5", fertig: false },
        { text: "Höfliche Phrasen zuordnen", material: "e6", fertig: false },
        { text: "Dialog-Sätze bauen", material: "e8", fertig: false },
        { text: "Orte im Plan finden", material: "e9", fertig: false },
      ] },
      ...ENGLISCH_LANDKARTE,
    ],
    verknuepfungen: [
      ["simple-past", "vok-pp84"],
      ["vok-pp84", "will-future"],
      ["will-future", "vok-pp94"],
      ["vok-pp94", "everyday"],
    ],
    materialien: [
      ...LERNZETTEL.englisch,
      { id: "e10", thema: "will-future · question tags · if-clause I", titel: "Übung: will oder going-to?", art: "arbeitsblatt", bereich: "selbstlernen", datum: "2026-05-12" },
      { id: "e11", thema: "Revision simple past", titel: "Übung: Simple Past", art: "arbeitsblatt", bereich: "selbstlernen", datum: "2026-05-05" },
      { id: "e1", thema: "Revision simple past", titel: "Übersicht: Irregular verbs", art: "zusammenfassung", bereich: "selbstlernen", datum: "2026-04-21" },
      { id: "e2", thema: "Vocabulary Unit 5 (pp. 84-93)", titel: "Vokabelliste Unit 5, S. 84-93", art: "arbeitsblatt", bereich: "unterricht", datum: "2026-04-23" },
      { id: "e3", thema: "will-future · question tags · if-clause I", titel: "Mitschrift: will vs. going-to", art: "notiz", bereich: "unterricht", datum: "2026-04-30" },
      { id: "e4", thema: "will-future · question tags · if-clause I", titel: "Arbeitsblatt: if-clause I Übungen", art: "arbeitsblatt", bereich: "unterricht", datum: "2026-05-07" },
      { id: "e7", thema: "will-future · question tags · if-clause I", titel: "Übung: Satz bauen", art: "arbeitsblatt", bereich: "selbstlernen", datum: "2026-05-08" },
      { id: "e5", thema: "Vocabulary Unit 5 (pp. 94-99)", titel: "Vokabelliste Unit 5, S. 94-99", art: "arbeitsblatt", bereich: "unterricht", datum: "2026-05-14" },
      { id: "e6", thema: "Everyday English: Dialog", titel: "Spickzettel: useful phrases for asking", art: "notiz", bereich: "selbstlernen", datum: "2026-05-19" },
      { id: "e8", thema: "Everyday English: Dialog", titel: "Übung: Satz bauen", art: "arbeitsblatt", bereich: "selbstlernen", datum: "2026-05-20" },
      { id: "e9", thema: "Everyday English: Dialog", titel: "Übung: Orte im Plan finden", art: "arbeitsblatt", bereich: "selbstlernen", datum: "2026-05-21" },
    ],
  },
  {
    id: "franzoesisch",
    fach: "Französisch",
    farbe: "#FFE37D",
    themen: [
      { id: "vocab-u3", label: "Vocabulaire Unité 3", etappe: 4, kbId: "7FA1", schritte: [
        { text: "Spickzettel lesen: französische Vokabeln lernen", material: "lz-fr-2", fertig: false },
        { text: "Vokabeln Unité 3 mit Karteikarten", material: "f1", fertig: false },
      ] },
      { id: "present-ir", label: "Présent: verbes en -ir", etappe: 4, kbId: "7FA2", schritte: [
        { text: "Lernzettel lesen: verbes en -ir", material: "lz-fr-3", fertig: false },
        { text: "-ir-Verben im Lückentext konjugieren", material: "f3", fertig: false },
      ] },
      { id: "passe-compose-avoir", label: "Le passé composé avec avoir", etappe: 4, kbId: "7FA3", schritte: [
        { text: "Lernzettel lesen: passé composé mit avoir", material: "lz-fr-1", fertig: false },
        { text: "passé composé: Quiz", material: "f4", fertig: false },
        { text: "Sätze im passé composé bauen", material: "f9", fertig: false },
      ] },
      { id: "vocab-loisirs", label: "Vocabulaire: les loisirs", etappe: 4, kbId: "7FA4", schritte: [
        { text: "Lernzettel lesen: über Hobbys sprechen", material: "lz-fr-4", fertig: false },
        { text: "Vokabeln les loisirs mit Karteikarten", material: "f5", fertig: false },
        { text: "jouer à / jouer de / faire du: Quiz", material: "f10", fertig: false },
      ] },
      { id: "dialog-cafe", label: "Lektüre & Dialog: Au café", etappe: 4, kbId: "7FA5", schritte: [
        { text: "Lernzettel lesen: im Café bestellen", material: "lz-fr-5", fertig: false },
        { text: "Dialog „Au café“ lesen", material: "f6", fertig: false },
        { text: "Café-Wendungen zuordnen", material: "f7", fertig: false },
      ] },
    ],
    verknuepfungen: [
      ["vocab-u3", "present-ir"],
      ["present-ir", "passe-compose-avoir"],
      ["passe-compose-avoir", "vocab-loisirs"],
      ["vocab-loisirs", "dialog-cafe"],
    ],
    materialien: [
      ...LERNZETTEL.franzoesisch,
      { id: "f1", thema: "Vocabulaire Unité 3", titel: "Vokabelliste Unité 3 (en ville)", art: "arbeitsblatt", bereich: "unterricht", datum: "2026-04-21" },
      { id: "f2", thema: "Présent: verbes en -ir", titel: "Übersicht: verbes en -ir (finir, choisir)", art: "zusammenfassung", bereich: "selbstlernen", datum: "2026-04-28", inhalt: "Verben auf -ir im Präsens:\n\nEndungen:\n- je ...is\n- tu ...is\n- il/elle ...it\n- nous ...issons\n- vous ...issez\n- ils/elles ...issent\n\nfinir (beenden):\n- je finis, tu finis, il finit\n- nous finissons, vous finissez, ils finissent\n\nchoisir (wählen):\n- je choisis, tu choisis, il choisit\n- nous choisissons, vous choisissez, ils choisissent\n\nMerke:\n- Im Plural steht immer -iss- vor der Endung." },
      { id: "f3", thema: "Présent: verbes en -ir", titel: "Übung: -ir-Verben konjugieren", art: "arbeitsblatt", bereich: "selbstlernen", datum: "2026-05-04" },
      { id: "f4", thema: "Le passé composé avec avoir", titel: "Übung: participe passé bilden", art: "arbeitsblatt", bereich: "selbstlernen", datum: "2026-05-12" },
      { id: "f5", thema: "Vocabulaire: les loisirs", titel: "Vokabelliste: les loisirs", art: "arbeitsblatt", bereich: "unterricht", datum: "2026-05-18" },
      { id: "f6", thema: "Lektüre & Dialog: Au café", titel: "Text: Au café", art: "arbeitsblatt", bereich: "unterricht", datum: "2026-05-20", inhalt: "Au café\n\nLéa: Bonjour madame, je voudrais un chocolat chaud, s'il vous plaît.\nLa serveuse: Très bien. Et pour toi?\nTom: Pour moi, une limonade, s'il vous plaît.\nLa serveuse: Voilà, un chocolat chaud et une limonade.\nLéa: Merci. C'est combien?\nLa serveuse: Ça fait quatre euros.\nTom: Voilà. Au revoir!\n\nNeue Wörter:\n- un chocolat chaud: eine heiße Schokolade\n- la serveuse: die Kellnerin\n- une limonade: eine Limonade\n- Ça fait quatre euros: das macht vier Euro" },
      { id: "f7", thema: "Lektüre & Dialog: Au café", titel: "Übung: phrases utiles au café", art: "arbeitsblatt", bereich: "selbstlernen", datum: "2026-05-21" },
      { id: "f9", thema: "Le passé composé avec avoir", titel: "Übung: Sätze im passé composé bauen", art: "arbeitsblatt", bereich: "selbstlernen", datum: "2026-05-13" },
      { id: "f10", thema: "Vocabulaire: les loisirs", titel: "Übung: jouer à, jouer de, faire du", art: "arbeitsblatt", bereich: "selbstlernen", datum: "2026-05-19" },
    ],
  },
];

export const artLabel = {
  notiz: "Notiz",
  arbeitsblatt: "Arbeitsblatt",
  zusammenfassung: "Zusammenfassung",
  pdf: "PDF",
  bild: "Bild",
  dokument: "Dokument",
  datei: "Datei",
  tafelnotiz: "Tafel-Notiz",
};

export const bereichLabel = {
  unterricht: "Unterricht",
  selbstlernen: "Selbstlernen",
};

export const statusLabel = {
  done: "erledigt",
  current: "aktuell",
  upcoming: "kommt noch",
};

// Lookup: zu welchem Lernweg gehört ein KB? -> { fachId, themaId, fach, thema } | null
export function lernwegFuerKb(kbId) {
  for (const f of faecher) {
    for (const t of f.themen) {
      if (t.kbId === kbId) {
        return { fachId: f.id, themaId: t.id, fach: f, thema: t };
      }
    }
  }
  return null;
}
