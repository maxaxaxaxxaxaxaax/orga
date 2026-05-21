// Lernfortschritt am Theresianum: keine Noten in Klasse 5–8, sondern
// Könnensbeweise (erbracht/gesamt) und ein Kompetenzstand je Fach.
// stand: "sicher" | "aufweg" | "aufbau". trend: "auf" | "stabil" | "ab".

// verlauf = erbrachte Könnensbeweise über die letzten Wochen (für die Mini-Kurve).
export const faecherKompetenz = [
  { fach: "Deutsch", erbracht: 7, gesamt: 8, stand: "sicher", trend: "auf", verlauf: [3, 4, 5, 6, 7, 7] },
  { fach: "Mathematik", erbracht: 6, gesamt: 9, stand: "aufweg", trend: "auf", verlauf: [2, 3, 3, 4, 5, 6] },
  { fach: "Englisch", erbracht: 7, gesamt: 8, stand: "sicher", trend: "stabil", verlauf: [5, 6, 6, 7, 7, 7] },
  { fach: "Latein", erbracht: 4, gesamt: 8, stand: "aufbau", trend: "ab", verlauf: [3, 3, 4, 4, 4, 4] },
  { fach: "Griechisch", erbracht: 3, gesamt: 6, stand: "aufweg", trend: "auf", verlauf: [1, 1, 2, 2, 3, 3] },
  { fach: "Biologie", erbracht: 6, gesamt: 7, stand: "sicher", trend: "stabil", verlauf: [4, 5, 5, 6, 6, 6] },
  { fach: "Geschichte", erbracht: 5, gesamt: 6, stand: "sicher", trend: "auf", verlauf: [2, 3, 4, 4, 5, 5] },
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
