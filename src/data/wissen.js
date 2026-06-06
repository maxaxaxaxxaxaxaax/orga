// Wissen pro Fach: jeder Lernweg gehört zu einem Etappenziel (Könnensbeweis, kbId).
// Schritte = die kleinen To-dos auf dem Weg zum KB. Materialien hängen über
// `thema === themen[].label` an einem Lernweg. So findet der Schüler im
// Wissen-Tab alles, was er für seinen aktuellen KB braucht.
// Im Wissen liegen nur Fächer mit echten Etappenzielen (Schulplaner Klasse 7).
// Stundenplan-Fächer ohne aktuellen KB (z. B. Bio, Geschichte) tauchen hier
// bewusst nicht auf, damit nichts „ohne Lernweg" angezeigt wird.

export const faecher = [
  {
    id: "mathe",
    fach: "Mathematik",
    farbe: "#3b5bdb",
    themen: [
      { id: "grundlagen", label: "Grundlagen negative Zahlen", etappe: 4, kbId: "7MA1", schritte: [
        { text: "Zahlengerade mit negativen Zahlen verstehen", fertig: false },
        { text: "Vorzeichen erkennen und benennen", fertig: false },
        { text: "Negative Zahlen ordnen und vergleichen", fertig: false },
      ] },
      { id: "addsub", label: "Addieren & Subtrahieren", etappe: 4, kbId: "7MA2", schritte: [
        { text: "Vorzeichenregeln Addition", fertig: false },
        { text: "Vorzeichenregeln Subtraktion", fertig: false },
        { text: "Übungen mit gemischten Aufgaben", fertig: false },
      ] },
      { id: "muldiv", label: "Multiplikation & Division", etappe: 4, kbId: "7MA3", schritte: [
        { text: "Vorzeichen bei Multiplikation", fertig: false },
        { text: "Vorzeichen bei Division", fertig: false },
        { text: "Sicher mit Punkt- vor Strichrechnung", fertig: false },
      ] },
      { id: "rechengesetze", label: "Rechengesetze mit Vorzeichen", etappe: 4, kbId: "7MA4", schritte: [
        { text: "Kommutativ- und Assoziativgesetz", fertig: false },
        { text: "Distributivgesetz mit Vorzeichen", fertig: false },
        { text: "Klammern auflösen", fertig: false },
        { text: "Anwendungs-Mix", fertig: false },
      ] },
      { id: "rechendiplom", label: "Rechendiplom", etappe: 4, kbId: "7MA5", schritte: [
        { text: "Kopfrechnen üben", fertig: false },
        { text: "Geschwindigkeit trainieren", fertig: false },
        { text: "Probediplom durchgehen", fertig: false },
      ] },
    ],
    verknuepfungen: [
      ["grundlagen", "addsub"],
      ["addsub", "muldiv"],
      ["muldiv", "rechengesetze"],
      ["rechengesetze", "rechendiplom"],
    ],
    materialien: [
      { id: "m1", thema: "Grundlagen negative Zahlen", titel: "Mitschrift: Zahlengerade", art: "notiz", bereich: "unterricht", datum: "2026-04-21" },
      { id: "m2", thema: "Grundlagen negative Zahlen", titel: "Arbeitsblatt: Vorzeichen-Memo", art: "arbeitsblatt", bereich: "unterricht", datum: "2026-04-22" },
      { id: "m3", thema: "Addieren & Subtrahieren", titel: "Spickzettel: Plus- und Minus-Regeln", art: "notiz", bereich: "selbstlernen", datum: "2026-04-28" },
      { id: "m4", thema: "Multiplikation & Division", titel: "Übersicht: Vorzeichen bei Mal & Geteilt", art: "zusammenfassung", bereich: "selbstlernen", datum: "2026-05-05" },
      { id: "m5", thema: "Rechengesetze mit Vorzeichen", titel: "Arbeitsblatt: Klammern auflösen", art: "arbeitsblatt", bereich: "unterricht", datum: "2026-05-12" },
      { id: "m6", thema: "Rechendiplom", titel: "Probe-Rechendiplom (Vorlage)", art: "pdf", bereich: "selbstlernen", datum: "2026-05-19" },
    ],
  },
  {
    id: "deutsch",
    fach: "Deutsch",
    farbe: "#e8590c",
    themen: [
      { id: "mini-vortrag", label: "Mini-Vortrag", etappe: 4, kbId: "7DA1", schritte: [
        { text: "Thema „Reise um die Welt“ wählen", fertig: false },
        { text: "Notizen und Stichpunkte sammeln", fertig: false },
        { text: "Vortrag laut üben (5 Min)", fertig: false },
      ] },
      { id: "lernplakat", label: "Lernplakat", etappe: 4, kbId: "7DA2", schritte: [
        { text: "Plakat-Grundgerüst skizzieren", fertig: false },
        { text: "Bilder und Texte einplanen", fertig: false },
        { text: "Plakat sauber gestalten", fertig: false },
        { text: "Quellen angeben", fertig: false },
      ] },
      { id: "lapbook", label: "Lapbook", etappe: 4, kbId: "7DA3", schritte: [
        { text: "Lapbook-Klappen vorbereiten", fertig: false },
        { text: "Inhalte ordnen und verteilen", fertig: false },
        { text: "Texte schreiben und einkleben", fertig: false },
        { text: "Lapbook gestalten und falten", fertig: false },
        { text: "Selbstcheck mit Checkliste", fertig: false },
      ] },
    ],
    verknuepfungen: [
      ["mini-vortrag", "lernplakat"],
      ["lernplakat", "lapbook"],
    ],
    materialien: [
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
      { id: "simple-past", label: "Revision simple past", etappe: 4, kbId: "7EA1", schritte: [
        { text: "Regelmäßige Verben (-ed) auffrischen", fertig: false },
        { text: "Unregelmäßige Verben (Top 30)", fertig: false },
        { text: "Fragen und Verneinungen", fertig: false },
      ] },
      { id: "vok-pp84", label: "Vocabulary Unit 5 (pp. 84-93)", etappe: 4, kbId: "7EA2", schritte: [
        { text: "Vokabeln lesen und übersetzen", fertig: false },
        { text: "Vokabeln mündlich abfragen", fertig: false },
      ] },
      { id: "will-future", label: "will-future · question tags · if-clause I", etappe: 4, kbId: "7EA3", schritte: [
        { text: "will-future bilden und anwenden", fertig: false },
        { text: "question tags ans Satzende setzen", fertig: false },
        { text: "if-clause Type I (real conditions)", fertig: false },
        { text: "Mix-Übungen aus allen drei Themen", fertig: false },
      ] },
      { id: "vok-pp94", label: "Vocabulary Unit 5 (pp. 94-99)", etappe: 4, kbId: "7EA4", schritte: [
        { text: "Vokabeln lesen und übersetzen", fertig: false },
        { text: "Vokabeln mündlich abfragen", fertig: false },
      ] },
      { id: "everyday", label: "Everyday English: Dialog", etappe: 4, kbId: "7EA5", schritte: [
        { text: "Vokabular „at an information center“ lernen", fertig: false },
        { text: "Dialog-Bausteine üben", fertig: false },
        { text: "Eigenen Dialog schreiben", fertig: false },
        { text: "Dialog mit Partner vortragen", fertig: false },
      ] },
    ],
    verknuepfungen: [
      ["simple-past", "vok-pp84"],
      ["vok-pp84", "will-future"],
      ["will-future", "vok-pp94"],
      ["vok-pp94", "everyday"],
    ],
    materialien: [
      { id: "e1", thema: "Revision simple past", titel: "Übersicht: Irregular verbs", art: "zusammenfassung", bereich: "selbstlernen", datum: "2026-04-21" },
      { id: "e2", thema: "Vocabulary Unit 5 (pp. 84-93)", titel: "Vokabelliste Unit 5, S. 84-93", art: "arbeitsblatt", bereich: "unterricht", datum: "2026-04-23" },
      { id: "e3", thema: "will-future · question tags · if-clause I", titel: "Mitschrift: will vs. going-to", art: "notiz", bereich: "unterricht", datum: "2026-04-30" },
      { id: "e4", thema: "will-future · question tags · if-clause I", titel: "Arbeitsblatt: if-clause I Übungen", art: "arbeitsblatt", bereich: "unterricht", datum: "2026-05-07" },
      { id: "e5", thema: "Vocabulary Unit 5 (pp. 94-99)", titel: "Vokabelliste Unit 5, S. 94-99", art: "arbeitsblatt", bereich: "unterricht", datum: "2026-05-14" },
      { id: "e6", thema: "Everyday English: Dialog", titel: "Spickzettel: useful phrases for asking", art: "notiz", bereich: "selbstlernen", datum: "2026-05-19" },
    ],
  },
  {
    id: "latein",
    fach: "Latein",
    farbe: "#7048e8",
    themen: [
      { id: "vok-l14", label: "Vokabeln L14", etappe: 4, kbId: "7LA1", schritte: [
        { text: "Vokabeln L14 lesen", fertig: false },
        { text: "Vokabeln auswendig lernen", fertig: false },
      ] },
      { id: "aci", label: "ACI mit Übersetzung", etappe: 4, kbId: "7LA2", schritte: [
        { text: "ACI im Satz erkennen", fertig: false },
        { text: "Subjektsakkusativ und Infinitiv bestimmen", fertig: false },
        { text: "Zeitverhältnis (gleichzeitig / vorzeitig)", fertig: false },
        { text: "ACI ins Deutsche übersetzen", fertig: false },
      ] },
      { id: "adj-konsdekl", label: "Adj. kons. Dekl. (Wdh.)", etappe: 4, kbId: "7LA3", schritte: [
        { text: "Endungstabelle wiederholen", fertig: false },
        { text: "Übungen mit Beispielen", fertig: false },
      ] },
      { id: "vok-l15-pronomen", label: "Vokabeln L15 / Pronomen", etappe: 4, kbId: "7LA4", schritte: [
        { text: "Vokabeln L15 lernen", fertig: false },
        { text: "Pronomen-Formen üben", fertig: false },
      ] },
      { id: "lektionstext-l15", label: "Lektionstext 15", etappe: 4, kbId: "7LA5", schritte: [
        { text: "Lektionstext L15 lesen", fertig: false },
        { text: "Satz für Satz übersetzen", fertig: false },
      ] },
    ],
    verknuepfungen: [
      ["vok-l14", "aci"],
      ["aci", "adj-konsdekl"],
      ["adj-konsdekl", "vok-l15-pronomen"],
      ["vok-l15-pronomen", "lektionstext-l15"],
    ],
    materialien: [
      { id: "l1", thema: "Vokabeln L14", titel: "Vokabelliste L14", art: "arbeitsblatt", bereich: "unterricht", datum: "2026-04-21" },
      { id: "l2", thema: "ACI mit Übersetzung", titel: "Mitschrift: ACI erkennen", art: "notiz", bereich: "unterricht", datum: "2026-04-28" },
      { id: "l3", thema: "ACI mit Übersetzung", titel: "Übungsblatt: ACI übersetzen", art: "arbeitsblatt", bereich: "selbstlernen", datum: "2026-05-05" },
      { id: "l4", thema: "Adj. kons. Dekl. (Wdh.)", titel: "Zusammenfassung: Endungen", art: "zusammenfassung", bereich: "selbstlernen", datum: "2026-05-12" },
      { id: "l5", thema: "Vokabeln L15 / Pronomen", titel: "Vokabelliste L15", art: "arbeitsblatt", bereich: "unterricht", datum: "2026-05-19" },
    ],
  },
  {
    id: "griechisch",
    fach: "Griechisch",
    farbe: "#0c8599",
    themen: [
      { id: "buchstaben", label: "Griechische Buchstaben und Lautlehre", etappe: 4, kbId: "7GA1", schritte: [
        { text: "Buchstaben lesen und schreiben", fertig: false },
        { text: "Lautwerte üben", fertig: false },
        { text: "Akzente und Betonung", fertig: false },
      ] },
      { id: "vok-l1", label: "Vokabeln L 1", etappe: 4, kbId: "7GA2", schritte: [
        { text: "Vokabeln L 1 lesen", fertig: false },
        { text: "Vokabeln auswendig lernen", fertig: false },
      ] },
      { id: "adekl", label: "a-Deklination im Singular", etappe: 4, kbId: "7GA3", schritte: [
        { text: "Endungen Singular kennen", fertig: false },
        { text: "Formen bestimmen", fertig: false },
      ] },
      { id: "vok-l2", label: "Vokabeln L 2", etappe: 4, kbId: "7GA4", schritte: [
        { text: "Vokabeln L 2 lesen", fertig: false },
        { text: "Vokabeln auswendig lernen", fertig: false },
      ] },
      { id: "uebersetzung-l2", label: "Übersetzung L 2", etappe: 4, kbId: "7GA5", schritte: [
        { text: "Lektionstext L 2 lesen", fertig: false },
        { text: "Satz für Satz übersetzen", fertig: false },
      ] },
    ],
    verknuepfungen: [
      ["buchstaben", "vok-l1"],
      ["vok-l1", "adekl"],
      ["adekl", "vok-l2"],
      ["vok-l2", "uebersetzung-l2"],
    ],
    materialien: [
      { id: "gr1", thema: "Griechische Buchstaben und Lautlehre", titel: "Arbeitsblatt: Alphabet schreiben", art: "arbeitsblatt", bereich: "unterricht", datum: "2026-04-21" },
      { id: "gr2", thema: "Vokabeln L 1", titel: "Vokabelliste L 1", art: "arbeitsblatt", bereich: "unterricht", datum: "2026-04-23" },
      { id: "gr3", thema: "a-Deklination im Singular", titel: "Spickzettel: Die vier Fälle", art: "notiz", bereich: "selbstlernen", datum: "2026-04-30" },
      { id: "gr4", thema: "a-Deklination im Singular", titel: "Übersicht: a-Deklination Endungen", art: "zusammenfassung", bereich: "selbstlernen", datum: "2026-05-07" },
      { id: "gr5", thema: "Vokabeln L 2", titel: "Vokabelliste L 2", art: "arbeitsblatt", bereich: "unterricht", datum: "2026-05-14" },
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
