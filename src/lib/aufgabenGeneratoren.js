// Aufgaben-Generatoren pro Thema. Jeder Generator gibt eine fertige
// Aufgabe { frage, loesung, hint } zurück. Generatoren bekommen die bisherige
// Liste, damit sie Doubletten vermeiden können.

function zufallsZahl(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatNegativeZahl(n) {
  return n < 0 ? `−${Math.abs(n)}` : `${n}`;
}

function formatNegativeZahlMitKlammer(n) {
  return n < 0 ? `(−${Math.abs(n)})` : `${n}`;
}

// Realistische Kontext-Aufgabe zu negativen Zahlen: Temperatur, Kontostand,
// Aufzug. Echte Anwendungssituationen statt reiner Rechen-Drills, damit das
// Konzept (unter Null, Schulden, Untergeschoss) begreifbar wird. Antwort ist
// immer eine Zahl, die Rechnung ist elementar und korrekt.
function negativeKontextAufgabe() {
  const art = Math.floor(Math.random() * 3);
  if (art === 0) {
    const t0 = zufallsZahl(-8, 5);
    const d = zufallsZahl(2, 10);
    const steigt = Math.random() < 0.5;
    const erg = steigt ? t0 + d : t0 - d;
    return {
      frage: `Morgens zeigt das Thermometer ${formatNegativeZahl(t0)} Grad. Bis Mittag ${steigt ? "steigt" : "sinkt"} die Temperatur um ${d} Grad. Was zeigt es mittags?`,
      loesung: erg,
      hint: `Start bei ${formatNegativeZahl(t0)}, dann ${steigt ? "+" : "−"} ${d}.`,
    };
  }
  if (art === 1) {
    const a = zufallsZahl(-9, 7);
    const b = zufallsZahl(2, 12);
    const bekommt = Math.random() < 0.5;
    const erg = bekommt ? a + b : a - b;
    return {
      frage: bekommt
        ? `Dein Kontostand ist ${formatNegativeZahl(a)} Euro. Du bekommst ${b} Euro dazu. Wie ist der neue Stand?`
        : `Dein Kontostand ist ${formatNegativeZahl(a)} Euro. Du gibst ${b} Euro aus. Wie ist der neue Stand?`,
      loesung: erg,
      hint: `Minus heißt Schulden. ${formatNegativeZahl(a)} ${bekommt ? "+" : "−"} ${b}.`,
    };
  }
  const a = zufallsZahl(-4, -1);
  const b = zufallsZahl(2, 8);
  const hoch = Math.random() < 0.5;
  const erg = hoch ? a + b : a - b;
  return {
    frage: hoch
      ? `Ein Aufzug steht im Untergeschoss ${formatNegativeZahl(a)} (Erdgeschoss ist 0). Er fährt ${b} Stockwerke nach oben. In welchem Stockwerk hält er?`
      : `Ein Aufzug steht im Stockwerk ${formatNegativeZahl(a)}. Er fährt ${b} Stockwerke nach unten. Wo hält er?`,
    loesung: erg,
    hint: `Unter Null ist Untergeschoss. ${formatNegativeZahl(a)} ${hoch ? "+" : "−"} ${b}.`,
  };
}

// Mehrschrittige Kontext-Aufgabe (Verlauf ueber mehrere Schritte): trainiert das
// zuverlaessige Rechnen ueber mehrere Stufen. Endantwort ist eine Zahl; der
// Hinweis zeigt die Schrittfolge (wird im Feedback sichtbar). Schritte werden
// berechnet, daher immer korrekt.
function mehrstufigKontextAufgabe() {
  const fmt = formatNegativeZahl;
  const art = Math.floor(Math.random() * 3);
  if (art === 0) {
    const t0 = zufallsZahl(-6, 3);
    const d1 = zufallsZahl(3, 10);
    const t1 = t0 + d1;
    const d2 = zufallsZahl(3, 10);
    const erg = t1 - d2;
    return {
      frage: `Morgens zeigt das Thermometer ${fmt(t0)} Grad. Bis Mittag wird es ${d1} Grad wärmer, bis zum Abend ${d2} Grad kälter. Was zeigt es abends?`,
      loesung: erg,
      hint: `Schritt für Schritt: ${fmt(t0)} + ${d1} = ${fmt(t1)}, dann ${fmt(t1)} − ${d2} = ${fmt(erg)}.`,
    };
  }
  if (art === 1) {
    const a = zufallsZahl(-12, -3);
    const b = zufallsZahl(10, 25);
    const c = zufallsZahl(8, 20);
    const s1 = a + b;
    const erg = s1 - c;
    return {
      frage: `Dein Kontostand ist ${fmt(a)} Euro. Du bekommst ${b} Euro, dann gibst du ${c} Euro aus. Wie ist der Endstand?`,
      loesung: erg,
      hint: `${fmt(a)} + ${b} = ${fmt(s1)}, dann ${fmt(s1)} − ${c} = ${fmt(erg)} Euro.`,
    };
  }
  const a = zufallsZahl(-4, -2);
  const up = zufallsZahl(2, 6);
  const down = zufallsZahl(2, 7);
  const s1 = a + up;
  const erg = s1 - down;
  return {
    frage: `Ein Aufzug steht im Untergeschoss ${fmt(a)}. Er fährt erst ${up} Stockwerke nach oben, dann ${down} nach unten. Wo hält er?`,
    loesung: erg,
    hint: `${fmt(a)} + ${up} = ${fmt(s1)}, dann ${fmt(s1)} − ${down} = ${fmt(erg)}.`,
  };
}

// Eine reine Vorzeichen-Rechnung mit passendem Hinweis bauen.
function baueRechnung(a, b, op) {
  const result = op === "+" ? a + b : a - b;
  const frage = `${formatNegativeZahl(a)} ${op} ${formatNegativeZahlMitKlammer(b)}`;
  let hint = "Stell dir den Zahlenstrahl vor.";
  if (op === "−" && b < 0) {
    hint = "Minus und Minus wird Plus. Du rechnest also " + formatNegativeZahl(a) + " + " + Math.abs(b) + ".";
  } else if (op === "+" && b < 0) {
    hint = "Plus und Minus wird Minus. Du rechnest also " + formatNegativeZahl(a) + " − " + Math.abs(b) + ".";
  } else if (a < 0 && b > 0 && op === "+") {
    hint = "Von " + formatNegativeZahl(a) + " aus " + b + " Schritte nach rechts.";
  } else if (a > 0 && b > 0 && op === "−" && b > a) {
    hint = "Von " + a + " aus " + b + " Schritte nach links: du landest unter Null.";
  }
  return { frage, loesung: result, hint };
}

// Generator: negative Zahlen (Addition & Subtraktion) mit Schwierigkeits-
// Progression ueber die Runde: leicht -> Festigung -> Transfer (Minus und Minus)
// -> Kontext-Anwendung. Die Position in der Runde steckt in vorhandene.length.
function negativeZahlenGen(vorhandene = []) {
  const vorhandeneFragen = new Set(vorhandene.map((a) => a.frage));
  const i = vorhandene.length;

  // Spaeter in der Runde die Anwendung im echten Kontext (Temperatur/Geld/Aufzug).
  // Die letzte Aufgabe ist eine mehrschrittige Anwendung als kroenender Abschluss.
  if (i >= 5 || (i >= 3 && Math.random() < 0.35)) {
    const mehrstufig = i >= 5;
    for (let v = 0; v < 12; v++) {
      const k = mehrstufig ? mehrstufigKontextAufgabe() : negativeKontextAufgabe();
      if (!vorhandeneFragen.has(k.frage)) return k;
    }
  }

  for (let versuch = 0; versuch < 30; versuch++) {
    let a, b, op;
    if (i <= 1) {
      // Stufe 1, leicht: kleine Betraege, sanfter Einstieg.
      op = Math.random() < 0.5 ? "+" : "−";
      a = zufallsZahl(-6, 6);
      b = zufallsZahl(1, 6);
    } else if (i <= 3) {
      // Stufe 2, Festigung: gemischte Vorzeichen im vollen Bereich.
      op = Math.random() < 0.5 ? "+" : "−";
      a = zufallsZahl(-10, 10);
      b = zufallsZahl(-10, 10);
    } else {
      // Stufe 3, Transfer: das knifflige Minus und Minus (a − (−b)).
      op = "−";
      a = zufallsZahl(-9, 9);
      b = -zufallsZahl(1, 9);
    }
    if (a === 0 && b === 0) continue;
    const aufg = baueRechnung(a, b, op);
    if (vorhandeneFragen.has(aufg.frage)) continue;
    return aufg;
  }
  return baueRechnung(zufallsZahl(-9, 9), zufallsZahl(1, 9), "+");
}

// Generator: Latein ACI + Auslöser-Vokabeln.
// Mischt Vokabel-Abfragen (lat → de, de → lat) mit ACI-Identifikations-
// und Übersetzungs-Aufgaben. Pool-basiert, Doubletten-Schutz.
const LATEIN_VOKABELN = [
  { lat: "videre", de: ["sehen", "blicken"] },
  { lat: "audire", de: ["hören"] },
  { lat: "dicere", de: ["sagen", "sprechen"] },
  { lat: "putare", de: ["glauben", "denken", "meinen"] },
  { lat: "scire", de: ["wissen"] },
  { lat: "magister", de: ["lehrer"] },
  { lat: "discipulus", de: ["schüler"] },
  { lat: "studere", de: ["lernen", "studieren"] },
  { lat: "amare", de: ["lieben"] },
  { lat: "rogare", de: ["fragen", "bitten"] },
  { lat: "respondere", de: ["antworten"] },
  { lat: "sentire", de: ["fühlen", "empfinden"] },
];

const ACI_FRAGEN = [
  {
    frage: 'Akkusativ in "Magistra discipulam laborare videt"',
    loesung: ["discipulam"],
    hint: "Welches Wort steht im Akkusativ Singular?",
  },
  {
    frage: 'Infinitiv in "Magistra discipulam laborare videt"',
    loesung: ["laborare"],
    hint: "Welches Wort endet auf -re und ist nicht konjugiert?",
  },
  {
    frage: 'Akkusativ in "Audio te cantare"',
    loesung: ["te"],
    hint: "Wer wird gehört? Akkusativ-Form von du.",
  },
  {
    frage: 'Infinitiv in "Audio te cantare"',
    loesung: ["cantare"],
    hint: "Was tut die Person, die gehört wird?",
  },
  {
    frage: 'Übersetze mit "dass": "Putamus magistros sapere"',
    loesung: [
      "wir glauben, dass die lehrer wissen",
      "wir glauben dass die lehrer wissen",
      "wir denken, dass die lehrer wissen",
      "wir meinen, dass die lehrer wissen",
    ],
    hint: "Akkusativ wird Subjekt im dass-Satz: magistros → die Lehrer.",
  },
  {
    frage: "Im ACI: Akkusativ wird im Deutschen zum ___",
    loesung: ["subjekt"],
    hint: "Der Akkusativ wird zum Was im dass-Satz?",
  },
  {
    frage: "Im ACI: Infinitiv wird im Deutschen zum ___",
    loesung: ["verb", "konjugierten verb", "prädikat"],
    hint: "Aus studere wird im Deutschen lernen als ___.",
  },
  {
    frage: "Welche Auslöser-Verben für den ACI hast du gelernt?",
    loesung: [
      "videre audire dicere putare scire",
      "videre, audire, dicere, putare, scire",
    ],
    hint: "Fünf Auslöser von der Tafel, mit Leerzeichen oder Komma getrennt.",
  },
];

function ACILateinGen(vorhandene = []) {
  const vorhandeneFragen = new Set(vorhandene.map((a) => a.frage));
  const kategorie = Math.random();

  if (kategorie < 0.5) {
    // Vokabel-Frage (lat → de oder de → lat)
    for (let versuch = 0; versuch < 25; versuch++) {
      const v = LATEIN_VOKABELN[Math.floor(Math.random() * LATEIN_VOKABELN.length)];
      const richtung = Math.random() < 0.5;
      const frage = richtung ? v.lat : `${v.de[0]} (deutsch → latein)`;
      if (vorhandeneFragen.has(frage)) continue;
      if (richtung) {
        return {
          frage,
          loesung: v.de,
          hint: `Auslöser- oder Inhaltsvokabel: ${v.de[0]}.`,
        };
      }
      return {
        frage,
        loesung: [v.lat],
        hint: `Lateinisch endet oft auf -re oder -ire.`,
      };
    }
  }

  // ACI-Frage aus dem Pool
  for (let versuch = 0; versuch < 25; versuch++) {
    const a = ACI_FRAGEN[Math.floor(Math.random() * ACI_FRAGEN.length)];
    if (vorhandeneFragen.has(a.frage)) continue;
    return a;
  }

  // Fallback: einfache Vokabel
  const v = LATEIN_VOKABELN[0];
  return {
    frage: v.lat,
    loesung: v.de,
    hint: "Erste Auslöser-Vokabel.",
  };
}

// Generator: Englisch will-future + Unit-5-Vokabeln.
// Mischt Vokabel-Abfragen (en → de und de → en) mit Lückentext-Aufgaben
// zur Grammatik (will / won't / Frage-Stellung).
const ENGLISCH_VOKABELN = [
  { en: "tomorrow", de: ["morgen"] },
  { en: "next week", de: ["nächste woche"] },
  { en: "soon", de: ["bald"] },
  { en: "promise", de: ["versprechen"] },
  { en: "help", de: ["helfen", "hilfe"] },
  { en: "travel", de: ["reisen"] },
  { en: "call", de: ["anrufen"] },
  { en: "meet", de: ["treffen"] },
  { en: "visit", de: ["besuchen"] },
  { en: "believe", de: ["glauben"] },
  { en: "remember", de: ["sich erinnern", "erinnern"] },
  { en: "decide", de: ["entscheiden"] },
];

const WILL_FUTURE_GRAMMATIK = [
  {
    frage: 'Lücke: "We ___ travel to London next month."',
    loesung: ["will"],
    hint: "Aussage in der Zukunft mit Signalwort.",
  },
  {
    frage: 'Lücke: "He ___ believe me." (Verneinung)',
    loesung: ["won't", "will not"],
    hint: "Verneinte Form, kurz oder lang.",
  },
  {
    frage: 'Lücke: "___ they remember the date?" (Frage)',
    loesung: ["Will"],
    hint: "Frage beginnt mit ___",
  },
  {
    frage: 'Lücke: "I promise I ___ never forget."',
    loesung: ["will"],
    hint: "Versprechen löst will-future aus.",
  },
  {
    frage: 'Welche Form ist KEIN will-future?',
    loesung: ["I am going home now"],
    hint: "Eine Form ist Gegenwart, kein will-future.",
    optionen: [
      "I will help you",
      "She won't come",
      "I am going home now",
      "Will you call me?",
    ],
  },
  {
    frage: "Wie heißt die Kurzform von will not?",
    loesung: ["won't"],
    hint: "wo + n + Apostroph + t",
  },
  {
    frage: "In welcher Person ändert sich will?",
    loesung: ["keine", "in keiner", "in keiner person"],
    hint: "Will ist für alle gleich.",
    optionen: ["he/she/it (3. Sg.)", "I/we (1. Person)", "you (2. Person)", "keine"],
  },
];

function willFutureGen(vorhandene = []) {
  const vorhandeneFragen = new Set(vorhandene.map((a) => a.frage));
  const kategorie = Math.random();

  if (kategorie < 0.55) {
    // Vokabel-Frage (en → de oder de → en)
    for (let versuch = 0; versuch < 25; versuch++) {
      const v =
        ENGLISCH_VOKABELN[Math.floor(Math.random() * ENGLISCH_VOKABELN.length)];
      const richtung = Math.random() < 0.5;
      const frage = richtung ? v.en : `${v.de[0]} (deutsch → englisch)`;
      if (vorhandeneFragen.has(frage)) continue;
      if (richtung) {
        return { frage, loesung: v.de, hint: "Unit-5-Vokabel." };
      }
      return { frage, loesung: [v.en], hint: "Englisches Wort schreiben." };
    }
  }

  // Grammatik-Frage aus dem Pool
  for (let versuch = 0; versuch < 25; versuch++) {
    const g =
      WILL_FUTURE_GRAMMATIK[
        Math.floor(Math.random() * WILL_FUTURE_GRAMMATIK.length)
      ];
    if (vorhandeneFragen.has(g.frage)) continue;
    return g;
  }

  // Fallback: simple Vokabel
  const v = ENGLISCH_VOKABELN[0];
  return { frage: v.en, loesung: v.de, hint: "Klassisches Zeit-Signalwort." };
}

// Generator: griechisches Alphabet. Mischt Buchstabe→Name, Name→Buchstabe,
// Großbuchstabe→Kleinbuchstabe und Lautwert→Name.
const GRIECH_BUCHSTABEN = [
  { kl: "α", gr: "Α", name: "alpha", laut: "a" },
  { kl: "β", gr: "Β", name: "beta", laut: "b" },
  { kl: "γ", gr: "Γ", name: "gamma", laut: "g" },
  { kl: "δ", gr: "Δ", name: "delta", laut: "d" },
  { kl: "ε", gr: "Ε", name: "epsilon", laut: "e" },
  { kl: "ζ", gr: "Ζ", name: "zeta", laut: "z" },
  { kl: "η", gr: "Η", name: "eta", laut: "ē" },
  { kl: "θ", gr: "Θ", name: "theta", laut: "th" },
  { kl: "ι", gr: "Ι", name: "iota", laut: "i" },
  { kl: "κ", gr: "Κ", name: "kappa", laut: "k" },
  { kl: "λ", gr: "Λ", name: "lambda", laut: "l" },
  { kl: "μ", gr: "Μ", name: "my", laut: "m" },
  { kl: "ν", gr: "Ν", name: "ny", laut: "n" },
  { kl: "ξ", gr: "Ξ", name: "xi", laut: "x" },
  { kl: "ο", gr: "Ο", name: "omikron", laut: "o" },
  { kl: "π", gr: "Π", name: "pi", laut: "p" },
  { kl: "ρ", gr: "Ρ", name: "rho", laut: "r" },
  { kl: "σ", gr: "Σ", name: "sigma", laut: "s" },
  { kl: "τ", gr: "Τ", name: "tau", laut: "t" },
  { kl: "υ", gr: "Υ", name: "ypsilon", laut: "ü" },
  { kl: "φ", gr: "Φ", name: "phi", laut: "ph" },
  { kl: "χ", gr: "Χ", name: "chi", laut: "ch" },
  { kl: "ψ", gr: "Ψ", name: "psi", laut: "ps" },
  { kl: "ω", gr: "Ω", name: "omega", laut: "ō" },
];

function griechAlphabetGen(vorhandene = []) {
  const vorhandeneFragen = new Set(vorhandene.map((a) => a.frage));
  for (let versuch = 0; versuch < 30; versuch++) {
    const b =
      GRIECH_BUCHSTABEN[Math.floor(Math.random() * GRIECH_BUCHSTABEN.length)];
    const modus = Math.floor(Math.random() * 4);
    let aufgabe;
    if (modus === 0) {
      aufgabe = {
        frage: `${b.kl} (Kleinbuchstabe → Name)`,
        loesung: [b.name],
        hint: `Lautwert: ${b.laut}`,
      };
    } else if (modus === 1) {
      aufgabe = {
        frage: `${b.gr} (Großbuchstabe → Name)`,
        loesung: [b.name],
        hint: `Klein geschrieben: ${b.kl}`,
      };
    } else if (modus === 2) {
      aufgabe = {
        frage: `${b.name} (Name → Kleinbuchstabe)`,
        loesung: [b.kl],
        hint: `Großbuchstabe: ${b.gr}`,
      };
    } else {
      aufgabe = {
        frage: `Lautwert ${b.laut} → Name?`,
        loesung: [b.name],
        hint: `Buchstabe: ${b.kl}`,
      };
    }
    if (!vorhandeneFragen.has(aufgabe.frage)) return aufgabe;
  }
  // Fallback
  const b = GRIECH_BUCHSTABEN[0];
  return {
    frage: `${b.kl} (Kleinbuchstabe → Name)`,
    loesung: [b.name],
    hint: `Lautwert: ${b.laut}`,
  };
}

// Generator: Multiplikation und Division negativer Zahlen.
// Erzeugt Aufgaben wie "(−3) · 4", "(−12) ÷ (−4)" mit klarer Vorzeichen-Regel.
function negativeMultDivGen(vorhandene = []) {
  const vorhandeneFragen = new Set(vorhandene.map((a) => a.frage));
  for (let versuch = 0; versuch < 30; versuch++) {
    const op = Math.random() < 0.5 ? "·" : "÷";
    let a, b, ergebnis;
    if (op === "·") {
      a = zufallsZahl(-9, 9);
      b = zufallsZahl(-9, 9);
      if (a === 0 || b === 0) continue;
      ergebnis = a * b;
    } else {
      // Division: wähle b und ergebnis, berechne a so dass es teilbar ist
      b = zufallsZahl(-9, 9);
      if (b === 0) continue;
      ergebnis = zufallsZahl(-9, 9);
      if (ergebnis === 0) continue;
      a = b * ergebnis;
      if (a < -90 || a > 90) continue;
    }
    const aStr = a < 0 ? `(${formatNegativeZahl(a)})` : `${a}`;
    const bStr = b < 0 ? `(${formatNegativeZahl(b)})` : `${b}`;
    const frage = `${aStr} ${op} ${bStr}`;
    if (vorhandeneFragen.has(frage)) continue;
    let hint;
    if (a < 0 && b < 0) hint = "Minus mal/geteilt minus ist plus.";
    else if (a > 0 && b > 0) hint = "Plus mit Plus bleibt Plus.";
    else hint = "Verschiedene Vorzeichen → Ergebnis ist negativ.";
    return { frage, loesung: ergebnis, hint };
  }
  return { frage: "(−2) · 3", loesung: -6, hint: "− mal + ist −." };
}

// Map Generator-Schlüssel → Generator-Funktion. Neue Themen einfach hier
// registrieren.
const generatoren = {
  negativeZahlen: negativeZahlenGen,
  negativeMultDiv: negativeMultDivGen,
  ACILatein: ACILateinGen,
  willFuture: willFutureGen,
  griechAlphabet: griechAlphabetGen,
};

// Liefert eine Aufgabe für den angegebenen Generator, oder null, wenn der
// Generator unbekannt ist.
export function neueAufgabe(key, vorhandene) {
  const fn = generatoren[key];
  if (!fn) return null;
  return fn(vorhandene);
}

// Liefert mehrere frische Aufgaben am Stück, ohne Doubletten zueinander.
export function neueAufgaben(key, vorhandene, anzahl = 5) {
  const fn = generatoren[key];
  if (!fn) return [];
  const ergebnis = [];
  const begleitung = [...vorhandene];
  for (let i = 0; i < anzahl; i++) {
    const a = fn(begleitung);
    if (!a) break;
    ergebnis.push(a);
    begleitung.push(a);
  }
  return ergebnis;
}

export function hatGenerator(key) {
  return Boolean(generatoren[key]);
}

// =========== Multiple-Choice-Optionen für den Quiz-Modus ===========

function mischen(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function eindeutig(arr) {
  return [...new Map(arr.map((x) => [String(x).toLowerCase(), x])).values()];
}

// Mathe: erzeugt plausible Distraktoren um die richtige Zahl herum.
function optionenZahlen(aufgabe) {
  const richtige = aufgabe.loesung;
  const kandidaten = [
    richtige,
    richtige + 1,
    richtige - 1,
    richtige + 2,
    richtige - 2,
    -richtige,
    richtige * -1 + 1,
    Math.abs(richtige),
  ];
  const optionen = eindeutig(kandidaten).slice(0, 6);
  // Behalte mindestens die richtige + 3 Distraktoren
  const ohneRichtige = optionen.filter((o) => o !== richtige);
  const auswahl = [richtige, ...ohneRichtige.slice(0, 3)];
  return mischen(auswahl).map(String);
}

// Latein: nutzt die existierenden Vokabel-/Satz-Pools für Distraktoren.
const ACI_SATZ_WOERTER = [
  "magister",
  "magistra",
  "discipulos",
  "discipulam",
  "studere",
  "laborare",
  "putat",
  "videt",
  "audio",
  "cantare",
  "te",
  "putamus",
  "magistros",
  "sapere",
  "sciunt",
];

function optionenLatein(aufgabe) {
  const erste = Array.isArray(aufgabe.loesung)
    ? aufgabe.loesung[0]
    : aufgabe.loesung;
  if (typeof erste !== "string") return null;

  // Vokabel lat → de
  const passendeVokabel = LATEIN_VOKABELN.find((v) => v.lat === aufgabe.frage);
  if (passendeVokabel) {
    const andere = LATEIN_VOKABELN.filter((v) => v.lat !== passendeVokabel.lat).map(
      (v) => v.de[0],
    );
    const distraktoren = mischen(andere).slice(0, 3);
    return mischen([passendeVokabel.de[0], ...distraktoren]);
  }
  // Vokabel de → lat
  if (aufgabe.frage.includes("(deutsch → latein)")) {
    const wort = aufgabe.frage.replace("(deutsch → latein)", "").trim();
    const passend = LATEIN_VOKABELN.find((v) =>
      v.de.some((d) => d.toLowerCase() === wort.toLowerCase()),
    );
    if (passend) {
      const andere = LATEIN_VOKABELN.filter((v) => v.lat !== passend.lat).map(
        (v) => v.lat,
      );
      const distraktoren = mischen(andere).slice(0, 3);
      return mischen([passend.lat, ...distraktoren]);
    }
  }
  // ACI-Satz-Identifikation
  if (
    aufgabe.frage.toLowerCase().includes("akkusativ in") ||
    aufgabe.frage.toLowerCase().includes("infinitiv in")
  ) {
    const andere = ACI_SATZ_WOERTER.filter(
      (w) => w.toLowerCase() !== erste.toLowerCase(),
    );
    const distraktoren = mischen(andere).slice(0, 3);
    return mischen([erste, ...distraktoren]);
  }
  // Konzept-Fragen: nutze hint-Kontext um plausible Distraktoren zu wählen
  if (aufgabe.frage.toLowerCase().includes("subjekt")) {
    return mischen([erste, "Objekt", "Verb", "Adjektiv"]);
  }
  if (aufgabe.frage.toLowerCase().includes("verb")) {
    return mischen([erste, "Subjekt", "Objekt", "Adjektiv"]);
  }
  return null;
}

// Englisch: nutzt die Vokabel-Pools für Distraktoren, plus feste
// Grammatik-Alternativen für die typischen Lückentexte (will / won't / shall / would).
const WILL_FORM_OPTIONEN = ["will", "won't", "shall", "would"];

function optionenEnglisch(aufgabe) {
  if (aufgabe.optionen && aufgabe.optionen.length >= 2) {
    return mischen(aufgabe.optionen);
  }
  const erste = Array.isArray(aufgabe.loesung)
    ? aufgabe.loesung[0]
    : aufgabe.loesung;
  if (typeof erste !== "string") return null;

  // Vokabel en → de (Frage steht in ENGLISCH_VOKABELN.en)
  const passendVokabel = ENGLISCH_VOKABELN.find((v) => v.en === aufgabe.frage);
  if (passendVokabel) {
    const andere = ENGLISCH_VOKABELN.filter((v) => v.en !== passendVokabel.en).map(
      (v) => v.de[0],
    );
    const distraktoren = mischen(andere).slice(0, 3);
    return mischen([passendVokabel.de[0], ...distraktoren]);
  }
  // Vokabel de → en
  if (aufgabe.frage.includes("(deutsch → englisch)")) {
    const wort = aufgabe.frage.replace("(deutsch → englisch)", "").trim();
    const passend = ENGLISCH_VOKABELN.find((v) =>
      v.de.some((d) => d.toLowerCase() === wort.toLowerCase()),
    );
    if (passend) {
      const andere = ENGLISCH_VOKABELN.filter((v) => v.en !== passend.en).map(
        (v) => v.en,
      );
      const distraktoren = mischen(andere).slice(0, 3);
      return mischen([passend.en, ...distraktoren]);
    }
  }
  // Lückentext (will/won't): nutze WILL_FORM_OPTIONEN
  if (aufgabe.frage.toLowerCase().includes("lücke")) {
    const richtige = erste.toLowerCase();
    if (WILL_FORM_OPTIONEN.some((w) => w.toLowerCase() === richtige)) {
      return mischen(WILL_FORM_OPTIONEN.slice());
    }
    // Frage-Stellung beginnt mit Großschreibung
    if (erste === "Will") {
      return mischen(["Will", "Won't", "Do", "Are"]);
    }
    // Verneinung
    if (erste === "won't" || erste === "will not") {
      return mischen(["won't", "will", "do not", "isn't"]);
    }
  }
  // Kurzform: won't
  if (aufgabe.frage.toLowerCase().includes("kurzform")) {
    return mischen(["won't", "wo'nt", "willn't", "wont"]);
  }
  return null;
}

// Griechisch: nutzt das Alphabet-Pool für Distraktoren in allen Frage-Modi.
function optionenGriech(aufgabe) {
  if (aufgabe.optionen && aufgabe.optionen.length >= 2) {
    return mischen(aufgabe.optionen);
  }
  const erste = Array.isArray(aufgabe.loesung)
    ? aufgabe.loesung[0]
    : aufgabe.loesung;
  if (typeof erste !== "string") return null;
  const frage = aufgabe.frage;

  // Buchstabe → Name (Klein- oder Großbuchstabe)
  if (frage.includes("Kleinbuchstabe → Name") || frage.includes("Großbuchstabe → Name")) {
    const richtige = GRIECH_BUCHSTABEN.find((b) => b.name === erste);
    if (!richtige) return null;
    const andere = GRIECH_BUCHSTABEN.filter((b) => b.name !== richtige.name).map(
      (b) => b.name,
    );
    return mischen([richtige.name, ...mischen(andere).slice(0, 3)]);
  }
  // Name → Kleinbuchstabe
  if (frage.includes("Name → Kleinbuchstabe")) {
    const richtige = GRIECH_BUCHSTABEN.find((b) => b.kl === erste);
    if (!richtige) return null;
    const andere = GRIECH_BUCHSTABEN.filter((b) => b.kl !== richtige.kl).map(
      (b) => b.kl,
    );
    return mischen([richtige.kl, ...mischen(andere).slice(0, 3)]);
  }
  // Lautwert → Name
  if (frage.includes("Lautwert")) {
    const richtige = GRIECH_BUCHSTABEN.find((b) => b.name === erste);
    if (!richtige) return null;
    const andere = GRIECH_BUCHSTABEN.filter((b) => b.name !== richtige.name).map(
      (b) => b.name,
    );
    return mischen([richtige.name, ...mischen(andere).slice(0, 3)]);
  }
  return null;
}

const optionenGen = {
  negativeZahlen: optionenZahlen,
  negativeMultDiv: optionenZahlen,
  ACILatein: optionenLatein,
  willFuture: optionenEnglisch,
  griechAlphabet: optionenGriech,
};

// Liefert Multiple-Choice-Optionen für eine Aufgabe oder null, wenn keine
// sinnvollen Distraktoren erzeugt werden können (dann Fallback zu Eingabe).
export function macheOptionen(aufgabe, generatorKey) {
  if (aufgabe.optionen && aufgabe.optionen.length >= 2) return aufgabe.optionen;
  const fn = optionenGen[generatorKey];
  if (!fn) return null;
  return fn(aufgabe);
}
