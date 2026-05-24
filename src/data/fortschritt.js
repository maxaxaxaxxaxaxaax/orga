// Lernfortschritt am Theresianum: keine Noten in Klasse 5–8, sondern
// Könnensbeweise (erbracht/gesamt) und ein Kompetenzstand je Fach.
// stand: "sicher" | "aufweg" | "aufbau". trend: "auf" | "stabil" | "ab".

// Qualitative Lerncoach-Einschätzung pro Fach plus verlauf für die Mini-Sparkline.
// Die Anzahl Könnensbeweise (erbracht/gesamt) wird in der Stand-Kopfzeile NICHT
// von hier gelesen, sondern dynamisch aus den echten Lernwegen berechnet
// (lib/lernstand.js -> fachKbStand). erbracht/gesamt sind nur Demo-Seeds für
// Verlauf/Plausibilität und sollten zur echten KB-Anzahl im Schulplaner passen
// (Mathe 5, Deutsch 3, Englisch 5, Latein 5, Griechisch 5).
export const faecherKompetenz = [
  { fach: "Deutsch", erbracht: 1, gesamt: 3, stand: "aufweg", trend: "auf", verlauf: [0, 0, 1, 1, 1, 1] },
  { fach: "Mathematik", erbracht: 2, gesamt: 5, stand: "aufweg", trend: "auf", verlauf: [0, 1, 1, 2, 2, 2] },
  { fach: "Englisch", erbracht: 3, gesamt: 5, stand: "sicher", trend: "stabil", verlauf: [1, 2, 2, 3, 3, 3] },
  { fach: "Latein", erbracht: 1, gesamt: 5, stand: "aufbau", trend: "ab", verlauf: [1, 1, 1, 1, 1, 1] },
  { fach: "Griechisch", erbracht: 0, gesamt: 5, stand: "aufbau", trend: "auf", verlauf: [0, 0, 0, 0, 0, 0] },
];

export const standLabel = {
  sicher: "sicher",
  aufweg: "auf gutem Weg",
  aufbau: "im Aufbau",
};

export const staerken = [
  "Mündliche Mitarbeit",
  "Eigenständiges Planen",
  "Zusammenarbeit in Projekten",
];

export const dranArbeiten = [
  "Latein-Vokabeln regelmäßig üben",
  "Zeit in der Studierzeit besser einteilen",
];

// Einschätzung des Lerncoachs.
export const coachEinschaetzung = {
  von: "Fr. Berg",
  text: "Max, du arbeitest sehr selbstständig und planst deine Lernwege gut. In Latein lohnt sich etwas mehr Regelmäßigkeit, dann gelingen dir die Könnensbeweise sicherer.",
};
