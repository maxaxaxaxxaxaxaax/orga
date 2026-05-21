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

export const startUploads = [
  eintrag("seed-1", "Mathematik", "unterricht", "Lineare Funktionen", "Tafelbild_Geradengleichung", "bild", 0),
  eintrag("seed-2", "Biologie", "selbstlernen", "Sinnesorgane", "Notizen_Auge_Aufbau", "notiz", 1),
  eintrag("seed-3", "Deutsch", "unterricht", "Kurzgeschichte", "AB_Kurzgeschichte_Analyse", "pdf", 2),
  eintrag("seed-4", "Latein", "selbstlernen", "ACI", "Spickzettel_ACI", "notiz", 4),
  eintrag("seed-5", "Geschichte", "unterricht", "Reformation", "Folien_Reformation_Luther", "pdf", 6),
];
