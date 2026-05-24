// Beispiel-Uploads, damit Ordner und Verlauf von Anfang an befüllt aussehen.
// Gleiche Form wie dokumentAusDatei() in lib/einsortieren.js.

const jetzt = Date.now();
const vorTagen = (n) => jetzt - n * 86400000 - 3600000;

function eintrag(id, fach, bereich, thema, titel, art, tage) {
  const ts = vorTagen(tage);
  return {
    id,
    fach,
    bereich,
    thema,
    titel,
    art,
    ts,
    datum: new Date(ts).toISOString().slice(0, 10),
    uploaded: true,
    fachErkannt: true,
  };
}

// Seeds zeigen auf reale Themen-Labels aus wissen.js, damit der Ordner-Tab
// die Dokumente einem existierenden Lernweg zuordnet.
export const startUploads = [
  eintrag("seed-1", "Mathematik", "unterricht", "Grundlagen negative Zahlen", "Tafelbild_Zahlengerade", "bild", 0),
  eintrag("seed-2", "Englisch", "selbstlernen", "Vocabulary Unit 5 (pp. 84-93)", "Vokabelliste_Unit5", "notiz", 1),
  eintrag("seed-3", "Deutsch", "unterricht", "Mini-Vortrag", "Notizen_Vortrag_Aufbau", "pdf", 2),
  eintrag("seed-4", "Latein", "selbstlernen", "ACI mit Übersetzung", "Spickzettel_ACI", "notiz", 4),
  eintrag("seed-5", "Griechisch", "unterricht", "Griechische Buchstaben und Lautlehre", "AB_Alphabet_Schreiben", "pdf", 6),
];
