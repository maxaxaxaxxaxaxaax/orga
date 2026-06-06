// Strategie-Wahl: vor jedem Quiz-Start wählt Max bewusst eine Lern-Strategie.
// Über Zeit baut sich ein Profil auf, das zeigt welche Strategie bei welchem
// Thema für ihn funktioniert. Kern-Idee für die Thesis: "Lernen lernen im
// Zeitalter KI" heißt, KI bewusst als eine Strategie unter mehreren wählen,
// nicht als Default-Antwortmaschine.

export const STRATEGIEN = [
  {
    id: "selbst",
    label: "Selbst probieren",
    icon: "🧠",
    kurz: "ohne Hilfe versuchen",
    lang: "Direkt loslegen, allein durchdenken. Klassisch autonomes Lernen.",
  },
  {
    id: "beispiele",
    label: "Beispiele anschauen",
    icon: "📖",
    kurz: "erst Notiz lesen",
    lang: "Erst die Erklärung und Beispiele aus der Notiz lesen, dann üben. Lernen am Vorbild.",
  },
  {
    id: "mitschueler",
    label: "Mit Mitschüler",
    icon: "👥",
    kurz: "im Chat fragen",
    lang: "Frage im Klassenchat oder beim Sitznachbarn. Soziales Lernen.",
  },
  {
    id: "ki-hilfe",
    label: "Kurze KI-Hilfe",
    icon: "💡",
    kurz: "Rückfragen, keine Antworten",
    lang: "Die KI stellt Rückfragen, statt Lösungen zu geben. Neue digitale Strategie.",
  },
];

const KEY = "orga.strategien";

function laden() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function speichern(eintraege) {
  try {
    localStorage.setItem(KEY, JSON.stringify(eintraege));
  } catch {
    // localStorage voll oder blockiert: kein harter Fehler im Demo.
  }
}

// Legt einen Strategie-Eintrag an, sobald eine Wahl getroffen wurde.
// Das Ergebnis (richtig/gesamt) wird später nachgetragen.
export function strategieWahlSpeichern({ fach, kbId, thema, strategie }) {
  const id = "strat-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
  const eintraege = laden();
  const eintrag = {
    id,
    ts: Date.now(),
    fach,
    kbId: kbId || null,
    thema: thema || null,
    strategie,
    ergebnis: null,
  };
  eintraege.push(eintrag);
  speichern(eintraege);
  return id;
}

// Trägt das Quiz-Ergebnis zu einem vorhandenen Strategie-Eintrag nach.
export function strategieErgebnisSpeichern(id, ergebnis) {
  if (!id) return;
  const eintraege = laden();
  const i = eintraege.findIndex((e) => e.id === id);
  if (i < 0) return;
  eintraege[i] = { ...eintraege[i], ergebnis };
  speichern(eintraege);
}

// Holt das Strategie-Profil: pro Strategie wie oft genutzt + Erfolgsquote.
export function strategieProfil(fach = null) {
  const eintraege = laden();
  const gefiltert = fach ? eintraege.filter((e) => e.fach === fach) : eintraege;
  const profil = {};
  for (const s of STRATEGIEN) {
    profil[s.id] = { strategie: s, anzahl: 0, richtig: 0, gesamt: 0 };
  }
  for (const e of gefiltert) {
    if (!profil[e.strategie]) continue;
    profil[e.strategie].anzahl++;
    if (e.ergebnis) {
      profil[e.strategie].richtig += e.ergebnis.richtig || 0;
      profil[e.strategie].gesamt += e.ergebnis.gesamt || 0;
    }
  }
  return profil;
}

export function strategieLabel(strategieId) {
  const s = STRATEGIEN.find((x) => x.id === strategieId);
  return s ? s.label : strategieId;
}
