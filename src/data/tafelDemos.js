// Demo-Tafelbilder: vorbereitete Beispiele für den Tafel-Snap-Flow.
// Pro Beispiel ein "vorher" (SVG-Mockup, simuliert das Foto) und ein "nachher"
// (strukturierte Notiz, die im Lernweg landet). In einer echten Implementierung
// würde die KI das nachher aus dem vorher erzeugen.

// Anzeige-Labels für Quelle-Typen. Eine Quelle beschreibt, was Max
// ursprünglich fotografiert/eingescannt hat. Die App soll später aus jedem
// dieser Inputs eine saubere strukturierte Notiz erzeugen können.
export const QUELLE_LABEL = {
  tafelbild: "Tafelbild",
  arbeitsblatt: "Arbeitsblatt",
  buchseite: "Buchseite",
  mitschrift: "Heft-Mitschrift",
};

// Demos mit versteckt: true werden im UI nicht angezeigt, bleiben aber im Code
// erhalten, damit man sie später schnell wieder einblenden kann.
const ALLE_TAFEL_DEMOS = [
  {
    id: "tafel-aci",
    quelle: "tafelbild",
    fach: "Latein",
    thema: "ACI mit Übersetzung",
    fachId: "latein",
    themaId: "aci-uebersetzung",
    titel: "ACI: Accusativus cum Infinitivo",
    inhalt: {
      ueberschrift: "ACI: Accusativus cum Infinitivo",
      walkthrough: {
        aufgabe: "Magister discipulos amare putat.",
        schritte: [
          "ACI-auslösendes Verb finden: putat (er glaubt)",
          "Akkusativ-Objekt: discipulos (die Schüler im Akk Plural)",
          "Infinitiv: amare (lieben)",
          "Übersetzungs-Schema: Subjekt + Verb + dass + [Akk wird Subjekt] + [Inf konjugiert]",
        ],
        loesung: "Der Lehrer glaubt, dass die Schüler lieben.",
      },
      tipps: {
        mitschueler:
          "Schau dir EIN Beispiel ganz langsam an. Markiere Akk und Inf farbig, dann fällt der Rest leichter.",
        ki: "Welches Wort im Satz löst den ACI aus?",
      },
      abschnitte: [
        {
          typ: "regel",
          ueberschrift: "Wann steht ein ACI?",
          text: "Nach Verben des Wahrnehmens, Sagens und Denkens (videre, dicere, putare, scire ...) steht im Lateinischen ein Akkusativ-mit-Infinitiv-Konstruktion.",
        },
        {
          typ: "schema",
          ueberschrift: "Aufbau",
          eintraege: [
            "Subjekt + Wahrnehmungs-Verb",
            "Akkusativ (= Subjekt im Deutschen)",
            "Infinitiv (= Prädikat im Deutschen)",
          ],
        },
        {
          typ: "beispiel",
          ueberschrift: "Beispiel",
          lateinisch: "Magister discipulos studere putat.",
          deutsch: "Der Lehrer glaubt, dass die Schüler lernen.",
        },
        {
          typ: "tipp",
          ueberschrift: "Übersetzungs-Trick",
          text: 'Im Deutschen mit "dass"-Satz übersetzen. Der Akkusativ wird zum Subjekt, der Infinitiv zum konjugierten Verb.',
        },
        {
          typ: "uebungen",
          ueberschrift: "Übungen",
          einleitung: "Vokabeln und ACI-Identifikation.",
          generator: "ACILatein",
          aufgaben: [
            {
              frage: "videre",
              loesung: ["sehen", "blicken"],
              hint: "Erste Auslöser-Vokabel von der Tafel.",
            },
            {
              frage: "putare",
              loesung: ["glauben", "denken", "meinen"],
              hint: "Ein Verb des Denkens und Meinens.",
            },
            {
              frage: 'Akkusativ in "Magister discipulos studere putat"',
              loesung: ["discipulos"],
              hint: "Welches Wort steht im Akkusativ Plural?",
            },
            {
              frage: 'Infinitiv in "Magister discipulos studere putat"',
              loesung: ["studere"],
              hint: "Welches Wort endet auf -re und ist nicht konjugiert?",
            },
            {
              frage: "Wie übersetzt man Akkusativ im ACI ins Deutsche?",
              loesung: ["Subjekt", "als Subjekt"],
              hint: "Aus discipulos wird im Deutschen die Schüler als ___.",
            },
          ],
        },
      ],
    },
  },
  {
    id: "tafel-negative-zahlen",
    quelle: "tafelbild",
    fach: "Mathematik",
    thema: "Addieren & Subtrahieren negativer Zahlen",
    fachId: "mathe",
    themaId: "addieren-subtrahieren",
    titel: "Addition und Subtraktion negativer Zahlen",
    inhalt: {
      ueberschrift: "Addition und Subtraktion negativer Zahlen",
      walkthrough: {
        aufgabe: "−3 − (−6) = ?",
        schritte: [
          "Doppel-Minus erkennen: − − wird zu +",
          "Aufgabe umschreiben: −3 + 6",
          "Auf dem Zahlenstrahl: von −3 aus 6 Schritte nach rechts",
          "Ergebnis: 3",
        ],
        loesung: "3",
      },
      tipps: {
        mitschueler:
          "Erst Vorzeichen klären, dann erst rechnen. Bei Minus mal Minus wird's Plus.",
        ki: "Welches Vorzeichen erwartest du beim Ergebnis und warum?",
      },
      abschnitte: [
        {
          typ: "regel",
          ueberschrift: "Vorzeichen-Regel",
          text: "Zwei gleiche Vorzeichen nebeneinander → Plus. Zwei verschiedene Vorzeichen → Minus.",
        },
        {
          typ: "schema",
          ueberschrift: "Merksätze",
          eintraege: [
            "+ und + → +",
            "− und − → +",
            "+ und − → −",
            "− und + → −",
          ],
        },
        {
          typ: "beispiel",
          ueberschrift: "Beispiele",
          rechnungen: [
            { ausdruck: "5 + (−3)", schritt: "5 − 3", ergebnis: "= 2" },
            { ausdruck: "−4 − (−6)", schritt: "−4 + 6", ergebnis: "= 2" },
            { ausdruck: "−7 + (−2)", schritt: "−7 − 2", ergebnis: "= −9" },
          ],
        },
        {
          typ: "tipp",
          ueberschrift: "Vorstellungs-Hilfe",
          text: "Stell dir den Zahlenstrahl vor: Plus geht nach rechts, Minus nach links. Vorzeichen sagen dir die Richtung. Probier es selbst aus.",
          interaktiv: "zahlenstrahl",
        },
        {
          typ: "uebungen",
          ueberschrift: "Übungen",
          einleitung: "Tipp dein Ergebnis ein und drück Enter. Die App prüft sofort. Wenn du weiter üben willst, lass dir frische Aufgaben generieren.",
          generator: "negativeZahlen",
          aufgaben: [
            { frage: "7 + (−4)", loesung: 3, hint: "Auf dem Zahlenstrahl: 7 nach links um 4." },
            { frage: "−3 − (−8)", loesung: 5, hint: "Minus mal minus wird plus. Also −3 + 8." },
            { frage: "−1 + (−9)", loesung: -10, hint: "Zwei negative Zahlen addieren: Beträge addieren, Vorzeichen bleibt minus." },
            { frage: "6 − 14", loesung: -8, hint: "Von 6 aus 14 Schritte nach links: du landest unter Null." },
            { frage: "−8 + 11", loesung: 3, hint: "Von −8 aus 11 Schritte nach rechts: du überschreitest die Null." },
          ],
        },
      ],
    },
  },
  {
    id: "tafel-will-future",
    versteckt: true,
    quelle: "tafelbild",
    fach: "Englisch",
    thema: "will-future · question tags · if-clause I",
    fachId: "englisch",
    themaId: "will-future",
    titel: "will-future: Zukunft im Englischen",
    inhalt: {
      ueberschrift: "will-future: Zukunft im Englischen",
      abschnitte: [
        {
          typ: "regel",
          ueberschrift: "Aufbau",
          text: "Subjekt + will + Grundform des Verbs. Für alle Personen gleich (I, you, he, she, we, they). Kein zusätzliches -s in der 3. Person.",
        },
        {
          typ: "schema",
          ueberschrift: "Drei Formen",
          eintraege: [
            "Aussage: I will help you.",
            "Verneinung: I won't (will not) help you.",
            "Frage: Will you help me?",
          ],
        },
        {
          typ: "beispiel",
          ueberschrift: "Beispiele",
          eintraege: [
            "I will help you tomorrow.",
            "She won't come to the party.",
            "Will you call me tonight?",
            "Cars will fly in 2030.",
          ],
        },
        {
          typ: "tipp",
          ueberschrift: "Signalwörter und Anwendung",
          text: "Typische Signalwörter: tomorrow, next week, soon, in 2030, in the future. Wann benutzt? Vorhersagen, spontane Entscheidungen, Versprechen.",
        },
        {
          typ: "uebungen",
          ueberschrift: "Übungen",
          einleitung: "Vokabeln, Sätze ergänzen und Grammatik.",
          generator: "willFuture",
          aufgaben: [
            {
              frage: "tomorrow",
              loesung: ["morgen"],
              hint: "Klassisches Zeit-Signalwort.",
            },
            {
              frage: "promise (deutsch → englisch)",
              loesung: ["promise"],
              hint: "Ein Wort, das das will-future oft auslöst.",
            },
            {
              frage: 'Lücke: "I ___ help you tomorrow."',
              loesung: ["will"],
              hint: "Spontanes Angebot in der Zukunft.",
            },
            {
              frage: 'Lücke: "She ___ come to the party." (Verneinung)',
              loesung: ["won't", "will not"],
              hint: "Verneinte Form, kurz oder lang.",
            },
            {
              frage: 'Lücke: "___ you call me tonight?" (Frage)',
              loesung: ["Will"],
              hint: "Frage-Stellung im will-future beginnt mit ___.",
            },
          ],
        },
      ],
    },
  },
  {
    id: "tafel-griech-alphabet",
    versteckt: true,
    quelle: "tafelbild",
    fach: "Griechisch",
    thema: "Griechische Buchstaben und Lautlehre",
    fachId: "griechisch",
    themaId: "alphabet",
    titel: "Griechisches Alphabet: 24 Buchstaben",
    inhalt: {
      ueberschrift: "Griechisches Alphabet: 24 Buchstaben",
      abschnitte: [
        {
          typ: "regel",
          ueberschrift: "Übersicht",
          text: "Das griechische Alphabet hat 24 Buchstaben. Jeder Buchstabe hat eine Klein- und Großform, einen Namen und einen Lautwert.",
        },
        {
          typ: "schema",
          ueberschrift: "Die 7 Vokale",
          eintraege: [
            "α (Α) alpha → a",
            "ε (Ε) epsilon → e (kurz)",
            "η (Η) eta → e (lang, ē)",
            "ι (Ι) iota → i",
            "ο (Ο) omikron → o (kurz)",
            "υ (Υ) ypsilon → ü/y",
            "ω (Ω) omega → o (lang, ō)",
          ],
        },
        {
          typ: "beispiel",
          ueberschrift: "Konsonanten-Beispiele",
          eintraege: [
            "β (Β) beta → b",
            "γ (Γ) gamma → g",
            "δ (Δ) delta → d",
            "θ (Θ) theta → th",
            "π (Π) pi → p",
            "σ (Σ) sigma → s",
            "φ (Φ) phi → ph",
            "χ (Χ) chi → ch",
            "ψ (Ψ) psi → ps",
          ],
        },
        {
          typ: "tipp",
          ueberschrift: "Lern-Tipp",
          text: "Großbuchstaben sehen oft anders aus als die Kleinen (z.B. λ Λ, ξ Ξ). Lerne sie in beiden Formen. Manche Namen tauchen in deutschen Wörtern auf: Alphabet, Delta, Omega, Theta.",
        },
        {
          typ: "uebungen",
          ueberschrift: "Übungen",
          einleitung: "Buchstabe → Name, Name → Buchstabe, Lautwert → Name.",
          generator: "griechAlphabet",
          aufgaben: [
            { frage: "α (Kleinbuchstabe → Name)", loesung: ["alpha"], hint: "Erster Buchstabe des Alphabets." },
            { frage: "β (Kleinbuchstabe → Name)", loesung: ["beta"], hint: "Zweiter Buchstabe, klingt wie b." },
            { frage: "Δ (Großbuchstabe → Name)", loesung: ["delta"], hint: "Dreieck-Form. Wie das Flussdelta." },
            { frage: "delta (Name → Kleinbuchstabe)", loesung: ["δ"], hint: "Der vierte Buchstabe als Kleinform." },
            { frage: "Lautwert th → Name?", loesung: ["theta"], hint: "Englischer th-Laut." },
          ],
        },
      ],
    },
  },
  {
    id: "mitschrift-mathe-multiplikation",
    versteckt: true,
    quelle: "mitschrift",
    fach: "Mathematik",
    thema: "Multiplikation & Division negativer Zahlen",
    fachId: "mathe",
    themaId: "multiplikation-division",
    titel: "Multiplikation & Division negativer Zahlen",
    inhalt: {
      ueberschrift: "Multiplikation und Division negativer Zahlen",
      abschnitte: [
        {
          typ: "regel",
          ueberschrift: "Vorzeichen-Regel (mal/geteilt)",
          text: "Gleiche Vorzeichen → Plus. Verschiedene Vorzeichen → Minus. Genau wie bei der Addition, aber jetzt für Mal und Geteilt.",
        },
        {
          typ: "schema",
          ueberschrift: "Merksätze",
          eintraege: [
            "(+) · (+) → +",
            "(−) · (−) → +",
            "(+) · (−) → −",
            "(−) · (+) → −",
          ],
        },
        {
          typ: "beispiel",
          ueberschrift: "Beispiele aus meiner Mitschrift",
          rechnungen: [
            { ausdruck: "(−3) · 4", schritt: "Vorzeichen: − · + = −", ergebnis: "= −12" },
            { ausdruck: "(−6) · (−3)", schritt: "Vorzeichen: − · − = +", ergebnis: "= 18" },
            { ausdruck: "−15 ÷ (−5)", schritt: "Vorzeichen: − ÷ − = +", ergebnis: "= 3" },
          ],
        },
        {
          typ: "tipp",
          ueberschrift: "Eselsbrücke",
          text: "Vorzeichen UND Beträge zählen getrennt: erst klären ob das Ergebnis Plus oder Minus ist, dann die Zahlen ohne Vorzeichen multiplizieren oder dividieren.",
        },
        {
          typ: "uebungen",
          ueberschrift: "Übungen",
          einleitung: "Multiplikation und Division mit negativen Zahlen.",
          generator: "negativeMultDiv",
          aufgaben: [
            { frage: "(−3) · 4", loesung: -12, hint: "− mal + ist −. Beträge: 3 × 4 = 12." },
            { frage: "5 · (−2)", loesung: -10, hint: "+ mal − ist −. Beträge: 5 × 2 = 10." },
            { frage: "(−6) · (−3)", loesung: 18, hint: "− mal − ist +. Beträge: 6 × 3 = 18." },
            { frage: "−12 ÷ 4", loesung: -3, hint: "− geteilt durch + ist −." },
            { frage: "(−15) ÷ (−5)", loesung: 3, hint: "− geteilt durch − ist +." },
          ],
        },
      ],
    },
  },
  {
    id: "buch-deutsch-tourismus",
    versteckt: true,
    quelle: "buchseite",
    fach: "Deutsch",
    thema: 'Sachtexte "Reise um die Welt"',
    fachId: "deutsch",
    themaId: "sachtexte-reise",
    titel: "Sachtext: Tourismus weltweit",
    inhalt: {
      ueberschrift: "Tourismus weltweit: Chance und Belastung",
      abschnitte: [
        {
          typ: "regel",
          ueberschrift: "Kerngedanke des Textes",
          text: "Tourismus bringt Ländern Einkommen, hat aber auch negative Folgen für Mensch und Umwelt. Der Text zeigt beide Seiten.",
        },
        {
          typ: "schema",
          ueberschrift: "Vor- und Nachteile aus dem Text",
          eintraege: [
            "Vorteil: Einkommen durch Hotels, Restaurants, Souvenirs",
            "Vorteil: Arbeitsplätze für Einheimische",
            "Nachteil: Lärm und Müll",
            "Nachteil: steigende Lebenshaltungskosten",
            "Nachteil: kulturelle Veränderungen",
          ],
        },
        {
          typ: "tipp",
          ueberschrift: "Wichtige Begriffe",
          text: "Einkommensquelle = woher das Geld kommt. Schattenseiten = negative Aspekte. Lebenshaltungskosten = wie viel Wohnen, Essen, Strom kosten. Einheimische = die Menschen, die dort wohnen.",
        },
        {
          typ: "uebungen",
          ueberschrift: "Verständnis-Quiz",
          einleitung: "Hast du den Text verstanden? Probier die Fragen.",
          aufgaben: [
            {
              frage: 'Was bedeutet "Einkommensquelle"?',
              loesung: ["geldquelle", "quelle des einkommens", "quelle für geld"],
              hint: 'Wofür gibt das Wort "Quelle" einen Hinweis?',
              optionen: ["Geldquelle", "Wasserquelle", "Energiequelle", "Inspirationsquelle"],
            },
            {
              frage: "Welche Schattenseite nennt der Text NICHT?",
              loesung: ["bildungsdefizit"],
              hint: "Eine Antwort steht nicht im Text.",
              optionen: ["Lärm und Müll", "Bildungsdefizit", "Steigende Kosten", "Kulturelle Veränderungen"],
            },
            {
              frage: "Wofür geben Touristen Geld aus?",
              loesung: ["hotels restaurants souvenirs", "hotels, restaurants und souvenirs"],
              hint: "Drei Dinge stehen im Text.",
              optionen: [
                "Hotels, Restaurants und Souvenirs",
                "Schulen, Bücher und Apps",
                "Strom, Wasser und Heizung",
                "Autos, Bahn und Flüge",
              ],
            },
            {
              frage: "Welche Textsorte liest du gerade?",
              loesung: ["sachtext"],
              hint: "Sachlich, informierend, nicht erzählend.",
              optionen: ["Sachtext", "Erzählung", "Gedicht", "Drama"],
            },
            {
              frage: "Was ist die Hauptaussage?",
              loesung: ["tourismus hat vor- und nachteile", "tourismus bringt vor- und nachteile"],
              hint: "Beide Seiten zusammen.",
              optionen: [
                "Tourismus ist nur schlecht",
                "Tourismus hat Vor- und Nachteile",
                "Tourismus ist nur gut",
                "Tourismus gibt es überall",
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "ab-latein-vokabeln-l14",
    versteckt: true,
    quelle: "arbeitsblatt",
    fach: "Latein",
    thema: "Vokabeln L14",
    fachId: "latein",
    themaId: "vokabeln-l14",
    titel: "Vokabelliste Lektion 14",
    inhalt: {
      ueberschrift: "Lektion 14: Vokabelliste",
      abschnitte: [
        {
          typ: "regel",
          ueberschrift: "Was ist hier zu tun?",
          text: "Lektion 14 enthält 12 neue Vokabeln. Lerne sie in beide Richtungen (lateinisch → deutsch und umgekehrt).",
        },
        {
          typ: "schema",
          ueberschrift: "Lern-Reihenfolge",
          eintraege: [
            "Verben zuerst (videre, audire ...)",
            "Substantive nach Deklination ordnen",
            "Zuletzt: Adjektive und Partikeln",
          ],
        },
        {
          typ: "tipp",
          ueberschrift: "Lern-Strategie",
          text: "Vokabeln in kleinen Portionen (5-7 pro Sitzung) statt alle auf einmal. Über mehrere Tage wiederholen, damit es ins Langzeitgedächtnis kommt.",
        },
        {
          typ: "uebungen",
          ueberschrift: "Vokabel-Quiz",
          einleitung: "Die Vokabeln des Arbeitsblatts als Quiz.",
          generator: "ACILatein",
          aufgaben: [
            { frage: "videre", loesung: ["sehen", "blicken"], hint: "Auslöser-Verb für den ACI." },
            { frage: "audire", loesung: ["hören"], hint: "Klingt im Englischen wie audio." },
            { frage: "dicere", loesung: ["sagen", "sprechen"], hint: "Daher kommt das Wort Diktion." },
            { frage: "discipulus", loesung: ["schüler"], hint: "Ein Lernender." },
            { frage: "magister", loesung: ["lehrer"], hint: "Lehrer/Meister." },
          ],
        },
      ],
    },
  },
];

// Filter: nur Demos zeigen, die nicht versteckt sind. Versteckte bleiben im
// Code als Reserve und können durch Entfernen von `versteckt: true` reaktiviert
// werden.
export const tafelDemos = ALLE_TAFEL_DEMOS.filter((d) => !d.versteckt);

// Realistisches Tafel-Vorher: für Mathe haben wir ein echtes Foto im public-
// Ordner, für Latein als Fallback ein handgezeichnetes SVG-Tafelbild (dunkelgrün,
// Kreide-Anmutung, Sektionen, farbige Akzente).
const CHALK_FONT =
  "Caveat, 'Patrick Hand', 'Marker Felt', 'Bradley Hand', 'Comic Sans MS', cursive";
const TAFEL_BG = "#2c4538";
const CHALK = "#ecead2";
const CHALK_AKZENT = "#f0959a";

const TAFEL_FOTOS = {
  Mathematik: "/tafeln/negative-zahlen.png",
  Latein: "/tafeln/aci-uebersetzung.png",
};

// Heft-Mitschrift-SVG: liniertes Papier, Rand-Linie, handschriftlich in
// dunkelblauer Tinte. Simuliert eine eigene Mitschrift im Schulheft.
const INK = "#1f3a6b";
const INK_AKZENT = "#a82929";

function mitschriftSvg(fach) {
  if (fach === "Mathematik") {
    const lines = Array.from({ length: 16 }, (_, i) => i)
      .map(
        (i) =>
          `<line x1="0" y1="${72 + i * 28}" x2="800" y2="${72 + i * 28}" stroke="#a9c1da" stroke-width="0.7" opacity="0.55"/>`,
      )
      .join("");
    return `
      <svg viewBox="0 0 800 540" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="ms-paper" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="13"/>
            <feColorMatrix values="0 0 0 0 0.97  0 0 0 0 0.94  0 0 0 0 0.86  0 0 0 0.04 0"/>
          </filter>
        </defs>
        <rect width="800" height="540" fill="#fdfaee"/>
        <rect width="800" height="540" filter="url(#ms-paper)" opacity="0.6"/>
        ${lines}
        <line x1="92" y1="0" x2="92" y2="540" stroke="${INK_AKZENT}" stroke-width="1" opacity="0.65"/>
        <g font-family="${CHALK_FONT}" fill="${INK}">
          <g transform="translate(20 56) rotate(-2)">
            <text font-size="18">21.05.</text>
          </g>

          <g transform="translate(400 92)">
            <text font-size="30" text-anchor="middle">Mal &amp; Geteilt mit −</text>
            <line x1="-130" y1="6" x2="130" y2="6" stroke="${INK}" stroke-width="1.6"/>
          </g>

          <g transform="translate(110 150)">
            <text font-size="22">Regel:</text>
            <line x1="0" y1="4" x2="78" y2="4" stroke="${INK}" stroke-width="1.2"/>
            <text font-size="20" y="38">(+) · (+) → +</text>
            <text font-size="20" y="68">(−) · (−) → +</text>
            <text font-size="20" y="98" fill="${INK_AKZENT}">(+) · (−) → −</text>
            <text font-size="20" y="128" fill="${INK_AKZENT}">(−) · (+) → −</text>
          </g>

          <g transform="translate(420 150)">
            <text font-size="22">Beispiele:</text>
            <line x1="0" y1="4" x2="118" y2="4" stroke="${INK}" stroke-width="1.2"/>
            <text font-size="20" y="38">(−3) · 4 = −12</text>
            <text font-size="20" y="68">5 · (−2) = −10</text>
            <text font-size="20" y="98">(−6) · (−3) = 18</text>
            <text font-size="20" y="128" font-style="italic">−15 ÷ (−5) = 3</text>
          </g>

          <g transform="translate(110 380)">
            <text font-size="22">Merken:</text>
            <line x1="0" y1="4" x2="92" y2="4" stroke="${INK}" stroke-width="1.2"/>
            <text font-size="19" y="38">Vorzeichen UND Zahl getrennt:</text>
            <text font-size="19" y="68">1. ist es + oder − ?</text>
            <text font-size="19" y="98">2. Beträge mal/geteilt rechnen</text>
          </g>

          <g stroke="${INK}" stroke-width="1.2" fill="none" opacity="0.7">
            <path d="M 360 200 Q 395 175, 425 205"/>
            <path d="M 419 205 L 425 205 L 423 199"/>
          </g>

          <g transform="translate(620 360) rotate(-4)" font-size="14" fill="${INK_AKZENT}">
            <text>! merken !</text>
          </g>
        </g>
      </svg>
    `;
  }
  return null;
}

// Buchseite-SVG: Schulbuch-Optik mit Seitenzahl-Kopf, Spalten-Layout und
// nummerierten Aufgaben am Ende. Serif-Druck auf cremefarbenem Papier.
function buchseiteSvg(fach) {
  if (fach === "Deutsch") {
    return `
      <svg viewBox="0 0 800 540" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="bs-paper" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="17"/>
            <feColorMatrix values="0 0 0 0 0.95  0 0 0 0 0.93  0 0 0 0 0.86  0 0 0 0.05 0"/>
          </filter>
        </defs>
        <rect width="800" height="540" fill="#fbf8ef"/>
        <rect width="800" height="540" filter="url(#bs-paper)" opacity="0.55"/>
        <g font-family="Georgia, 'Times New Roman', serif" fill="#2a2a2a">
          <!-- Kopfzeile -->
          <text x="40" y="36" font-size="11" fill="#888" letter-spacing="1.5">DEUTSCH 7 · LEHRWERK</text>
          <text x="760" y="36" font-size="11" text-anchor="end" fill="#888" letter-spacing="1.5">SEITE 42</text>
          <line x1="40" y1="48" x2="760" y2="48" stroke="#bbb" stroke-width="0.6"/>

          <!-- Kapitel-Label -->
          <text x="400" y="82" font-size="13" text-anchor="middle" fill="#7a4646" letter-spacing="2.5">KAPITEL 3 · REISE UM DIE WELT</text>

          <!-- Titel -->
          <text x="400" y="120" font-size="28" text-anchor="middle" font-weight="700">Tourismus weltweit</text>
          <text x="400" y="148" font-size="17" text-anchor="middle" font-style="italic" fill="#5a5a5a">Chance und Belastung zugleich</text>

          <line x1="320" y1="166" x2="480" y2="166" stroke="#7a4646" stroke-width="1.2"/>

          <!-- Text-Spalten -->
          <g font-size="14" line-height="1.5">
            <text x="40" y="208">
              <tspan x="40" dy="0">In vielen Ländern ist der Tourismus eine wichtige</tspan>
              <tspan x="40" dy="22">Einkommensquelle. Touristen geben Geld für Hotels,</tspan>
              <tspan x="40" dy="22">Restaurants und Souvenirs aus. Davon profitieren</tspan>
              <tspan x="40" dy="22">viele Einheimische, die in der Tourismus-Branche</tspan>
              <tspan x="40" dy="22">arbeiten oder eigene Geschäfte betreiben.</tspan>
            </text>
            <text x="420" y="208">
              <tspan x="420" dy="0">Gleichzeitig hat der Tourismus aber auch Schatten-</tspan>
              <tspan x="420" dy="22">seiten: Lärm, Müll und steigende Lebenshaltungs-</tspan>
              <tspan x="420" dy="22">kosten machen das Leben für Einheimische schwer.</tspan>
              <tspan x="420" dy="22">In beliebten Städten verändert sich auch die Kultur,</tspan>
              <tspan x="420" dy="22">weil immer mehr Geschäfte nur für Touristen öffnen.</tspan>
            </text>
          </g>

          <!-- Trenner -->
          <line x1="40" y1="370" x2="760" y2="370" stroke="#bbb" stroke-width="0.6"/>

          <!-- Aufgaben-Sektion -->
          <g>
            <text x="40" y="400" font-size="14" font-weight="700" fill="#7a4646">Aufgaben</text>
            <g font-size="13">
              <text x="40" y="428">1. Erkläre den Begriff "Einkommensquelle" mit eigenen Worten.</text>
              <text x="40" y="452">2. Nenne drei Schattenseiten, die im Text genannt werden.</text>
              <text x="40" y="476">3. Was ist die zentrale Aussage des Textes? Antworte in einem Satz.</text>
              <text x="40" y="500">4. Welche Textsorte hast du gerade gelesen?</text>
            </g>
          </g>

          <text x="760" y="528" font-size="9" text-anchor="end" fill="#aaa">© Theresianum · Deutschbuch Klasse 7</text>
        </g>
      </svg>
    `;
  }
  return null;
}

// Arbeitsblatt-SVG: weiße Papier-Optik statt dunkelgrüner Tafel.
// Gedruckte Serif-Schrift, dünne Linien, simulierter Ausdruck mit Notenraster.
function arbeitsblattSvg(fach, thema) {
  if (fach === "Latein" && thema?.includes("Vokabeln")) {
    return `
      <svg viewBox="0 0 800 540" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="ab-paper" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="9"/>
            <feColorMatrix values="0 0 0 0 0.93  0 0 0 0 0.91  0 0 0 0 0.84  0 0 0 0.06 0"/>
          </filter>
        </defs>
        <rect width="800" height="540" fill="#f9f7ee"/>
        <rect width="800" height="540" filter="url(#ab-paper)" opacity="0.6"/>
        <g font-family="Georgia, 'Times New Roman', serif" fill="#202020">
          <!-- Kopfzeile -->
          <text x="40" y="42" font-size="13" fill="#5a5a5a">Klasse 7a · Latein · Frau Schmidt</text>
          <text x="760" y="42" font-size="13" text-anchor="end" fill="#5a5a5a">Name: ____________</text>
          <text x="400" y="80" font-size="26" text-anchor="middle" font-weight="700">Vokabelliste Lektion 14</text>
          <line x1="40" y1="96" x2="760" y2="96" stroke="#202020" stroke-width="1.2"/>

          <!-- Tabellen-Kopf -->
          <g font-size="13" font-weight="700" fill="#5a5a5a">
            <text x="50" y="124">lateinisch</text>
            <text x="280" y="124">deutsch</text>
            <text x="460" y="124">lateinisch</text>
            <text x="650" y="124">deutsch</text>
          </g>
          <line x1="40" y1="132" x2="760" y2="132" stroke="#999" stroke-width="0.6"/>

          <!-- Vokabel-Zeilen -->
          <g font-size="17">
            <text x="50" y="164" font-style="italic">videre</text>
            <text x="280" y="164" fill="#888">_________________</text>
            <text x="460" y="164" font-style="italic">magister</text>
            <text x="650" y="164" fill="#888">_________________</text>

            <text x="50" y="200" font-style="italic">audire</text>
            <text x="280" y="200" fill="#888">_________________</text>
            <text x="460" y="200" font-style="italic">discipulus</text>
            <text x="650" y="200" fill="#888">_________________</text>

            <text x="50" y="236" font-style="italic">dicere</text>
            <text x="280" y="236" fill="#888">_________________</text>
            <text x="460" y="236" font-style="italic">studere</text>
            <text x="650" y="236" fill="#888">_________________</text>

            <text x="50" y="272" font-style="italic">putare</text>
            <text x="280" y="272" fill="#888">_________________</text>
            <text x="460" y="272" font-style="italic">amare</text>
            <text x="650" y="272" fill="#888">_________________</text>

            <text x="50" y="308" font-style="italic">scire</text>
            <text x="280" y="308" fill="#888">_________________</text>
            <text x="460" y="308" font-style="italic">rogare</text>
            <text x="650" y="308" fill="#888">_________________</text>
          </g>

          <!-- Aufgaben unten -->
          <line x1="40" y1="350" x2="760" y2="350" stroke="#999" stroke-width="0.6"/>
          <text x="40" y="384" font-size="15" font-weight="700">Aufgabe: Übersetze ins Deutsche</text>
          <g font-size="14" fill="#202020">
            <text x="40" y="414">1. Magister discipulos amare putat. → __________________</text>
            <text x="40" y="442">2. Audio te studere. → __________________________________</text>
            <text x="40" y="470">3. Rogamus magistros respondere. → ________________</text>
          </g>

          <!-- Fußzeile -->
          <text x="760" y="510" font-size="10" text-anchor="end" fill="#888">Theresianum Mainz · Etappe 4 · KB 7 L A1</text>
        </g>
      </svg>
    `;
  }
  return null;
}

export function tafelMockSvg(fach, thema, quelle) {
  // Quelle-spezifische Optik vor dem Foto-Fallback prüfen, sonst überschreibt das
  // Lehrer-Foto z.B. eine Mitschrift-Demo zum gleichen Fach.
  if (quelle === "arbeitsblatt") {
    const ab = arbeitsblattSvg(fach, thema);
    if (ab) return ab;
  }
  if (quelle === "mitschrift") {
    const ms = mitschriftSvg(fach);
    if (ms) return ms;
  }
  if (quelle === "buchseite") {
    const bs = buchseiteSvg(fach);
    if (bs) return bs;
  }
  // Wenn für das Fach ein echtes Foto hinterlegt ist, verwende dieses (für Quelle Tafelbild).
  const fotoUrl = TAFEL_FOTOS[fach];
  if (fotoUrl) {
    return `<img src="${fotoUrl}" alt="Foto vom Tafelbild ${fach}" class="tafel-foto" />`;
  }
  if (fach === "Griechisch") {
    const greekRow = (kl, gr, name, laut, x, y) =>
      `<text x="${x}" y="${y}" font-size="19">${kl} (${gr}) ${name} → ${laut}</text>`;
    return `
      <svg viewBox="0 0 800 540" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="gr-dust" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11"/>
            <feColorMatrix values="0 0 0 0 0.93  0 0 0 0 0.92  0 0 0 0 0.82  0 0 0 0.05 0"/>
          </filter>
        </defs>
        <rect width="800" height="540" fill="${TAFEL_BG}"/>
        <rect width="800" height="540" filter="url(#gr-dust)" opacity="0.5"/>
        <g font-family="${CHALK_FONT}" fill="${CHALK}" stroke="none">
          <g transform="translate(40 52) rotate(-1)">
            <text font-size="22">19.05.24</text>
            <line x1="0" y1="6" x2="74" y2="6" stroke="${CHALK}" stroke-width="1.4"/>
          </g>

          <g transform="translate(400 95)">
            <text font-size="36" text-anchor="middle">Griechisches Alphabet</text>
            <line x1="-200" y1="8" x2="200" y2="8" stroke="${CHALK}" stroke-width="2"/>
            <text font-size="18" text-anchor="middle" y="32">24 Buchstaben</text>
          </g>

          <g transform="translate(50 175)">
            <text font-size="24">Vokale:</text>
            <line x1="0" y1="6" x2="84" y2="6" stroke="${CHALK_AKZENT}" stroke-width="1.6"/>
            ${greekRow("α", "Α", "alpha", "a", 0, 36)}
            ${greekRow("ε", "Ε", "epsilon", "e", 0, 62)}
            ${greekRow("η", "Η", "eta", "ē", 0, 88)}
            ${greekRow("ι", "Ι", "iota", "i", 0, 114)}
            ${greekRow("ο", "Ο", "omikron", "o", 0, 140)}
            ${greekRow("υ", "Υ", "ypsilon", "ü", 0, 166)}
            ${greekRow("ω", "Ω", "omega", "ō", 0, 192)}
          </g>

          <g transform="translate(320 175)">
            <text font-size="24">Konsonanten:</text>
            <line x1="0" y1="6" x2="142" y2="6" stroke="${CHALK}" stroke-width="1.6"/>
            ${greekRow("β", "Β", "beta", "b", 0, 36)}
            ${greekRow("γ", "Γ", "gamma", "g", 0, 62)}
            ${greekRow("δ", "Δ", "delta", "d", 0, 88)}
            ${greekRow("θ", "Θ", "theta", "th", 0, 114)}
            ${greekRow("κ", "Κ", "kappa", "k", 0, 140)}
            ${greekRow("λ", "Λ", "lambda", "l", 0, 166)}
            ${greekRow("μ", "Μ", "my", "m", 0, 192)}
          </g>

          <g transform="translate(560 175)">
            <text font-size="24">weitere:</text>
            <line x1="0" y1="6" x2="92" y2="6" stroke="${CHALK}" stroke-width="1.6"/>
            ${greekRow("ν", "Ν", "ny", "n", 0, 36)}
            ${greekRow("π", "Π", "pi", "p", 0, 62)}
            ${greekRow("ρ", "Ρ", "rho", "r", 0, 88)}
            ${greekRow("σ", "Σ", "sigma", "s", 0, 114)}
            ${greekRow("τ", "Τ", "tau", "t", 0, 140)}
            ${greekRow("φ", "Φ", "phi", "ph", 0, 166)}
            ${greekRow("χ", "Χ", "chi", "ch", 0, 192)}
          </g>

          <g transform="translate(50 410)">
            <text font-size="24">Merke:</text>
            <line x1="0" y1="6" x2="80" y2="6" stroke="${CHALK}" stroke-width="1.6"/>
            <text font-size="20" y="36">Großbuchstaben sehen oft </text>
            <text font-size="20" x="280" y="36" fill="${CHALK_AKZENT}">anders aus</text>
            <text font-size="20" y="62">als die Kleinen.</text>
            <text font-size="20" y="92">Z.B.: λ → Λ, ξ → Ξ, φ → Φ.</text>
            <line x1="280" y1="42" x2="395" y2="42" stroke="${CHALK_AKZENT}" stroke-width="1.4"/>
          </g>
        </g>
      </svg>
    `;
  }
  if (fach === "Englisch") {
    return `
      <svg viewBox="0 0 800 540" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="eng-dust" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5"/>
            <feColorMatrix values="0 0 0 0 0.93  0 0 0 0 0.92  0 0 0 0 0.82  0 0 0 0.05 0"/>
          </filter>
        </defs>
        <rect width="800" height="540" fill="${TAFEL_BG}"/>
        <rect width="800" height="540" filter="url(#eng-dust)" opacity="0.5"/>
        <g font-family="${CHALK_FONT}" fill="${CHALK}" stroke="none">
          <g transform="translate(40 52) rotate(-1)">
            <text font-size="22">12.05.24</text>
            <line x1="0" y1="6" x2="74" y2="6" stroke="${CHALK}" stroke-width="1.4"/>
          </g>

          <g transform="translate(400 95)">
            <text font-size="38" text-anchor="middle">will-future</text>
            <line x1="-120" y1="8" x2="120" y2="8" stroke="${CHALK}" stroke-width="2"/>
          </g>

          <g transform="translate(50 175)">
            <text font-size="24">Aufbau:</text>
            <line x1="0" y1="6" x2="92" y2="6" stroke="${CHALK}" stroke-width="1.6"/>
            <text font-size="20" x="0" y="42">Subjekt + will + Verb</text>
            <text font-size="18" x="0" y="72" fill="${CHALK_AKZENT}">won't = will not</text>
            <text font-size="18" x="0" y="100">für ALLE Personen gleich</text>
          </g>

          <g transform="translate(340 175)">
            <text font-size="24">Beispiele:</text>
            <line x1="0" y1="6" x2="116" y2="6" stroke="${CHALK}" stroke-width="1.6"/>
            <text font-size="18" x="0" y="42" font-style="italic">I will help you.</text>
            <text font-size="18" x="0" y="68" font-style="italic">She won't come.</text>
            <text font-size="18" x="0" y="94" font-style="italic">Will you call me?</text>
          </g>

          <g transform="translate(560 175)">
            <text font-size="24">Signalwörter:</text>
            <line x1="0" y1="6" x2="142" y2="6" stroke="${CHALK}" stroke-width="1.6"/>
            <text font-size="18" x="0" y="42">tomorrow</text>
            <text font-size="18" x="0" y="68">next week</text>
            <text font-size="18" x="0" y="94">soon</text>
            <text font-size="18" x="0" y="120">in 2030</text>
          </g>

          <g transform="translate(50 340)">
            <text font-size="24">Frage-Stellung:</text>
            <line x1="0" y1="6" x2="170" y2="6" stroke="${CHALK}" stroke-width="1.6"/>
            <text font-size="20" y="42">Will + Subjekt + Verb ?</text>
            <text font-size="16" y="68" fill="${CHALK_AKZENT}">→ Will you help me?</text>
          </g>

          <g transform="translate(50 440)">
            <text font-size="24">Merke:</text>
            <line x1="0" y1="6" x2="80" y2="6" stroke="${CHALK}" stroke-width="1.6"/>
            <text font-size="18" y="36">will-future = </text>
            <text font-size="18" x="120" y="36" fill="${CHALK_AKZENT}">Zukunft</text>
            <text font-size="18" y="62">spontane Entscheidung oder Vorhersage!</text>
            <line x1="120" y1="42" x2="195" y2="42" stroke="${CHALK_AKZENT}" stroke-width="1.4"/>
          </g>

          <g stroke="${CHALK}" stroke-width="1.4" fill="none" opacity="0.85">
            <path d="M 660 380 Q 690 410, 720 388"/>
            <path d="M 714 388 L 720 388 L 718 382"/>
          </g>
        </g>
      </svg>
    `;
  }
  if (fach === "Latein") {
    return `
      <svg viewBox="0 0 800 540" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="lat-dust" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3"/>
            <feColorMatrix values="0 0 0 0 0.93  0 0 0 0 0.92  0 0 0 0 0.82  0 0 0 0.05 0"/>
          </filter>
        </defs>
        <rect width="800" height="540" fill="${TAFEL_BG}"/>
        <rect width="800" height="540" filter="url(#lat-dust)" opacity="0.5"/>
        <g font-family="${CHALK_FONT}" fill="${CHALK}" stroke="none">
          <!-- Datum -->
          <g transform="translate(40 50) rotate(-1.5)">
            <text font-size="22">14.05.24</text>
            <line x1="0" y1="6" x2="70" y2="6" stroke="${CHALK}" stroke-width="1.4"/>
          </g>

          <!-- Titel mittig -->
          <g transform="translate(400 95)">
            <text font-size="40" text-anchor="middle">ACI</text>
            <line x1="-58" y1="8" x2="58" y2="8" stroke="${CHALK}" stroke-width="2"/>
            <text font-size="20" text-anchor="middle" y="36">(Accusativus cum Infinitivo)</text>
          </g>

          <!-- Linke Spalte: Auslöser-Verben -->
          <g transform="translate(50 195)">
            <text font-size="24">Auslöser:</text>
            <line x1="0" y1="6" x2="110" y2="6" stroke="${CHALK}" stroke-width="1.6"/>
            <text font-size="20" x="20" y="38">videre — sehen</text>
            <text font-size="20" x="20" y="68">audire — hören</text>
            <text font-size="20" x="20" y="98">dicere — sagen</text>
            <text font-size="20" x="20" y="128">putare — glauben</text>
            <text font-size="20" x="20" y="158">scire — wissen</text>
          </g>

          <!-- Mittlere Spalte: Aufbau-Schema -->
          <g transform="translate(320 195)">
            <text font-size="24">Aufbau:</text>
            <line x1="0" y1="6" x2="92" y2="6" stroke="${CHALK}" stroke-width="1.6"/>
            <text font-size="20" x="20" y="42">Subjekt + Verb</text>
            <text font-size="20" x="42" y="72">+ Akkusativ</text>
            <text font-size="20" x="42" y="102">+ Infinitiv</text>
          </g>

          <!-- Rechte Spalte: Beispiel + Übersetzung -->
          <g transform="translate(545 195)">
            <text font-size="24">Beispiel:</text>
            <line x1="0" y1="6" x2="100" y2="6" stroke="${CHALK}" stroke-width="1.6"/>
            <text font-size="20" x="14" y="38">Magister discipulos</text>
            <text font-size="20" x="14" y="64">studere putat.</text>
            <g transform="translate(14 95)" font-size="18">
              <text>→ Der Lehrer glaubt,</text>
              <text y="24" fill="${CHALK_AKZENT}">  dass die Schüler</text>
              <text y="48" fill="${CHALK_AKZENT}">  lernen.</text>
            </g>
          </g>

          <!-- Merke unten -->
          <g transform="translate(50 430)">
            <text font-size="24">Merke:</text>
            <line x1="0" y1="6" x2="80" y2="6" stroke="${CHALK}" stroke-width="1.6"/>
            <text font-size="20" y="36">Akkusativ wird Subjekt im Deutschen,</text>
            <text font-size="20" y="62">Infinitiv wird konjugiertes Verb.</text>
            <text font-size="20" y="92">→ Übersetze immer mit </text>
            <text font-size="20" x="270" y="92" fill="${CHALK_AKZENT}">"dass"-Satz</text>
            <text font-size="20" x="385" y="92">!</text>
            <line x1="270" y1="98" x2="380" y2="98" stroke="${CHALK_AKZENT}" stroke-width="1.4"/>
          </g>

          <!-- kleine Schwung-Linie -->
          <g stroke="${CHALK}" stroke-width="1.4" fill="none" opacity="0.85">
            <path d="M 720 250 Q 740 230, 760 246"/>
            <path d="M 754 246 L 760 246 L 758 240"/>
          </g>
        </g>
      </svg>
    `;
  }
  return `
    <svg viewBox="0 0 800 540" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="mat-dust" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7"/>
          <feColorMatrix values="0 0 0 0 0.93  0 0 0 0 0.92  0 0 0 0 0.82  0 0 0 0.05 0"/>
        </filter>
      </defs>
      <rect width="800" height="540" fill="${TAFEL_BG}"/>
      <rect width="800" height="540" filter="url(#mat-dust)" opacity="0.5"/>
      <g font-family="${CHALK_FONT}" fill="${CHALK}" stroke="none">
        <!-- Datum oben links -->
        <g transform="translate(40 52) rotate(-1)">
          <text font-size="22">08.05.24</text>
          <line x1="0" y1="6" x2="74" y2="6" stroke="${CHALK}" stroke-width="1.4"/>
        </g>

        <!-- Titel mittig -->
        <g transform="translate(400 95)">
          <text font-size="40" text-anchor="middle">negative Zahlen</text>
          <line x1="-138" y1="8" x2="138" y2="8" stroke="${CHALK}" stroke-width="2"/>
        </g>

        <!-- Linke Spalte: Vorzeichen -->
        <g transform="translate(50 165)">
          <text font-size="24">Vorzeichen:</text>
          <line x1="0" y1="6" x2="142" y2="6" stroke="${CHALK}" stroke-width="1.6"/>
          <g font-size="22" transform="translate(28 42)">
            <text>+ <tspan dx="14">...</tspan> <tspan dx="14">positiv</tspan></text>
            <text y="32">− <tspan dx="14">...</tspan> <tspan dx="14">negativ</tspan></text>
            <text y="64">0 <tspan dx="10">...</tspan> <tspan dx="14">weder positiv noch negativ</tspan></text>
          </g>
        </g>

        <!-- Linke Spalte unten: Rechenregeln in Rahmen -->
        <g transform="translate(50 320)">
          <text font-size="24">Rechenregeln:</text>
          <line x1="0" y1="6" x2="160" y2="6" stroke="${CHALK}" stroke-width="1.6"/>
          <rect x="0" y="22" width="240" height="170" fill="none" stroke="${CHALK}" stroke-width="1.6"/>
          <g font-size="22" transform="translate(28 56)">
            <text>+ <tspan dx="10">und</tspan> <tspan dx="10">+</tspan> <tspan dx="18">=</tspan> <tspan dx="14">+</tspan></text>
            <text y="36">− <tspan dx="10">und</tspan> <tspan dx="10">−</tspan> <tspan dx="18">=</tspan> <tspan dx="14">+</tspan></text>
            <text y="72">+ <tspan dx="10">und</tspan> <tspan dx="10">−</tspan> <tspan dx="18">=</tspan> <tspan dx="14">−</tspan></text>
            <text y="108">− <tspan dx="10">und</tspan> <tspan dx="10">+</tspan> <tspan dx="18">=</tspan> <tspan dx="14">−</tspan></text>
          </g>
        </g>

        <!-- Mittlere Spalte: Beispiele -->
        <g transform="translate(330 320)">
          <text font-size="24">Beispiele:</text>
          <line x1="0" y1="6" x2="120" y2="6" stroke="${CHALK}" stroke-width="1.6"/>
          <g font-size="22" transform="translate(20 42)">
            <text>5 <tspan dx="6">+</tspan> <tspan dx="6">(−3)</tspan> <tspan dx="14">=</tspan> <tspan dx="12">2</tspan></text>
            <text y="32">−4 <tspan dx="6">−</tspan> <tspan dx="6">(−6)</tspan> <tspan dx="14">=</tspan> <tspan dx="12">2</tspan></text>
            <text y="64">−2 <tspan dx="6">+</tspan> <tspan dx="6">(−7)</tspan> <tspan dx="14">=</tspan> <tspan dx="10">−9</tspan></text>
            <text y="96">8 <tspan dx="6">−</tspan> <tspan dx="6">12</tspan> <tspan dx="22">=</tspan> <tspan dx="10">−4</tspan></text>
            <text y="128">−5 <tspan dx="6">+</tspan> <tspan dx="6">9</tspan> <tspan dx="26">=</tspan> <tspan dx="14">4</tspan></text>
          </g>
        </g>

        <!-- Rechte Spalte oben: Zahlengerade -->
        <g transform="translate(545 165)">
          <text font-size="24">Zahlengerade:</text>
          <line x1="0" y1="6" x2="160" y2="6" stroke="${CHALK}" stroke-width="1.6"/>

          <!-- Achse mit Pfeilen -->
          <g transform="translate(0 70)">
            <line x1="-8" y1="0" x2="232" y2="0" stroke="${CHALK}" stroke-width="2"/>
            <polyline points="-8,0 2,-6 2,6" fill="none" stroke="${CHALK}" stroke-width="2"/>
            <polyline points="232,0 222,-6 222,6" fill="none" stroke="${CHALK}" stroke-width="2"/>
            ${[-4, -3, -2, -1, 0, 1, 2, 3, 4]
              .map((n, i) => {
                const x = 4 + i * 28;
                const color = n === 0 ? CHALK_AKZENT : CHALK;
                return `
                  <line x1="${x}" y1="-6" x2="${x}" y2="6" stroke="${color}" stroke-width="1.6"/>
                  <text x="${x}" y="28" font-size="18" text-anchor="middle" fill="${color}">${n}</text>
                `;
              })
              .join("")}
          </g>
          <text font-size="18" y="138">Nach links wird es immer kleiner.</text>
          <text font-size="18" y="164">Nach rechts wird es immer größer.</text>
        </g>

        <!-- Rechte Spalte unten: Merke -->
        <g transform="translate(545 380)">
          <text font-size="24">Merke:</text>
          <line x1="0" y1="6" x2="80" y2="6" stroke="${CHALK}" stroke-width="1.6"/>
          <text font-size="20" y="40">Negative Zahlen sind</text>
          <text font-size="20" x="200" y="40" fill="${CHALK_AKZENT}">kleiner</text>
          <line x1="200" y1="46" x2="278" y2="46" stroke="${CHALK_AKZENT}" stroke-width="1.6"/>
          <text font-size="20" y="68">als positive Zahlen!</text>
        </g>
      </g>
    </svg>
  `;
}
