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
    farbe: "#3b5bdb",
    themen: [
      { id: "grundlagen", label: "Grundlagen negative Zahlen", etappe: 4, kbId: "7MA1", kategorie: "Mathematische Grundlagen", subkategorie: "Negative Zahlen", schritte: [
        { text: "Zahlengerade mit negativen Zahlen verstehen", fertig: false },
        { text: "Vorzeichen erkennen und benennen", fertig: false },
        { text: "Negative Zahlen ordnen und vergleichen", fertig: false },
      ] },
      { id: "addsub", label: "Addieren & Subtrahieren", etappe: 4, kbId: "7MA2", kategorie: "Mathematische Grundlagen", subkategorie: "Negative Zahlen", schritte: [
        { text: "Vorzeichenregeln Addition", fertig: false },
        { text: "Vorzeichenregeln Subtraktion", fertig: false },
        { text: "Übungen mit gemischten Aufgaben", fertig: false },
      ] },
      { id: "muldiv", label: "Multiplikation & Division", etappe: 4, kbId: "7MA3", kategorie: "Mathematische Grundlagen", subkategorie: "Negative Zahlen", schritte: [
        { text: "Vorzeichen bei Multiplikation", fertig: false },
        { text: "Vorzeichen bei Division", fertig: false },
        { text: "Sicher mit Punkt- vor Strichrechnung", fertig: false },
      ] },
      { id: "rechengesetze", label: "Rechengesetze mit Vorzeichen", etappe: 4, kbId: "7MA4", kategorie: "Mathematische Grundlagen", subkategorie: "Negative Zahlen", schritte: [
        { text: "Kommutativ- und Assoziativgesetz", fertig: false },
        { text: "Distributivgesetz mit Vorzeichen", fertig: false },
        { text: "Klammern auflösen", fertig: false },
        { text: "Anwendungs-Mix", fertig: false },
      ] },
      { id: "rechendiplom", label: "Rechendiplom", etappe: 4, kbId: "7MA5", kategorie: "Mathematische Grundlagen", subkategorie: "Negative Zahlen", schritte: [
        { text: "Kopfrechnen üben", fertig: false },
        { text: "Geschwindigkeit trainieren", fertig: false },
        { text: "Probediplom durchgehen", fertig: false },
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
    farbe: "#e8590c",
    themen: [
      { id: "mini-vortrag", label: "Mini-Vortrag", etappe: 4, kbId: "7DA1", kategorie: "Textarten und Schreiben", subkategorie: "Präsentieren und Gestalten", schritte: [
        { text: "Thema „Reise um die Welt“ wählen", fertig: false },
        { text: "Notizen und Stichpunkte sammeln", fertig: false },
        { text: "Vortrag laut üben (5 Min)", fertig: false },
      ] },
      { id: "lernplakat", label: "Lernplakat", etappe: 4, kbId: "7DA2", kategorie: "Textarten und Schreiben", subkategorie: "Präsentieren und Gestalten", schritte: [
        { text: "Plakat-Grundgerüst skizzieren", fertig: false },
        { text: "Bilder und Texte einplanen", fertig: false },
        { text: "Plakat sauber gestalten", fertig: false },
        { text: "Quellen angeben", fertig: false },
      ] },
      { id: "lapbook", label: "Lapbook", etappe: 4, kbId: "7DA3", kategorie: "Textarten und Schreiben", subkategorie: "Präsentieren und Gestalten", schritte: [
        { text: "Lapbook-Klappen vorbereiten", fertig: false },
        { text: "Inhalte ordnen und verteilen", fertig: false },
        { text: "Texte schreiben und einkleben", fertig: false },
        { text: "Lapbook gestalten und falten", fertig: false },
        { text: "Selbstcheck mit Checkliste", fertig: false },
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
    farbe: "#f59f00",
    themen: [
      { id: "simple-past", label: "Revision simple past", etappe: 4, kbId: "7EA1", kategorie: "Zeitformen", subkategorie: "Vergangenheit", schritte: [
        { text: "Regelmäßige Verben (-ed) auffrischen", fertig: false },
        { text: "Unregelmäßige Verben (Top 30)", fertig: false },
        { text: "Fragen und Verneinungen", fertig: false },
      ] },
      { id: "vok-pp84", label: "Vocabulary Unit 5 (pp. 84-93)", etappe: 4, kbId: "7EA2", kategorie: "Wortschatz und Rechtschreibung", subkategorie: "Grundwortschatz", schritte: [
        { text: "Vokabeln lesen und übersetzen", fertig: false },
        { text: "Vokabeln mündlich abfragen", fertig: false },
      ] },
      { id: "will-future", label: "will-future · question tags · if-clause I", etappe: 4, kbId: "7EA3", kategorie: "Zeitformen", subkategorie: "Zukunft", schritte: [
        { text: "will-future bilden und anwenden", fertig: false },
        { text: "question tags ans Satzende setzen", fertig: false },
        { text: "if-clause Type I (real conditions)", fertig: false },
        { text: "Mix-Übungen aus allen drei Themen", fertig: false },
      ] },
      { id: "vok-pp94", label: "Vocabulary Unit 5 (pp. 94-99)", etappe: 4, kbId: "7EA4", kategorie: "Wortschatz und Rechtschreibung", subkategorie: "Grundwortschatz", schritte: [
        { text: "Vokabeln lesen und übersetzen", fertig: false },
        { text: "Vokabeln mündlich abfragen", fertig: false },
      ] },
      { id: "everyday", label: "Everyday English: Dialog", etappe: 4, kbId: "7EA5", kategorie: "Sprachmittlung und Kommunikation", subkategorie: "Muendliche Kommunikation", schritte: [
        { text: "Vokabular „at an information center“ lernen", fertig: false },
        { text: "Dialog-Bausteine üben", fertig: false },
        { text: "Eigenen Dialog schreiben", fertig: false },
        { text: "Dialog mit Partner vortragen", fertig: false },
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
        { text: "Vokabeln Unité 3 lesen", fertig: false },
        { text: "Vokabeln auswendig lernen", fertig: false },
      ] },
      { id: "present-ir", label: "Présent: verbes en -ir", etappe: 4, kbId: "7FA2", schritte: [
        { text: "Endungen von finir und choisir lernen", fertig: false },
        { text: "Formen üben", fertig: false },
        { text: "Im Satz anwenden", fertig: false },
      ] },
      { id: "passe-compose-avoir", label: "Le passé composé avec avoir", etappe: 4, kbId: "7FA3", schritte: [
        { text: "avoir im Präsens wiederholen", fertig: false },
        { text: "Participe passé regelmäßiger Verben bilden", fertig: false },
        { text: "Sätze im passé composé bilden", fertig: false },
        { text: "Wichtige unregelmäßige Partizipien lernen", fertig: false },
      ] },
      { id: "vocab-loisirs", label: "Vocabulaire: les loisirs", etappe: 4, kbId: "7FA4", schritte: [
        { text: "Vokabeln zu Freizeit und Hobbys lesen", fertig: false },
        { text: "Vokabeln auswendig lernen", fertig: false },
      ] },
      { id: "dialog-cafe", label: "Lektüre & Dialog: Au café", etappe: 4, kbId: "7FA5", schritte: [
        { text: "Dialog Au café lesen", fertig: false },
        { text: "Neue Wörter klären", fertig: false },
        { text: "Eigenen Dialog schreiben und nachspielen", fertig: false },
      ] },
    ],
    verknuepfungen: [
      ["vocab-u3", "present-ir"],
      ["present-ir", "passe-compose-avoir"],
      ["passe-compose-avoir", "vocab-loisirs"],
      ["vocab-loisirs", "dialog-cafe"],
    ],
    materialien: [
      {
        id: "lz-fr-1",
        thema: "Le passé composé avec avoir",
        titel: "Lernzettel: Das passé composé mit avoir",
        art: "lernzettel",
        bereich: "selbstlernen",
        datum: "2026-05-11",
        inhalt: "Wozu:\n- Mit dem passé composé erzählst du auf Französisch, was in der Vergangenheit passiert ist (zum Beispiel was du gestern gemacht hast).\n- Es ist die wichtigste Vergangenheitsform im Französischen.\n\nRegel:\n- Das passé composé besteht aus zwei Teilen: einer Form von avoir im Präsens und dem participe passé.\n- Bei Verben auf -er endet das participe passé auf -é (manger wird mangé).\n- Bei Verben auf -ir endet es oft auf -i (finir wird fini).\n- Die Form von avoir richtet sich nach dem Subjekt: j'ai, tu as, il/elle a, nous avons, vous avez, ils/elles ont.\n\nMerksatz:\n- Erst avoir passend zum Subjekt, dann das participe passé.\n\nBeispiel:\n- Bilde den Satz: Ich habe eine Pizza gegessen.\n- Subjekt je, also die Form ai.\n- manger wird zu mangé.\n- Ergebnis: J'ai mangé une pizza.\n\nHäufige Fehler:\n- avoir vergessen und nur das participe passé schreiben (mangé statt j'ai mangé).\n- Die Form von avoir nicht ans Subjekt anpassen (nous a statt nous avons).\n- Unregelmäßige Partizipien wie avoir zu eu oder être zu été als regelmäßig bilden.",
      },
      { id: "f1", thema: "Vocabulaire Unité 3", titel: "Vokabelliste Unité 3", art: "arbeitsblatt", bereich: "unterricht", datum: "2026-04-21" },
      { id: "f2", thema: "Présent: verbes en -ir", titel: "Übersicht: verbes en -ir (finir, choisir)", art: "zusammenfassung", bereich: "selbstlernen", datum: "2026-04-28" },
      { id: "f3", thema: "Présent: verbes en -ir", titel: "Übung: -ir-Verben konjugieren", art: "arbeitsblatt", bereich: "selbstlernen", datum: "2026-05-04" },
      { id: "f4", thema: "Le passé composé avec avoir", titel: "Übung: participe passé bilden", art: "arbeitsblatt", bereich: "selbstlernen", datum: "2026-05-12" },
      { id: "f5", thema: "Vocabulaire: les loisirs", titel: "Vokabelliste: les loisirs", art: "arbeitsblatt", bereich: "unterricht", datum: "2026-05-18" },
      { id: "f6", thema: "Lektüre & Dialog: Au café", titel: "Text: Au café", art: "arbeitsblatt", bereich: "unterricht", datum: "2026-05-20" },
      { id: "f7", thema: "Lektüre & Dialog: Au café", titel: "Spickzettel: phrases utiles au café", art: "notiz", bereich: "selbstlernen", datum: "2026-05-21" },
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
