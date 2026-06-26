// Interaktive, fachspezifische Inhalte für Materialien, damit "Dokumente" nicht
// leer sind, sondern echte Übungsformate zeigen. Pro Material-Id ein Eintrag
// { typ, daten }. Der Dispatcher MaterialInhalt rendert die passende Komponente.
// Typen (wachsend): "karteikarten" (Vokabeln), "zahlenstrahl" (Mathe),
// "merkblatt" (Tabellen/Regeln), "lueckentext" (Cloze), "zuordnung" (Matching).

import {
  MERKBLATT,
  LUECKENTEXT,
  ZUORDNUNG,
  REIHENFOLGE,
  AUSWAHLQUIZ,
  SATZBAU,
  BILDZUORDNUNG,
  MARKIEREN,
} from "./interaktivAgenten";
import { UEBUNGEN_EXTRA } from "../data/uebungenExtra";

export const INTERAKTIV = {
  // ---- Latein: Vokabel-Karteikarten -----------------------------------------
  l1: {
    typ: "karteikarten",
    daten: {
      hinweis: "Lektion 14",
      karten: [
        { vorne: "servus, servi (m.)", hinten: "der Sklave, der Diener", beispiel: "Servus dominum timet. (Der Sklave fürchtet den Herrn.)" },
        { vorne: "dominus, domini (m.)", hinten: "der Herr", beispiel: "Dominus servos vocat. (Der Herr ruft die Sklaven.)" },
        { vorne: "templum, templi (n.)", hinten: "der Tempel", beispiel: "Templum magnum est. (Der Tempel ist groß.)" },
        { vorne: "clamare", hinten: "rufen, schreien", beispiel: "Servi in foro clamant. (Die Sklaven rufen auf dem Forum.)" },
        { vorne: "parare", hinten: "vorbereiten, beschaffen", beispiel: "Cibum paramus. (Wir bereiten das Essen vor.)" },
        { vorne: "statim", hinten: "sofort, sogleich", beispiel: "Statim venio. (Ich komme sofort.)" },
        { vorne: "tamen", hinten: "dennoch, trotzdem", beispiel: "Servus laborat, dominus tamen dormit. (Der Sklave arbeitet, der Herr aber schläft.)" },
        { vorne: "saepe", hinten: "oft", beispiel: "Saepe in templo sumus. (Wir sind oft im Tempel.)" },
      ],
    },
  },
  l5: {
    typ: "karteikarten",
    daten: {
      hinweis: "Lektion 15",
      karten: [
        { vorne: "pater, patris (m.)", hinten: "der Vater", beispiel: "Pater filium amat. (Der Vater liebt den Sohn.)" },
        { vorne: "mater, matris (f.)", hinten: "die Mutter", beispiel: "Mater in casa est. (Die Mutter ist im Haus.)" },
        { vorne: "frater, fratris (m.)", hinten: "der Bruder", beispiel: "Frater meus venit. (Mein Bruder kommt.)" },
        { vorne: "miles, militis (m.)", hinten: "der Soldat", beispiel: "Miles fortis pugnat. (Der tapfere Soldat kämpft.)" },
        { vorne: "petere", hinten: "bitten, verlangen, aufsuchen", beispiel: "Auxilium petimus. (Wir bitten um Hilfe.)" },
        { vorne: "respondere", hinten: "antworten", beispiel: "Discipulus magistro respondet. (Der Schüler antwortet dem Lehrer.)" },
        { vorne: "numquam", hinten: "niemals", beispiel: "Miles numquam timet. (Der Soldat fürchtet sich niemals.)" },
      ],
    },
  },

  // ---- Englisch: Vokabeln & unregelmäßige Verben ----------------------------
  e1: {
    typ: "karteikarten",
    daten: {
      hinweis:
        "Irregular verbs: Grundform, simple past, past participle. Manche enden gleich, z.B. bring, buy und think auf -ought.",
      karten: [
        { vorne: "go", hinten: "went – gone" },
        { vorne: "see", hinten: "saw – seen" },
        { vorne: "take", hinten: "took – taken" },
        { vorne: "write", hinten: "wrote – written" },
        { vorne: "speak", hinten: "spoke – spoken" },
        { vorne: "begin", hinten: "began – begun" },
        { vorne: "bring", hinten: "brought – brought" },
        { vorne: "buy", hinten: "bought – bought" },
        { vorne: "think", hinten: "thought – thought" },
        { vorne: "eat", hinten: "ate – eaten" },
        { vorne: "give", hinten: "gave – given" },
        { vorne: "find", hinten: "found – found" },
        { vorne: "come", hinten: "came – come" },
      ],
    },
  },
  e2: {
    typ: "karteikarten",
    daten: {
      hinweis: "Unit 5, S. 84-93",
      karten: [
        { vorne: "neighbour", hinten: "der Nachbar / die Nachbarin", beispiel: "Our new neighbour is very friendly." },
        { vorne: "to borrow", hinten: "(sich) ausleihen", beispiel: "Can I borrow your pen, please?" },
        { vorne: "to lend", hinten: "(ver)leihen", beispiel: "She will lend me her bike tomorrow." },
        { vorne: "crowded", hinten: "überfüllt, voll", beispiel: "The bus was very crowded this morning." },
        { vorne: "on purpose", hinten: "absichtlich", beispiel: "Sorry, I didn't do it on purpose." },
        { vorne: "to whisper", hinten: "flüstern", beispiel: "Please whisper, the baby is sleeping." },
        { vorne: "trust", hinten: "das Vertrauen / vertrauen", beispiel: "You can trust your best friends." },
      ],
    },
  },
  e5: {
    typ: "karteikarten",
    daten: {
      hinweis: "Unit 5, S. 94-99",
      karten: [
        { vorne: "information centre", hinten: "die Touristen-Information", beispiel: "You can get a map at the information centre." },
        { vorne: "to recommend", hinten: "empfehlen", beispiel: "Can you recommend a good restaurant?" },
        { vorne: "entrance fee", hinten: "der Eintrittspreis", beispiel: "The entrance fee for students is five euros." },
        { vorne: "guided tour", hinten: "die Führung", beispiel: "We took a guided tour through the old town." },
        { vorne: "nearby", hinten: "in der Nähe", beispiel: "Is there a supermarket nearby?" },
        { vorne: "straight ahead", hinten: "geradeaus", beispiel: "Go straight ahead and turn left." },
      ],
    },
  },

  // ---- Griechisch: Alphabet & Vokabeln --------------------------------------
  gr1: {
    typ: "karteikarten",
    daten: {
      hinweis: "Das griechische Alphabet, 24 Buchstaben",
      karten: [
        { vorne: "Α α", hinten: "Alpha, a" },
        { vorne: "Β β", hinten: "Beta, b" },
        { vorne: "Γ γ", hinten: "Gamma, g" },
        { vorne: "Δ δ", hinten: "Delta, d" },
        { vorne: "Ε ε", hinten: "Epsilon, kurzes e" },
        { vorne: "Ζ ζ", hinten: "Zeta, z (wie ds)" },
        { vorne: "Η η", hinten: "Eta, langes e", beispiel: "Merke: sieht aus wie H, ist aber das lange e." },
        { vorne: "Θ θ", hinten: "Theta, th" },
        { vorne: "Ι ι", hinten: "Iota, i" },
        { vorne: "Κ κ", hinten: "Kappa, k" },
        { vorne: "Λ λ", hinten: "Lambda, l" },
        { vorne: "Μ μ", hinten: "My, m" },
        { vorne: "Ν ν", hinten: "Ny, n", beispiel: "Merke: sieht aus wie v, ist aber n." },
        { vorne: "Ξ ξ", hinten: "Xi, x (ks)" },
        { vorne: "Ο ο", hinten: "Omikron, kurzes o" },
        { vorne: "Π π", hinten: "Pi, p" },
        { vorne: "Ρ ρ", hinten: "Rho, r", beispiel: "Merke: sieht aus wie P, ist aber r." },
        { vorne: "Σ σ/ς", hinten: "Sigma, s", beispiel: "Am Wortende schreibt man ς, sonst σ." },
        { vorne: "Τ τ", hinten: "Tau, t" },
        { vorne: "Υ υ", hinten: "Ypsilon, ü" },
        { vorne: "Φ φ", hinten: "Phi, ph (f)" },
        { vorne: "Χ χ", hinten: "Chi, ch", beispiel: "Merke: nicht x, sondern ch wie in Bach." },
        { vorne: "Ψ ψ", hinten: "Psi, ps" },
        { vorne: "Ω ω", hinten: "Omega, langes o" },
      ],
    },
  },
  gr2: {
    typ: "karteikarten",
    daten: {
      hinweis: "Lektion 1",
      karten: [
        { vorne: "ὁ ἄνθρωπος", hinten: "der Mensch" },
        { vorne: "ὁ λόγος", hinten: "das Wort, die Rede" },
        { vorne: "ἡ ἀρετή", hinten: "die Tüchtigkeit, Tugend" },
        { vorne: "ὁ θεός", hinten: "der Gott" },
        { vorne: "ὁ φίλος", hinten: "der Freund" },
        { vorne: "ἡ ψυχή", hinten: "die Seele" },
        { vorne: "λέγειν", hinten: "sagen, sprechen" },
        { vorne: "γράφειν", hinten: "schreiben" },
        { vorne: "καί", hinten: "und, auch" },
        { vorne: "οὐ / οὐκ", hinten: "nicht" },
      ],
    },
  },
  gr5: {
    typ: "karteikarten",
    daten: {
      hinweis: "Lektion 2",
      karten: [
        { vorne: "ἡ θάλασσα", hinten: "das Meer" },
        { vorne: "ἡ χώρα", hinten: "das Land, die Gegend" },
        { vorne: "ὁ ποταμός", hinten: "der Fluss" },
        { vorne: "ὁ ἵππος", hinten: "das Pferd" },
        { vorne: "φέρειν", hinten: "tragen, bringen" },
        { vorne: "ἔχειν", hinten: "haben, halten" },
        { vorne: "καλός", hinten: "schön, gut" },
        { vorne: "ἀγαθός", hinten: "gut, tüchtig" },
        { vorne: "νῦν", hinten: "jetzt, nun" },
      ],
    },
  },

  // ---- Mathematik: Zahlenstrahl ---------------------------------------------
  m1: {
    typ: "zahlenstrahl",
    daten: {
      von: -10,
      bis: 10,
      aufgaben: [
        // Warmlaufen: ablesen, dann Schritt für Schritt aufs Konzept.
        { frage: "Lies ab: klicke auf die −3.", ziel: -3 },
        {
          frage: "Welche ist kleiner: −6 oder −2? Klicke die kleinere an.",
          ziel: -6,
          warum:
            "Je weiter links eine Zahl auf dem Strahl steht, desto kleiner ist sie. −6 liegt links von −2, also ist −6 kleiner. Bei negativen Zahlen ist die mit der größeren Ziffer die kleinere.",
        },
        {
          frage: "Klicke die Zahl genau in der Mitte zwischen −4 und 2.",
          ziel: -1,
          warum:
            "Von −4 sind es 3 Schritte nach rechts bis −1, und von 2 sind es 3 Schritte nach links bis −1. Also liegt −1 genau in der Mitte.",
        },
        {
          frage: "Klicke auf die Gegenzahl von 8.",
          ziel: -8,
          quelle: 8,
          warum:
            "Die Gegenzahl liegt gleich weit von der 0 entfernt, nur auf der anderen Seite. 8 ist 8 Schritte rechts von 0, also liegt −8 genau 8 Schritte links von 0.",
        },
        {
          frage: "Starte bei −4 und gehe 6 nach rechts. Klicke, wo du landest.",
          ziel: 2,
          warum:
            "Nach rechts heißt addieren. Von −4: −3, −2, −1, 0, 1, 2. Nach 6 Schritten bist du bei 2, also −4 + 6 = 2.",
        },
        {
          frage:
            "−7 ist 7 Schritte von der 0 weg. Klicke die Zahl, die genauso weit auf der anderen Seite liegt.",
          ziel: 7,
          quelle: -7,
          warum:
            "Der Abstand zur 0 heißt Betrag. −7 und 7 haben beide den Betrag 7, liegen also gleich weit von der 0 entfernt, nur in verschiedene Richtungen.",
        },
      ],
    },
  },
  m2: {
    typ: "zahlenstrahl",
    daten: {
      von: -6,
      bis: 6,
      aufgaben: [
        // Rechnen am Strahl: plus heißt nach rechts, minus nach links.
        {
          frage: "Rechne am Strahl: 3 − 5. Starte bei 3 und klicke das Ergebnis.",
          ziel: -2,
          warum:
            "Minus heißt nach links. Von 3 fünf Schritte nach links: 2, 1, 0, −1, −2. Also 3 − 5 = −2. Wenn man mehr abzieht als da ist, wird das Ergebnis negativ.",
        },
        {
          frage: "Rechne am Strahl: −4 + 3. Klicke das Ergebnis.",
          ziel: -1,
          warum:
            "Plus heißt nach rechts. Von −4 drei Schritte nach rechts: −3, −2, −1. Also −4 + 3 = −1.",
        },
        {
          frage: "Rechne am Strahl: −2 − 3. Klicke das Ergebnis.",
          ziel: -5,
          warum:
            "Minus heißt nach links, auch wenn du schon im Negativen bist. Von −2: −3, −4, −5. Also −2 − 3 = −5, die Zahl wird kleiner.",
        },
        {
          frage: "Klicke die Gegenzahl von −5.",
          ziel: 5,
          quelle: -5,
          warum:
            "Die Gegenzahl spiegelt an der 0. −5 liegt 5 Schritte links, also liegt die Gegenzahl 5 Schritte rechts: die 5.",
        },
      ],
    },
  },
};

// Von Agenten authorierte Inhalte einmischen (je eigener Typ).
for (const [id, daten] of Object.entries(MERKBLATT))
  INTERAKTIV[id] = { typ: "merkblatt", daten };
for (const [id, daten] of Object.entries(LUECKENTEXT))
  INTERAKTIV[id] = { typ: "lueckentext", daten };
for (const [id, daten] of Object.entries(ZUORDNUNG))
  INTERAKTIV[id] = { typ: "zuordnung", daten };
for (const [id, daten] of Object.entries(REIHENFOLGE))
  INTERAKTIV[id] = { typ: "reihenfolge", daten };
for (const [id, daten] of Object.entries(AUSWAHLQUIZ))
  INTERAKTIV[id] = { typ: "auswahlquiz", daten };
for (const [id, daten] of Object.entries(SATZBAU))
  INTERAKTIV[id] = { typ: "satzbau", daten };
for (const [id, daten] of Object.entries(BILDZUORDNUNG))
  INTERAKTIV[id] = { typ: "bildzuordnung", daten };
for (const [id, daten] of Object.entries(MARKIEREN))
  INTERAKTIV[id] = { typ: "markieren", daten };
// Zusatz-Uebungen (Rollout): nach Typ gruppiert, generisch einmischen.
for (const [typ, eintraege] of Object.entries(UEBUNGEN_EXTRA))
  for (const [id, daten] of Object.entries(eintraege))
    INTERAKTIV[id] = { typ, daten };

export function interaktivFuerMaterial(id) {
  return INTERAKTIV[id] || null;
}

// Welche interaktiven Typen sind eine AUFGABE zum Bearbeiten (statt
// Nachschlage-Material)? Geteilt von Fokus und Ablage, damit beide gleich
// trennen, was man tut und was man nur liest. Merkblatt zaehlt als Nachschlagen.
export const AUFGABE_TYPEN = [
  "auswahlquiz",
  "lueckentext",
  "zuordnung",
  "reihenfolge",
  "satzbau",
  "bildzuordnung",
  "markieren",
  "zahlenstrahl",
  "karteikarten",
];
export function istAufgabeMaterial(material) {
  const e = INTERAKTIV[material.id];
  return !!e && AUFGABE_TYPEN.includes(e.typ);
}

// Kurzes Aktivitäts-Label pro Typ: sagt vorab, was beim Öffnen wartet.
export const TYP_LABEL = {
  karteikarten: "Karteikarten",
  zahlenstrahl: "Zahlenstrahl",
  merkblatt: "Merkblatt",
  lueckentext: "Lückentext",
  zuordnung: "Zuordnen",
  reihenfolge: "Reihenfolge",
  auswahlquiz: "Quiz",
  satzbau: "Satz bauen",
  bildzuordnung: "Plan-Übung",
  markieren: "Im Satz markieren",
};

// Aktivitäts-Label für ein Material: die Übungsform, sonst "Lesen" für reinen
// Text. null, wenn es nichts zu öffnen gibt.
export function aktivitaetLabel(material) {
  const eintrag = INTERAKTIV[material.id];
  if (eintrag) return TYP_LABEL[eintrag.typ] || "Übung";
  if (material.inhalt) return "Lesen";
  return null;
}

// Ein Material ist öffenbar, wenn es Volltext oder einen interaktiven Inhalt hat.
export function istOeffenbar(material) {
  return !!material.inhalt || !!INTERAKTIV[material.id];
}
