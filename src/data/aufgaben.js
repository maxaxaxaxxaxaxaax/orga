// Aufgaben mit Fälligkeit (ISO), Dauer (Min), Priorität und Typ.
// typ: "hausaufgabe" | "abgabe" | "projekt" | "lernweg"
// prio: "hoch" | "normal"
// "lernweg" = selbstregulierte Lernschritte (Theresianum-Konzept).
// lernweg (optional) koppelt die Aufgabe an einen Schritt im Wissen-Netz:
//   { fachId, themaId, schritt } -> Erledigen hakt den Schritt ab.

export const aufgaben = [
  { id: 1, fach: "Biologie", titel: "Steckbrief Wirbeltiere abgeben", faellig: "2026-05-21", dauer: 40, prio: "hoch", typ: "abgabe" },
  { id: 2, fach: "Mathematik", titel: "Lernweg „Lineare Funktionen“: Geradengleichung", faellig: "2026-05-21", dauer: 30, prio: "hoch", typ: "lernweg", lernweg: { fachId: "mathe", themaId: "linear", schritt: 3 } },
  { id: 3, fach: "Latein", titel: "Vokabeln Lektion 14 wiederholen", faellig: "2026-05-22", dauer: 20, prio: "normal", typ: "hausaufgabe" },
  { id: 4, fach: "Deutsch", titel: "Inhaltsangabe zur Kurzgeschichte schreiben", faellig: "2026-05-25", dauer: 35, prio: "hoch", typ: "hausaufgabe", lernweg: { fachId: "deutsch", themaId: "inhalt", schritt: 0 } },
  { id: 5, fach: "Geschichte", titel: "Kapitel „Mittelalter“ lesen", faellig: "2026-05-26", dauer: 30, prio: "normal", typ: "hausaufgabe" },
  { id: 6, fach: "Erdkunde", titel: "Projekt: Plakat „Klimazonen“ (Gruppe)", faellig: "2026-06-03", dauer: 120, prio: "normal", typ: "projekt" },
  { id: 7, fach: "Mathematik", titel: "Könnensbeweis vorbereiten (Studierzeit)", faellig: "2026-05-27", dauer: 60, prio: "hoch", typ: "lernweg", lernweg: { fachId: "mathe", themaId: "linear", schritt: 4 } },
];

export const typLabel = {
  hausaufgabe: "Hausaufgabe",
  abgabe: "Abgabe",
  projekt: "Projekt",
  lernweg: "Lernweg",
};
