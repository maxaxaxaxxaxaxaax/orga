// Gemeinsamer Posteingang für alles Schulische:
// Lehrer:innen, Lerncoach, Klassenchat, Sekretariat.
// kategorie: "lehrer" | "klasse" | "schule"
// aktion: true = es wird eine Reaktion erwartet (würde KI später markieren)

export const rolleFarbe = {
  lehrer: "#3b5bdb",
  klasse: "#2f9e44",
  schule: "#9c36b5",
};

export const nachrichten = [
  {
    id: 1,
    von: "Fr. Berg",
    rolle: "Lerncoach",
    kategorie: "lehrer",
    betreff: "Feedback zu deinem Lernweg „Lineare Funktionen“",
    vorschau: "Du machst gute Fortschritte. Vor der Arbeit lohnt sich noch ein Blick auf die Steigung …",
    text: "Hallo Max,\n\ndu machst beim Lernweg „Lineare Funktionen“ richtig gute Fortschritte. Vor dem Könnensbeweis schau dir die Steigung noch einmal genau an, da war zuletzt eine kleine Unsicherheit.\n\nMelde dich bitte kurz, ob der Termin am Donnerstag in der Studierzeit für dich passt.\n\nViele Grüße\nFr. Berg",
    zeit: "09:14",
    gelesen: false,
    aktion: true,
  },
  {
    id: 2,
    von: "Hr. Klein",
    rolle: "Deutsch",
    kategorie: "lehrer",
    betreff: "Material zur Inhaltsangabe hochgeladen",
    vorschau: "Ich habe euch das Musterbeispiel und eine Checkliste ins Fach Deutsch gelegt.",
    text: "Liebe Klasse,\n\nich habe euch das Musterbeispiel und eine Checkliste zur Inhaltsangabe ins Fach Deutsch gelegt. Schaut sie euch bis zur nächsten Stunde an.\n\nHr. Klein",
    zeit: "08:02",
    gelesen: false,
    aktion: false,
  },
  {
    id: 3,
    von: "Klasse 7a",
    rolle: "Klassenchat",
    kategorie: "klasse",
    betreff: "Wer hat die Bio-Aufgabe verstanden?",
    vorschau: "Lena: Ich glaube wir sollen nur den Steckbrief machen, oder?",
    text: "Lena: Ich glaube wir sollen nur den Steckbrief machen, oder?\nJonas: Ja genau, einen Steckbrief zu einem Wirbeltier deiner Wahl.\nLena: Super, danke!",
    zeit: "Gestern",
    gelesen: false,
    aktion: false,
  },
  {
    id: 4,
    von: "Sekretariat",
    rolle: "Verwaltung",
    kategorie: "schule",
    betreff: "Wandertag am 12. Juni: Rückmeldung nötig",
    vorschau: "Bitte gib bis Freitag die unterschriebene Einverständniserklärung ab.",
    text: "Liebe Schülerinnen und Schüler,\n\nam 12. Juni findet unser Wandertag statt. Bitte gebt bis Freitag die unterschriebene Einverständniserklärung im Sekretariat ab und teilt uns mit, ob ihr teilnehmt.\n\nDas Sekretariat",
    zeit: "Gestern",
    gelesen: false,
    aktion: true,
  },
  {
    id: 5,
    von: "Fr. Voss",
    rolle: "Biologie",
    kategorie: "lehrer",
    betreff: "Erinnerung: Steckbrief heute abgeben",
    vorschau: "Denkt bitte daran, den Steckbrief Wirbeltiere heute in der Stunde abzugeben.",
    text: "Denkt bitte daran, den Steckbrief Wirbeltiere heute in der Stunde abzugeben. Wer noch Fragen hat, kommt einfach kurz vorbei.\n\nFr. Voss",
    zeit: "Gestern",
    gelesen: true,
    aktion: false,
  },
  {
    id: 6,
    von: "Gruppe „Klimazonen“",
    rolle: "Projekt",
    kategorie: "klasse",
    betreff: "Treffen in der Studierzeit?",
    vorschau: "Tim: Sollen wir uns Donnerstag in der Studierzeit treffen und das Plakat anfangen?",
    text: "Tim: Sollen wir uns Donnerstag in der Studierzeit treffen und das Plakat „Klimazonen“ anfangen?\nMax: Klingt gut.\nSara: Ich bringe die Stifte mit.",
    zeit: "Mo",
    gelesen: true,
    aktion: false,
  },
  {
    id: 7,
    von: "Schulleitung",
    rolle: "Elterninfo",
    kategorie: "schule",
    betreff: "Termine für den Elternsprechtag",
    vorschau: "Die Anmeldung für den Elternsprechtag ist ab nächster Woche möglich.",
    text: "Sehr geehrte Eltern,\n\ndie Anmeldung für den Elternsprechtag ist ab nächster Woche über das Elternportal möglich. Die Tutorinnen und Tutoren freuen sich auf den Austausch.\n\nDie Schulleitung",
    zeit: "Mo",
    gelesen: true,
    aktion: false,
  },
];

export const kategorieLabel = {
  lehrer: "Lehrkräfte",
  klasse: "Klasse",
  schule: "Schule",
};
