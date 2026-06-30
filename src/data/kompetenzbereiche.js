// Echte Lehrplan-Kompetenzbereiche / Leitideen je Fach, belegt durch RLP-Lehrpläne
// (Sek I, Stand 2022) + KMK-Bildungsstandards (Volltext-Recherche, Quellenqualität
// hoch; siehe Memory schulhub-lehrplan-treue). Statt der traditionellen Inhalts-
// schubladen (Algebra, Stilmittel, Verben ...) bildet das Netz die ECHTEN
// Kompetenzbereiche oben ab; die Inhalte ordnen sich über subkategorie darunter.
//
// Bewusst als ABGELEITETE Ebene: die Rohdaten der Themen (kategorie/subkategorie in
// wissen.js + *Landkarte.js) bleiben unangetastet, ebenso die Validatoren und die
// Ablage/Material-Logik. Nur Netz-Aufbau (netzModell.js) gruppiert nach Bereich.

// Geordnete Kompetenzbereiche je Fach (Reihenfolge = Anzeige-Reihenfolge).
export const KOMPETENZBEREICHE = {
  mathe: [
    "Zahl und Operation",
    "Größen und Messen",
    "Raum und Form",
    "Funktionaler Zusammenhang",
    "Daten und Zufall",
  ],
  deutsch: [
    "Sprache und Sprachgebrauch untersuchen",
    "Schreiben",
    "Sprechen und Zuhören",
    "Lesen – mit Texten und Medien umgehen",
  ],
  englisch: [
    "Verfügen über sprachliche Mittel",
    "Funktionale kommunikative Kompetenz",
    "Text- und Medienkompetenz",
  ],
};

// subkategorie -> Kompetenzbereich. Schlüssel sind die EXAKTEN subkategorie-Strings
// aus fachStruktur.js / matheKategorien.js (innerhalb eines Fachs eindeutig). Jede
// vorhandene subkategorie muss hier genau einen Bereich treffen (Check: pruefeBereiche).
export const SUBKAT_BEREICH = {
  mathe: {
    // Zahl und Operation: Zahlen, Rechnen, Zahlbereiche, Potenzen/Wurzeln/Logarithmen.
    "Mengen und Logik": "Zahl und Operation",
    "Zahlen und Zahlbereiche": "Zahl und Operation",
    "Negative Zahlen": "Zahl und Operation",
    "Brüche und Dezimalzahlen": "Zahl und Operation",
    "Prozent und Zins": "Zahl und Operation",
    "Potenzen und Wurzeln": "Zahl und Operation",
    "Potenzen, Wurzeln, Logarithmen": "Zahl und Operation",
    "Komplexe Zahlen": "Zahl und Operation",
    // Größen und Messen: Größen, Einheiten, Maßstab, Finanz-/Sachrechnen.
    "Verhältnisse und Größen": "Größen und Messen",
    "Finanzen und Verhältnisse": "Größen und Messen",
    // Raum und Form: Geometrie inkl. analytischer Geometrie.
    "Grundlagen und Figuren": "Raum und Form",
    "Dreieck und Kreis": "Raum und Form",
    "Flächen, Körper und Raum": "Raum und Form",
    "Analytische Geometrie": "Raum und Form",
    // Funktionaler Zusammenhang: Terme/Gleichungen, Funktionen, Analysis, Wachstum.
    "Terme": "Funktionaler Zusammenhang",
    "Gleichungen und Ungleichungen": "Funktionaler Zusammenhang",
    "Matrizen": "Funktionaler Zusammenhang",
    "Grundlagen der Funktionen": "Funktionaler Zusammenhang",
    "Elementare Funktionen": "Funktionaler Zusammenhang",
    "Exponential- und trigonometrische Funktionen": "Funktionaler Zusammenhang",
    "Folgen und Grenzwerte": "Funktionaler Zusammenhang",
    "Differentialrechnung": "Funktionaler Zusammenhang",
    "Integralrechnung": "Funktionaler Zusammenhang",
    "Anwendungen": "Funktionaler Zusammenhang",
    "Wachstum und Zerfall": "Funktionaler Zusammenhang",
    "Modellieren und Optimieren": "Funktionaler Zusammenhang",
    // Daten und Zufall: Statistik, Wahrscheinlichkeit, Verteilungen, Datenkompetenz.
    "Beschreibende Statistik": "Daten und Zufall",
    "Wahrscheinlichkeit": "Daten und Zufall",
    "Verteilungen und Tests": "Daten und Zufall",
    "Daten im Alltag": "Daten und Zufall",
  },
  deutsch: {
    // Sprache und Sprachgebrauch untersuchen: Grammatik, Stilmittel, Sprachreflexion.
    "Wortarten": "Sprache und Sprachgebrauch untersuchen",
    "Wortbildung": "Sprache und Sprachgebrauch untersuchen",
    "Zeitformen und Modi": "Sprache und Sprachgebrauch untersuchen",
    "Satzbau und Satzglieder": "Sprache und Sprachgebrauch untersuchen",
    "Kasus und Deklination": "Sprache und Sprachgebrauch untersuchen",
    "Rhetorische Mittel": "Sprache und Sprachgebrauch untersuchen",
    "Klang und Wiederholung": "Sprache und Sprachgebrauch untersuchen",
    "Sprache im Wandel": "Sprache und Sprachgebrauch untersuchen",
    // Schreiben: Rechtschreibung (Teilbereich von Schreiben) + Textproduktion.
    "Schreibregeln": "Schreiben",
    "Zeichensetzung": "Schreiben",
    "Rechtschreibstrategien": "Schreiben",
    "Argumentierende Texte": "Schreiben",
    "Analyse und Interpretation": "Schreiben",
    "Berichtende und beschreibende Texte": "Schreiben",
    "Journalistische und Gebrauchstexte": "Schreiben",
    "Kreatives und erzaehlendes Schreiben": "Schreiben",
    // Sprechen und Zuhören: Kommunikation, Präsentieren/Vortragen.
    "Präsentieren und Gestalten": "Sprechen und Zuhören",
    "Kommunikation": "Sprechen und Zuhören",
    // Lesen - mit Texten und Medien umgehen: Gattungen, Epochen, Werke.
    "Grundlagen der Lyrik": "Lesen – mit Texten und Medien umgehen",
    "Metrum und Reim": "Lesen – mit Texten und Medien umgehen",
    "Gedichtarten": "Lesen – mit Texten und Medien umgehen",
    "Epische Texte": "Lesen – mit Texten und Medien umgehen",
    "Dramatische Texte": "Lesen – mit Texten und Medien umgehen",
    "Aufklaerung bis Klassik": "Lesen – mit Texten und Medien umgehen",
    "Romantik bis Realismus": "Lesen – mit Texten und Medien umgehen",
    "Moderne und Gegenwart": "Lesen – mit Texten und Medien umgehen",
    "Dramen": "Lesen – mit Texten und Medien umgehen",
    "Romane und Erzaehlungen": "Lesen – mit Texten und Medien umgehen",
  },
  englisch: {
    // Verfügen über sprachliche Mittel: Grammatik (Wortarten, Verben, Zeitformen,
    // Satzbau) + Wortschatz/Orthografie. Dienen der kommunikativen Kompetenz.
    "Gegenwart": "Verfügen über sprachliche Mittel",
    "Vergangenheit": "Verfügen über sprachliche Mittel",
    "Zukunft": "Verfügen über sprachliche Mittel",
    "Zeitformen im Vergleich": "Verfügen über sprachliche Mittel",
    "Besondere Verben": "Verfügen über sprachliche Mittel",
    "Verbformen": "Verfügen über sprachliche Mittel",
    "Passiv und Konstruktionen": "Verfügen über sprachliche Mittel",
    "Pronomen": "Verfügen über sprachliche Mittel",
    "Adjektive und Adverbien": "Verfügen über sprachliche Mittel",
    "Nomen und Artikel": "Verfügen über sprachliche Mittel",
    "Präpositionen und Bindewörter": "Verfügen über sprachliche Mittel",
    "Satzstellung": "Verfügen über sprachliche Mittel",
    "Nebensätze": "Verfügen über sprachliche Mittel",
    "Zeichensetzung": "Verfügen über sprachliche Mittel",
    "Grundwortschatz": "Verfügen über sprachliche Mittel",
    "Typische Stolperfallen": "Verfügen über sprachliche Mittel",
    "Aussprache und Schreibung": "Verfügen über sprachliche Mittel",
    // Funktionale kommunikative Kompetenz: Schreiben, Sprachmittlung, Hör-/Leseverstehen.
    "Grundlegende Texte": "Funktionale kommunikative Kompetenz",
    "Argumentative Texte": "Funktionale kommunikative Kompetenz",
    "Briefe und E-Mails": "Funktionale kommunikative Kompetenz",
    "Kreatives und persoenliches Schreiben": "Funktionale kommunikative Kompetenz",
    "Mediation": "Funktionale kommunikative Kompetenz",
    "Hoer- und Leseverstehen": "Funktionale kommunikative Kompetenz",
    "Muendliche Kommunikation": "Funktionale kommunikative Kompetenz",
    // Text- und Medienkompetenz: literarische und mediale Analyse/Interpretation.
    "Literarische Analyse": "Text- und Medienkompetenz",
    "Sach- und Medienanalyse": "Text- und Medienkompetenz",
    "Stilmittel und Sprache": "Text- und Medienkompetenz",
  },
};

// Liefert den Kompetenzbereich eines Themas (über seine subkategorie). Fällt auf die
// Roh-kategorie zurück, falls keine Zuordnung existiert (damit nichts verschwindet).
export function bereichFuer(fachId, thema) {
  const map = SUBKAT_BEREICH[fachId];
  if (map && thema.subkategorie && map[thema.subkategorie]) return map[thema.subkategorie];
  return thema.kategorie || null;
}

// Prueft, dass jede in den Daten verwendete subkategorie genau einem Bereich
// zugeordnet ist. Gibt eine Fehlerliste zurueck (leer = ok).
export function pruefeBereiche(faecher) {
  const fehler = [];
  for (const fach of faecher) {
    const map = SUBKAT_BEREICH[fach.id];
    if (!map) continue; // Faecher ohne Bereichsmodell (z.B. franzoesisch) ueberspringen
    const bereiche = new Set(KOMPETENZBEREICHE[fach.id] || []);
    for (const t of fach.themen || []) {
      if (!t.subkategorie) continue;
      const b = map[t.subkategorie];
      if (!b) fehler.push(`${fach.id}: subkategorie ohne Bereich: ${t.subkategorie}`);
      else if (!bereiche.has(b)) fehler.push(`${fach.id}: unbekannter Bereich '${b}' fuer ${t.subkategorie}`);
    }
  }
  return fehler;
}
