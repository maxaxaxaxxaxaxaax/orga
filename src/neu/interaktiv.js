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
        { vorne: "servus, servi (m.)", hinten: "der Sklave, der Diener" },
        { vorne: "dominus, domini (m.)", hinten: "der Herr" },
        { vorne: "templum, templi (n.)", hinten: "der Tempel" },
        { vorne: "clamare", hinten: "rufen, schreien" },
        { vorne: "parare", hinten: "vorbereiten, beschaffen" },
        { vorne: "statim", hinten: "sofort, sogleich" },
        { vorne: "tamen", hinten: "dennoch, trotzdem" },
        { vorne: "saepe", hinten: "oft" },
      ],
    },
  },
  l5: {
    typ: "karteikarten",
    daten: {
      hinweis: "Lektion 15",
      karten: [
        { vorne: "pater, patris (m.)", hinten: "der Vater" },
        { vorne: "mater, matris (f.)", hinten: "die Mutter" },
        { vorne: "frater, fratris (m.)", hinten: "der Bruder" },
        { vorne: "miles, militis (m.)", hinten: "der Soldat" },
        { vorne: "petere", hinten: "bitten, verlangen, aufsuchen" },
        { vorne: "respondere", hinten: "antworten" },
        { vorne: "numquam", hinten: "niemals" },
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
      hinweis: "Das griechische Alphabet",
      karten: [
        { vorne: "Α α", hinten: "Alpha — a" },
        { vorne: "Β β", hinten: "Beta — b" },
        { vorne: "Γ γ", hinten: "Gamma — g" },
        { vorne: "Δ δ", hinten: "Delta — d" },
        { vorne: "Ε ε", hinten: "Epsilon — e (kurz)" },
        { vorne: "Θ θ", hinten: "Theta — th" },
        { vorne: "Λ λ", hinten: "Lambda — l" },
        { vorne: "Π π", hinten: "Pi — p" },
        { vorne: "Σ σ/ς", hinten: "Sigma — s" },
        { vorne: "Ω ω", hinten: "Omega — o (lang)" },
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
        { vorne: "λέγειν", hinten: "sagen, sprechen" },
        { vorne: "γράφειν", hinten: "schreiben" },
        { vorne: "καί", hinten: "und, auch" },
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
        { vorne: "φέρειν", hinten: "tragen, bringen" },
        { vorne: "ἔχειν", hinten: "haben, halten" },
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
