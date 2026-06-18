import { MATHE_KATEGORIEN, MATHE_SUBKATEGORIEN } from "./matheKategorien";

// Pro Fach die geordnete Gliederung: Kategorien und je Kategorie die Subkategorien.
// Faecher ohne Eintrag werden in der Ablage flach (ungruppiert) angezeigt.
export const FACH_STRUKTUR = {
  mathe: { kategorien: MATHE_KATEGORIEN, subkategorien: MATHE_SUBKATEGORIEN },
  deutsch: {
    kategorien: [
      "Grammatik",
      "Rechtschreibung",
      "Textarten und Schreiben",
      "Sprache und Kommunikation",
      "Lyrik",
      "Epik und Dramatik",
      "Stilmittel",
      "Literaturepochen",
      "Literarische Werke",
    ],
    subkategorien: {
      Grammatik: ["Wortarten", "Wortbildung", "Zeitformen und Modi", "Satzbau und Satzglieder", "Kasus und Deklination"],
      Rechtschreibung: ["Schreibregeln", "Zeichensetzung", "Rechtschreibstrategien"],
      "Textarten und Schreiben": ["Argumentierende Texte", "Analyse und Interpretation", "Berichtende und beschreibende Texte", "Journalistische und Gebrauchstexte", "Kreatives und erzaehlendes Schreiben", "Präsentieren und Gestalten"],
      "Sprache und Kommunikation": ["Kommunikation", "Sprache im Wandel"],
      Lyrik: ["Grundlagen der Lyrik", "Metrum und Reim", "Gedichtarten"],
      "Epik und Dramatik": ["Epische Texte", "Dramatische Texte"],
      Stilmittel: ["Rhetorische Mittel", "Klang und Wiederholung"],
      Literaturepochen: ["Aufklaerung bis Klassik", "Romantik bis Realismus", "Moderne und Gegenwart"],
      "Literarische Werke": ["Dramen", "Romane und Erzaehlungen"],
    },
  },
  englisch: {
    kategorien: [
      "Zeitformen",
      "Verben",
      "Wortarten",
      "Satzbau",
      "Schreiben und Textarten",
      "Analyse und Interpretation",
      "Wortschatz und Rechtschreibung",
      "Sprachmittlung und Kommunikation",
    ],
    subkategorien: {
      Zeitformen: ["Gegenwart", "Vergangenheit", "Zukunft", "Zeitformen im Vergleich"],
      Verben: ["Besondere Verben", "Verbformen", "Passiv und Konstruktionen"],
      Wortarten: ["Pronomen", "Adjektive und Adverbien", "Nomen und Artikel", "Präpositionen und Bindewörter"],
      Satzbau: ["Satzstellung", "Nebensätze", "Zeichensetzung"],
      "Schreiben und Textarten": ["Grundlegende Texte", "Argumentative Texte", "Briefe und E-Mails", "Kreatives und persoenliches Schreiben"],
      "Analyse und Interpretation": ["Literarische Analyse", "Sach- und Medienanalyse", "Stilmittel und Sprache"],
      "Wortschatz und Rechtschreibung": ["Grundwortschatz", "Typische Stolperfallen", "Aussprache und Schreibung"],
      "Sprachmittlung und Kommunikation": ["Mediation", "Hoer- und Leseverstehen", "Muendliche Kommunikation"],
    },
  },
};

// Prueft das Themen-Netz eines Fachs. Landkarten-Themen brauchen eine erklaerung,
// aktive KB-Lernwege brauchen schritte. Gibt eine Fehlerliste zurueck (leer = ok).
export function pruefeFachNetz(faecher, fachId) {
  const fehler = [];
  const fach = faecher.find((f) => f.id === fachId);
  if (!fach) return ["Fach '" + fachId + "' fehlt"];
  const struktur = FACH_STRUKTUR[fachId];
  const ids = new Set();
  const kbIds = new Set();
  for (const t of fach.themen) {
    if (!t.id || ids.has(t.id)) fehler.push("id-Problem: " + t.id);
    ids.add(t.id);
    if (!t.kbId || kbIds.has(t.kbId)) fehler.push("kbId-Problem: " + t.kbId);
    kbIds.add(t.kbId);
    if (struktur) {
      if (!t.kategorie || !struktur.kategorien.includes(t.kategorie))
        fehler.push("kategorie-Problem bei " + t.id + ": " + t.kategorie);
      else if (!t.subkategorie || !(struktur.subkategorien[t.kategorie] || []).includes(t.subkategorie))
        fehler.push("subkategorie-Problem bei " + t.id + ": " + t.subkategorie);
    }
    if (t.landkarte) {
      if (!t.erklaerung || !t.erklaerung.trim())
        fehler.push("Landkarten-Thema ohne erklaerung: " + t.id);
    } else if (!Array.isArray(t.schritte) || !t.schritte.length) {
      fehler.push("Aktives Thema ohne schritte: " + t.id);
    }
  }
  return fehler;
}
