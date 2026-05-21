// Etappenziele am Theresianum: der Stoff ist in Etappen gegliedert,
// die meist von Ferien zu Ferien laufen. Innerhalb einer Etappe geben
// Lernwege den Stoff vor (siehe data/fortschritt.js).

export const etappen = [
  {
    id: 1,
    label: "Start → Herbstferien",
    kurz: "Herbst",
    farbe: "#f59f00",
    von: "2025-09-01",
    bis: "2025-10-17",
    ziel: "Ankommen, Lernwege kennenlernen und erste Könnensbeweise erbringen.",
  },
  {
    id: 2,
    label: "Herbst → Weihnachten",
    kurz: "Weihnachten",
    farbe: "#e8590c",
    von: "2025-10-27",
    bis: "2025-12-19",
    ziel: "Grundlagen festigen und vor den Weihnachtsferien sichern.",
  },
  {
    id: 3,
    label: "Weihnachten → Ostern",
    kurz: "Ostern",
    farbe: "#1971c2",
    von: "2026-01-08",
    bis: "2026-04-02",
    ziel: "Kernthemen erarbeiten und in den Lernwegen vertiefen.",
  },
  {
    id: 4,
    label: "Ostern → Pfingsten",
    kurz: "Pfingsten",
    farbe: "#2f9e44",
    von: "2026-04-20",
    bis: "2026-05-29",
    ziel: "Lineare Funktionen sicher beherrschen und den Könnensbeweis bestehen.",
  },
  {
    id: 5,
    label: "Pfingsten → Sommer",
    kurz: "Sommer",
    farbe: "#9c36b5",
    von: "2026-06-08",
    bis: "2026-07-24",
    ziel: "Offene Themen abschließen und das Schuljahr runden.",
  },
];

export const etappeFarbe = Object.fromEntries(etappen.map((e) => [e.id, e.farbe]));

// Aktuelle Etappe anhand des Datums (während Ferien: die nächste Etappe).
export function aktuelleEtappe(d = new Date()) {
  const t = d.getTime();
  for (const e of etappen) {
    if (t <= new Date(e.bis + "T23:59:59").getTime()) return e;
  }
  return etappen[etappen.length - 1];
}
