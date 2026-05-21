// Wissen pro Fach: das Schuljahr als Netz von LERNWEGEN. Jeder Knoten ist ein
// Lernweg mit konkreten Schritten (schritte[].fertig zeigt den Stand). Darunter
// liegen die Materialien (materialien[].thema == themen[].label).
// Status wird aus den Schritten abgeleitet: alle fertig = erledigt, einige =
// aktuell, keine = kommt noch. themen[].etappe = Etappe (1–5) für den Filter.

export const faecher = [
  {
    id: "mathe",
    fach: "Mathematik",
    farbe: "#3b5bdb",
    themen: [
      { id: "terme", label: "Terme", etappe: 1, schritte: [
        { text: "Terme aufstellen", fertig: true },
        { text: "Klammern auflösen", fertig: true },
        { text: "Terme zusammenfassen", fertig: true },
      ] },
      { id: "kongruenz", label: "Kongruenz", etappe: 1, schritte: [
        { text: "Kongruenzsätze kennen (SSS, SWS)", fertig: true },
        { text: "Dreiecke konstruieren", fertig: true },
      ] },
      { id: "prozent", label: "Prozent & Zinsen", etappe: 2, schritte: [
        { text: "Grund-, Prozentwert, Prozentsatz", fertig: true },
        { text: "Prozentsatz berechnen", fertig: true },
        { text: "Zinsrechnung", fertig: true },
      ] },
      { id: "gleich", label: "Gleichungen", etappe: 3, schritte: [
        { text: "Äquivalenzumformungen", fertig: true },
        { text: "Gleichungen lösen", fertig: true },
        { text: "Textaufgaben in Gleichungen übersetzen", fertig: true },
      ] },
      { id: "linear", label: "Lineare Funktionen", etappe: 4, schritte: [
        { text: "Wertetabelle aufstellen und Graph zeichnen", fertig: true },
        { text: "Steigung m bestimmen", fertig: true },
        { text: "y-Achsenabschnitt b ablesen", fertig: true },
        { text: "Geradengleichung y = mx + b aufstellen", fertig: false },
        { text: "Übungs-Check vor dem Könnensbeweis", fertig: false },
      ] },
      { id: "steigung", label: "Steigung", etappe: 4, schritte: [
        { text: "Steigungsdreieck zeichnen", fertig: true },
        { text: "Steigung aus zwei Punkten", fertig: false },
        { text: "Negative Steigung deuten", fertig: false },
      ] },
      { id: "graphen", label: "Graphen zeichnen", etappe: 4, schritte: [
        { text: "Punkte ins Koordinatensystem", fertig: false },
        { text: "Gerade sauber zeichnen", fertig: false },
      ] },
      { id: "lgs", label: "Gleichungssysteme", etappe: 5, schritte: [
        { text: "Gleichungssystem aufstellen", fertig: false },
        { text: "Einsetzungsverfahren", fertig: false },
        { text: "Lösung prüfen", fertig: false },
      ] },
      { id: "quadrat", label: "Quadratische Funktionen", etappe: 5, schritte: [
        { text: "Parabel erkennen", fertig: false },
        { text: "Scheitelpunkt bestimmen", fertig: false },
      ] },
      { id: "wahrsch", label: "Wahrscheinlichkeit", etappe: 5, schritte: [
        { text: "Zufallsexperiment beschreiben", fertig: false },
        { text: "Wahrscheinlichkeit berechnen", fertig: false },
      ] },
    ],
    verknuepfungen: [
      ["prozent", "terme"],
      ["terme", "gleich"],
      ["terme", "kongruenz"],
      ["gleich", "linear"],
      ["linear", "steigung"],
      ["linear", "graphen"],
      ["linear", "lgs"],
      ["lgs", "quadrat"],
      ["lgs", "wahrsch"],
    ],
    materialien: [
      { id: "m1", thema: "Lineare Funktionen", titel: "Mitschrift: Steigung & y-Achsenabschnitt", art: "notiz", bereich: "unterricht", datum: "2026-05-18" },
      { id: "m2", thema: "Lineare Funktionen", titel: "Lernweg-Übungsblatt Schritt 1–3", art: "arbeitsblatt", bereich: "selbstlernen", datum: "2026-05-20" },
      { id: "m3", thema: "Lineare Funktionen", titel: "Zusammenfassung für den Könnensbeweis", art: "zusammenfassung", bereich: "selbstlernen", datum: "2026-05-19" },
      { id: "m4", thema: "Terme", titel: "Mitschrift: Klammern auflösen", art: "notiz", bereich: "unterricht", datum: "2025-09-22" },
      { id: "m5", thema: "Prozent & Zinsen", titel: "Arbeitsblatt Zinsrechnung", art: "arbeitsblatt", bereich: "unterricht", datum: "2025-11-14" },
      { id: "m6", thema: "Gleichungen", titel: "Zusammenfassung: Äquivalenzumformungen", art: "zusammenfassung", bereich: "selbstlernen", datum: "2026-02-03" },
      { id: "m7", thema: "Kongruenz", titel: "Arbeitsblatt: Kongruenzsätze (SSS, SWS)", art: "arbeitsblatt", bereich: "unterricht", datum: "2025-09-30" },
      { id: "m8", thema: "Steigung", titel: "Spickzettel: Steigungsdreieck", art: "notiz", bereich: "selbstlernen", datum: "2026-05-21" },
      { id: "m9", thema: "Prozent & Zinsen", titel: "Mitschrift: Grund-, Prozentwert, Prozentsatz", art: "notiz", bereich: "unterricht", datum: "2025-11-10" },
    ],
  },
  {
    id: "deutsch",
    fach: "Deutsch",
    farbe: "#e8590c",
    themen: [
      { id: "wort", label: "Wortarten", etappe: 1, schritte: [
        { text: "Die zehn Wortarten kennen", fertig: true },
        { text: "Wortarten im Satz bestimmen", fertig: true },
      ] },
      { id: "satz", label: "Satzglieder", etappe: 1, schritte: [
        { text: "Subjekt & Prädikat finden", fertig: true },
        { text: "Objekte und Umstandsangaben", fertig: true },
      ] },
      { id: "bericht", label: "Bericht schreiben", etappe: 2, schritte: [
        { text: "W-Fragen klären", fertig: true },
        { text: "Sachlich und knapp formulieren", fertig: true },
      ] },
      { id: "ballade", label: "Balladen", etappe: 3, schritte: [
        { text: "Merkmale der Ballade", fertig: true },
        { text: "Stilmittel erkennen", fertig: true },
        { text: "Ballade vortragen", fertig: true },
      ] },
      { id: "kurz", label: "Kurzgeschichte", etappe: 4, schritte: [
        { text: "Merkmale der Kurzgeschichte", fertig: true },
        { text: "Inhalt erfassen", fertig: true },
        { text: "Deutung formulieren", fertig: false },
      ] },
      { id: "inhalt", label: "Inhaltsangabe", etappe: 4, schritte: [
        { text: "Aufbau einer Inhaltsangabe", fertig: false },
        { text: "Im Präsens zusammenfassen", fertig: false },
      ] },
      { id: "argument", label: "Argumentieren", etappe: 5, schritte: [
        { text: "These und Argument unterscheiden", fertig: false },
        { text: "Argumente mit Beispielen stützen", fertig: false },
      ] },
      { id: "eroert", label: "Erörterung", etappe: 5, schritte: [
        { text: "Pro und Kontra sammeln", fertig: false },
        { text: "Erörterung gliedern", fertig: false },
      ] },
    ],
    verknuepfungen: [
      ["wort", "satz"],
      ["satz", "bericht"],
      ["bericht", "ballade"],
      ["satz", "kurz"],
      ["kurz", "inhalt"],
      ["inhalt", "argument"],
      ["argument", "eroert"],
    ],
    materialien: [
      { id: "d1", thema: "Kurzgeschichte", titel: "Aufbau einer Inhaltsangabe", art: "zusammenfassung", bereich: "selbstlernen", datum: "2026-05-17" },
      { id: "d2", thema: "Kurzgeschichte", titel: "Mitschrift: Merkmale der Kurzgeschichte", art: "notiz", bereich: "unterricht", datum: "2026-05-16" },
      { id: "d3", thema: "Balladen", titel: "Zusammenfassung: Stilmittel", art: "zusammenfassung", bereich: "selbstlernen", datum: "2026-01-20" },
      { id: "d4", thema: "Bericht schreiben", titel: "Arbeitsblatt: W-Fragen", art: "arbeitsblatt", bereich: "unterricht", datum: "2025-11-05" },
      { id: "d5", thema: "Wortarten", titel: "Übersicht: Die zehn Wortarten", art: "zusammenfassung", bereich: "selbstlernen", datum: "2025-09-12" },
      { id: "d6", thema: "Satzglieder", titel: "Arbeitsblatt: Subjekt, Prädikat, Objekt", art: "arbeitsblatt", bereich: "unterricht", datum: "2025-09-18" },
      { id: "d7", thema: "Balladen", titel: "Mitschrift: „Der Zauberlehrling“", art: "notiz", bereich: "unterricht", datum: "2026-01-15" },
    ],
  },
  {
    id: "englisch",
    fach: "Englisch",
    farbe: "#f59f00",
    themen: [
      { id: "simplepast", label: "Simple Past", etappe: 1, schritte: [
        { text: "Regelmäßige Verben", fertig: true },
        { text: "Unregelmäßige Verben", fertig: true },
      ] },
      { id: "perfect", label: "Present Perfect", etappe: 2, schritte: [
        { text: "have/has + past participle", fertig: true },
        { text: "Signalwörter (already, yet)", fertig: true },
      ] },
      { id: "comparison", label: "Steigerung von Adjektiven", etappe: 3, schritte: [
        { text: "comparative bilden", fertig: true },
        { text: "superlative bilden", fertig: true },
      ] },
      { id: "vocab4", label: "Wortschatz: Unit 4", etappe: 4, schritte: [
        { text: "Vokabeln S. 84–93", fertig: true },
        { text: "useful phrases üben", fertig: false },
      ] },
      { id: "conditional", label: "If-Sätze (Conditional I)", etappe: 4, schritte: [
        { text: "if-Satz + will-future erkennen", fertig: true },
        { text: "Sätze selbst bilden", fertig: false },
        { text: "Anwendung im Dialog", fertig: false },
      ] },
      { id: "reported", label: "Indirekte Rede", etappe: 5, schritte: [
        { text: "Zeitverschiebung verstehen", fertig: false },
        { text: "Aussagen umformen", fertig: false },
      ] },
      { id: "relative", label: "Relativsätze", etappe: 5, schritte: [
        { text: "who / which / that", fertig: false },
        { text: "Relativsätze verbinden", fertig: false },
      ] },
    ],
    verknuepfungen: [
      ["simplepast", "perfect"],
      ["perfect", "comparison"],
      ["comparison", "conditional"],
      ["perfect", "vocab4"],
      ["conditional", "reported"],
      ["conditional", "relative"],
    ],
    materialien: [
      { id: "e1", thema: "If-Sätze (Conditional I)", titel: "Grammatik: Conditional Type I", art: "zusammenfassung", bereich: "selbstlernen", datum: "2026-05-18" },
      { id: "e2", thema: "Wortschatz: Unit 4", titel: "Vokabelliste Unit 4", art: "arbeitsblatt", bereich: "unterricht", datum: "2026-05-13" },
      { id: "e3", thema: "Present Perfect", titel: "Mitschrift: have/has + past participle", art: "notiz", bereich: "unterricht", datum: "2025-11-20" },
      { id: "e4", thema: "Simple Past", titel: "Arbeitsblatt: irregular verbs", art: "arbeitsblatt", bereich: "unterricht", datum: "2025-09-25" },
      { id: "e5", thema: "Steigerung von Adjektiven", titel: "Zusammenfassung: comparative & superlative", art: "zusammenfassung", bereich: "selbstlernen", datum: "2026-02-10" },
      { id: "e6", thema: "Wortschatz: Unit 4", titel: "Spickzettel: useful phrases", art: "notiz", bereich: "selbstlernen", datum: "2026-05-20" },
    ],
  },
  {
    id: "latein",
    fach: "Latein",
    farbe: "#7048e8",
    themen: [
      { id: "lek13", label: "Lektion 13", etappe: 2, schritte: [
        { text: "Vokabeln L13", fertig: true },
        { text: "Lektionstext übersetzen", fertig: true },
      ] },
      { id: "deklination", label: "Deklinationen", etappe: 3, schritte: [
        { text: "o- & a-Deklination", fertig: true },
        { text: "konsonantische Deklination", fertig: true },
      ] },
      { id: "lek14", label: "Lektion 14", etappe: 4, schritte: [
        { text: "Vokabeln L14", fertig: true },
        { text: "Lektionstext übersetzen", fertig: false },
      ] },
      { id: "aci", label: "ACI", etappe: 4, schritte: [
        { text: "ACI im Satz erkennen", fertig: true },
        { text: "Subjektsakkusativ & Infinitiv bestimmen", fertig: false },
        { text: "Zeitverhältnis (gleichzeitig/vorzeitig)", fertig: false },
        { text: "ACI ins Deutsche übersetzen", fertig: false },
      ] },
      { id: "konj", label: "Konjugationen", etappe: 5, schritte: [
        { text: "Präsens & Imperfekt", fertig: false },
        { text: "Perfekt bilden", fertig: false },
      ] },
      { id: "lek15", label: "Lektion 15", etappe: 5, schritte: [
        { text: "Vokabeln L15", fertig: false },
        { text: "Lektionstext übersetzen", fertig: false },
      ] },
    ],
    verknuepfungen: [
      ["lek13", "deklination"],
      ["deklination", "lek14"],
      ["lek14", "aci"],
      ["aci", "konj"],
      ["lek14", "lek15"],
    ],
    materialien: [
      { id: "l1", thema: "Lektion 14", titel: "Vokabelliste Lektion 14", art: "arbeitsblatt", bereich: "unterricht", datum: "2026-05-14" },
      { id: "l2", thema: "ACI", titel: "Mitschrift: ACI erkennen", art: "notiz", bereich: "unterricht", datum: "2026-05-12" },
      { id: "l3", thema: "Deklinationen", titel: "Zusammenfassung: o- & a-Deklination", art: "zusammenfassung", bereich: "selbstlernen", datum: "2026-02-26" },
      { id: "l4", thema: "ACI", titel: "Übungsblatt: ACI übersetzen", art: "arbeitsblatt", bereich: "selbstlernen", datum: "2026-05-19" },
      { id: "l5", thema: "Lektion 13", titel: "Mitschrift: Perfekt", art: "notiz", bereich: "unterricht", datum: "2025-11-28" },
    ],
  },
  {
    id: "griechisch",
    fach: "Griechisch",
    farbe: "#0c8599",
    themen: [
      { id: "alphabet", label: "Alphabet & Lautlehre", etappe: 1, schritte: [
        { text: "Buchstaben lesen & schreiben", fertig: true },
        { text: "Betonung und Akzente", fertig: true },
      ] },
      { id: "artikel", label: "Artikel & Kasus", etappe: 2, schritte: [
        { text: "Die vier Fälle kennen", fertig: true },
        { text: "Artikel zuordnen", fertig: true },
      ] },
      { id: "odekl", label: "o-Deklination", etappe: 3, schritte: [
        { text: "Endungen Singular", fertig: true },
        { text: "Vokabeln L1", fertig: true },
      ] },
      { id: "adekl", label: "a-Deklination", etappe: 4, schritte: [
        { text: "Endungen kennen", fertig: true },
        { text: "Formen bestimmen", fertig: false },
      ] },
      { id: "praesens", label: "Präsens der Verben", etappe: 4, schritte: [
        { text: "Präsens Aktiv bilden", fertig: true },
        { text: "Personalendungen üben", fertig: false },
      ] },
      { id: "lek5", label: "Lektion 5", etappe: 5, schritte: [
        { text: "Vokabeln L2", fertig: false },
        { text: "Lektionstext übersetzen", fertig: false },
      ] },
      { id: "partizip", label: "Partizip", etappe: 5, schritte: [
        { text: "Partizip erkennen", fertig: false },
        { text: "Partizip übersetzen", fertig: false },
      ] },
    ],
    verknuepfungen: [
      ["alphabet", "artikel"],
      ["artikel", "odekl"],
      ["odekl", "adekl"],
      ["adekl", "praesens"],
      ["praesens", "lek5"],
      ["praesens", "partizip"],
    ],
    materialien: [
      { id: "gr1", thema: "a-Deklination", titel: "Übersicht: a-Deklination", art: "zusammenfassung", bereich: "selbstlernen", datum: "2026-05-15" },
      { id: "gr2", thema: "Alphabet & Lautlehre", titel: "Arbeitsblatt: Griechisches Alphabet", art: "arbeitsblatt", bereich: "unterricht", datum: "2025-09-10" },
      { id: "gr3", thema: "Präsens der Verben", titel: "Mitschrift: Präsens Aktiv", art: "notiz", bereich: "unterricht", datum: "2026-05-11" },
      { id: "gr4", thema: "o-Deklination", titel: "Vokabelliste Lektion 3", art: "arbeitsblatt", bereich: "unterricht", datum: "2026-01-15" },
      { id: "gr5", thema: "Artikel & Kasus", titel: "Spickzettel: Die vier Fälle", art: "notiz", bereich: "selbstlernen", datum: "2025-11-22" },
    ],
  },
  {
    id: "bio",
    fach: "Biologie",
    farbe: "#2f9e44",
    themen: [
      { id: "zelle", label: "Zelle", etappe: 1, schritte: [
        { text: "Aufbau der Zelle", fertig: true },
        { text: "Tier- & Pflanzenzelle vergleichen", fertig: true },
      ] },
      { id: "wirbel", label: "Wirbeltiere", etappe: 2, schritte: [
        { text: "Merkmale der Wirbeltierklassen", fertig: true },
        { text: "Säugetiere", fertig: true },
        { text: "Vögel & Reptilien", fertig: true },
        { text: "Steckbrief erstellen", fertig: true },
      ] },
      { id: "verdauung", label: "Verdauung", etappe: 3, schritte: [
        { text: "Verdauungsorgane", fertig: true },
        { text: "Weg der Nahrung", fertig: true },
      ] },
      { id: "atmung", label: "Atmung & Blut", etappe: 3, schritte: [
        { text: "Blutkreislauf", fertig: true },
        { text: "Gasaustausch in der Lunge", fertig: true },
      ] },
      { id: "sinne", label: "Sinnesorgane", etappe: 4, schritte: [
        { text: "Aufbau des Auges", fertig: true },
        { text: "Weitere Sinne", fertig: false },
      ] },
      { id: "oeko", label: "Ökologie", etappe: 4, schritte: [
        { text: "Lebensraum & Anpassung", fertig: true },
        { text: "Nahrungsbeziehungen", fertig: false },
      ] },
      { id: "nahrung", label: "Nahrungskette", etappe: 5, schritte: [
        { text: "Produzent, Konsument, Destruent", fertig: false },
        { text: "Nahrungsnetz aufstellen", fertig: false },
      ] },
      { id: "immun", label: "Immunsystem", etappe: 5, schritte: [
        { text: "Abwehr des Körpers", fertig: false },
        { text: "Impfung verstehen", fertig: false },
      ] },
      { id: "evo", label: "Evolution", etappe: 5, schritte: [
        { text: "Angepasstheit erklären", fertig: false },
        { text: "Stammbaum lesen", fertig: false },
      ] },
    ],
    verknuepfungen: [
      ["zelle", "wirbel"],
      ["zelle", "verdauung"],
      ["verdauung", "atmung"],
      ["atmung", "sinne"],
      ["sinne", "immun"],
      ["wirbel", "oeko"],
      ["oeko", "nahrung"],
      ["wirbel", "evo"],
    ],
    materialien: [
      { id: "b1", thema: "Wirbeltiere", titel: "Steckbrief Säugetiere", art: "notiz", bereich: "selbstlernen", datum: "2025-10-12" },
      { id: "b2", thema: "Wirbeltiere", titel: "Arbeitsblatt Vögel & Reptilien", art: "arbeitsblatt", bereich: "unterricht", datum: "2025-10-18" },
      { id: "b3", thema: "Ökologie", titel: "Zusammenfassung Nahrungskette", art: "zusammenfassung", bereich: "selbstlernen", datum: "2026-05-10" },
      { id: "b4", thema: "Atmung & Blut", titel: "Mitschrift: Blutkreislauf", art: "notiz", bereich: "unterricht", datum: "2026-03-09" },
      { id: "b5", thema: "Sinnesorgane", titel: "Arbeitsblatt: Das Auge", art: "arbeitsblatt", bereich: "unterricht", datum: "2026-05-15" },
      { id: "b6", thema: "Zelle", titel: "Zusammenfassung: Tier- & Pflanzenzelle", art: "zusammenfassung", bereich: "selbstlernen", datum: "2025-09-20" },
    ],
  },
  {
    id: "geschichte",
    fach: "Geschichte",
    farbe: "#9c36b5",
    themen: [
      { id: "antike", label: "Antike", etappe: 1, schritte: [
        { text: "Das Römische Reich", fertig: true },
        { text: "Leben in der Antike", fertig: true },
      ] },
      { id: "mittel", label: "Mittelalter", etappe: 2, schritte: [
        { text: "Stände & Lehnswesen", fertig: true },
        { text: "Leben auf der Burg", fertig: true },
      ] },
      { id: "entdeck", label: "Entdeckungen", etappe: 3, schritte: [
        { text: "Seewege & Motive", fertig: true },
        { text: "Kolumbus & Folgen", fertig: true },
      ] },
      { id: "humanismus", label: "Humanismus", etappe: 3, schritte: [
        { text: "Neues Menschenbild", fertig: true },
        { text: "Buchdruck", fertig: true },
      ] },
      { id: "reform", label: "Reformation", etappe: 4, schritte: [
        { text: "Luther & die 95 Thesen", fertig: true },
        { text: "Folgen der Spaltung", fertig: false },
      ] },
      { id: "absolut", label: "Absolutismus", etappe: 5, schritte: [
        { text: "Ludwig XIV.", fertig: false },
        { text: "Merkmale des Absolutismus", fertig: false },
      ] },
      { id: "franzrev", label: "Französische Revolution", etappe: 5, schritte: [
        { text: "Ursachen", fertig: false },
        { text: "Verlauf & Folgen", fertig: false },
      ] },
    ],
    verknuepfungen: [
      ["antike", "mittel"],
      ["mittel", "entdeck"],
      ["entdeck", "humanismus"],
      ["humanismus", "reform"],
      ["reform", "absolut"],
      ["absolut", "franzrev"],
    ],
    materialien: [
      { id: "g1", thema: "Mittelalter", titel: "Zeitstrahl: Leben im Mittelalter", art: "arbeitsblatt", bereich: "unterricht", datum: "2025-12-08" },
      { id: "g2", thema: "Mittelalter", titel: "Mitschrift: Stände & Burgen", art: "notiz", bereich: "unterricht", datum: "2025-12-11" },
      { id: "g3", thema: "Entdeckungen", titel: "Zusammenfassung: Kolumbus & Co.", art: "zusammenfassung", bereich: "selbstlernen", datum: "2026-02-19" },
      { id: "g4", thema: "Reformation", titel: "Mitschrift: Luther & die 95 Thesen", art: "notiz", bereich: "unterricht", datum: "2026-05-08" },
      { id: "g5", thema: "Antike", titel: "Arbeitsblatt: Das Römische Reich", art: "arbeitsblatt", bereich: "unterricht", datum: "2025-09-26" },
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
