// Von Agenten authorierte Inhalte für die Material-Typen Merkblatt, Lückentext
// und Zuordnung. Getrennt von interaktiv.js, damit die Registry übersichtlich
// bleibt. Wird in interaktiv.js eingemischt.

// Satzbau: aus Wort-Bausteinen den richtigen englischen Satz bauen (woerter in
// korrekter Reihenfolge). Die deutsche Bedeutung ist der Anlass. Fachlich
// sichere, gaengige Saetze (if-clause I, will-future, Unit-5-Sprache).
export const SATZBAU = {
  e7: {
    sprache: "englischen",
    saetze: [
      { woerter: ["If", "it", "rains,", "we", "will", "stay", "at", "home."], uebersetzung: "Wenn es regnet, bleiben wir zu Hause.", erklaerung: "if-clause Typ I: die Bedingung steht im Simple Present (it rains), die Folge im will-future (we will stay). Steht der if-Satz vorne, kommt ein Komma." },
      { woerter: ["I", "will", "help", "you", "if", "you", "ask", "me."], uebersetzung: "Ich helfe dir, wenn du mich fragst.", erklaerung: "Steht der if-Satz hinten, fällt das Komma weg. Trotzdem: Bedingung im Present (you ask), Folge im will-future (I will help)." },
      { woerter: ["She", "will", "be", "happy", "if", "she", "wins."], uebersetzung: "Sie wird glücklich sein, wenn sie gewinnt.", erklaerung: "Folge im will-future (she will be), Bedingung im Present (she wins). if-Satz hinten, also kein Komma." },
      { woerter: ["Can", "you", "recommend", "a", "good", "restaurant?"], uebersetzung: "Kannst du ein gutes Restaurant empfehlen?", erklaerung: "Höfliche Frage mit can: Can + Subjekt + Grundform (recommend). Das Adjektiv good steht direkt vor dem Nomen restaurant." },
      { woerter: ["The", "entrance", "fee", "is", "five", "euros."], uebersetzung: "Der Eintrittspreis beträgt fünf Euro.", erklaerung: "Aussagesatz: Subjekt (the entrance fee) + Verb (is) + Rest. entrance fee ist ein zusammengesetztes Nomen, entrance beschreibt fee." },
      { woerter: ["If", "you", "study", "hard,", "you", "will", "pass", "the", "exam."], uebersetzung: "Wenn du fleißig lernst, bestehst du die Prüfung.", erklaerung: "if-Satz vorne mit Komma: Present (you study), dann Folge im will-future (you will pass). hard ist hier Adverb und beschreibt study." },
    ],
  },
  // Everyday English: höfliche Fragen und Bitten als Satzbau (passend zu e6).
  e8: {
    sprache: "englischen",
    saetze: [
      { woerter: ["Excuse", "me,", "where", "is", "the", "museum?"], uebersetzung: "Entschuldigung, wo ist das Museum?", erklaerung: "Höflicher Einstieg Excuse me, dann die Frage: Fragewort where + is + Subjekt (the museum)." },
      { woerter: ["Could", "you", "tell", "me", "the", "way", "to", "the", "station?"], uebersetzung: "Könntest du mir den Weg zum Bahnhof sagen?", erklaerung: "Höfliche Bitte mit could: Could + you + Grundform (tell). Nach tell kommt me (wem) und dann the way (was)." },
      { woerter: ["Can", "you", "recommend", "a", "nice", "cafe?"], uebersetzung: "Kannst du ein nettes Café empfehlen?", erklaerung: "Can + you + Grundform (recommend). Das Adjektiv nice steht vor dem Nomen cafe." },
      { woerter: ["What", "time", "does", "the", "shop", "open?"], uebersetzung: "Wann öffnet der Laden?", erklaerung: "Frage im Present mit Hilfsverb does: What time + does + Subjekt (the shop) + Grundform (open). Das Verb bleibt in der Grundform, weil does schon die Person zeigt." },
      { woerter: ["I", "would", "like", "two", "tickets,", "please."], uebersetzung: "Ich hätte gern zwei Tickets, bitte.", erklaerung: "would like heißt höflich ich hätte gern. Danach die Menge (two tickets), please am Ende macht die Bitte freundlich." },
      { woerter: ["Thank", "you", "very", "much", "for", "your", "help."], uebersetzung: "Vielen Dank für deine Hilfe.", erklaerung: "Feste Wendung: Thank you (very much) for + Nomen (your help). for nennt den Grund des Dankes." },
    ],
  },
};

// Im Satz markieren: ein Wort im echten Satz anklicken (Satzanalyse). Hier:
// ACI im Latein, den Akkusativ (Subjekt) und den Infinitiv (Praedikat) im echten
// Satz erkennen. Saetze fachlich geprueft (Standard-Schul-ACI).
export const MARKIEREN = {
  l6: {
    saetze: [
      { woerter: ["Magistra", "discipulam", "laborare", "videt."], ziel: 1, frage: "Klicke den Akkusativ an (im ACI wird er zum Subjekt).", uebersetzung: "Die Lehrerin sieht, dass die Schülerin arbeitet.", tipp: "Der Akkusativ endet hier auf -am. Welches Wort hört so auf?", erklaerung: "discipulam ist Akkusativ und wird im dass-Satz zum Subjekt." },
      { woerter: ["Magistra", "discipulam", "laborare", "videt."], ziel: 2, frage: "Klicke den Infinitiv an (er wird zum Prädikat).", uebersetzung: "Die Lehrerin sieht, dass die Schülerin arbeitet.", tipp: "Der Infinitiv endet auf -re (hier -are). Welches Wort passt?", erklaerung: "laborare ist der Infinitiv und wird zu arbeitet." },
      { woerter: ["Audio", "te", "cantare."], ziel: 1, frage: "Klicke den Akkusativ an.", uebersetzung: "Ich höre, dass du singst.", tipp: "Der Akkusativ ist hier ein kurzes Wort: die Akkusativform von du.", erklaerung: "te ist der Akkusativ (von du) und wird zum Subjekt des dass-Satzes." },
      { woerter: ["Audio", "te", "cantare."], ziel: 2, frage: "Klicke den Infinitiv an.", uebersetzung: "Ich höre, dass du singst.", tipp: "Such die Form, die auf -re endet.", erklaerung: "cantare ist der Infinitiv und wird zu singst." },
      { woerter: ["Puto", "magistrum", "venire."], ziel: 1, frage: "Klicke den Akkusativ an.", uebersetzung: "Ich glaube, dass der Lehrer kommt.", tipp: "Der Akkusativ endet hier auf -um.", erklaerung: "magistrum ist der Akkusativ und wird zum Subjekt." },
      { woerter: ["Puto", "magistrum", "venire."], ziel: 2, frage: "Klicke den Infinitiv an.", uebersetzung: "Ich glaube, dass der Lehrer kommt.", tipp: "Der Infinitiv endet auf -re (hier -ire).", erklaerung: "venire ist der Infinitiv und wird zu kommt." },
    ],
  },
};

// Plan-Uebung (Bild-Zuordnung): englische Ortsfrage -> richtigen Raum im Plan
// antippen. Raum-Labels auf Deutsch, Frage auf Englisch (Vokabel im Raumkontext).
export const BILDZUORDNUNG = {
  e9: {
    raeume: [
      { id: "eingang", label: "Eingang" },
      { id: "info", label: "Information" },
      { id: "cafe", label: "Café" },
      { id: "toiletten", label: "Toiletten" },
      { id: "laden", label: "Laden" },
      { id: "ausgang", label: "Ausgang" },
    ],
    fragen: [
      { frage: "Where is the entrance?", raum: "eingang", tipp: "entrance kommt von to enter, also hineingehen.", erklaerung: "entrance heißt Eingang, dort gehst du hinein." },
      { frage: "Where are the toilets?", raum: "toiletten", tipp: "toilets klingt fast wie das deutsche Wort.", erklaerung: "toilets heißt Toiletten." },
      { frage: "Where is the gift shop?", raum: "laden", tipp: "shop heißt Laden, gift heißt Geschenk.", erklaerung: "a gift shop ist ein Laden für Geschenke, also der Laden." },
      { frage: "Where is the exit?", raum: "ausgang", tipp: "exit ist das Gegenteil von entrance.", erklaerung: "exit heißt Ausgang, dort gehst du hinaus." },
      { frage: "Where is the café?", raum: "cafe", tipp: "café ist fast wie im Deutschen.", erklaerung: "café ist das Café." },
      { frage: "Where is the information desk?", raum: "info", tipp: "a desk ist ein Schalter oder Tresen.", erklaerung: "the information desk ist die Information, der Schalter für Auskünfte." },
    ],
  },
};

export const MERKBLATT = {
  m3: {
    abschnitte: [
      {
        titel: "Vorzeichen lesen",
        einleitung:
          "Jede Zahl hat ein Vorzeichen: + (plus) oder - (minus). Ohne Zeichen ist eine Zahl positiv.",
        regeln: [
          { text: "Plus und Minus direkt hintereinander werden zu Minus.", beispiel: "5 + (-3) = 5 - 3 = 2" },
          { text: "Minus und Minus direkt hintereinander werden zu Plus.", beispiel: "5 - (-3) = 5 + 3 = 8" },
          { text: "Plus und Plus bleiben Plus.", beispiel: "5 + (+3) = 5 + 3 = 8" },
        ],
      },
      {
        titel: "Addieren",
        regeln: [
          { text: "Gleiche Vorzeichen: Beträge addieren, Vorzeichen behalten.", beispiel: "(-4) + (-6) = -10" },
          { text: "Verschiedene Vorzeichen: Beträge abziehen, Vorzeichen der größeren Zahl nehmen.", beispiel: "(-7) + 3 = -4" },
        ],
      },
      {
        titel: "Subtrahieren",
        einleitung: "Minus rechnen heißt: die Gegenzahl addieren.",
        regeln: [
          { text: "Eine Zahl abziehen ist dasselbe wie ihre Gegenzahl addieren.", beispiel: "8 - 5 = 8 + (-5) = 3" },
          { text: "Eine negative Zahl abziehen macht das Ergebnis größer.", beispiel: "2 - (-6) = 2 + 6 = 8" },
        ],
      },
      {
        titel: "Auf einen Blick",
        tabelle: {
          kopf: ["Rechnung", "wird zu", "Beispiel"],
          zeilen: [
            ["+ (+)", "+", "4 + (+2) = 6"],
            ["+ (-)", "-", "4 + (-2) = 2"],
            ["- (+)", "-", "4 - (+2) = 2"],
            ["- (-)", "+", "4 - (-2) = 6"],
          ],
        },
      },
    ],
  },
  m4: {
    abschnitte: [
      {
        titel: "Warum ist das so?",
        einleitung:
          "Ein Minus bedeutet: das Gegenteil. Minus mal minus heißt dann das Gegenteil vom Gegenteil, und damit landest du wieder beim Ursprung. Das ist keine Willkür, sondern folgt aus der Bedeutung von Minus.",
        regeln: [
          {
            text: "Ein Minus dreht die Richtung um. Zwei Minus drehen zweimal, du schaust wieder in die Ausgangsrichtung.",
            beispiel: "Das Gegenteil vom Gegenteil von 5 ist wieder 5.",
          },
          {
            text: "Darum ergibt minus mal minus ein Plus.",
            beispiel: "(−1) mal (−3): zweimal das Gegenteil von 3, also +3.",
          },
        ],
      },
      {
        titel: "Die Grundregel",
        einleitung: "Bei Mal und Geteilt zählt nur, ob die Vorzeichen gleich oder verschieden sind.",
        regeln: [
          { text: "Gleiche Vorzeichen ergeben Plus.", beispiel: "(+) mit (+) und (-) mit (-) ergibt +" },
          { text: "Verschiedene Vorzeichen ergeben Minus.", beispiel: "(+) mit (-) ergibt -" },
          { text: "Erst das Vorzeichen bestimmen, dann die Beträge rechnen.", beispiel: "(-6) : (-2): gleich, also +, dann 6:2 = 3" },
        ],
      },
      {
        titel: "Multiplikation (Mal)",
        tabelle: {
          kopf: ["Rechnung", "Vorzeichen", "Beispiel"],
          zeilen: [
            ["plus mal plus", "= plus", "(+3) mal (+4) = +12"],
            ["plus mal minus", "= minus", "(+3) mal (-4) = -12"],
            ["minus mal plus", "= minus", "(-3) mal (+4) = -12"],
            ["minus mal minus", "= plus", "(-3) mal (-4) = +12"],
          ],
        },
      },
      {
        titel: "Division (Geteilt)",
        einleitung: "Beim Teilen gelten genau dieselben Vorzeichenregeln wie beim Mal.",
        tabelle: {
          kopf: ["Rechnung", "Vorzeichen", "Beispiel"],
          zeilen: [
            ["plus geteilt plus", "= plus", "(+12) : (+4) = +3"],
            ["plus geteilt minus", "= minus", "(+12) : (-4) = -3"],
            ["minus geteilt plus", "= minus", "(-12) : (+4) = -3"],
            ["minus geteilt minus", "= plus", "(-12) : (-4) = +3"],
          ],
        },
      },
      {
        titel: "Trick zum Merken",
        regeln: [
          { text: "Zähle die Minuszeichen: gerade Anzahl ergibt Plus, ungerade ergibt Minus.", beispiel: "(-2) mal (-3) mal (-1) = -6 (drei Minus, also ungerade)" },
        ],
      },
    ],
  },
  l4: {
    abschnitte: [
      {
        titel: "Worum geht es",
        einleitung:
          "Konsonantische Deklination (3. Deklination). Adjektive richten sich in Kasus, Numerus und Genus nach ihrem Bezugswort. Beispiel: vetus (alt).",
        regeln: [
          { text: "Der Wortstamm endet auf einen Konsonanten, die Endung hängt direkt an.", beispiel: "vetus, Stamm veter-" },
          { text: "Maskulin und Feminin haben dieselben Endungen, Neutrum weicht in Nominativ und Akkusativ ab." },
        ],
      },
      {
        titel: "Endungen m. / f.",
        tabelle: {
          kopf: ["Kasus", "Singular", "Plural"],
          zeilen: [
            ["Nominativ", "- (oder -s)", "-es"],
            ["Genitiv", "-is", "-um"],
            ["Dativ", "-i", "-ibus"],
            ["Akkusativ", "-em", "-es"],
            ["Ablativ", "-e", "-ibus"],
          ],
        },
      },
      {
        titel: "Endungen Neutrum",
        einleitung: "Beim Neutrum sind Nominativ und Akkusativ immer gleich, im Plural enden sie auf -a.",
        tabelle: {
          kopf: ["Kasus", "Singular", "Plural"],
          zeilen: [
            ["Nominativ", "-", "-a"],
            ["Genitiv", "-is", "-um"],
            ["Dativ", "-i", "-ibus"],
            ["Akkusativ", "-", "-a"],
            ["Ablativ", "-e", "-ibus"],
          ],
        },
      },
      {
        titel: "Beispiel vetus",
        tabelle: {
          kopf: ["Kasus", "Sg. m./f.", "Pl. m./f."],
          zeilen: [
            ["Nom.", "vetus", "veteres"],
            ["Gen.", "veteris", "veterum"],
            ["Dat.", "veteri", "veteribus"],
            ["Akk.", "veterem", "veteres"],
            ["Abl.", "vetere", "veteribus"],
          ],
        },
      },
    ],
  },
  gr3: {
    abschnitte: [
      {
        titel: "Die vier Fälle",
        einleitung: "Jeder Fall (Kasus) hat eine Aufgabe im Satz. Du erfragst ihn mit einer bestimmten Frage.",
        tabelle: {
          kopf: ["Fall", "Frage", "Funktion"],
          zeilen: [
            ["Nominativ", "wer? was?", "Subjekt (wer handelt)"],
            ["Genitiv", "wessen?", "Besitz, Zugehörigkeit"],
            ["Dativ", "wem?", "Empfänger (indirektes Objekt)"],
            ["Akkusativ", "wen? was?", "direktes Objekt (Ziel)"],
          ],
        },
      },
      {
        titel: "So prüfst du",
        regeln: [
          { text: "Nominativ: Stelle die Frage wer oder was tut etwas.", beispiel: "Die Göttin spricht. (wer spricht?)" },
          { text: "Genitiv: Frage wessen, oft mit von übersetzt.", beispiel: "das Haus der Göttin (wessen Haus?)" },
          { text: "Dativ: Frage wem etwas gegeben oder gesagt wird.", beispiel: "Ich folge der Göttin. (wem folge ich?)" },
          { text: "Akkusativ: Frage wen oder was die Handlung trifft.", beispiel: "Ich sehe die Göttin. (wen sehe ich?)" },
        ],
      },
    ],
  },
  gr4: {
    abschnitte: [
      {
        titel: "Worum geht es",
        einleitung:
          "a-Deklination (1. Deklination) im Singular. Es gibt feminine Wörter und einige maskuline. Das Geschlecht erkennst du am Artikel.",
        regeln: [
          { text: "Feminin auf langes Alpha (a) behält das a in allen Fällen.", beispiel: "he chora (das Land)" },
          { text: "Maskuline der a-Deklination enden im Nominativ Singular auf -es oder -as.", beispiel: "ho neanias (der junge Mann)" },
        ],
      },
      {
        titel: "Endungen feminin (a-Klasse)",
        einleitung: "Langes Alpha, Beispiel he chora (das Land).",
        tabelle: {
          kopf: ["Fall", "Artikel", "Endung", "Beispiel"],
          zeilen: [
            ["Nom.", "he", "-a", "chora"],
            ["Gen.", "tes", "-as", "choras"],
            ["Dat.", "te", "-a (mit Iota)", "chora"],
            ["Akk.", "ten", "-an", "choran"],
          ],
        },
      },
      {
        titel: "Endungen feminin (e-Klasse)",
        einleitung: "Nach Zischlaut wird das Alpha zum Eta, Beispiel he gnome (die Meinung).",
        tabelle: {
          kopf: ["Fall", "Artikel", "Endung", "Beispiel"],
          zeilen: [
            ["Nom.", "he", "-e", "gnome"],
            ["Gen.", "tes", "-es", "gnomes"],
            ["Dat.", "te", "-e (mit Iota)", "gnome"],
            ["Akk.", "ten", "-en", "gnomen"],
          ],
        },
      },
      {
        titel: "Endungen maskulin",
        einleitung: "Beispiel ho polites (der Bürger): nur Nominativ und Genitiv weichen ab.",
        tabelle: {
          kopf: ["Fall", "Artikel", "Endung", "Beispiel"],
          zeilen: [
            ["Nom.", "ho", "-es", "polites"],
            ["Gen.", "tou", "-ou", "politou"],
            ["Dat.", "to", "-e (mit Iota)", "polite"],
            ["Akk.", "ton", "-en", "politen"],
          ],
        },
      },
    ],
  },
  d3: {
    abschnitte: [
      {
        titel: "Aufbau",
        einleitung:
          "Ein Lernplakat zeigt ein Thema auf einen Blick. Plane den Platz, bevor du klebst oder schreibst.",
        regeln: [
          { text: "Eine klare Überschrift ganz oben, groß und lesbar." },
          { text: "Das Thema in 3 bis 5 Felder aufteilen.", beispiel: "Definition, Beispiel, Merksatz, Bild" },
          { text: "Wichtiges in die Mitte, Ergänzungen an den Rand." },
        ],
      },
      {
        titel: "Gestaltung",
        regeln: [
          { text: "Stichworte statt ganzer Sätze: kurz und merkbar." },
          { text: "Farben mit System: eine Farbe pro Unterthema." },
          { text: "Bilder, Pfeile und Rahmen helfen beim Verstehen." },
          { text: "Aus 2 Metern Abstand muss die Überschrift lesbar sein." },
        ],
      },
      {
        titel: "Vor dem Abgeben prüfen",
        regeln: [
          { text: "Stimmt alles fachlich und ist nichts Wichtiges vergessen?" },
          { text: "Ist die Schrift sauber und überall lesbar?" },
          { text: "Sieht das Plakat aufgeräumt aus, nicht überladen?" },
        ],
      },
    ],
  },
  d4: {
    abschnitte: [
      {
        titel: "Was ist ein Lapbook?",
        einleitung:
          "Ein Lapbook ist eine aufklappbare Mappe zu einem Thema. Unter kleinen Klappen versteckst du Inhalte, die man zum Lesen aufklappt.",
        regeln: [
          { text: "Grundlage ist ein gefalteter Tonkarton (DIN A3)." },
          { text: "Darauf kommen viele kleine Klappen und Taschen." },
        ],
      },
      {
        titel: "Klappen-Arten",
        tabelle: {
          kopf: ["Klappe", "Eignet sich für"],
          zeilen: [
            ["Einfache Klappe", "Frage außen, Antwort innen"],
            ["Leporello (Ziehharmonika)", "eine Reihenfolge oder Zeitleiste"],
            ["Drehscheibe", "Begriffe und ihre Bedeutung"],
            ["Tasche mit Kärtchen", "Vokabeln oder Beispiele"],
          ],
        },
      },
      {
        titel: "So baust du es",
        regeln: [
          { text: "Tonkarton in der Mitte falten, beide Seiten nach innen klappen." },
          { text: "Klappen erst beschriften, dann ausschneiden und aufkleben." },
          { text: "Erst anordnen, dann kleben: so passt am Ende alles." },
        ],
      },
    ],
  },
};

export const LUECKENTEXT = {
  e4: {
    saetze: [
      { situation: "Ihr plant das Wochenende und schaut auf die Wetter-App.", vor: "If it ", loesung: ["rains"], nach: " tomorrow, we will stay at home.", tipp: "Nach if steht das Present Simple (it: + s)." },
      { situation: "Ihr plant das Wochenende und schaut auf die Wetter-App.", vor: "If it rains tomorrow, we ", loesung: ["will stay", "'ll stay"], nach: " at home.", tipp: "Die Folge im Hauptsatz: will + Grundform." },
      { situation: "Kurz vor der Klassenarbeit.", vor: "If you ", loesung: ["study", "work"], nach: " hard, you will pass the exam.", tipp: "Bedingung nach if: Present Simple." },
      { situation: "Kurz vor der Klassenarbeit.", vor: "If you study hard, you ", loesung: ["will pass", "'ll pass"], nach: " the exam.", tipp: "Hauptsatz: will + Grundform." },
      { situation: "Beim Fußballspiel deiner Schwester.", vor: "She will be happy if she ", loesung: ["wins"], nach: " the game.", tipp: "Nach if: Present Simple, bei she immer + s (wins)." },
      { situation: "Der Bus kommt gleich, ihr seid spät dran.", vor: "If we ", loesung: ["miss"], nach: " the bus, we will be late.", tipp: "Bedingung im Present Simple, niemals will nach if." },
      { situation: "Morgen soll die Sonne scheinen.", vor: "If the weather is nice, they ", loesung: ["will go", "'ll go", "will play", "'ll play"], nach: " to the beach.", tipp: "Hauptsatz mit will + Grundform." },
      { situation: "Dein Freund braucht Hilfe bei den Hausaufgaben.", vor: "I will help you if you ", loesung: ["ask", "ask me"], nach: " me.", tipp: "Nach if: Present Simple." },
    ],
  },
  e3: {
    saetze: [
      { vor: "Look at those dark clouds! It ", loesung: ["is going to", "'s going to"], nach: " rain.", tipp: "Vorhersage mit Beweis vor Augen: going to." },
      { vor: "I think our team ", loesung: ["will"], nach: " win the match.", tipp: "Vermutung, Meinung (I think): will." },
      { vor: "I have already decided: I ", loesung: ["am going to", "'m going to"], nach: " learn Spanish next year.", tipp: "Fester Plan, Absicht: going to." },
      { vor: "The phone is ringing. I ", loesung: ["will", "'ll"], nach: " answer it.", tipp: "Spontane Entscheidung im Moment: will." },
      { vor: "We ", loesung: ["are going to", "'re going to"], nach: " visit our grandparents this weekend, it is all planned.", tipp: "Geplante Absicht: going to." },
      { vor: "Maybe she ", loesung: ["will"], nach: " call you later.", tipp: "Unsichere Vorhersage (maybe): will." },
      { vor: "Watch out, you ", loesung: ["are going to", "'re going to"], nach: " drop that glass!", tipp: "Sichtbares Anzeichen jetzt: going to." },
      { vor: "I promise I ", loesung: ["will", "'ll"], nach: " be on time.", tipp: "Versprechen: will." },
    ],
  },
  l3: {
    saetze: [
      { vor: '"Audio puerum cantare." Übersetzung: Ich höre, ', loesung: ["dass der Junge singt"], nach: ".", tipp: "ACI: Akkusativ wird zum Subjekt, Infinitiv zum Prädikat im dass-Satz." },
      { vor: '"Video amicum venire." Übersetzung: Ich sehe, ', loesung: ["dass der Freund kommt"], nach: ".", tipp: "amicum (Akk.) = Subjekt, venire = kommt." },
      { vor: '"Magister dicit discipulos laborare." Übersetzung: Der Lehrer sagt, ', loesung: ["dass die Schüler arbeiten"], nach: ".", tipp: "discipulos ist Plural-Akkusativ: die Schüler." },
      { vor: '"Puella putat puerum dormire." Übersetzung: Das Mädchen glaubt, ', loesung: ["dass der Junge schläft"], nach: ".", tipp: "putat (glaubt) löst den ACI aus." },
      { vor: '"Scio te Romam amare." Übersetzung: Ich weiß, ', loesung: ["dass du Rom liebst"], nach: ".", tipp: "te (Akk. von tu) = du, amare = liebst." },
      { vor: '"Pater sperat filium venturum esse." Übersetzung: Der Vater hofft, ', loesung: ["dass der Sohn kommen wird", "dass der Sohn kommt"], nach: ".", tipp: "venturum esse ist Infinitiv Futur: kommen wird." },
      { vor: '"Credo Marcum verum dicere." Übersetzung: Ich glaube, ', loesung: ["dass Marcus die Wahrheit sagt"], nach: ".", tipp: "verum = die Wahrheit (Akk. Objekt im dass-Satz)." },
      { vor: '"Nuntius dicit hostes appropinquare." Das einzelne Wort hostes heißt übersetzt: ', loesung: ["die Feinde", "Feinde"], nach: ".", tipp: "hostes ist hier der Akkusativ Plural von hostis." },
    ],
  },
};

export const REIHENFOLGE = {
  m5: {
    aufgabe: "Bring die Rechenschritte für −2 · (3 − 5) + 4 in die richtige Reihenfolge.",
    schritte: [
      "Zuerst die Klammer berechnen: 3 − 5 = −2",
      "Den Wert einsetzen: −2 · (−2) + 4",
      "Punkt vor Strich: −2 · (−2) = 4",
      "Einsetzen: 4 + 4",
      "Zusammenrechnen: 4 + 4 = 8",
    ],
    erklaerung:
      "Die Reihenfolge folgt zwei Regeln: erst Klammern, dann Punkt vor Strich. Deshalb kommt 3 − 5 zuerst, dann die Mal-Rechnung −2 · (−2), und erst ganz am Ende das Plus.",
  },
  d5: {
    aufgabe: "Bring die Stationen der Weltreise in die richtige Reihenfolge (von London aus immer nach Osten).",
    schritte: [
      "London: der Start der Reise",
      "Suezkanal in Ägypten",
      "Bombay in Indien",
      "Hongkong in China",
      "San Francisco in den USA",
      "Zurück in London: das Ziel",
    ],
  },
};

export const AUSWAHLQUIZ = {
  // Deutsch: Lernplakat gestalten, situative Entscheidungen (Anwendung der Regeln).
  d7: {
    fragen: [
      {
        frage: "Du gestaltest ein Lernplakat. Wie viel Text gehört darauf?",
        optionen: [
          "Wenig Text, nur kurze Stichpunkte.",
          { text: "So viel wie möglich, damit alles ganz genau erklärt ist.", erklaerung: "Zu viel Text kann aus der Entfernung niemand lesen. Ein Plakat lebt von kurzen Stichpunkten." },
          { text: "Gar kein Text, nur Bilder.", erklaerung: "Ein paar Stichworte braucht es zur Orientierung. Nur Bilder ohne Worte sind oft nicht eindeutig." },
        ],
        richtig: 0,
        erklaerung: "Auf ein Lernplakat kommen kurze Stichpunkte, keine ganzen Sätze. So bleibt es übersichtlich und aus der Ferne lesbar.",
      },
      {
        frage: "Wohin gehört die Überschrift?",
        optionen: [
          "Oben, groß und gut lesbar.",
          { text: "Unten klein in die Ecke.", erklaerung: "Die Überschrift ist das Erste, was alle sehen sollen. In der Ecke geht sie unter." },
          { text: "Mittig versteckt zwischen den Bildern.", erklaerung: "Zwischen den Bildern fällt die Überschrift nicht auf. Sie gehört klar nach oben." },
        ],
        richtig: 0,
        erklaerung: "Die Überschrift steht groß oben, damit sofort klar ist, worum es auf dem Plakat geht.",
      },
      {
        frage: "Wie ordnest du die Inhalte auf dem Plakat?",
        optionen: [
          "In klare Felder mit eigenen Überschriften.",
          { text: "Kreuz und quer, wo gerade Platz ist.", erklaerung: "Ohne Ordnung findet das Auge keinen Anfang. Klare Felder führen durch das Plakat." },
          { text: "Alles in einen langen Fließtext untereinander.", erklaerung: "Ein langer Fließtext wirkt wie eine Textwand. Felder und Stichpunkte sind übersichtlicher." },
        ],
        richtig: 0,
        erklaerung: "Klare Bereiche mit Überschriften gliedern das Plakat, sodass man es schnell erfassen kann.",
      },
      {
        frage: "Womit prüfst du, ob dein Plakat lesbar ist?",
        optionen: [
          "Du trittst ein paar Schritte zurück und schaust, ob du es noch lesen kannst.",
          { text: "Du gehst mit der Lupe ganz nah heran.", erklaerung: "Ein Plakat wird aus der Entfernung betrachtet, nicht mit der Lupe. Der Test ist der Abstand." },
          { text: "Gar nicht, Hauptsache es ist bunt.", erklaerung: "Bunt allein hilft nicht. Wichtig ist, dass man Überschrift und Stichpunkte aus der Ferne lesen kann." },
        ],
        richtig: 0,
        erklaerung: "Tritt ein paar Schritte zurück: Wenn die Überschrift und die Stichpunkte noch lesbar sind, passt die Schriftgröße.",
      },
      {
        frage: "Was gehört zum Schluss noch auf das Plakat?",
        optionen: [
          "Die Quellen, also woher deine Bilder und Infos stammen.",
          { text: "Nichts weiter, das Plakat ist fertig.", erklaerung: "Quellen gehören dazu, damit man weiß, woher die Infos kommen. Sie werden oft vergessen." },
          { text: "Ein großes buntes Muster über den ganzen Rand.", erklaerung: "Deko über den ganzen Rand lenkt ab. Wichtiger ist die Quellenangabe." },
        ],
        richtig: 0,
        erklaerung: "Am Ende gibst du deine Quellen an, also woher die Bilder und Informationen kommen. Das gehört immer dazu.",
      },
    ],
  },
  // Mathe: Plus und Minus mit negativen Zahlen anwenden (inkl. Sachaufgaben).
  m7: {
    fragen: [
      {
        frage: "Wie viel ist −8 + 3?",
        optionen: [
          "−5",
          { text: "5", erklaerung: "−8 hat den größeren Betrag, also bleibt das Ergebnis negativ." },
          { text: "11", erklaerung: "Das wäre 8 + 3. Die 8 ist hier aber negativ." },
          { text: "−11", erklaerung: "Das wäre −(8 + 3). Nur eine der Zahlen ist negativ." },
        ],
        richtig: 0,
        erklaerung: "Verschiedene Vorzeichen: Beträge abziehen (8 − 3 = 5), Vorzeichen der größeren Zahl, also −5.",
      },
      {
        frage: "Wie viel ist −5 + (−7)?",
        optionen: [
          "−12",
          { text: "12", erklaerung: "Gleiche Vorzeichen: Beträge addieren, aber das Vorzeichen bleibt minus." },
          { text: "2", erklaerung: "Hier wird nicht abgezogen, beide Zahlen sind negativ." },
          { text: "−2", erklaerung: "Beträge werden addiert (5 + 7), nicht abgezogen." },
        ],
        richtig: 0,
        erklaerung: "Gleiche Vorzeichen: Beträge addieren (5 + 7 = 12), Vorzeichen behalten, also −12.",
      },
      {
        frage: "Wie viel ist 6 − (−4)?",
        optionen: [
          { text: "2", erklaerung: "Minus und Minus werden zu Plus, das Ergebnis wird größer." },
          "10",
          { text: "−10", erklaerung: "Die 6 bleibt positiv, es wird 6 + 4 gerechnet." },
          { text: "−2", erklaerung: "Doppelvorzeichen zuerst auflösen: − (−4) wird + 4." },
        ],
        richtig: 1,
        erklaerung: "Minus und Minus wird Plus: 6 + 4 = 10.",
      },
      {
        frage: "Morgens sind es −3 Grad. Bis Mittag wird es 7 Grad wärmer. Wie viel Grad sind es dann?",
        optionen: [
          { text: "−10 Grad", erklaerung: "Es wird wärmer, du rechnest −3 + 7, nicht −3 − 7." },
          "4 Grad",
          { text: "10 Grad", erklaerung: "Start ist −3, nicht 3. Erst über die 0, dann weiter." },
          { text: "−4 Grad", erklaerung: "7 ist größer als 3, also landest du über null." },
        ],
        richtig: 1,
        erklaerung: "−3 + 7 = 4: von −3 sieben Schritte nach rechts landet bei +4 Grad.",
      },
      {
        frage: "Lina hat −12 Euro auf dem Konto (also 12 Euro Schulden) und zahlt 20 Euro ein. Wie ist der Kontostand?",
        optionen: [
          "8 Euro",
          { text: "−8 Euro", erklaerung: "20 ist größer als 12, die Schulden sind ausgeglichen und es bleibt etwas übrig." },
          { text: "−32 Euro", erklaerung: "Einzahlen macht den Kontostand größer, du rechnest −12 + 20." },
          { text: "32 Euro", erklaerung: "Das wäre 12 + 20. Die 12 ist aber ein Minus (Schulden)." },
        ],
        richtig: 0,
        erklaerung: "−12 + 20 = 8: die 12 Euro Schulden sind weg, 8 Euro bleiben übrig.",
      },
    ],
  },
  // Mathe: Mal und Geteilt mit negativen Zahlen anwenden (inkl. Sachaufgabe).
  m8: {
    fragen: [
      {
        frage: "Wie viel ist −6 · 4?",
        optionen: [
          "−24",
          { text: "24", erklaerung: "Verschiedene Vorzeichen (minus mal plus) ergeben minus." },
          { text: "−10", erklaerung: "Das wäre −6 − 4. Hier wird multipliziert." },
          { text: "−2", erklaerung: "Das wäre −6 + 4. Hier wird multipliziert." },
        ],
        richtig: 0,
        erklaerung: "Minus mal Plus ergibt Minus: 6 · 4 = 24, also −24.",
      },
      {
        frage: "Wie viel ist −5 · (−3)?",
        optionen: [
          { text: "−15", erklaerung: "Minus mal Minus ergibt Plus, nicht Minus." },
          "15",
          { text: "8", erklaerung: "Das wäre −5 + (−3) als Betrag. Hier wird mal gerechnet." },
          { text: "−8", erklaerung: "Hier wird multipliziert, nicht addiert." },
        ],
        richtig: 1,
        erklaerung: "Minus mal Minus ergibt Plus: 5 · 3 = 15.",
      },
      {
        frage: "Wie viel ist −18 : 6?",
        optionen: [
          "−3",
          { text: "3", erklaerung: "Minus geteilt durch Plus bleibt minus." },
          { text: "−12", erklaerung: "Das wäre −18 − 6. Hier wird geteilt." },
          { text: "−108", erklaerung: "Das wäre −18 · 6. Hier wird geteilt, nicht mal." },
        ],
        richtig: 0,
        erklaerung: "Minus geteilt durch Plus ergibt Minus: 18 : 6 = 3, also −3.",
      },
      {
        frage: "Wie viel ist −2 · (−3) · (−1)?",
        optionen: [
          { text: "6", erklaerung: "Zähle die Minuszeichen: drei sind ungerade, also wird das Ergebnis minus." },
          "−6",
          { text: "−5", erklaerung: "Hier wird multipliziert, nicht addiert." },
          { text: "5", erklaerung: "Hier wird multipliziert (2 · 3 · 1 = 6), nicht addiert." },
        ],
        richtig: 1,
        erklaerung: "Drei Minuszeichen (ungerade) ergeben Minus: 2 · 3 · 1 = 6, also −6.",
      },
      {
        frage: "Ein Taucher sinkt von der Wasseroberfläche (0 m) jede Minute 3 Meter. Wo ist er nach 4 Minuten?",
        optionen: [
          "−12 Meter",
          { text: "12 Meter", erklaerung: "Er sinkt, geht also unter null: das Ergebnis ist negativ." },
          { text: "−7 Meter", erklaerung: "Pro Minute sinkt er, das ist −3 · 4, nicht −3 − 4." },
          { text: "−1 Meter", erklaerung: "Nach 4 Minuten ist er viermal 3 Meter tiefer." },
        ],
        richtig: 0,
        erklaerung: "−3 · 4 = −12: viermal 3 Meter abwärts sind 12 Meter unter der Oberfläche.",
      },
    ],
  },
  gr7: {
    fragen: [
      {
        frage: "Ὁ ἄνθρωπος λέγει. (Der Mensch spricht.) In welchem Fall steht „ὁ ἄνθρωπος\"?",
        optionen: ["Nominativ", "Genitiv", "Dativ", "Akkusativ"],
        richtig: 0,
        erklaerung: "Wer spricht? Der Mensch ist das Subjekt, also Nominativ.",
      },
      {
        frage: "Ὁ ἄνθρωπος τὴν θάλασσαν ὁρᾷ. (Der Mensch sieht das Meer.) In welchem Fall steht „τὴν θάλασσαν\"?",
        optionen: [
          "Akkusativ",
          { text: "Dativ", erklaerung: "Dativ wäre wem? Hier fragst du wen oder was er sieht, das ist Akkusativ." },
          "Nominativ",
          "Genitiv",
        ],
        richtig: 0,
        erklaerung: "Wen oder was sieht er? Das Meer ist das direkte Objekt, also Akkusativ (Endung -ν).",
      },
      {
        frage: "Ὁ λόγος τῷ ἀνθρώπῳ πέμπεται. (Das Wort wird dem Menschen geschickt.) In welchem Fall steht „τῷ ἀνθρώπῳ\"?",
        optionen: [
          "Dativ",
          { text: "Akkusativ", erklaerung: "Akkusativ wäre wen? Hier fragst du wem es geschickt wird, das ist Dativ." },
          "Nominativ",
          "Genitiv",
        ],
        richtig: 0,
        erklaerung: "Wem wird es geschickt? Der Empfänger steht im Dativ.",
      },
      {
        frage: "Ἡ ἀρετὴ τοῦ ἀνθρώπου μεγάλη ἐστιν. (Die Tugend des Menschen ist groß.) In welchem Fall steht „τοῦ ἀνθρώπου\"?",
        optionen: ["Genitiv", "Dativ", "Akkusativ", "Nominativ"],
        richtig: 0,
        erklaerung: "Wessen Tugend? Die Zugehörigkeit steht im Genitiv.",
      },
      {
        frage: "Ὁ ἄνθρωπος τὸν λόγον λέγει. (Der Mensch spricht das Wort.) In welchem Fall steht „τὸν λόγον\"?",
        optionen: ["Nominativ", "Akkusativ", "Genitiv", "Dativ"],
        richtig: 1,
        erklaerung: "Was spricht er? Das Wort ist das Objekt, also Akkusativ (Endung -ον).",
      },
      {
        frage: "Ἡ θάλασσα μεγάλη ἐστιν. (Das Meer ist groß.) In welchem Fall steht „ἡ θάλασσα\"?",
        optionen: ["Dativ", "Genitiv", "Nominativ", "Akkusativ"],
        richtig: 2,
        erklaerung: "Was ist groß? Das Meer ist das Subjekt, also Nominativ.",
      },
    ],
  },
  gr6: {
    fragen: [
      {
        frage:
          "Welcher Fall ist das Subjekt im Satz (du fragst: wer oder was handelt)?",
        optionen: ["Nominativ", "Genitiv", "Dativ", "Akkusativ"],
        richtig: 0,
        erklaerung: "Der Nominativ ist der Fall des Subjekts: wer oder was tut etwas.",
      },
      {
        frage: "Auf welche Frage antwortet der Genitiv?",
        optionen: ["wem?", "wessen?", "wen oder was?", "wer oder was?"],
        richtig: 1,
        erklaerung: "Der Genitiv zeigt Besitz und Zugehörigkeit, du fragst wessen.",
      },
      {
        frage: "Du fragst, wem etwas gegeben wird. Welcher Fall ist das?",
        optionen: ["Akkusativ", "Nominativ", "Dativ", "Genitiv"],
        richtig: 2,
        erklaerung: "Der Dativ ist der Empfänger, das indirekte Objekt: wem.",
      },
      {
        frage: "Ich sehe die Göttin. In welchem Fall steht die Göttin?",
        optionen: [
          { text: "Nominativ", erklaerung: "Nominativ wäre, wer handelt. Hier handelt aber ich, nicht die Göttin." },
          { text: "Dativ", erklaerung: "Dativ wäre wem? Hier fragst du wen sehe ich, das ist Akkusativ." },
          "Genitiv",
          "Akkusativ",
        ],
        richtig: 3,
        erklaerung: "Wen sehe ich? Die Göttin ist das direkte Objekt, also Akkusativ.",
      },
      {
        frage: "Das Haus der Göttin. In welchem Fall steht der Göttin?",
        optionen: [
          "Genitiv",
          { text: "Dativ", erklaerung: "Dativ wäre wem? Hier fragst du wessen Haus, das ist Genitiv." },
          "Akkusativ",
          "Nominativ",
        ],
        richtig: 0,
        erklaerung: "Wessen Haus? Der Göttin steht im Genitiv (Zugehörigkeit).",
      },
      {
        frage: "Ich folge der Göttin. In welchem Fall steht der Göttin?",
        optionen: [
          { text: "Akkusativ", erklaerung: "Vorsicht, Falle: folgen sieht aus wie ein Objekt, steht aber im Dativ. Du fragst wem folge ich." },
          "Dativ",
          "Nominativ",
          "Genitiv",
        ],
        richtig: 1,
        erklaerung: "Wem folge ich? Der Göttin steht im Dativ (Empfänger).",
      },
    ],
  },
  m6: {
    fragen: [
      {
        frage: "Wie viel ist −7 + 12?",
        optionen: [
          { text: "−5", erklaerung: "Fast: 12 ist größer als 7, also wird das Ergebnis positiv." },
          "5",
          { text: "19", erklaerung: "Das wäre 7 + 12. Hier ist die 7 aber negativ." },
          { text: "−19", erklaerung: "Das wäre −(7 + 12). Nur eine der Zahlen ist negativ." },
        ],
        richtig: 1,
        erklaerung: "−7 + 12 = 12 − 7 = 5.",
      },
      {
        frage: "Wie viel ist 4 − 9?",
        optionen: [
          "−5",
          { text: "5", erklaerung: "Das wäre 9 − 4. Hier steht die 4 zuerst, es geht unter null." },
          { text: "−13", erklaerung: "Hier wird subtrahiert, nicht 4 + 9 gerechnet." },
          { text: "13", erklaerung: "Das wäre 4 + 9. Gefragt ist aber 4 − 9." },
        ],
        richtig: 0,
        erklaerung: "4 − 9 geht über die Null hinaus: −5.",
      },
      {
        frage: "Wie viel ist −3 · (−5)?",
        optionen: [
          { text: "−15", erklaerung: "Minus mal Minus ergibt Plus, nicht Minus." },
          { text: "8", erklaerung: "Das wäre 3 + 5. Hier wird mal gerechnet." },
          "15",
          { text: "−8", erklaerung: "Das wäre −(3 + 5). Hier wird multipliziert." },
        ],
        richtig: 2,
        erklaerung: "Minus mal Minus ergibt Plus: 3 · 5 = 15.",
      },
      {
        frage: "Wie viel ist −20 : 4?",
        optionen: [
          "−5",
          { text: "5", erklaerung: "Minus geteilt durch Plus bleibt minus." },
          { text: "−16", erklaerung: "Das wäre 20 − 4. Hier wird geteilt." },
          { text: "−24", erklaerung: "Das wäre −20 − 4. Hier wird geteilt." },
        ],
        richtig: 0,
        erklaerung: "Minus geteilt durch Plus ergibt Minus: 20 : 4 = 5, also −5.",
      },
      {
        frage: "Wie viel ist 5 − (−3)?",
        optionen: [
          { text: "2", erklaerung: "Das wäre 5 − 3. Minus und Minus werden hier zu Plus." },
          { text: "−2", erklaerung: "Minus und Minus werden zu Plus, nicht zu Minus." },
          "8",
          { text: "−8", erklaerung: "Das wäre −(5 + 3). Die 5 bleibt positiv." },
        ],
        richtig: 2,
        erklaerung: "Minus und Minus wird Plus: 5 + 3 = 8.",
      },
      {
        frage: "Was rechnest du bei 2 + 3 · 4 zuerst?",
        optionen: [
          { text: "2 + 3", erklaerung: "Punkt vor Strich: das Mal kommt zuerst." },
          { text: "von links nach rechts", erklaerung: "Das gilt nur bei gleichen Rechenarten." },
          "3 · 4",
          { text: "egal", erklaerung: "Die Reihenfolge zählt: Punkt vor Strich." },
        ],
        richtig: 2,
        erklaerung: "Punkt vor Strich: erst 3 · 4 = 12, dann 2 + 12 = 14.",
      },
    ],
  },
  l2: {
    fragen: [
      {
        frage: "Wofür steht die Abkürzung ACI?",
        optionen: [
          "Ablativus cum Infinitivo",
          "Accusativus cum Infinitivo",
          "Accusativus cum Imperativo",
          "Adiectivum cum Infinitivo",
        ],
        richtig: 1,
        erklaerung: "ACI = Akkusativ mit Infinitiv.",
      },
      {
        frage: "Wie übersetzt man einen ACI meist ins Deutsche?",
        optionen: [
          "mit einem weil-Satz",
          "mit einem wenn-Satz",
          "mit einem dass-Satz",
          "mit einer Frage",
        ],
        richtig: 2,
        erklaerung: "Der ACI wird in der Regel mit einem dass-Satz wiedergegeben.",
      },
      {
        frage: "Welche Wörter lösen typischerweise einen ACI aus?",
        optionen: [
          "nur Präpositionen",
          "Verben des Sagens und Wahrnehmens",
          "nur Zahlwörter",
          "Verben der Bewegung",
        ],
        richtig: 1,
        erklaerung: "Verben wie dicere (sagen), audire (hören) und videre (sehen) leiten einen ACI ein.",
      },
      {
        frage: "Der Akkusativ des ACI wird im deutschen dass-Satz zum ...",
        optionen: ["Subjekt", "Objekt", "Prädikat", "Attribut"],
        richtig: 0,
        erklaerung: "Aus dem Akkusativ wird das Subjekt des dass-Satzes.",
      },
      {
        frage: '"Audio puerum cantare." Was ist hier puerum?',
        optionen: [
          "das Prädikat",
          "ein Ablativ",
          "der Akkusativ (Subjekt des ACI)",
          "der Infinitiv",
        ],
        richtig: 2,
        erklaerung: "puerum ist Akkusativ und wird zum Subjekt: dass der Junge singt.",
      },
      {
        frage: '"Audio puerum cantare." Was ist cantare?',
        optionen: [
          "der Infinitiv (Prädikat im dass-Satz)",
          "ein Substantiv",
          "ein Adjektiv",
          "der Akkusativ",
        ],
        richtig: 0,
        erklaerung: "cantare ist der Infinitiv und wird zu singt: Ich höre, dass der Junge singt.",
      },
      {
        frage: '"Magistra discipulam laborare videt." Welches Wort ist der Akkusativ (Subjekt des ACI)?',
        optionen: [
          "magistra",
          { text: "discipulam", erklaerung: "Richtig: discipulam endet auf -am, das ist Akkusativ Singular. Im ACI wird genau dieser Akkusativ zum Subjekt des dass-Satzes." },
          { text: "laborare", erklaerung: "laborare ist der Infinitiv, nicht der Akkusativ." },
          { text: "videt", erklaerung: "videt ist das auslösende Verb (sehen)." },
        ],
        richtig: 1,
        erklaerung: "discipulam ist Akkusativ und wird im dass-Satz zum Subjekt: dass die Schülerin arbeitet.",
      },
      {
        frage: '"Magistra discipulam laborare videt." Wie übersetzt du den Satz?',
        optionen: [
          { text: "Die Lehrerin sieht, dass die Schülerin arbeitet.", erklaerung: "Richtig: magistra (Nominativ) ist das Subjekt im Hauptsatz, der Akkusativ discipulam wird zum Subjekt des dass-Satzes, laborare wird zu arbeitet." },
          { text: "Die Schülerin sieht, dass die Lehrerin arbeitet.", erklaerung: "Vertauscht: magistra (Nominativ) sieht, discipulam (Akkusativ) arbeitet." },
          { text: "Die Lehrerin und die Schülerin arbeiten.", erklaerung: "Das ist kein dass-Satz, der ACI geht verloren." },
          { text: "Die Lehrerin sieht die arbeitende Schülerin.", erklaerung: "Nah dran, aber der ACI wird mit dass aufgelöst." },
        ],
        richtig: 0,
        erklaerung: "magistra (Nominativ) ist das Subjekt, der Akkusativ discipulam wird zum Subjekt des dass-Satzes, laborare zu arbeitet.",
      },
    ],
  },
};

export const ZUORDNUNG = {
  e6: {
    aufgabe: "Ordne jede englische Phrase ihrer deutschen Bedeutung zu.",
    paare: [
      { links: "Could you tell me ...?", rechts: "Könnten Sie mir sagen ...?", tipp: "could macht die Bitte höflich, tell heißt sagen.", erklaerung: "Could you ...? ist eine sehr höfliche Bitte, tell me heißt mir sagen." },
      { links: "Excuse me, where is ...?", rechts: "Entschuldigung, wo ist ...?", tipp: "where heißt wo.", erklaerung: "Excuse me leitet höflich ein, where is fragt nach dem Ort." },
      { links: "Do you know how to get to ...?", rechts: "Wissen Sie, wie man zu ... kommt?", tipp: "to get to heißt irgendwo hinkommen.", erklaerung: "how to get to ... heißt wie man zu ... kommt." },
      { links: "May I ask you something?", rechts: "Darf ich Sie etwas fragen?", tipp: "may fragt um Erlaubnis (dürfen).", erklaerung: "May I ...? heißt Darf ich ...?, something heißt etwas." },
      { links: "Could you say that again, please?", rechts: "Könnten Sie das bitte wiederholen?", tipp: "again heißt nochmal.", erklaerung: "say that again heißt das nochmal sagen, also wiederholen." },
      { links: "What time does ... open?", rechts: "Wann öffnet ...?", tipp: "what time heißt um welche Uhrzeit.", erklaerung: "What time does ... open? fragt nach der Öffnungszeit." },
    ],
  },
  d1: {
    aufgabe: "Ordne jedem Teil des Mini-Vortrags seine Funktion zu.",
    paare: [
      { links: "Einleitung", rechts: "Neugier wecken und Thema nennen" },
      { links: "Überleitung", rechts: "Vom Einstieg zum Inhalt führen" },
      { links: "Hauptteil", rechts: "Die wichtigsten Punkte erklären" },
      { links: "Beispiel", rechts: "Eine Aussage anschaulich machen" },
      { links: "Zusammenfassung", rechts: "Das Wichtigste kurz bündeln" },
      { links: "Schluss", rechts: "Mit einem starken Satz enden" },
    ],
  },
  d2: {
    aufgabe: "Ordne jedem Vortrags-Tipp zu, warum er wichtig ist.",
    paare: [
      { links: "Laut und deutlich sprechen", rechts: "Damit alle dich gut verstehen" },
      { links: "Blickkontakt halten", rechts: "Damit sich das Publikum angesprochen fühlt" },
      { links: "Langsam sprechen, Pausen machen", rechts: "Damit man dir gut folgen kann" },
      { links: "Aufrecht stehen", rechts: "Damit du sicher und ruhig wirkst" },
      { links: "Karteikarten statt Text ablesen", rechts: "Damit du frei und lebendig sprichst" },
      { links: "Hände ruhig einsetzen", rechts: "Damit Gesten das Gesagte unterstützen" },
    ],
  },
};
